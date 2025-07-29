import { 
  InstagramAuthResponse, 
  InstagramPostsResponse, 
  InstagramInsightsResponse,
  InstagramMedia,
  InstagramInsight 
} from '../types';

// 環境に応じてAPI_BASE_URLを切り替え
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://instagram-marketing-backend-v2.onrender.com');

// Instagram認証開始
export const startInstagramAuth = (): void => {
  // バックエンドのInstagram認証エンドポイントにリダイレクト
  const authUrl = `${API_BASE_URL}/auth/instagram`;
  console.log('[DEBUG] Instagram認証開始:', {
    API_BASE_URL,
    authUrl,
    hostname: window.location.hostname,
    currentUrl: window.location.href
  });
  window.location.href = authUrl;
};

// Instagram認証コールバック処理
export const handleInstagramCallback = async (): Promise<InstagramAuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/instagram/callback${window.location.search}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Instagram認証に失敗しました');
    }
    
    return data;
  } catch (error) {
    console.error('[ERROR] Instagram認証コールバック処理失敗:', error);
    throw error;
  }
};

// Instagram投稿データ取得
export const fetchInstagramPosts = async (
  userId: string, 
  accessToken: string, 
  instagramBusinessAccountId: string
): Promise<InstagramMedia[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/instagram/posts/${userId}?access_token=${accessToken}&instagram_business_account_id=${instagramBusinessAccountId}`
    );
    const data: InstagramPostsResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Instagram投稿データの取得に失敗しました');
    }
    
    return data.data;
  } catch (error) {
    console.error('[ERROR] Instagram投稿データ取得失敗:', error);
    throw error;
  }
};

// Instagram投稿インサイト取得
export const fetchInstagramInsights = async (
  mediaId: string, 
  accessToken: string
): Promise<InstagramInsight[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/instagram/insights/${mediaId}?access_token=${accessToken}`
    );
    const data: InstagramInsightsResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Instagramインサイトの取得に失敗しました');
    }
    
    return data.data;
  } catch (error) {
    console.error('[ERROR] Instagramインサイト取得失敗:', error);
    throw error;
  }
};

// ローカルストレージにInstagram認証情報を保存
export const saveInstagramAuth = (authData: {
  accessToken: string;
  instagramBusinessAccount: any;
  recentPosts: any[];
}): void => {
  try {
    localStorage.setItem('instagram_auth', JSON.stringify({
      ...authData,
      savedAt: new Date().toISOString()
    }));
    console.log('[DEBUG] Instagram認証情報をローカルストレージに保存しました');
  } catch (error) {
    console.error('[ERROR] Instagram認証情報の保存に失敗:', error);
  }
};

// ローカルストレージからInstagram認証情報を取得
export const getInstagramAuth = (): any => {
  try {
    const authData = localStorage.getItem('instagram_auth');
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  } catch (error) {
    console.error('[ERROR] Instagram認証情報の取得に失敗:', error);
    return null;
  }
};

// Instagram認証情報をクリア
export const clearInstagramAuth = (): void => {
  try {
    localStorage.removeItem('instagram_auth');
    console.log('[DEBUG] Instagram認証情報をクリアしました');
  } catch (error) {
    console.error('[ERROR] Instagram認証情報のクリアに失敗:', error);
  }
};

// Instagram認証状態をチェック
export const isInstagramAuthenticated = (): boolean => {
  const authData = getInstagramAuth();
  return authData !== null && authData.accessToken;
}; 