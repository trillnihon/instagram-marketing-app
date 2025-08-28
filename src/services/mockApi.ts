/**
 * Instagram マーケティングアプリ - Mock API サービス
 * 
 * 🚨 次のチャットへの引き継ぎ情報（2025-08-28 本番API切り替え完了版）
 * 
 * 現在の状況:
 * ✅ ユーザーID参照ミス（currentUser?.userId → currentUser?.id）を修正完了
 * ✅ API パスとパラメータの修正完了
 * ✅ デバッグログを追加してAPI呼び出しの詳細を可視化
 * ✅ via.placeholder.comへの依存を削除（Base64 SVG画像に置換）
 * ✅ リトライ機能とタイムアウト処理を追加
 * ✅ 詳細なAPI状態監視機能を追加
 * ✅ 本番API切り替え完了（Mock APIフォールバック停止）
 * 
 * 本番API動作確認結果（2025-08-28）:
 * ✅ /api/health: 200 OK
 * ✅ /api/scheduler/posts?userId=demo_user: 200 OK  
 * ✅ /api/instagram/history/demo_user: 200 OK
 * 
 * 新機能:
 * - ApiStatusMonitorコンポーネントで本番APIの状態をリアルタイム監視
 * - 本番APIのみを使用（Mock APIフォールバックなし）
 * - エラー時は適切なエラーメッセージを表示
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
    media_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY2QjZCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gUG9zdCAxPC90ZXh0Pjwvc3ZnPg==',
    thumbnail_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY2QjZCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gMTwvdGV4dD48L3N2Zz4=',
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
    media_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEVDREM0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gUG9zdCAyPC90ZXh0Pjwvc3ZnPg==',
    thumbnail_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEVDREM0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gMjwvdGV4dD48L3N2Zz4=',
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
    media_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDVCN0QxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gUG9zdCAzPC90ZXh0Pjwvc3ZnPg==',
    thumbnail_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDVCN0QxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gMzwvdGV4dD48L3N2Zz4=',
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

// 本番APIのみを使用（Mock APIは停止済み）
export const apiWithFallback = {
  // 投稿履歴取得（本番APIのみ）
  getInstagramHistory: async (userId: string = 'demo_user') => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
    const apiUrl = `${apiBaseUrl}/instagram/history/${userId}`;
    console.log(`🔍 [PRODUCTION API] Instagram履歴取得: ${apiUrl}`);
    console.log(`🔍 [PRODUCTION API] ユーザーID: ${userId}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`🔍 [PRODUCTION API] レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [SUCCESS] 本番API成功: データ件数 ${data.data?.length || 0}`);
      return data;
    } else {
      console.log(`❌ [ERROR] 本番API失敗: ${response.status} ${response.statusText}`);
      throw new Error(`API呼び出し失敗: ${response.status} ${response.statusText}`);
    }
  },

  // スケジュール済み投稿取得（本番APIのみ）
  getScheduledPosts: async (userId: string = 'demo_user', month?: number, year?: number) => {
    // userId の検証を追加
    if (!userId || userId === 'undefined') {
      console.log('⚠️ [WARNING] 無効なユーザーID:', userId);
      throw new Error('無効なユーザーIDです');
    }
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
    
    // クエリパラメータを構築
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const apiUrl = `${apiBaseUrl}/scheduler/posts?${params.toString()}`;
    console.log(`🔍 [PRODUCTION API] スケジュール投稿取得: ${apiUrl}`);
    console.log(`🔍 [PRODUCTION API] ユーザーID: ${userId}, 月: ${month}, 年: ${year}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`🔍 [PRODUCTION API] レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [SUCCESS] 本番スケジュールAPI成功: データ件数 ${data.posts?.length || 0}`);
      return data;
    } else {
      console.log(`❌ [ERROR] 本番スケジュールAPI失敗: ${response.status} ${response.statusText}`);
      throw new Error(`スケジュールAPI呼び出し失敗: ${response.status} ${response.statusText}`);
    }
  },

  // アナリティクスデータ取得（本番APIのみ）
  getAnalyticsData: async () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
    const apiUrl = `${apiBaseUrl}/analytics/dashboard`;
    console.log(`🔍 [PRODUCTION API] アナリティクスデータ取得: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`🔍 [PRODUCTION API] レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [SUCCESS] 本番アナリティクスAPI成功');
      return data;
    } else {
      console.log(`❌ [ERROR] 本番アナリティクスAPI失敗: ${response.status} ${response.statusText}`);
      throw new Error(`アナリティクスAPI呼び出し失敗: ${response.status} ${response.statusText}`);
    }
  },

  // ハッシュタグ分析データ取得（本番APIのみ）
  getHashtagData: async () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
    const apiUrl = `${apiBaseUrl}/hashtags/analysis`;
    console.log(`🔍 [PRODUCTION API] ハッシュタグ分析データ取得: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`🔍 [PRODUCTION API] レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [SUCCESS] 本番ハッシュタグAPI成功');
      return data;
    } else {
      console.log(`❌ [ERROR] 本番ハッシュタグAPI失敗: ${response.status} ${response.statusText}`);
      throw new Error(`ハッシュタグAPI呼び出し失敗: ${response.status} ${response.statusText}`);
    }
  },

  // ヘルスチェック（本番APIのみ）
  healthCheck: async () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
    const apiUrl = `${apiBaseUrl}/health`;
    console.log(`🔍 [PRODUCTION API] ヘルスチェック: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`🔍 [PRODUCTION API] レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [SUCCESS] 本番ヘルスチェックAPI成功');
      return data;
    } else {
      console.log(`❌ [ERROR] 本番ヘルスチェックAPI失敗: ${response.status} ${response.statusText}`);
      throw new Error(`ヘルスチェックAPI呼び出し失敗: ${response.status} ${response.statusText}`);
    }
  },

  // 本番APIの詳細な状態確認
  checkProductionApiStatus: async () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
    const endpoints = [
      '/health',
      '/instagram/history/demo_user',
      '/scheduler/posts?userId=demo_user'
    ];
    
    interface EndpointResult {
      status?: number;
      statusText?: string;
      responseTime?: string;
      ok?: boolean;
      error?: string;
      timestamp: string;
    }
    
    const results: Record<string, EndpointResult> = {};
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results[endpoint] = {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          ok: response.ok,
          timestamp: new Date().toISOString()
        };
        
        console.log(`🔍 [API STATUS] ${endpoint}: ${response.status} ${response.statusText} (${responseTime}ms)`);
      } catch (error) {
        results[endpoint] = {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
        console.log(`❌ [API STATUS] ${endpoint}: エラー - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return {
      apiBaseUrl,
      timestamp: new Date().toISOString(),
      endpoints: results,
      summary: {
        total: endpoints.length,
        successful: Object.values(results).filter((r: EndpointResult) => r.ok).length,
        failed: Object.values(results).filter((r: EndpointResult) => !r.ok && !r.error).length,
        errors: Object.values(results).filter((r: EndpointResult) => r.error).length
      }
    };
  }
}; 