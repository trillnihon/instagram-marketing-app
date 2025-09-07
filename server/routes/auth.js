import express from 'express';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const router = express.Router();

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
 * Instagram OAuth認証コールバック
 * GET /auth/instagram/callback
 */
router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, error, error_description } = req.query;

    // エラーチェック
    if (error) {
      console.error(`❌ [AUTH] Facebook認証エラー: ${error} - ${error_description}`);
      return res.status(400).json({
        success: false,
        error: `Facebook認証エラー: ${error_description || error}`
      });
    }

    if (!code) {
      console.error('❌ [AUTH] 認証コードが取得できませんでした');
      return res.status(400).json({
        success: false,
        error: '認証コードが取得できませんでした'
      });
    }

    console.log(`🔍 [AUTH] 認証コード受信: ${code.substring(0, 10)}...`);

    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const redirectUri = process.env.FB_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      console.error('❌ [AUTH] 必要な環境変数が設定されていません');
      return res.status(500).json({
        success: false,
        error: 'Facebook App設定が不完全です'
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
      return res.status(400).json({
        success: false,
        error: `短期トークン取得失敗: ${errorText}`
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
      return res.status(400).json({
        success: false,
        error: `長期トークン変換失敗: ${errorText}`
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
      return res.status(400).json({
        success: false,
        error: `ユーザー情報取得失敗: ${errorText}`
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

    // upsert操作（既存レコードがあれば更新、なければ新規作成）
    const result = await tokensCollection.updateOne(
      { userId: userData.id },
      { $set: tokenDocument },
      { upsert: true }
    );

    console.log(`✅ [AUTH] MongoDB保存成功: ${result.upsertedCount > 0 ? '新規作成' : '更新'}`);

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
    console.error('❌ [AUTH] Instagram認証コールバックエラー:', error);
    res.status(500).json({
      success: false,
      error: '認証処理中にエラーが発生しました'
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