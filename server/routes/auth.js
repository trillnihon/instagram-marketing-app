import express from 'express';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// インメモリユーザーストア（本番ではDBを使用）
const users = new Map();

// JWTシークレットキー（本番では環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 環境変数の確認
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

// JWT認証ミドルウェア
const authenticateToken = (req, res, next) => {
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

console.log('🔍 [AUTH] 環境変数チェック:', {
  FB_APP_ID: FB_APP_ID ? '設定済み' : '未設定',
  FB_APP_SECRET: FB_APP_SECRET ? '設定済み' : '未設定',
  FB_REDIRECT_URI: FB_REDIRECT_URI ? '設定済み' : '未設定'
});

if (!FB_APP_ID || !FB_APP_SECRET) {
  console.error("[AUTH] FB_APP_IDまたはFB_APP_SECRETが未設定");
}

// ========== 基本的な認証エンドポイント ==========

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
        error: 'メールアクレスまたはパスワードが正しくありません' 
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

// ========== Instagram専用エンドポイント ==========

/**
 * 環境変数設定状況確認エンドポイント
 * GET /auth/env-check
 */
router.get('/env-check', (req, res) => {
  const envStatus = {
    FB_APP_ID: FB_APP_ID ? '設定済み' : '未設定',
    FB_APP_SECRET: FB_APP_SECRET ? '設定済み' : '未設定',
    FB_REDIRECT_URI: FB_REDIRECT_URI ? '設定済み' : '未設定',
    MONGO_URI: process.env.MONGO_URI ? '設定済み' : '未設定'
  };
  
  const allSet = FB_APP_ID && FB_APP_SECRET && FB_REDIRECT_URI;
  
  res.json({
    success: allSet,
    message: allSet ? 'すべての環境変数が設定されています' : '一部の環境変数が未設定です',
    environment: envStatus,
    redirect_uri: FB_REDIRECT_URI
  });
});

// MongoDB接続設定
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram-marketing';
let mongoClient = null;

/**
 * MongoDB接続を取得
 */
async function getMongoClient() {
  if (!mongoClient) {
    try {
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      console.log('✅ [AUTH] MongoDB接続成功');
    } catch (error) {
      console.error('❌ [AUTH] MongoDB接続失敗:', error);
      throw error;
    }
  }
  return mongoClient;
}

/**
 * Instagram OAuth認証開始
 * GET /auth/instagram
 */
router.get('/instagram', (req, res) => {
  try {
    const appId = process.env.FB_APP_ID;
    const redirectUri = process.env.FB_REDIRECT_URI;
    
    if (!appId || !redirectUri) {
      console.error('❌ [AUTH] 必要な環境変数が設定されていません');
      return res.status(500).json({
        success: false,
        error: 'Facebook App IDまたはRedirect URIが設定されていません'
      });
    }

    // 必要なスコープ
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
      'public_profile',
      'email'
    ].join(',');

    // Facebook認証URLを構築
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scopes}&` +
      `response_type=code&` +
      `state=instagram_auth`;

    console.log(`🔍 [AUTH] Instagram認証開始: ${authUrl.replace(appId, '***APP_ID***')}`);

    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ [AUTH] Instagram認証開始エラー:', error);
    res.status(500).json({
      success: false,
      error: '認証開始に失敗しました'
    });
  }
});

/**
 * Instagram OAuth認証コード交換
 * POST /auth/exchange
 */
router.post('/exchange', async (req, res) => {
  try {
    const { code } = req.body;
    console.log("受け取ったcode:", code);
    console.log('🔍 [AUTH] リクエストボディ全体:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [AUTH] リクエストヘッダー:', JSON.stringify(req.headers, null, 2));

    if (!code) {
      console.error('❌ [AUTH] 認証コードが提供されていません');
      console.error('❌ [AUTH] req.body:', req.body);
      console.error('❌ [AUTH] req.body.code:', req.body.code);
      return res.status(400).json({
        success: false,
        error: '認証コードが提供されていません'
      });
    }

    console.log(`🔍 [AUTH] 認証コード受信: ${code.substring(0, 10)}...`);

    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const redirectUri = process.env.FB_REDIRECT_URI;

    // 詳細ログを追加
    console.log("🔍 [AUTH] 受信した code:", code);
    console.log("🔍 [AUTH] 使用する redirect_uri:", process.env.FB_REDIRECT_URI);
    console.log("🔍 [AUTH] 使用する client_id:", process.env.FB_APP_ID);
    console.log("🔍 [AUTH] 使用する client_secret (一部):", process.env.FB_APP_SECRET ? process.env.FB_APP_SECRET.substring(0,6) + "..." : "undefined");

    if (!appId || !appSecret || !redirectUri) {
      console.error('❌ [AUTH] 必要な環境変数が設定されていません');
      console.error('❌ [AUTH] 環境変数チェック:', {
        FB_APP_ID: appId ? '設定済み' : '未設定',
        FB_APP_SECRET: appSecret ? '設定済み' : '未設定',
        FB_REDIRECT_URI: redirectUri ? '設定済み' : '未設定'
      });
      return res.status(500).json({
        success: false,
        error: 'Facebook App設定が不完全です',
        details: {
          FB_APP_ID: appId ? '設定済み' : '未設定',
          FB_APP_SECRET: appSecret ? '設定済み' : '未設定',
          FB_REDIRECT_URI: redirectUri ? '設定済み' : '未設定'
        }
      });
    }

    // 1. 短期アクセストークンを取得
    console.log('🔍 [AUTH] 短期アクセストークン取得開始');
    const shortTokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`
    );

    if (!shortTokenResponse.ok) {
      const errorText = await shortTokenResponse.text();
      console.error(`❌ [AUTH] 短期トークン取得失敗: ${shortTokenResponse.status} ${errorText}`);
      console.error("❌ [AUTH] Meta API エラー詳細:", errorText);
      console.error("❌ [AUTH] リクエストURL:", `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret ? appSecret.substring(0,6) + '...' : 'undefined'}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code.substring(0,10)}...`);
      return res.status(500).json({ 
        success: false, 
        error: errorText,
        metaApiError: true,
        statusCode: shortTokenResponse.status,
        requestDetails: {
          client_id: appId,
          redirect_uri: redirectUri,
          code_length: code.length
        }
      });
    }

    const shortTokenData = await shortTokenResponse.json();
    console.log(`✅ [AUTH] 短期トークン取得成功: ${shortTokenData.access_token.substring(0, 10)}...`);

    // 2. 長期アクセストークンに変換
    console.log('🔍 [AUTH] 長期アクセストークン変換開始');
    const longTokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortTokenData.access_token}`
    );

    if (!longTokenResponse.ok) {
      const errorText = await longTokenResponse.text();
      console.error(`❌ [AUTH] 長期トークン変換失敗: ${longTokenResponse.status} ${errorText}`);
      console.error("❌ [AUTH] Meta API エラー詳細 (長期トークン):", errorText);
      return res.status(500).json({ 
        success: false, 
        error: errorText,
        metaApiError: true,
        statusCode: longTokenResponse.status,
        step: 'long_token_exchange'
      });
    }

    const longTokenData = await longTokenResponse.json();
    console.log(`✅ [AUTH] 長期トークン変換成功: ${longTokenData.access_token.substring(0, 10)}...`);

    // 3. ユーザー情報を取得
    console.log('🔍 [AUTH] ユーザー情報取得開始');
    const userResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${longTokenData.access_token}`
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`❌ [AUTH] ユーザー情報取得失敗: ${userResponse.status} ${errorText}`);
      console.error("❌ [AUTH] Meta API エラー詳細 (ユーザー情報):", errorText);
      return res.status(500).json({ 
        success: false, 
        error: errorText,
        metaApiError: true,
        statusCode: userResponse.status,
        step: 'user_info_fetch'
      });
    }

    const userData = await userResponse.json();
    console.log(`✅ [AUTH] ユーザー情報取得成功: ${userData.name} (ID: ${userData.id})`);

    // 4. MongoDBに保存
    console.log('🔍 [AUTH] MongoDB保存開始');
    const client = await getMongoClient();
    const db = client.db('instagram-marketing');
    const tokensCollection = db.collection('tokens');

    const tokenDocument = {
      userId: userData.id,
      accessToken: longTokenData.access_token,
      expiresIn: longTokenData.expires_in || 5184000, // デフォルト60日
      obtainedAt: new Date().toISOString(),
      provider: 'instagram',
      userName: userData.name,
      userEmail: userData.email || null
    };

    console.log('🔍 [AUTH] 保存するトークンドキュメント:', {
      userId: tokenDocument.userId,
      userName: tokenDocument.userName,
      expiresIn: tokenDocument.expiresIn,
      obtainedAt: tokenDocument.obtainedAt,
      provider: tokenDocument.provider,
      accessToken: tokenDocument.accessToken ? `${tokenDocument.accessToken.substring(0, 10)}...` : null
    });

    // upsert操作（既存レコードがあれば更新、なければ新規作成）
    const result = await tokensCollection.updateOne(
      { userId: userData.id },
      { $set: tokenDocument },
      { upsert: true }
    );

    console.log(`✅ [AUTH] MongoDB保存成功: ${result.upsertedCount > 0 ? '新規作成' : '更新'}`);
    console.log('🔍 [AUTH] MongoDB操作結果:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });

    // 5. 成功レスポンス
    res.json({
      success: true,
      message: '長期トークンをMongoDBに保存しました',
      data: {
        userId: userData.id,
        userName: userData.name,
        expiresIn: tokenDocument.expiresIn,
        obtainedAt: tokenDocument.obtainedAt,
        operation: result.upsertedCount > 0 ? 'created' : 'updated'
      }
    });

  } catch (error) {
    console.error('❌ [AUTH] Instagram認証コード交換エラー:', error);
    console.error('❌ [AUTH] エラースタック:', error.stack);
    console.error('❌ [AUTH] エラー詳細:', {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status
    });
    
    // MongoDB接続エラーの場合
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        error: 'データベース接続エラーが発生しました。しばらく時間をおいてから再試行してください。'
      });
    }
    
    // Facebook APIエラーの場合
    if (error.message.includes('Facebook') || error.message.includes('Graph API')) {
      return res.status(400).json({
        success: false,
        error: 'Facebook APIとの通信に失敗しました。認証情報を確認してください。'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '認証処理中にエラーが発生しました'
    });
  }
});

