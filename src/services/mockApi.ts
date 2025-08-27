/**
 * Instagram マーケティングアプリ - Mock API サービス
 * 
 * 🚨 次のチャットへの引き継ぎ情報（2025-08-25）
 * 
 * 現在の状況:
 * - ユーザーID参照ミス（currentUser?.userId → currentUser?.id）を修正完了
 * - API パスとパラメータの修正完了
 * - デバッグログを追加してAPI呼び出しの詳細を可視化
 * 
 * 残存する問題:
 * - バックエンドAPIが404エラーを返す（/instagram/history/:userId, /scheduler/posts）
 * - 本番API失敗時にMock APIが呼ばれ、via.placeholder.com の503エラーが発生
 * 
 * 次のステップ:
 * 1. バックエンドAPIの動作確認
 * 2. 本番APIが正常動作する場合、Mock APIの呼び出しを完全停止
 * 3. エラーハンドリングの改善
 * 
 * 絶対に変更禁止:
 * - 環境変数キー VITE_API_BASE_URL
 * - Instagram Graph API 認証フロー
 * - ProtectedRoute の認証チェック処理
 */

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
  getInstagramHistory: async (userId: string = 'demo_user') => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
      const apiUrl = `${apiBaseUrl}/instagram/history/${userId}`;
      console.log(`🔍 [DEBUG] 本番API呼び出し: ${apiUrl}`);
      console.log(`🔍 [DEBUG] ユーザーID: ${userId}`);
      
      const response = await fetch(apiUrl);
      console.log(`🔍 [DEBUG] 本番APIレスポンス: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [SUCCESS] 本番API成功: データ件数 ${data.data?.length || 0}`);
        return data;
      } else {
        console.log(`❌ [ERROR] 本番API失敗: ${response.status} ${response.statusText}`);
        // 本番APIが失敗した場合のみMock APIにフォールバック
        console.log('🔄 [FALLBACK] 本番API失敗のため、Mock APIにフォールバック');
        return await mockApi.getInstagramHistory();
      }
    } catch (error) {
      console.log('⚠️ [ERROR] 本番API接続エラー、Mock APIにフォールバック:', error);
      return await mockApi.getInstagramHistory();
    }
  },

  // スケジュール済み投稿取得（フォールバック付き）
  getScheduledPosts: async (userId: string = 'demo_user', month?: number, year?: number) => {
    try {
      // userId の検証を追加
      if (!userId || userId === 'undefined') {
        console.log('⚠️ [WARNING] 無効なユーザーID:', userId);
        console.log('🔄 [FALLBACK] 無効なユーザーIDのため、Mock APIにフォールバック');
        return await mockApi.getScheduledPosts();
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
      
      // クエリパラメータを構築
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const apiUrl = `${apiBaseUrl}/scheduler/posts?${params.toString()}`;
      console.log(`🔍 [DEBUG] 本番スケジュールAPI呼び出し: ${apiUrl}`);
      console.log(`🔍 [DEBUG] ユーザーID: ${userId}, 月: ${month}, 年: ${year}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`🔍 [DEBUG] 本番スケジュールAPIレスポンス: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [SUCCESS] 本番スケジュールAPI成功: データ件数 ${data.posts?.length || 0}`);
        return data;
      } else {
        console.log(`❌ [ERROR] 本番スケジュールAPI失敗: ${response.status} ${response.statusText}`);
        // 本番APIが失敗した場合のみMock APIにフォールバック
        console.log('🔄 [FALLBACK] 本番スケジュールAPI失敗のため、Mock APIにフォールバック');
        return await mockApi.getScheduledPosts();
      }
    } catch (error) {
      console.log('⚠️ [ERROR] 本番スケジュールAPI接続エラー、Mock APIにフォールバック:', error);
      return await mockApi.getScheduledPosts();
    }
  },

  // アナリティクスデータ取得（フォールバック付き）
  getAnalyticsData: async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
      const response = await fetch(`${apiBaseUrl}/analytics/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('✅ [SUCCESS] 本番アナリティクスAPI成功');
        return await response.json();
      } else {
        console.log(`❌ [ERROR] 本番アナリティクスAPI失敗: ${response.status} ${response.statusText}`);
        console.log('🔄 [FALLBACK] 本番アナリティクスAPI失敗のため、Mock APIにフォールバック');
        return await mockApi.getAnalyticsData();
      }
    } catch (error) {
      console.log('⚠️ [ERROR] 本番アナリティクスAPI接続エラー、Mock APIにフォールバック:', error);
      return await mockApi.getAnalyticsData();
    }
  },

  // ハッシュタグ分析データ取得（フォールバック付き）
  getHashtagData: async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
      const response = await fetch(`${apiBaseUrl}/hashtags/analysis`);
      if (response.ok) {
        console.log('✅ [SUCCESS] 本番ハッシュタグAPI成功');
        return await response.json();
      } else {
        console.log(`❌ [ERROR] 本番ハッシュタグAPI失敗: ${response.status} ${response.statusText}`);
        console.log('🔄 [FALLBACK] 本番ハッシュタグAPI失敗のため、Mock APIにフォールバック');
        return await mockApi.getHashtagData();
      }
    } catch (error) {
      console.log('⚠️ [ERROR] 本番ハッシュタグAPI接続エラー、Mock APIにフォールバック:', error);
      return await mockApi.getHashtagData();
    }
  },

  // ヘルスチェック（フォールバック付き）
  healthCheck: async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
      const response = await fetch(`${apiBaseUrl}/health`);
      if (response.ok) {
        console.log('✅ [SUCCESS] 本番ヘルスチェックAPI成功');
        return await response.json();
      } else {
        console.log(`❌ [ERROR] 本番ヘルスチェックAPI失敗: ${response.status} ${response.statusText}`);
        console.log('🔄 [FALLBACK] 本番ヘルスチェックAPI失敗のため、Mock APIにフォールバック');
        return await mockApi.healthCheck();
      }
    } catch (error) {
      console.log('⚠️ [ERROR] 本番ヘルスチェックAPI接続エラー、Mock APIにフォールバック:', error);
      return await mockApi.healthCheck();
    }
  }
}; 