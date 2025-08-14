import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== FOCUSED DEBUG SERVER ===');
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

// 基本ミドルウェア
console.log('✅ 1. Adding CORS...');
app.use(cors());

console.log('✅ 2. Adding JSON parser...');
app.use(express.json());

console.log('✅ 3. Adding static files...');
app.use(express.static('public'));

// 最小限のルート
console.log('✅ 4. Adding routes...');

app.get('/health', (req, res) => {
  console.log('📡 Health check requested');
  res.json({ 
    status: 'OK', 
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/debug', (req, res) => {
  console.log('🔍 Debug info requested');
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  });
});

// サーバー起動
console.log('✅ 5. Starting server...');

const server = app.listen(PORT, () => {
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Debug: http://localhost:${PORT}/debug`);
  
  // 5秒後に自己テスト
  setTimeout(() => {
    console.log('🧪 Self-test in 5 seconds...');
    const req = http.get(`http://localhost:${PORT}/health`, (res) => {
      console.log('✅ Self-test PASSED - Server is responsive');
    });
    req.on('error', (err) => {
      console.log('❌ Self-test FAILED:', err.message);
    });
  }, 5000);
});

server.on('error', (error) => {
  console.log('❌ SERVER ERROR:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use`);
  }
});

console.log('✅ 6. Setup complete - waiting for connections...');
