#!/usr/bin/env node

/**
 * Instagram Marketing App - HTTPS対応サーバー
 * ローカル開発用の自己署名証明書を使用したHTTPSサーバー
 */

import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// ESM対応の__dirname再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の読み込み
const envPath = path.resolve(__dirname, 'env.development');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 4000;

// CORS設定
app.use(cors({
  origin: ['http://localhost:3001', 'https://localhost:3001'],
  credentials: true
}));

// ミドルウェア
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ヘルスチェックエンドポイント（HTTPS必須）
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    protocol: req.protocol,
    secure: req.secure,
    server: 'https-server'
  });
});

// Graph API検証用エンドポイント
app.get('/api/verify-token', async (req, res) => {
  try {
    const token = process.env.FB_USER_OR_LL_TOKEN;
    if (!token) {
      return res.status(400).json({ 
        error: 'FB_USER_OR_LL_TOKENが設定されていません',
        solution: '環境変数ファイルに有効なトークンを設定してください'
      });
    }

    // Graph API /me エンドポイントをテスト
    const response = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: 'Graph API呼び出し失敗',
        status: response.status,
        statusText: response.statusText,
        graphApiError: errorData.error,
        token: token.substring(0, 20) + '...',
        recommendations: [
          'トークンが有効期限切れの可能性があります',
          'トークンに適切な権限があるか確認してください',
          'Facebookアプリの設定を確認してください'
        ]
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      message: 'Graph API呼び出し成功',
      data: {
        id: data.id,
        name: data.name,
        token: token.substring(0, 20) + '...'
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'サーバーエラー',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// トークン設定エンドポイント
app.post('/api/set-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'トークンが提供されていません' });
    }

    // 環境変数ファイルを更新
    const envPath = path.resolve(__dirname, 'env.development');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // FB_USER_OR_LL_TOKENの行を更新または追加
    const tokenLine = `FB_USER_OR_LL_TOKEN=${token}`;
    
    if (envContent.includes('FB_USER_OR_LL_TOKEN=')) {
      envContent = envContent.replace(
        /FB_USER_OR_LL_TOKEN=.*/,
        tokenLine
      );
    } else {
      envContent += `\n${tokenLine}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    res.json({ 
      success: true, 
      message: 'トークンが設定されました',
      token: token.substring(0, 20) + '...'
    });

  } catch (error) {
    res.status(500).json({
      error: 'トークン設定失敗',
      message: error.message
    });
  }
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('エラー:', err);
  res.status(500).json({ error: 'サーバーエラー' });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// HTTPS証明書の設定
const httpsOptions = {
  key: null,
  cert: null
};

// 自己署名証明書の生成または読み込み
function setupHttpsCertificates() {
  const certDir = path.join(__dirname, 'certs');
  const keyPath = path.join(certDir, 'localhost-key.pem');
  const certPath = path.join(certDir, 'localhost.pem');

  // 証明書ディレクトリが存在しない場合は作成
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // 証明書ファイルが存在しない場合は生成
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('自己署名証明書を生成中...');
    
    // mkcertが利用可能な場合は使用
    const mkcertPath = path.join(__dirname, '..', 'mkcert.exe');
    if (fs.existsSync(mkcertPath)) {
      try {
        execSync(`"${mkcertPath}" -install -key-file "${keyPath}" -cert-file "${certPath}" localhost 127.0.0.1 ::1`, { 
          cwd: certDir,
          stdio: 'inherit'
        });
        console.log('mkcertで証明書を生成しました');
      } catch (error) {
        console.log('mkcertでの証明書生成に失敗、OpenSSLを使用します');
        generateSelfSignedCert(keyPath, certPath);
      }
    } else {
      generateSelfSignedCert(keyPath, certPath);
    }
  }

  // 証明書ファイルを読み込み
  try {
    httpsOptions.key = fs.readFileSync(keyPath);
    httpsOptions.cert = fs.readFileSync(certPath);
    console.log('HTTPS証明書を読み込みました');
  } catch (error) {
    console.error('証明書の読み込みに失敗:', error.message);
    process.exit(1);
  }
}

// OpenSSLを使用した自己署名証明書生成（フォールバック）
function generateSelfSignedCert(keyPath, certPath) {
  try {
    // 秘密鍵の生成
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { 
      cwd: path.dirname(keyPath),
      stdio: 'inherit'
    });
    
    // 証明書の生成
    const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = JP
ST = Tokyo
L = Tokyo
O = Instagram Marketing App
OU = Development
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
`;
    
    const configPath = path.join(path.dirname(keyPath), 'openssl.conf');
    fs.writeFileSync(configPath, opensslConfig);
    
    execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}"`, {
      cwd: path.dirname(keyPath),
      stdio: 'inherit'
    });
    
    // 設定ファイルを削除
    fs.unlinkSync(configPath);
    
    console.log('OpenSSLで自己署名証明書を生成しました');
  } catch (error) {
    console.error('OpenSSLでの証明書生成に失敗:', error.message);
    throw new Error('証明書の生成に失敗しました');
  }
}

// サーバー起動
function startServer() {
  try {
    setupHttpsCertificates();
    
    const httpsServer = https.createServer(httpsOptions, app);
    
    httpsServer.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 Instagram Marketing App - HTTPS サーバー起動');
      console.log('='.repeat(60));
      console.log(`✅ HTTPS: https://localhost:${PORT}`);
      console.log(`🔗 Health: https://localhost:${PORT}/health`);
      console.log(`🔗 Token Verify: https://localhost:${PORT}/api/verify-token`);
      console.log(`🔗 Set Token: https://localhost:${PORT}/api/set-token`);
      console.log('='.repeat(60));
      console.log('⚠️  自己署名証明書のため、ブラウザで警告が表示される場合があります');
      console.log('⚠️  警告を無視して「詳細設定」→「localhostにアクセス」を選択してください');
      console.log('='.repeat(60));
    });
    
    // エラーハンドリング
    httpsServer.on('error', (error) => {
      console.error('HTTPSサーバーエラー:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

// サーバー起動
startServer();
