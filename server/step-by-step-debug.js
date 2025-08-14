import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== STEP-BY-STEP DEBUG SERVER ===');
console.log('Time:', new Date().toISOString());

const app = express();
const PORT = 4000;

// エラーハンドリング強化
process.on('uncaughtException', (error) => {
  console.log('❌ UNCAUGHT EXCEPTION:', error.name, error.message);
  console.log('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ UNHANDLED REJECTION at:', promise);
  console.log('Reason:', reason);
  process.exit(1);
});

// 段階1: 基本ミドルウェア
console.log('✅ STEP 1: Adding basic middleware...');
app.use(cors());
app.use(express.json());

// 段階2: 環境変数読み込みテスト
console.log('✅ STEP 2: Testing environment variables...');
try {
  import('dotenv').then(dotenv => {
    dotenv.default.config();
    console.log('✅ dotenv loaded successfully');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('PORT:', process.env.PORT || 'undefined');
  }).catch(err => {
    console.log('⚠️ dotenv not available:', err.message);
  });
} catch (error) {
  console.log('⚠️ dotenv import failed:', error.message);
}

// 段階3: ルート追加
console.log('✅ STEP 3: Adding routes...');

app.get('/health', (req, res) => {
  console.log('📡 Health check requested');
  res.json({ 
    status: 'OK', 
    time: new Date().toISOString(),
    uptime: process.uptime(),
    step: 'step-by-step-debug'
  });
});

app.get('/test-imports', async (req, res) => {
  console.log('🔍 Testing imports...');
  const results = {};
  
  // テストするモジュール一覧
  const modules = [
    'winston',
    'winston-daily-rotate-file',
    'detect-port',
    'express-session',
    'axios',
    'openai',
    'stripe',
    'uuid',
    'mongoose'
  ];
  
  for (const moduleName of modules) {
    try {
      const module = await import(moduleName);
      results[moduleName] = '✅ OK';
    } catch (error) {
      results[moduleName] = `❌ FAILED: ${error.message}`;
    }
  }
  
  res.json({
    success: true,
    imports: results,
    message: 'Import test completed'
  });
});

// 段階4: サーバー起動
console.log('✅ STEP 4: Starting server...');

const server = app.listen(PORT, () => {
  console.log('🚀 STEP-BY-STEP SERVER STARTED SUCCESSFULLY!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Import Test: http://localhost:${PORT}/test-imports`);
  
  // 自己テスト
  setTimeout(() => {
    console.log('🧪 Self-test in 3 seconds...');
    const req = http.get(`http://localhost:${PORT}/health`, (res) => {
      console.log('✅ Self-test PASSED - Server is responsive');
    });
    req.on('error', (err) => {
      console.log('❌ Self-test FAILED:', err.message);
    });
  }, 3000);
});

server.on('error', (error) => {
  console.log('❌ SERVER ERROR:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use`);
  }
});

console.log('✅ STEP 5: Setup complete - waiting for connections...');
