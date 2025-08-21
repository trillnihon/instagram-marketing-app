import express from 'express';
import InstagramAPI from '../services/instagram-api.js';
import TokenService from '../services/tokenService.js';
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
    let access_token = req.body.access_token;
    const { accountId, days = 30 } = req.body;
    
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

    console.log('📊 投稿時間分析開始:', { accountId, days });
    
    const instagramAPI = new InstagramAPI(access_token);
    const analysis = await instagramAPI.analyzePostingTimes(accountId, parseInt(days));
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 投稿時間分析エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// AI投稿生成API
router.post('/ai/generate-post', async (req, res) => {
  try {
    let access_token = req.body.access_token;
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
      data: generatedPost,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI投稿生成エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
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
    
    const instagramAPI = new InstagramAPI(access_token);
    const performance = await instagramAPI.analyzePerformance(accountId, period, metric);
    
    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ パフォーマンス分析エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 