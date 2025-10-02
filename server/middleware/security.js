import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// CORS設定
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const origins = [
      'https://instagram-marketing-app.vercel.app',
      'https://instagram-marketing-app-v1.vercel.app',
      'https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app',
      'https://instagram-marketing-app-git-main-trillnihons-projects.vercel.app',
      'https://instagram-marketing-backend-v2.onrender.com'
    ];
    
    // Vercelプレビュードメインのワイルドカード許可
    origins.push('https://*.vercel.app');
    
    // 環境変数で追加のオリジンを指定可能
    if (process.env.CORS_ORIGIN) {
      origins.push(process.env.CORS_ORIGIN);
    }
    
    // 複数のオリジンを環境変数で指定可能（カンマ区切り）
    if (process.env.CORS_ORIGINS) {
      const additionalOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
      origins.push(...additionalOrigins);
    }
    
    return origins;
  } else {
    return [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3001',
      'http://localhost:3002',
      'https://localhost:3002'
    ];
  }
};

export const corsOptions = {
  origin: getCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ]
};

// レート制限設定
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 15分間に100回まで
  message: {
    success: false,
    message: 'リクエスト制限に達しました。しばらく時間をおいてから再試行してください。'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // ヘルスチェックや静的ファイルは制限から除外
    return req.path === '/health' || req.path.startsWith('/static/');
  }
});

// 認証エンドポイント用の厳しいレート制限
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 15分間に5回まで
  message: {
    success: false,
    message: '認証試行回数が上限に達しました。しばらく時間をおいてから再試行してください。'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Helmet設定
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://graph.facebook.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// セキュリティヘッダー設定
export const securityHeaders = (req, res, next) => {
  // XSS保護
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // クリックジャッキング保護
  res.setHeader('X-Frame-Options', 'DENY');
  
  // MIME型スニッフィング保護
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // リファラーポリシー
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // パーミッションポリシー
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// HTTPS強制ミドルウェア（本番環境でのみ有効）
export const requireHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // X-Forwarded-Protoヘッダーをチェック（プロキシ環境対応）
    const isSecure = req.secure || req.get('X-Forwarded-Proto') === 'https';
    
    if (!isSecure) {
      return res.status(403).json({
        success: false,
        message: 'HTTPS接続が必要です。セキュリティ上の理由により、HTTP接続は許可されていません。'
      });
    }
  }
  next();
};

// JWTシークレット強度チェック
export const validateJWTSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET環境変数が設定されていません');
  }
  
  if (jwtSecret.length < 16) {
    throw new Error('JWT_SECRETは最低16文字以上である必要があります');
  }
  
  // 簡単な強度チェック（数字、文字、特殊文字を含む）
  const hasNumber = /\d/.test(jwtSecret);
  const hasLetter = /[a-zA-Z]/.test(jwtSecret);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(jwtSecret);
  
  if (!hasNumber || !hasLetter || !hasSpecial) {
    console.warn('⚠️ JWT_SECRETの強度が低い可能性があります。数字、文字、特殊文字を含む16文字以上の文字列を推奨します。');
  }
  
  return true;
};

// リクエストサイズ制限
export const requestSizeLimit = {
  limit: '10mb',
  extended: true,
  parameterLimit: 1000
};

// ファイルアップロード制限
export const fileUploadLimit = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 5, // 最大5ファイル
  fileFilter: (req, file, cb) => {
    // 許可するファイルタイプ
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('許可されていないファイルタイプです'), false);
    }
  }
}; 