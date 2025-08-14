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

console.log('=== ENHANCED SERVER STARTING ===');
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
    time: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === 'true'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongoConnected: false, // デモモード
    demoMode: process.env.DEMO_MODE === 'true'
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

// 認証エンドポイント
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

// Instagram API エンドポイント（デモモード）
app.get('/api/instagram/me', async (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(400).json({ error: 'access_token is required' });
  }
  
  // デモユーザーの場合はダミーデータを返す
  if (access_token === 'demo_token' || process.env.DEMO_MODE === 'true') {
    console.log('🎭 [DEBUG] デモユーザー用ダミーデータを返却');
    return res.json({
      id: 'demo_user_id',
      username: 'demo_user',
      account_type: 'PERSONAL',
      media_count: 1
    });
  }
  
  // 実際のInstagram API呼び出し
  try {
    const url = `https://graph.instagram.com/v18.0/me?fields=id,username,account_type,media_count&access_token=${access_token}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Instagram API' });
  }
});

// AI投稿生成エンドポイント（デモモード）
app.post('/api/ai/generate-post', async (req, res) => {
  try {
    const { prompt, platform = 'instagram' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'プロンプトは必須です'
      });
    }
    
    // デモモードの場合はダミーデータを返す
    if (process.env.DEMO_MODE === 'true') {
      const demoPost = {
        id: `demo_post_${Date.now()}`,
        content: `🎯 ${prompt}に関する投稿\n\n✨ これはデモモードでの生成結果です。\n\n#デモ #AI生成 #${platform}`,
        hashtags: ['#デモ', '#AI生成', `#${platform}`],
        estimatedEngagement: Math.floor(Math.random() * 50) + 20,
        platform: platform,
        createdAt: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        data: demoPost,
        message: 'デモモード: AI投稿生成が完了しました'
      });
    }
    
    // 実際のAI生成処理（将来的に実装）
    res.status(501).json({
      success: false,
      error: 'AI生成機能は現在開発中です'
    });
    
  } catch (error) {
    console.error('AI post generation error:', error);
    res.status(500).json({
      success: false,
      error: 'AI投稿生成に失敗しました'
    });
  }
});

// 投稿分析エンドポイント（デモモード）
app.post('/api/analytics/post-analysis', async (req, res) => {
  try {
    const { postId, content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '投稿内容は必須です'
      });
    }
    
    // デモモードの場合はダミーデータを返す
    if (process.env.DEMO_MODE === 'true') {
      const demoAnalysis = {
        postId: postId || `demo_${Date.now()}`,
        engagementScore: Math.floor(Math.random() * 100) + 50,
        reachEstimate: Math.floor(Math.random() * 10000) + 1000,
        hashtagEffectiveness: Math.floor(Math.random() * 100) + 60,
        optimalPostingTime: '19:00-21:00',
        recommendations: [
          'ハッシュタグを3-5個に最適化してください',
          '投稿時間を19:00-21:00に変更することをお勧めします',
          '画像とキャプションの一貫性を保ちましょう'
        ],
        createdAt: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        data: demoAnalysis,
        message: 'デモモード: 投稿分析が完了しました'
      });
    }
    
    // 実際の分析処理（将来的に実装）
    res.status(501).json({
      success: false,
      error: '分析機能は現在開発中です'
    });
    
  } catch (error) {
    console.error('Post analysis error:', error);
    res.status(500).json({
      success: false,
      error: '投稿分析に失敗しました'
    });
  }
});

// サーバー起動
console.log('✅ 6. Starting server...');

const server = app.listen(DEFAULT_PORT, () => {
  console.log('🚀 ENHANCED SERVER STARTED SUCCESSFULLY!');
  console.log(`📡 Server running on port ${DEFAULT_PORT}`);
  console.log(`🔗 Health: http://localhost:${DEFAULT_PORT}/health`);
  console.log(`🔍 Debug: http://localhost:${DEFAULT_PORT}/debug`);
  console.log('🎯 Demo mode:', process.env.DEMO_MODE === 'true' ? 'Enabled' : 'Disabled');
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
});

server.on('error', (error) => {
  console.error('❌ SERVER ERROR:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${DEFAULT_PORT} is already in use`);
  }
});

console.log('✅ 7. Setup complete - waiting for connections...');
