import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWTトークン生成
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// JWTトークン検証
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 認証ミドルウェア
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'アクセストークンが必要です' 
      });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: '無効なトークンです' 
      });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'ユーザーが見つからないか、無効です' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: '認証処理中にエラーが発生しました' 
    });
  }
};

// 管理者認証ミドルウェア
export const requireAdmin = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: '管理者権限が必要です' 
        });
      }
      next();
    });
  } catch (error) {
    console.error('管理者認証エラー:', error);
    return res.status(500).json({ 
      success: false, 
      error: '認証処理中にエラーが発生しました' 
    });
  }
};

// オプショナル認証（ログインしていなくてもアクセス可能）
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('オプショナル認証エラー:', error);
    next(); // エラーが発生しても続行
  }
}; 