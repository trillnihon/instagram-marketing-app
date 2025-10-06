import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

// APIのベースURL（環境変数から取得、/apiを含む）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';

// axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターでJWTトークンを自動追加
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    console.error('Auth API Error:', error);
    return Promise.reject(error);
  }
);

// Facebook Login for Business認証
export const facebookLoginCallback = async (authData: {
  access_token?: string;
  long_lived_token?: string;
  expires_in?: string;
  data_access_expiration_time?: string;
  code?: string;
  redirect_uri: string;
}) => {
  try {
    console.log('📸 [AUTH STEP 1] Facebook Login for Business認証開始:', {
      hasAccessToken: !!authData.access_token,
      hasLongLivedToken: !!authData.long_lived_token,
      hasCode: !!authData.code,
      redirectUri: authData.redirect_uri
    });

    const response = await apiClient.post('/auth/exchange', authData);
    
    console.log('✅ [AUTH STEP 2] Facebook認証成功:', {
      status: response.status,
      hasInstagramAccounts: !!response.data.instagramAccounts,
      accountCount: response.data.instagramAccounts?.length || 0
    });

    if (response.data.userAccessToken) {
      localStorage.setItem('facebook_access_token', response.data.userAccessToken);
    }

    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] Facebook認証エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Facebook認証に失敗しました');
    }
    throw error;
  }
};

// Instagram Media取得
export const getInstagramMedia = async (igUserId: string, accessToken: string) => {
  try {
    console.log('📸 [AUTH STEP 3] Instagram Media取得開始:', {
      igUserId,
      hasAccessToken: !!accessToken
    });

    const response = await apiClient.get(`/instagram/media/${igUserId}`, {
      params: { access_token: accessToken }
    });

    console.log('✅ [AUTH STEP 4] Instagram Media取得成功:', {
      status: response.status,
      mediaCount: response.data.media?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 4] Instagram Media取得エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Instagram Media取得に失敗しました');
    }
    throw error;
  }
};

// ユーザー登録
export const register = async (userData: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    console.log('📝 [AUTH STEP 1] ユーザー登録開始:', {
      email: userData.email,
      username: userData.username
    });

    const response = await apiClient.post('/auth/register', userData);
    
    console.log('✅ [AUTH STEP 2] ユーザー登録成功:', {
      status: response.status,
      hasToken: !!response.data.token
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] ユーザー登録エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '登録に失敗しました');
    }
    throw error;
  }
};

// ユーザーログイン
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    console.log('🔐 [AUTH STEP 1] ログイン処理開始:', {
      API_BASE_URL,
      requestURL: `${API_BASE_URL}/auth/login`,
      credentials: { email: credentials.email }
    });
    
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('✅ [AUTH STEP 2] ログイン成功:', {
      status: response.status,
      hasToken: !!response.data.token
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] ログインエラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });
    
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'ログインに失敗しました');
    }
    throw error;
  }
};

// ログアウト
export const logout = () => {
  console.log('🚪 [AUTH STEP 1] ログアウト処理開始');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('facebook_access_token');
  console.log('✅ [AUTH STEP 2] ログアウト完了');
  // 必要に応じてサーバーにログアウトリクエストを送信
};

// 現在のユーザー情報を取得
export const getCurrentUser = async () => {
  try {
    console.log('👤 [AUTH STEP 1] ユーザー情報取得開始');
    const response = await apiClient.get('/auth/me');
    console.log('✅ [AUTH STEP 2] ユーザー情報取得成功:', {
      status: response.status,
      hasUser: !!response.data.user
    });
    return response.data.user;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] ユーザー情報取得エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 認証エラーの場合、トークンを削除
      localStorage.removeItem('auth_token');
      return null;
    }
    throw error;
  }
};

// ユーザー情報更新
export const updateUser = async (userData: {
  username?: string;
  email?: string;
}) => {
  try {
    console.log('📝 [AUTH STEP 1] ユーザー情報更新開始:', userData);
    const response = await apiClient.put('/auth/me', userData);
    console.log('✅ [AUTH STEP 2] ユーザー情報更新成功:', {
      status: response.status
    });
    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] ユーザー情報更新エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'ユーザー情報の更新に失敗しました');
    }
    throw error;
  }
};

// パスワード変更
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    console.log('🔒 [AUTH STEP 1] パスワード変更開始');
    const response = await apiClient.put('/auth/change-password', passwordData);
    console.log('✅ [AUTH STEP 2] パスワード変更成功:', {
      status: response.status
    });
    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] パスワード変更エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'パスワードの変更に失敗しました');
    }
    throw error;
  }
};

// アカウント削除
export const deleteAccount = async () => {
  try {
    console.log('🗑️ [AUTH STEP 1] アカウント削除開始');
    const response = await apiClient.delete('/auth/me');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('facebook_access_token');
    console.log('✅ [AUTH STEP 2] アカウント削除成功:', {
      status: response.status
    });
    return response.data;
  } catch (error) {
    console.error('❌ [AUTH STEP 2] アカウント削除エラー:', {
      error: error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null
    });

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'アカウントの削除に失敗しました');
    }
    throw error;
  }
};

// トークンの有効性をチェック
export const isTokenValid = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  try {
    // JWTトークンの有効期限をチェック（簡易版）
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// 認証状態をチェック
export const checkAuthStatus = async () => {
  if (!isTokenValid()) {
    return null;
  }
  
  try {
    return await getCurrentUser();
  } catch (error) {
    return null;
  }
};

// Instagram OAuth認証後にトークンを保存
export const saveInstagramTokenToBackend = async (accessToken: string) => {
  try {
    console.log("📤 Sending Instagram access token to backend:", accessToken.slice(0, 10) + "...");

    const response = await fetch(`${API_BASE_URL}/auth/save-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // ✅ 必須
      mode: 'cors',            // ✅ 必須
      body: JSON.stringify({ access_token: accessToken })
    });

    // 404/500の丁寧な扱い
    if (response.status === 404) {
      throw new Error('サーバーが見つかりません（404）。時間をおいて再度お試しください。');
    }
    if (response.status >= 500) {
      throw new Error('サーバーエラー（500）。しばらくしてから再試行してください。');
    }

    const data = await response.json();
    
    if (!data.success || !data.token || !data.user) {
      throw new Error(data.message || '認証応答が不正です。');
    }

    console.log('✅ [AUTH] Instagramトークン保存成功:', {
      userId: data.user.id,
      userName: data.user.name,
      hasToken: !!data.token
    });

    // 1) localStorageへ保存
    localStorage.setItem('IG_JWT', data.token);
    localStorage.setItem('IG_USER', JSON.stringify(data.user));

    // 2) グローバルストアへ同期
    const { setCurrentUser, setAuthenticated } = useAppStore.getState();
    setCurrentUser(data.user);
    setAuthenticated(true);

    return data.user;
  } catch (error: any) {
    console.error("❌ [AUTH] Failed to send token:", error.message);
    throw error;
  }
}; 