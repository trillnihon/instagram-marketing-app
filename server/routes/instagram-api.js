import express from 'express';
import InstagramAPI from '../services/instagram-api.js';
import TokenService from '../services/tokenService.js';
import { exchangeLongLivedToken } from '../services/instagramGraphService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Instagram Graph API接続テスト用ルート
 */

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Instagram API サービスは正常に動作しています',
    timestamp: new Date().toISOString()
  });
});

// アクセストークンを使用した診断実行
router.post('/diagnostic', async (req, res) => {
  try {
    let accessToken = req.body.accessToken;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!accessToken) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'アクセストークンが必要です。DBに有効な長期トークンがありません。'
        });
      }
      accessToken = tokenData.token;
    }

    console.log('🔍 Instagram Graph API 診断開始');
    
    const instagramAPI = new InstagramAPI(accessToken);
    const diagnostic = await instagramAPI.runFullDiagnostic();
    
    res.json({
      success: true,
      data: diagnostic,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 診断エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ユーザー情報取得
router.get('/user-info', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    const instagramAPI = new InstagramAPI(access_token);
    const userInfo = await instagramAPI.getUserInfo();
    
    res.json({
      success: true,
      data: userInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ ユーザー情報取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Facebookページ一覧取得
router.get('/pages', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    const instagramAPI = new InstagramAPI(access_token);
    const pages = await instagramAPI.getPages();
    
    res.json({
      success: true,
      data: pages,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Facebookページ取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Instagram Business Account情報取得
router.get('/instagram-account/:accountId', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    const { accountId } = req.params;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId パラメータが必要です'
      });
    }

    const instagramAPI = new InstagramAPI(access_token);
    const accountInfo = await instagramAPI.getInstagramAccount(accountId);
    
    res.json({
      success: true,
      data: accountInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Instagram Account取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Instagram投稿一覧取得
router.get('/media/:accountId', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    const { limit = 25 } = req.query;
    const { accountId } = req.params;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId パラメータが必要です'
      });
    }

    const instagramAPI = new InstagramAPI(access_token);
    const media = await instagramAPI.getMedia(accountId, parseInt(limit));
    
    res.json({
      success: true,
      data: media,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Instagram投稿取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// メディアインサイト取得
router.get('/media/:mediaId/insights', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    const { mediaId } = req.params;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!mediaId) {
      return res.status(400).json({
        success: false,
        error: 'mediaId パラメータが必要です'
      });
    }

    const instagramAPI = new InstagramAPI(access_token);
    const insights = await instagramAPI.getMediaInsights(mediaId);
    
    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ メディアインサイト取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// アカウントインサイト取得
router.get('/account/:accountId/insights', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    const { accountId } = req.params;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId パラメータが必要です'
      });
    }

    const instagramAPI = new InstagramAPI(access_token);
    const insights = await instagramAPI.getAccountInsights(accountId);
    
    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ アカウントインサイト取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// エラーログ取得
router.get('/errors', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    const instagramAPI = new InstagramAPI(access_token);
    const errors = instagramAPI.getErrors();
    
    res.json({
      success: true,
      data: errors,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ エラーログ取得エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 投稿時間分析API
router.post('/posting-time-analysis', async (req, res) => {
  try {
    let access_token = req.body.accessToken || req.body.access_token;
    const { accountId, days = 30 } = req.body;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'accessToken または access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId パラメータが必要です'
      });
    }

    console.log('📊 投稿時間分析開始:', { accountId, days });
    console.log('📊 リクエストボディ:', req.body);
    console.log('📊 アクセストークン:', access_token ? '設定済み' : '未設定');
    
    const instagramAPI = new InstagramAPI(access_token);
    const analysis = await instagramAPI.analyzePostingTimes(accountId, parseInt(days));
    
    res.json({
      success: true,
      data: {
        postingTimes: analysis.postingTimes || [],
        hourlyDistribution: analysis.hourlyDistribution || [],
        dailyDistribution: analysis.dailyDistribution || [],
        bestPostingTimes: analysis.bestPostingTimes || {},
        recommendations: analysis.recommendations || [],
        totalPosts: analysis.totalPosts || 0,
        analysisPeriod: analysis.analysisPeriod || days
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 投稿時間分析エラー:', error.message);
    console.error('❌ エラースタック:', error.stack);
    
    // エラーの種類に応じて適切なレスポンスを返す
    let statusCode = 500;
    let errorMessage = '投稿時間分析中にエラーが発生しました';
    
    if (error.message.includes('access_token')) {
      statusCode = 401;
      errorMessage = 'アクセストークンが無効です';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorMessage = 'API制限に達しました。しばらく時間をおいてから再試行してください';
    } else if (error.message.includes('permission')) {
      statusCode = 403;
      errorMessage = 'この操作を実行する権限がありません';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// AI投稿生成API
router.post('/ai/generate-post', async (req, res) => {
  try {
    let access_token = req.body.accessToken || req.body.access_token;
    const { 
      accountId, 
      contentType = 'post', 
      tone = 'professional', 
      targetAudience = 'general',
      industry = 'general',
      postLength = 'medium',
      includeHashtags = true,
      language = 'ja'
    } = req.body;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'accessToken または access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId パラメータが必要です'
      });
    }

    console.log('🤖 AI投稿生成開始:', { 
      accountId, 
      contentType, 
      tone, 
      targetAudience, 
      industry, 
      postLength, 
      includeHashtags, 
      language 
    });
    console.log('🤖 リクエストボディ:', req.body);
    console.log('🤖 アクセストークン:', access_token ? '設定済み' : '未設定');
    
    const instagramAPI = new InstagramAPI(access_token);
    const generatedPost = await instagramAPI.generateAIPost({
      accountId,
      contentType,
      tone,
      targetAudience,
      industry,
      postLength,
      includeHashtags,
      language
    });
    
    res.json({
      success: true,
      data: {
        content: generatedPost.content || '',
        hashtags: generatedPost.hashtags || [],
        recommendations: generatedPost.recommendations || [],
        metadata: generatedPost.metadata || {}
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI投稿生成エラー:', error.message);
    console.error('❌ エラースタック:', error.stack);
    
    // エラーの種類に応じて適切なレスポンスを返す
    let statusCode = 500;
    let errorMessage = 'AI投稿生成中にエラーが発生しました';
    
    if (error.message.includes('access_token')) {
      statusCode = 401;
      errorMessage = 'アクセストークンが無効です';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorMessage = 'API制限に達しました。しばらく時間をおいてから再試行してください';
    } else if (error.message.includes('permission')) {
      statusCode = 403;
      errorMessage = 'この操作を実行する権限がありません';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// 投稿パフォーマンス分析API
router.get('/performance-analysis/:accountId', async (req, res) => {
  try {
    let access_token = req.query.access_token;
    const { accountId } = req.params;
    const { period = '30d', metric = 'engagement' } = req.query;
    
    // アクセストークンが指定されていない場合はDBから取得
    if (!access_token) {
      const tokenData = await TokenService.getValidLongLivedToken();
      if (!tokenData) {
        return res.status(400).json({
          success: false,
          error: 'access_token パラメータが必要です。DBに有効な長期トークンがありません。'
        });
      }
      access_token = tokenData.token;
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId パラメータが必要です'
      });
    }

    console.log('📈 パフォーマンス分析開始:', { accountId, period, metric });
    console.log('📈 クエリパラメータ:', req.query);
    console.log('📈 アクセストークン:', access_token ? '設定済み' : '未設定');
    
    const instagramAPI = new InstagramAPI(access_token);
    const performance = await instagramAPI.analyzePerformance(accountId, period, metric);
    
    res.json({
      success: true,
      data: {
        metrics: performance.metrics || {},
        insights: performance.insights || [],
        recommendations: performance.recommendations || [],
        period: performance.period || period,
        accountId: performance.accountId || accountId
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ パフォーマンス分析エラー:', error.message);
    console.error('❌ エラースタック:', error.stack);
    
    // エラーの種類に応じて適切なレスポンスを返す
    let statusCode = 500;
    let errorMessage = 'パフォーマンス分析中にエラーが発生しました';
    
    if (error.message.includes('access_token')) {
      statusCode = 401;
      errorMessage = 'アクセストークンが無効です';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorMessage = 'API制限に達しました。しばらく時間をおいてから再試行してください';
    } else if (error.message.includes('permission')) {
      statusCode = 403;
      errorMessage = 'この操作を実行する権限がありません';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 短期アクセストークンを長期アクセストークンに変換
 * GET /api/instagram/exchange-token
 */
router.get("/exchange-token", async (req, res) => {
  try {
    const shortToken = process.env.FB_USER_OR_LL_TOKEN;
    
    if (!shortToken) {
      return res.status(400).json({
        success: false,
        error: 'FB_USER_OR_LL_TOKEN環境変数が設定されていません'
      });
    }

    console.log(`🔄 [TOKEN EXCHANGE] 短期トークンから長期トークンへの変換開始`);
    console.log(`🔑 [TOKEN EXCHANGE] 短期トークン: ${shortToken.substring(0, 20)}...`);
    
    const data = await exchangeLongLivedToken(shortToken);
    
    console.log(`✅ [TOKEN EXCHANGE] トークン変換成功: ${data.access_token ? '成功' : '失敗'}`);
    
    res.json({ 
      success: true, 
      data,
      message: '短期アクセストークンを長期アクセストークンに変換しました',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ [TOKEN EXCHANGE] トークン変換失敗:`, error);
    
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
      message: 'トークン変換に失敗しました',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Instagram Graph APIサービス状態確認
 * GET /api/instagram/status
 */
router.get("/status", async (req, res) => {
  try {
    const { instagramGraphService } = await import('../services/instagramGraphService.js');
    
    const status = instagramGraphService.getServiceStatus();
    
    res.json({
      success: true,
      message: 'Instagram Graph APIサービス状態を取得しました',
      data: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [INSTAGRAM STATUS] サービス状態確認失敗:', error);
    
    res.status(500).json({
      success: false,
      message: 'Instagram Graph APIサービス状態の確認に失敗しました',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 