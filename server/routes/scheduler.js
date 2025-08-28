import express from 'express';
const router = express.Router();

// 簡易的なメモリ保存（本番ではDB推奨）
let scheduledPosts = [];

// 投稿取得
router.get('/posts', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const posts = scheduledPosts.filter(p => p.userId === userId);
  // データ構造を統一（フロントエンドの期待する形式に合わせる）
  res.json({ 
    success: true, 
    posts,
    message: posts.length === 0 ? 'スケジュール済み投稿が存在しません' : 'スケジュール済み投稿を取得しました'
  });
});

// 投稿追加
router.post('/posts', (req, res) => {
  const { userId, post } = req.body;
  if (!userId || !post) {
    return res.status(400).json({ error: 'userId and post are required' });
  }
  const newPost = { id: Date.now().toString(), userId, ...post };
  scheduledPosts.push(newPost);
  res.json({ success: true, post: newPost });
});

export default router;
