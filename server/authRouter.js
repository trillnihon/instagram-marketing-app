import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import { getMongoClient } from './config/database.js';

const router = express.Router();

// インメモリユーザーストア（本番ではDBを使用）
const users = new Map();

// JWTシークレットキー（本番では環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // バリデーション
    if (!email || !password || !username) {
      return res.status(400).json({ 
        error: 'メールアドレス、パスワード、ユーザー名は必須です' 
      });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: '有効なメールアドレスを入力してください' 
      });
    }

    // パスワードの強度チェック
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'パスワードは8文字以上で入力してください' 
      });
    }

    // ユーザー名の長さチェック
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'ユーザー名は3文字以上で入力してください' 
      });
    }

    // 既存ユーザーチェック
    for (const [_, user] of users) {
      if (user.email === email) {
        return res.status(400).json({ 
          error: 'このメールアドレスは既に使用されています' 
        });
      }
      if (user.username === username) {
        return res.status(400).json({ 
          error: 'このユーザー名は既に使用されています' 
        });
      }
    }

    // パスワードのハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ユーザー作成
    const userId = uuidv4();
    const newUser = {
      id: userId,
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      plan: 'free',
      captionGenerationUsed: 0,
      imageGenerationUsed: 0
    };

    users.set(userId, newUser);

    // JWTトークン生成
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        username: newUser.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // レスポンス（パスワードは除外）
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'アカウントが正常に作成されました',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({ 
      error: 'ユーザー登録に失敗しました' 
    });
  }
});

// ユーザーログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'メールアドレスとパスワードは必須です' 
      });
    }

    // ユーザー検索
    let user = null;
    for (const [_, u] of users) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }

    // JWTトークン生成
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // レスポンス（パスワードは除外）
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'ログインに成功しました',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ 
      error: 'ログインに失敗しました' 
    });
  }
});

// JWT認証ミドルウェア
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'アクセストークンが必要です' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: '無効なトークンです' 
      });
    }
    req.user = user;
    next();
  });
};

// ユーザー情報取得（認証済み）
router.get('/me', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'ユーザーが見つかりません' 
      });
    }

    // レスポンス（パスワードは除外）
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ 
      error: 'ユーザー情報の取得に失敗しました' 
    });
  }
});

// ユーザー情報更新（認証済み）
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'ユーザーが見つかりません' 
      });
    }

    const { username, email } = req.body;
    const updates = {};

    // ユーザー名の更新
    if (username && username !== user.username) {
      // 重複チェック
      for (const [_, u] of users) {
        if (u.id !== userId && u.username === username) {
          return res.status(400).json({ 
            error: 'このユーザー名は既に使用されています' 
          });
        }
      }
      updates.username = username;
    }

    // メールアドレスの更新
    if (email && email !== user.email) {
      // メールアドレスの形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: '有効なメールアドレスを入力してください' 
        });
      }

      // 重複チェック
      for (const [_, u] of users) {
        if (u.id !== userId && u.email === email) {
          return res.status(400).json({ 
            error: 'このメールアドレスは既に使用されています' 
          });
        }
      }
      updates.email = email;
    }

    // ユーザー情報更新
    const updatedUser = { ...user, ...updates };
    users.set(userId, updatedUser);

    // レスポンス（パスワードは除外）
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'ユーザー情報が更新されました',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('ユーザー情報更新エラー:', error);
    res.status(500).json({ 
      error: 'ユーザー情報の更新に失敗しました' 
    });
  }
});

// パスワード変更（認証済み）
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'ユーザーが見つかりません' 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // バリデーション
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: '現在のパスワードと新しいパスワードは必須です' 
      });
    }

    // 現在のパスワード検証
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: '現在のパスワードが正しくありません' 
      });
    }

    // 新しいパスワードの強度チェック
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: '新しいパスワードは8文字以上で入力してください' 
      });
    }

    // 新しいパスワードのハッシュ化
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // パスワード更新
    const updatedUser = { ...user, password: hashedNewPassword };
    users.set(userId, updatedUser);

    res.json({
      success: true,
      message: 'パスワードが正常に変更されました'
    });

  } catch (error) {
    console.error('パスワード変更エラー:', error);
    res.status(500).json({ 
      error: 'パスワードの変更に失敗しました' 
    });
  }
});

// ユーザー削除（認証済み）
router.delete('/me', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'ユーザーが見つかりません' 
      });
    }

    // ユーザー削除
    users.delete(userId);

    res.json({
      success: true,
      message: 'アカウントが正常に削除されました'
    });

  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    res.status(500).json({ 
      error: 'アカウントの削除に失敗しました' 
    });
  }
});

export default router; 