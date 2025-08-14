import express from 'express';
import session from 'express-session';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== FIXED SERVER STARTING ===');
console.log('Time:', new Date().toISOString());

// エラーハンドリング強化
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error.name, error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// 環境変数の読み込み
console.log('✅ 1. Loading environment variables...');
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
  if (!process.env.MONGODB_URI) {
    process.env.DEMO_MODE = 'true';
  }
}

console.log('✅ 2. Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEMO_MODE: process.env.DEMO_MODE === 'true' ? '有効' : '無効',
  PORT: process.env.PORT || '4000'
});

// ロガーの初期化
console.log('✅ 3. Initializing logger...');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 4000;

// 基本ミドルウェア
console.log('✅ 4. Adding basic middleware...');
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// セッション設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 基本ルート
console.log('✅ 5. Adding basic routes...');

app.get('/', (req, res) => {
  res.json({
    message: 'Instagram Marketing App Backend API',
    status: 'running',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongoConnected: false // デモモード
  });
});

app.get('/debug', (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DEMO_MODE: process.env.DEMO_MODE
    }
  });
});

// デモ用エンドポイント
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'メールアドレスとパスワードは必須です'
      });
    }
    
    // デモ用の簡易認証
    if (email === 'demo@example.com' && password === 'password123') {
      res.json({
        success: true,
        message: 'ログインに成功しました',
        user: {
          id: 'demo-user-1',
          email: email,
          username: 'demo_user'
        },
        token: 'demo-token-123'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'ログインに失敗しました'
    });
  }
});

// サーバー起動
console.log('✅ 6. Starting server...');

const server = app.listen(DEFAULT_PORT, () => {
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log(`📡 Server running on port ${DEFAULT_PORT}`);
  console.log(`🔗 Health: http://localhost:${DEFAULT_PORT}/health`);
  console.log(`🔍 Debug: http://localhost:${DEFAULT_PORT}/debug`);
  console.log('🎯 Demo mode: Enabled');
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
});

server.on('error', (error) => {
  console.error('❌ SERVER ERROR:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${DEFAULT_PORT} is already in use`);
  }
});

console.log('✅ 7. Setup complete - waiting for connections...');
