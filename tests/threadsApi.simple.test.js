const request = require('supertest');
const express = require('express');

// 環境変数の設定
process.env.API_TOKEN = 'your_actual_token_here';
process.env.NODE_ENV = 'test';

// 簡素化されたルーター
const app = express();
app.use(express.json());

// ダミーデータストア
let dummyPosts = [
  {
    id: '1',
    content: 'これは最初のダミー投稿です。',
    media: ['https://example.com/image1.jpg'],
    timestamp: new Date().toISOString()
  }
];

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const expectedToken = process.env.API_TOKEN || 'your_actual_token_here';
  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};

// POST /threads/api/submitPost
app.post('/threads/api/submitPost', authenticateToken, (req, res) => {
  try {
    const { content, media = [] } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Content must be 500 characters or less' });
    }

    if (!Array.isArray(media)) {
      return res.status(400).json({ error: 'Media must be an array' });
    }

    const newPost = {
      id: Date.now().toString(),
      content,
      media,
      timestamp: new Date().toISOString()
    };

    dummyPosts.unshift(newPost);

    res.status(201).json({
      success: true,
      id: newPost.id,
      timestamp: newPost.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /threads/api/listPosts
app.get('/threads/api/listPosts', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = dummyPosts.slice(0, limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /threads/api/deletePost/:id
app.delete('/threads/api/deletePost/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = dummyPosts.length;
    
    dummyPosts = dummyPosts.filter(post => post.id !== id);
    
    if (dummyPosts.length === initialLength) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /threads/api/analyze
app.post('/threads/api/analyze', authenticateToken, (req, res) => {
  try {
    const { content, media = [] } = req.body;

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

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Threads API Integration Tests (Simplified)', () => {
  const validToken = 'your_actual_token_here';
  const invalidToken = 'invalid_token';

  describe('POST /threads/api/submitPost', () => {
    it('正常リクエストした場合の成功レスポンス', async () => {
      const postData = {
        content: 'テスト投稿内容',
        media: ['https://example.com/image.jpg']
      };

      const response = await request(app)
        .post('/threads/api/submitPost')
        .set('Authorization', `Bearer ${validToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('Authorizationヘッダー無しで401になるケース', async () => {
      const postData = {
        content: 'テスト投稿内容',
        media: []
      };

      const response = await request(app)
        .post('/threads/api/submitPost')
        .send(postData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authorization token required');
    });

    it('contentが欠落しているときに400を返す', async () => {
      const postData = {
        media: ['https://example.com/image.jpg']
      };

      const response = await request(app)
        .post('/threads/api/submitPost')
        .set('Authorization', `Bearer ${validToken}`)
        .send(postData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Content is required and must be a string');
    });
  });

  describe('GET /threads/api/listPosts', () => {
    it('正常に投稿一覧を取得できる', async () => {
      const response = await request(app)
        .get('/threads/api/listPosts')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /threads/api/deletePost/:id', () => {
    it('正常に投稿を削除できる', async () => {
      // まず投稿を作成
      const createResponse = await request(app)
        .post('/threads/api/submitPost')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          content: '削除用テスト投稿',
          media: []
        });

      const postId = createResponse.body.id;

      // 投稿を削除
      const deleteResponse = await request(app)
        .delete(`/threads/api/deletePost/${postId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('success', true);
    });
  });

  describe('POST /threads/api/analyze', () => {
    it('正常に投稿を分析できる', async () => {
      const postData = {
        content: 'これはテスト投稿です。分析対象のコンテンツです。',
        media: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      };

      const response = await request(app)
        .post('/threads/api/analyze')
        .set('Authorization', `Bearer ${validToken}`)
        .send(postData)
        .expect(200);

      expect(response.body).toHaveProperty('contentLength');
      expect(response.body).toHaveProperty('mediaCount');
      expect(response.body).toHaveProperty('wordCount');
    });
  });
}); 