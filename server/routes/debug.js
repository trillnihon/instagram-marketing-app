import express from 'express';
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
      console.log('✅ [DEBUG] MongoDB接続成功');
    } catch (error) {
      console.error('❌ [DEBUG] MongoDB接続失敗:', error);
      throw error;
    }
  }
  return mongoClient;
}

/**
 * 保存されたトークン一覧取得
 * GET /debug/tokens
 */
router.get('/tokens', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] トークン一覧取得開始');
    
    const client = await getMongoClient();
    const db = client.db('instagram-marketing');
    const tokensCollection = db.collection('tokens');

    // 全トークンを取得
    const tokens = await tokensCollection.find({}).toArray();
    
    console.log(`✅ [DEBUG] トークン一覧取得成功: ${tokens.length}件`);

    // レスポンス用にトークンをマスク
    const maskedTokens = tokens.map(token => ({
      _id: token._id,
      userId: token.userId,
      userName: token.userName,
      userEmail: token.userEmail,
      expiresIn: token.expiresIn,
      obtainedAt: token.obtainedAt,
      provider: token.provider,
      tokenType: token.tokenType || 'authorization_code_flow',
      accessToken: token.accessToken ? `${token.accessToken.substring(0, 10)}...${token.accessToken.substring(token.accessToken.length - 4)}` : null,
      tokenLength: token.accessToken ? token.accessToken.length : 0
    }));

    res.json({
      success: true,
      message: 'トークン一覧を取得しました',
      data: {
        tokens: maskedTokens,
        count: tokens.length,
        database: 'instagram-marketing',
        collection: 'tokens'
      }
    });

  } catch (error) {
    console.error('❌ [DEBUG] トークン一覧取得エラー:', error);
    
    // MongoDB接続エラーの場合
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        error: 'データベース接続エラーが発生しました',
        details: 'MongoDBへの接続に失敗しました'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'トークン一覧の取得に失敗しました',
      details: error.message
    });
  }
});

/**
 * 特定ユーザーのトークン取得
 * GET /debug/tokens/:userId
 */
router.get('/tokens/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 [DEBUG] ユーザートークン取得開始: ${userId}`);
    
    const client = await getMongoClient();
    const db = client.db('instagram-marketing');
    const tokensCollection = db.collection('tokens');

    // 特定ユーザーのトークンを取得
    const token = await tokensCollection.findOne({ userId: userId });
    
    if (!token) {
      return res.status(404).json({
        success: false,
        error: 'トークンが見つかりません',
        details: `ユーザーID ${userId} のトークンが存在しません`
      });
    }

    console.log(`✅ [DEBUG] ユーザートークン取得成功: ${userId}`);

    // レスポンス用にトークンをマスク
    const maskedToken = {
      _id: token._id,
      userId: token.userId,
      userName: token.userName,
      userEmail: token.userEmail,
      expiresIn: token.expiresIn,
      obtainedAt: token.obtainedAt,
      provider: token.provider,
      tokenType: token.tokenType || 'authorization_code_flow',
      accessToken: token.accessToken ? `${token.accessToken.substring(0, 10)}...${token.accessToken.substring(token.accessToken.length - 4)}` : null,
      tokenLength: token.accessToken ? token.accessToken.length : 0
    };

    res.json({
      success: true,
      message: 'ユーザートークンを取得しました',
      data: {
        token: maskedToken,
        database: 'instagram-marketing',
        collection: 'tokens'
      }
    });

  } catch (error) {
    console.error('❌ [DEBUG] ユーザートークン取得エラー:', error);
    
    // MongoDB接続エラーの場合
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        error: 'データベース接続エラーが発生しました',
        details: 'MongoDBへの接続に失敗しました'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'ユーザートークンの取得に失敗しました',
      details: error.message
    });
  }
});

/**
 * データベース接続状況確認
 * GET /debug/status
 */
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] データベース接続状況確認');
    
    const client = await getMongoClient();
    const db = client.db('instagram-marketing');
    
    // データベース接続テスト
    await db.admin().ping();
    
    // コレクション情報を取得
    const collections = await db.listCollections().toArray();
    const tokensCollection = db.collection('tokens');
    const tokenCount = await tokensCollection.countDocuments();
    
    console.log('✅ [DEBUG] データベース接続状況確認完了');

    res.json({
      success: true,
      message: 'データベース接続状況を確認しました',
      data: {
        database: 'instagram-marketing',
        status: 'connected',
        collections: collections.map(col => col.name),
        tokenCount: tokenCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [DEBUG] データベース接続状況確認エラー:', error);
    
    res.status(500).json({
      success: false,
      error: 'データベース接続状況の確認に失敗しました',
      details: error.message
    });
  }
});

export default router;
