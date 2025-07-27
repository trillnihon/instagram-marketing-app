import express from 'express';
import { User } from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 新規登録
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // バリデーション
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'すべてのフィールドが必要です'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは6文字以上である必要があります'
      });
    }
    
    // 既存ユーザーチェック
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'email は既に使用されています'
      });
    }
    
    // 新しいユーザーを作成
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // JWTトークンを生成
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'ユーザー登録が完了しました',
      token,
      user: user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('新規登録エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ユーザー登録中にエラーが発生しました'
    });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // バリデーション
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスとパスワードが必要です'
      });
    }
    
    // ユーザーを検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }
    
    // パスワード検証
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }
    
    // ユーザーがアクティブかチェック
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'アカウントが無効になっています'
      });
    }
    
    // ログイン情報を更新
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    
    // JWTトークンを生成
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'ログインに成功しました',
      token,
      user: user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({
      success: false,
      message: 'ログイン中にエラーが発生しました'
    });
  }
});

// ログアウト（クライアント側でトークンを削除）
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // 実際のログアウト処理（必要に応じてトークンブラックリストなど）
    res.json({
      success: true,
      message: 'ログアウトしました'
    });
  } catch (error) {
    console.error('ログアウトエラー:', error);
    res.status(500).json({
      success: false,
      message: 'ログアウト中にエラーが発生しました'
    });
  }
});

// プロフィール取得
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'プロフィール取得中にエラーが発生しました'
    });
  }
});

// プロフィール更新
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { profile } = req.body;
    
    // profileオブジェクトから値を取得
    const displayName = profile?.displayName;
    const bio = profile?.bio;
    const avatar = profile?.avatar;
    
    // displayNameのバリデーション
    if (displayName !== undefined && typeof displayName === 'string' && displayName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'displayNameは50文字以内で入力してください'
      });
    }
    
    // 更新処理
    if (displayName !== undefined) {
      req.user.profile.displayName = displayName;
    }
    if (bio !== undefined) {
      req.user.profile.bio = bio;
    }
    if (avatar !== undefined) {
      req.user.profile.avatar = avatar;
    }
    
    await req.user.save();
    
    // getPublicProfile()の返却値が正しいか確認
    const publicUser = req.user.getPublicProfile ? req.user.getPublicProfile() : req.user;
    
    res.json({
      success: true,
      message: 'プロフィールが更新されました',
      user: publicUser
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({
      success: false,
      message: 'プロフィール更新中にエラーが発生しました'
    });
  }
});

// パスワード変更
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '現在のパスワードと新しいパスワードが必要です'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新しいパスワードは6文字以上である必要があります'
      });
    }
    
    // 現在のパスワードを検証
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '現在のパスワードが正しくありません'
      });
    }
    
    // 新しいパスワードを設定
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({
      success: true,
      message: 'パスワードを変更しました'
    });
    
  } catch (error) {
    console.error('パスワード変更エラー:', error);
    res.status(500).json({
      success: false,
      message: 'パスワード変更中にエラーが発生しました'
    });
  }
});

// アカウント削除
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    
    res.json({
      success: true,
      message: 'アカウントを削除しました'
    });
    
  } catch (error) {
    console.error('アカウント削除エラー:', error);
    res.status(500).json({
      success: false,
      message: 'アカウント削除中にエラーが発生しました'
    });
  }
});

export default router; 