import axios from 'axios';

// APIのベースURL（直接設定）
const API_BASE_URL = 'https://instagram-marketing-backend-v2.onrender.com';

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
    if (error.response?.status === 401) {
      // 認証エラーの場合、トークンを削除してログインページにリダイレクト
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ユーザー登録
export const register = async (userData: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    const response = await apiClient.post('/api/auth/register', userData);
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
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
    const response = await apiClient.post('/api/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'ログインに失敗しました');
    }
    throw error;
  }
};

// ログアウト
export const logout = () => {
  localStorage.removeItem('auth_token');
  // 必要に応じてサーバーにログアウトリクエストを送信
};

// 現在のユーザー情報を取得
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/auth/me');
    return response.data.user;
  } catch (error) {
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
    const response = await apiClient.put('/api/auth/me', userData);
    return response.data;
  } catch (error) {
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
    const response = await apiClient.put('/api/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'パスワードの変更に失敗しました');
    }
    throw error;
  }
};

// アカウント削除
export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/api/auth/me');
    localStorage.removeItem('auth_token');
    return response.data;
  } catch (error) {
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