/**
 * CORS preflight リクエスト対応
 * OPTIONS /auth/save-token
 */
router.options('/save-token', (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://instagram-marketing-app.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.status(200).end();
});

/**
 * Instagram OAuthアクセストークン保存（implicit flow用）
 * POST /auth/save-token
 */
router.post('/save-token', async (req, res) => {
  // 🔹 追加：明示的にCORSヘッダーを設定
  res.header("Access-Control-Allow-Origin", "https://instagram-marketing-app.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  try {
    const { accessToken } = req.body;
    console.log("受け取ったaccessToken:", accessToken ? accessToken.substring(0, 10) + '...' : 'なし');
    console.log('🔍 [AUTH] リクエストボディ全体:', JSON.stringify(req.body, null, 2));

    if (!accessToken) {
      console.error('❌ [AUTH] アクセストークンが提供されていません');
      return res.status(400).json({
        success: false,
        error: 'アクセストークンが提供されていません'
      });
    }

    console.log(`🔍 [AUTH] アクセストークン受信: ${accessToken.substring(0, 10)}...`);

    // 1. ユーザー情報を取得
    console.log('🔍 [AUTH] ユーザー情報取得開始');
    const userResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${accessToken}`
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`❌ [AUTH] ユーザー情報取得失敗: ${userResponse.status} ${errorText}`);
      console.error("❌ [AUTH] Meta API エラー詳細 (ユーザー情報):", errorText);
      return res.status(500).json({ 
        success: false, 
        error: errorText,
        metaApiError: true,
        statusCode: userResponse.status,
        step: 'user_info_fetch'
      });
    }

    const userData = await userResponse.json();
    console.log(`✅ [AUTH] ユーザー情報取得成功: ${userData.name} (ID: ${userData.id})`);

    // 2. トークンの有効期限を確認（デフォルト60日）
    const tokenExpiresIn = 5184000; // 60日（秒）

    // 3. MongoDBに保存
    console.log('🔍 [AUTH] MongoDB保存開始');
    const client = await getMongoClient();
    const db = client.db('instagram-marketing');
    const tokensCollection = db.collection('tokens');

    const tokenDocument = {
      userId: userData.id,
      accessToken: accessToken,
      expiresIn: tokenExpiresIn,
      obtainedAt: new Date().toISOString(),
      provider: 'instagram',
      userName: userData.name,
      userEmail: userData.email || null,
      tokenType: 'implicit_flow'
    };

    console.log('🔍 [AUTH] 保存するトークンドキュメント:', {
      userId: tokenDocument.userId,
      userName: tokenDocument.userName,
      expiresIn: tokenDocument.expiresIn,
      obtainedAt: tokenDocument.obtainedAt,
      provider: tokenDocument.provider,
      tokenType: tokenDocument.tokenType,
      accessToken: tokenDocument.accessToken ? `${tokenDocument.accessToken.substring(0, 10)}...` : null
    });

    // upsert操作（既存レコードがあれば更新、なければ新規作成）
    const result = await tokensCollection.updateOne(
      { userId: userData.id },
      { $set: tokenDocument },
      { upsert: true }
    );

    console.log(`✅ [AUTH] MongoDB保存成功: ${result.upsertedCount > 0 ? '新規作成' : '更新'}`);
    console.log('🔍 [AUTH] MongoDB操作結果:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId
    });

    // 4. JWT発行
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ [AUTH] JWT_SECRETが設定されていません');
      return res.status(500).json({
        success: false,
        error: 'JWT_SECRET not set'
      });
    }

    // JWT有効期限を環境ごとに設定
    const expiresIn = process.env.JWT_EXPIRES_IN 
        || (process.env.NODE_ENV === "production" ? "7d" : "60s");

    console.log(`🔍 [AUTH] JWT有効期限設定:`, {
      NODE_ENV: process.env.NODE_ENV,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      finalExpiresIn: expiresIn
    });

    const jwtPayload = { 
      id: userData.id, 
      name: userData.name, 
      provider: 'instagram' 
    };
    const token = jwt.sign(jwtPayload, secret, { expiresIn });

    console.log(`✅ [AUTH] JWT発行成功: ${token.substring(0, 20)}...`);

    // 5. 統一レスポンス形式
    res.json({
      success: true,
      user: { 
        id: userData.id, 
        name: userData.name 
      },
      token
    });

  } catch (error) {
    console.error('❌ [AUTH] Instagramアクセストークン保存エラー:', error);
    console.error('❌ [AUTH] エラースタック:', error.stack);
    console.error('❌ [AUTH] エラー詳細:', {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status
    });
    
    // MongoDB接続エラーの場合
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        error: 'データベース接続エラーが発生しました。しばらく時間をおいてから再試行してください。'
      });
    }
    
    // Facebook APIエラーの場合
    if (error.message.includes('Facebook') || error.message.includes('Graph API')) {
      return res.status(400).json({
        success: false,
        error: 'Facebook APIとの通信に失敗しました。認証情報を確認してください。'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'トークン保存処理中にエラーが発生しました'
    });
  }
});

/**
 * 保存されたトークン一覧取得
 * GET /auth/tokens
 */
router.get('/tokens', async (req, res) => {
  try {
    const client = await getMongoClient();
    const db = client.db('instagram-marketing');
    const tokensCollection = db.collection('tokens');

    const tokens = await tokensCollection.find({}).toArray();
    
    // アクセストークンをマスク
    const maskedTokens = tokens.map(token => ({
      userId: token.userId,
      userName: token.userName,
      expiresIn: token.expiresIn,
      obtainedAt: token.obtainedAt,
      provider: token.provider,
      accessToken: token.accessToken ? `${token.accessToken.substring(0, 10)}...${token.accessToken.substring(token.accessToken.length - 4)}` : null
    }));

    res.json({
      success: true,
      data: maskedTokens,
      count: tokens.length
    });

  } catch (error) {
    console.error('❌ [AUTH] トークン一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'トークン一覧の取得に失敗しました'
    });
  }
});

export default router;