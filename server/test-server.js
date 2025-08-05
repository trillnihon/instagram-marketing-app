import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// CORS設定
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// JSONパーサー
app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  console.log('🏥 ヘルスチェックリクエスト受信');
  res.json({
    status: 'ok',
    message: 'Instagram Marketing App Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// デモデータエンドポイント
app.get('/api/instagram/history/demo', (req, res) => {
  console.log('📱 Instagram履歴リクエスト受信');
  const demoPosts = [
    {
      id: 'demo_post_1',
      caption: 'デモ投稿1: 美しい風景写真 #デモ #テスト',
      media_type: 'IMAGE',
      media_url: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Demo+Post+1',
      thumbnail_url: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=Demo+1',
      permalink: 'https://instagram.com/p/demo1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      likes: 150,
      comments: 25,
      engagement_rate: 8.5
    },
    {
      id: 'demo_post_2',
      caption: 'デモ投稿2: おいしい料理 #デモ #料理',
      media_type: 'IMAGE',
      media_url: 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Demo+Post+2',
      thumbnail_url: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=Demo+2',
      permalink: 'https://instagram.com/p/demo2',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      likes: 200,
      comments: 30,
      engagement_rate: 9.2
    }
  ];

  res.json({
    success: true,
    data: demoPosts,
    message: 'デモ投稿データを取得しました'
  });
});

// スケジュール済み投稿エンドポイント
app.post('/api/scheduler/posts', (req, res) => {
  console.log('📅 スケジュール済み投稿リクエスト受信');
  const scheduledPosts = [
    {
      id: 'scheduled_1',
      caption: '予定投稿1: 明日の投稿 #予定',
      scheduled_time: new Date(Date.now() + 86400000).toISOString(),
      status: 'scheduled'
    }
  ];

  res.json({
    success: true,
    data: scheduledPosts,
    message: 'スケジュール済み投稿を取得しました'
  });
});

// アナリティクスダッシュボードエンドポイント
app.post('/api/analytics/dashboard', (req, res) => {
  console.log('📊 アナリティクスリクエスト受信');
  const analyticsData = {
    total_posts: 15,
    total_likes: 2500,
    total_comments: 350,
    average_engagement_rate: 8.7,
    followers_growth: 150,
    top_performing_posts: [
      {
        id: 'top_1',
        caption: '最も人気の投稿',
        likes: 450,
        comments: 65,
        engagement_rate: 12.5
      }
    ]
  };

  res.json({
    success: true,
    data: analyticsData,
    message: 'アナリティクスデータを取得しました'
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('❌ エラー:', err);
  res.status(500).json({
    success: false,
    error: 'サーバーエラーが発生しました',
    message: err.message
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  console.log('❌ 404エラー:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`✅ テストサーバー起動成功: http://localhost:${PORT}`);
  console.log('📊 利用可能なエンドポイント:');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/instagram/history/demo');
  console.log('  - POST /api/scheduler/posts');
  console.log('  - POST /api/analytics/dashboard');
  console.log('�� サーバー準備完了！');
}); 