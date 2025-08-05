import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// ダミーデータストア
let dummyPosts: Array<{
  id: string;
  content: string;
  media: string[];
  timestamp: string;
}> = [
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

// 認証ミドルウェア（ダミー実装）
const authenticateToken = (req: Request, res: Response, next: Function) => {
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

// POST /threads/api/submitPost
router.post('/submitPost', authenticateToken, (req: Request, res: Response) => {
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
router.get('/listPosts', authenticateToken, (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
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
router.delete('/deletePost/:id', authenticateToken, (req: Request, res: Response) => {
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
router.post('/analyze', authenticateToken, (req: Request, res: Response) => {
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

export default router; 