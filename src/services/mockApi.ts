// モックAPIサービス - バックエンドが利用できない場合のフォールバック

// デモ投稿データ
const mockPosts = [
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
  },
  {
    id: 'demo_post_3',
    caption: 'デモ投稿3: 素敵な場所 #デモ #旅行',
    media_type: 'IMAGE',
    media_url: 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Demo+Post+3',
    thumbnail_url: 'https://via.placeholder.com/150x150/45B7D1/FFFFFF?text=Demo+3',
    permalink: 'https://instagram.com/p/demo3',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    likes: 180,
    comments: 22,
    engagement_rate: 8.8
  }
];

// スケジュール済み投稿データ
const mockScheduledPosts = [
  {
    id: 'scheduled_1',
    caption: '予定投稿1: 明日の投稿 #予定',
    scheduled_time: new Date(Date.now() + 86400000).toISOString(),
    status: 'scheduled'
  },
  {
    id: 'scheduled_2',
    caption: '予定投稿2: 来週の投稿 #予定',
    scheduled_time: new Date(Date.now() + 604800000).toISOString(),
    status: 'scheduled'
  }
];

// アナリティクスデータ
const mockAnalyticsData = {
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

// ハッシュタグ分析データ
const mockHashtagData = [
  {
    hashtag: '#カフェ',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#コーヒー',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#お気に入り',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#休憩',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#リラックス',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#美味しい',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#雰囲気',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  },
  {
    hashtag: '#おすすめ',
    usage_count: 1,
    avg_engagement: 9.0,
    avg_score: 1053
  }
];

// モックAPI関数
export const mockApi = {
  // 投稿履歴取得
  getInstagramHistory: async () => {
    console.log('📱 [MOCK API] Instagram履歴データを取得');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockPosts,
          message: 'デモ投稿データを取得しました（モック）'
        });
      }, 500); // 0.5秒の遅延でリアルなAPI呼び出しをシミュレート
    });
  },

  // スケジュール済み投稿取得
  getScheduledPosts: async () => {
    console.log('📅 [MOCK API] スケジュール済み投稿を取得');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockScheduledPosts,
          message: 'スケジュール済み投稿を取得しました（モック）'
        });
      }, 300);
    });
  },

  // アナリティクスデータ取得
  getAnalyticsData: async () => {
    console.log('📊 [MOCK API] アナリティクスデータを取得');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockAnalyticsData,
          message: 'アナリティクスデータを取得しました（モック）'
        });
      }, 400);
    });
  },

  // ハッシュタグ分析データ取得
  getHashtagData: async () => {
    console.log('🏷️ [MOCK API] ハッシュタグ分析データを取得');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockHashtagData,
          message: 'ハッシュタグ分析データを取得しました（モック）'
        });
      }, 200);
    });
  },

  // ヘルスチェック
  healthCheck: async () => {
    console.log('🏥 [MOCK API] ヘルスチェック');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'ok',
          message: 'モックAPIサーバーは正常に動作しています',
          timestamp: new Date().toISOString(),
          environment: 'mock'
        });
      }, 100);
    });
  }
};

// 実際のAPI呼び出しを試行し、失敗した場合はモックAPIを使用
export const apiWithFallback = {
  // 投稿履歴取得（フォールバック付き）
  getInstagramHistory: async () => {
    try {
      const response = await fetch('http://localhost:4000/api/instagram/history/demo');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('⚠️ [API FALLBACK] バックエンドAPI接続失敗、モックAPIを使用');
    }
    return await mockApi.getInstagramHistory();
  },

  // スケジュール済み投稿取得（フォールバック付き）
  getScheduledPosts: async () => {
    try {
      const response = await fetch('http://localhost:4000/api/scheduler/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('⚠️ [API FALLBACK] バックエンドAPI接続失敗、モックAPIを使用');
    }
    return await mockApi.getScheduledPosts();
  },

  // アナリティクスデータ取得（フォールバック付き）
  getAnalyticsData: async () => {
    try {
      const response = await fetch('http://localhost:4000/api/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('⚠️ [API FALLBACK] バックエンドAPI接続失敗、モックAPIを使用');
    }
    return await mockApi.getAnalyticsData();
  },

  // ハッシュタグ分析データ取得（フォールバック付き）
  getHashtagData: async () => {
    try {
      const response = await fetch('http://localhost:4000/api/hashtags/analysis');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('⚠️ [API FALLBACK] バックエンドAPI接続失敗、モックAPIを使用');
    }
    return await mockApi.getHashtagData();
  },

  // ヘルスチェック（フォールバック付き）
  healthCheck: async () => {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('⚠️ [API FALLBACK] バックエンドAPI接続失敗、モックAPIを使用');
    }
    return await mockApi.healthCheck();
  }
}; 