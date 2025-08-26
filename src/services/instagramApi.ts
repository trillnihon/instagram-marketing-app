import { 
  InstagramAuthResponse, 
  InstagramPostsResponse, 
  InstagramInsightsResponse,
  InstagramMedia,
  InstagramInsight 
} from '../types';

// API_BASE_URLの環境変数ベース設定（/apiを含む）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';

// Instagram認証開始
export const startInstagramAuth = (): void => {
  // バックエンドのInstagram認証エンドポイントにリダイレクト
  const authUrl = `${API_BASE_URL}/instagram/auth`;
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
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (!code) {
      throw new Error('認証コードが取得できませんでした');
    }
    
    console.log('[DEBUG] Instagram認証コールバック処理開始:', { code, state });
    
    // バックエンドで認証コードを処理
    const response = await fetch(`${API_BASE_URL}/instagram/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });
    
    if (!response.ok) {
      throw new Error(`認証処理に失敗しました: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Instagram認証成功:', data);
    
    return data;
  } catch (error) {
    console.error('[ERROR] Instagram認証コールバック処理エラー:', error);
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
      `${API_BASE_URL}/instagram/posts/${userId}?access_token=${accessToken}&instagram_business_account_id=${instagramBusinessAccountId}`
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
      `${API_BASE_URL}/instagram/insights/${mediaId}?access_token=${accessToken}`
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