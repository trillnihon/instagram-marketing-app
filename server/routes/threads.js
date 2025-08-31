import express from 'express';
import { getTrendPosts, getHashtagRanking } from '../services/threadsDataService.js';

const router = express.Router();

// ダミーデータストア
let dummyPosts = [
  {
    id: '1',
    content: 'これは最初のダミー投稿です。',
    media: ['https://example.com/image1.jpg'],
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    content: '2番目のダミー投稿です。',
    media: [],
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

// 認証ミドルウェア（改善版）
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // ダミートークン検証（実際のトークンと一致するかチェック）
  const expectedToken = process.env.API_TOKEN || 'your_actual_token_here';
  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};

// 認証バイパスミドルウェア（特定のエンドポイント用）
const authenticateTokenWithBypass = (req, res, next) => {
  // Graph API呼び出し時は認証をバイパス
  if (req.path === '/trend-posts' || req.path === '/hashtag-ranking') {
    // FB_USER_OR_LL_TOKENが存在する場合は認証をスキップ
    if (process.env.FB_USER_OR_LL_TOKEN) {
      console.log('🔓 [THREADS API] 認証バイパス - Graph API呼び出し');
      return next();
    }
  }

  // 通常の認証処理
  authenticateToken(req, res, next);
};

// POST /threads/api/submitPost
router.post('/submitPost', authenticateToken, (req, res) => {
  try {
    const { content, media = [] } = req.body;

    // バリデーション
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Content must be 500 characters or less' });
    }

    if (!Array.isArray(media)) {
      return res.status(400).json({ error: 'Media must be an array' });
    }

    // 新しい投稿を作成
    const newPost = {
      id: Date.now().toString(),
      content,
      media,
      timestamp: new Date().toISOString()
    };

    // ダミーデータに追加
    dummyPosts.unshift(newPost);

    console.log('📝 [THREADS API] 投稿作成成功:', {
      id: newPost.id,
      contentLength: content.length,
      mediaCount: media.length
    });

    res.status(201).json({
      success: true,
      id: newPost.id,
      timestamp: newPost.timestamp
    });
  } catch (error) {
    console.error('❌ [THREADS API] 投稿作成エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /threads/api/listPosts
router.get('/listPosts', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = dummyPosts.slice(0, limit);

    console.log('📋 [THREADS API] 投稿一覧取得成功:', {
      requestedLimit: limit,
      returnedCount: posts.length,
      totalCount: dummyPosts.length
    });

    res.json(posts);
  } catch (error) {
    console.error('❌ [THREADS API] 投稿一覧取得エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /threads/api/deletePost/:id
router.delete('/deletePost/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = dummyPosts.length;
    
    dummyPosts = dummyPosts.filter(post => post.id !== id);
    
    if (dummyPosts.length === initialLength) {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log('🗑️ [THREADS API] 投稿削除成功:', {
      deletedId: id,
      remainingCount: dummyPosts.length
    });

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('❌ [THREADS API] 投稿削除エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /threads/api/analyze
router.post('/analyze', authenticateToken, (req, res) => {
  try {
    const { content, media = [] } = req.body;

    // バリデーション
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    if (!Array.isArray(media)) {
      return res.status(400).json({ error: 'Media must be an array' });
    }

    const analysis = {
      contentLength: content.length,
      mediaCount: media.length,
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
      hasMedia: media.length > 0,
      isLongPost: content.length > 200
    };

    console.log('📊 [THREADS API] 投稿分析成功:', analysis);

    res.json(analysis);
  } catch (error) {
    console.error('❌ [THREADS API] 投稿分析エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/threads/trend-posts
router.get('/trend-posts', authenticateTokenWithBypass, async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const days = parseInt(req.query.days) || 30;

    console.log('📈 [THREADS API] トレンド投稿取得開始:', { userId, days });

    // FB_USER_OR_LL_TOKENを必ず付与
    const accessToken = process.env.FB_USER_OR_LL_TOKEN;
    if (!accessToken) {
      console.error('❌ [THREADS API] FB_USER_OR_LL_TOKENが設定されていません');
      return res.status(500).json({ 
        success: false, 
        error: 'Facebook access token not configured' 
      });
    }

    const trendPosts = await getTrendPosts(userId, days);

    console.log('✅ [THREADS API] トレンド投稿取得成功:', {
      userId,
      days,
      postCount: trendPosts.length
    });

    res.json({
      success: true,
      data: trendPosts,
      count: trendPosts.length
    });

  } catch (error) {
    console.error('❌ [THREADS API] トレンド投稿取得エラー:', error);
    
    // エラー時は401ではなく{ success:false, error: message }を返す
    res.status(200).json({
      success: false,
      error: error.message || 'Failed to fetch trend posts',
      data: []
    });
  }
});

// GET /api/threads/hashtag-ranking
router.get('/hashtag-ranking', authenticateTokenWithBypass, async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';

    console.log('🏷️ [THREADS API] ハッシュタグランキング取得開始:', { userId });

    // FB_USER_OR_LL_TOKENを必ず付与
    const accessToken = process.env.FB_USER_OR_LL_TOKEN;
    if (!accessToken) {
      console.error('❌ [THREADS API] FB_USER_OR_LL_TOKENが設定されていません');
      return res.status(500).json({ 
        success: false, 
        error: 'Facebook access token not configured' 
      });
    }

    const hashtagRanking = await getHashtagRanking(userId);

    // 投稿が0件なら空配列を返す
    if (!hashtagRanking || hashtagRanking.length === 0) {
      console.log('📭 [THREADS API] ハッシュタグデータが0件');
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    // キャプションから #ハッシュタグ を抽出してカウント
    const hashtagCounts = {};
    hashtagRanking.forEach(item => {
      if (item.tag && item.tag.startsWith('#')) {
        hashtagCounts[item.tag] = (hashtagCounts[item.tag] || 0) + (item.usageCount || 1);
      }
    });

    console.log('✅ [THREADS API] ハッシュタグランキング取得成功:', {
      userId,
      hashtagCount: hashtagRanking.length,
      extractedHashtags: Object.keys(hashtagCounts).length
    });

    res.json({
      success: true,
      data: hashtagRanking,
      hashtagCounts,
      count: hashtagRanking.length
    });

  } catch (error) {
    console.error('❌ [THREADS API] ハッシュタグランキング取得エラー:', error);
    
    // 例外はすべて try-catch でキャッチして 500 にならないようにする
    res.status(200).json({
      success: false,
      error: error.message || 'Failed to fetch hashtag ranking',
      data: [],
      hashtagCounts: {},
      count: 0
    });
  }
});

export default router; 