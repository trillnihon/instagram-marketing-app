import axios from 'axios';

// APIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';

// axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターでAPIトークンを自動追加
apiClient.interceptors.request.use(
  (config) => {
    const apiToken = import.meta.env.VITE_API_TOKEN || 'your_actual_token_here';
    if (apiToken) {
      config.headers.Authorization = `Bearer ${apiToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプターでエラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 投稿作成の型定義
export interface ThreadsPostData {
  content: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    alt_text?: string;
  }>;
}

export interface ThreadsPostResponse {
  success: boolean;
  post_id?: string;
  message?: string;
  error?: string;
}

// Threads投稿作成API
export const createThreadsPost = async (postData: ThreadsPostData): Promise<ThreadsPostResponse> => {
  try {
    console.log('📝 [THREADS STEP 1] 投稿作成開始:', {
      contentLength: postData.content.length,
      mediaCount: postData.media?.length || 0,
      apiUrl: `${API_BASE_URL}/threads/api/submitPost`
    });

    const response = await apiClient.post('/threads/api/submitPost', postData);
    
    console.log('✅ [THREADS STEP 2] 投稿作成成功:', {
      status: response.status,
      postId: response.data.post_id,
      success: response.data.success
    });

    return response.data;
  } catch (error) {
    console.error('❌ [THREADS STEP 2] 投稿作成エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '投稿の作成に失敗しました');
    }
    throw error;
  }
};

// 投稿一覧取得
export const getThreadsPosts = async (limit: number = 10): Promise<any[]> => {
  try {
    console.log('📋 [THREADS STEP 1] 投稿一覧取得開始:', {
      limit,
      apiUrl: `${API_BASE_URL}/threads/api/posts`
    });

    const response = await apiClient.get('/threads/api/posts', {
      params: { limit }
    });

    console.log('✅ [THREADS STEP 2] 投稿一覧取得成功:', {
      status: response.status,
      postCount: response.data.length
    });

    return response.data;
  } catch (error) {
    console.error('❌ [THREADS STEP 2] 投稿一覧取得エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '投稿一覧の取得に失敗しました');
    }
    throw error;
  }
};

// 投稿削除
export const deleteThreadsPost = async (postId: string): Promise<boolean> => {
  try {
    console.log('🗑️ [THREADS STEP 1] 投稿削除開始:', {
      postId,
      apiUrl: `${API_BASE_URL}/threads/api/posts/${postId}`
    });

    const response = await apiClient.delete(`/threads/api/posts/${postId}`);

    console.log('✅ [THREADS STEP 2] 投稿削除成功:', {
      status: response.status,
      success: response.data.success
    });

    return response.data.success;
  } catch (error) {
    console.error('❌ [THREADS STEP 2] 投稿削除エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '投稿の削除に失敗しました');
    }
    throw error;
  }
};

// 投稿分析
export const analyzeThreadsPost = async (postId: string): Promise<any> => {
  try {
    console.log('📊 [THREADS STEP 1] 投稿分析開始:', {
      postId,
      apiUrl: `${API_BASE_URL}/threads/api/posts/${postId}/analytics`
    });

    const response = await apiClient.get(`/threads/api/posts/${postId}/analytics`);

    console.log('✅ [THREADS STEP 2] 投稿分析成功:', {
      status: response.status,
      hasAnalytics: !!response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ [THREADS STEP 2] 投稿分析エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '投稿分析に失敗しました');
    }
    throw error;
  }
}; 