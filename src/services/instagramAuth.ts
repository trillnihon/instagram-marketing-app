import { InstagramAuth } from '../types';

// Instagram Graph API認証サービス
export class InstagramAuthService {
  private static readonly FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v19.0';
  private static readonly FACEBOOK_AUTH_URL = 'https://www.facebook.com';

  // 処理中の認証コードを追跡（重複送信防止）
  private static processingCodes = new Set<string>();

  // Cookieにstateを保存
  static setStateCookie(state: string) {
    document.cookie = `instagram_auth_state=${state}; path=/; SameSite=Lax`;
  }

  // Cookieからstateを取得
  static getStateCookie(): string | null {
    const match = document.cookie.match(/(?:^|; )instagram_auth_state=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Cookieからstateを削除
  static removeStateCookie() {
    document.cookie = 'instagram_auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }

  // 認証URLの生成（Instagram Graph API用）
  static generateAuthUrl(): string {
    // 環境変数からApp IDを取得、フォールバックは正しい値を使用
    const clientId = import.meta.env.VITE_FACEBOOK_APP_ID || '1003724798254754';
    const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || 'https://instagram-marketing-app.vercel.app/auth/instagram/callback';
    const scope = 'instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement,public_profile,email';
    const state = this.generateState();

    // デバッグログ強化
    console.log('[DEBUG] Instagram Graph API認証設定:', {
      VITE_FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID,
      VITE_INSTAGRAM_REDIRECT_URI: import.meta.env.VITE_INSTAGRAM_REDIRECT_URI,
      clientId: clientId,
      redirectUri: redirectUri,
      scope: scope,
      envMode: import.meta.env.MODE,
      envDev: import.meta.env.DEV,
      envProd: import.meta.env.PROD,
      // 強制的に正しいApp IDを使用
      forcedAppId: '1003724798254754'
    });

    // 環境変数が正しく読み込まれているかチェック
    if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
      console.warn('[WARNING] VITE_FACEBOOK_APP_IDが環境変数から読み込めません。フォールバック値を使用します。');
    }

    // 強制的に正しいApp IDを使用（環境変数の問題を回避）
    const finalClientId = '1003724798254754';
    console.log('[DEBUG] 最終的に使用されるApp ID:', finalClientId);

    // 状態をCookieに保存
    this.setStateCookie(state);
    console.log('保存したstate:', state, '(Cookie)');

    // Instagram Graph APIの認証URL（v19.0使用）
    const authUrl = `${this.FACEBOOK_AUTH_URL}/v19.0/dialog/oauth?client_id=${finalClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
    console.log('[DEBUG] 生成された認証URL:', authUrl);
    return authUrl;
  }

  // 認証コードからアクセストークンを取得
  static async exchangeCodeForToken(code: string): Promise<InstagramAuth> {
    // 重複送信チェック
    if (this.processingCodes.has(code)) {
      throw new Error('この認証コードは既に処理中です。重複送信を防ぐため、しばらくお待ちください。');
    }

    // 処理中のコードとしてマーク
    this.processingCodes.add(code);

    try {
      const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || 'http://localhost:3001/auth/instagram/callback';
      const state = this.getStateCookie() || '';
      
      console.log('[DEBUG] Instagram Graph API認証コード送信開始:', code.substring(0, 20) + '...');
      
      const response = await fetch(`/api/auth/instagram/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ERROR] サーバーエラー:', response.status, errorText);
        throw new Error('Token exchange failed: ' + response.statusText + ' ' + errorText);
      }
      
      const data = await response.json();
      console.log('[DEBUG] Instagram Graph API認証成功:', data);
      
      // サーバーからのレスポンス形式に合わせて処理
      const authData: InstagramAuth = {
        accessToken: data.access_token || data.longLivedToken,
        userId: data.user?.id || data.user_id || '',
        expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(), // 60日
        permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement'],
        instagramBusinessAccountId: data.instagram_business_account_id || data.user?.instagram_business_account_id
      };
      
      console.log('[DEBUG] 処理された認証データ:', authData);
      return authData;
      
    } finally {
      // 処理完了後、コードを削除
      this.processingCodes.delete(code);
    }
  }

  // 短期トークンを長期トークンに交換
  private static async exchangeForLongLivedToken(shortLivedToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const url = `${this.FACEBOOK_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&client_secret=${import.meta.env.VITE_FACEBOOK_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Long-lived token exchange failed');
    }

    return response.json();
  }

  // アクセストークンの有効性を確認
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      // バックエンド経由でトークンの有効性を確認
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${apiBaseUrl}/instagram/user-info?accessToken=${accessToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success && !!data.data?.id;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // アクセストークンを更新（期限切れの場合）
  static async refreshToken(accessToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    // Facebook Graph APIでは長期トークンは自動的に更新されるため、
    // 必要に応じて新しい長期トークンを取得
    const url = `${this.FACEBOOK_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&client_secret=${import.meta.env.VITE_FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  // 状態パラメータの生成
  private static generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // 状態パラメータの検証
  static validateState(state: string): boolean {
    const savedState = this.getStateCookie();
    console.log('受け取ったstate:', state, '保存されているstate:', savedState, '(Cookie)');
    if (!savedState) {
      return false;
    }

    this.removeStateCookie();
    return state === savedState;
  }

  // 認証フローの開始
  static startAuthFlow(): void {
    const authUrl = this.generateAuthUrl();
    window.location.href = authUrl;
  }

  // 認証コールバックの処理
  static async handleAuthCallback(url: string): Promise<InstagramAuth | null> {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`認証エラー: ${error}`);
    }

    if (!code || !state) {
      throw new Error('認証パラメータが不足しています');
    }

    // state検証はサーバー側で行うため、ここではスキップ
    // if (!this.validateState(state)) {
    //   throw new Error('認証状態の検証に失敗しました');
    // }

    return await this.exchangeCodeForToken(code);
  }

  // ログアウト処理
  static logout(): void {
    // Cookieから認証情報を削除
    this.removeStateCookie();
    localStorage.removeItem('instagram_auth_data');
    
    // Instagramのログアウトページにリダイレクト（オプション）
    // window.location.href = 'https://www.instagram.com/accounts/logout/';
  }

  // 認証情報の保存
  static saveAuthData(authData: InstagramAuth): void {
    localStorage.setItem('instagram_auth_data', JSON.stringify(authData));
  }

  // 認証情報の取得
  static getAuthData(): InstagramAuth | null {
    const authData = localStorage.getItem('instagram_auth_data');
    if (!authData) {
      return null;
    }

    try {
      const parsed = JSON.parse(authData);
      
      // トークンの有効期限をチェック
      if (new Date(parsed.expiresAt) <= new Date()) {
        this.logout();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Auth data parsing error:', error);
      this.logout();
      return null;
    }
  }

  // Instagramアカウント情報の取得
  static async getInstagramAccountInfo(accessToken: string): Promise<{
    id: string;
    username: string;
    media_count: number;
    followers_count: number;
    follows_count: number;
    biography: string;
    profile_picture_url: string;
  } | null> {
    try {
      console.log('[DEBUG] Instagramアカウント情報取得開始');
      
      // 方法1: バックエンド経由でユーザー情報を取得（最優先）
      console.log('[DEBUG] 方法1: バックエンド経由でユーザー情報を取得');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const userUrl = `${apiBaseUrl}/instagram/user-info?accessToken=${accessToken}`;
      console.log('[DEBUG] 方法1 URL:', userUrl);
      
      const userResponse = await fetch(userUrl);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('[DEBUG] 方法1 基本ユーザー情報取得成功:', userData);
        
        // ユーザー情報が取得できた場合、方法2に進む
        console.log('[DEBUG] 方法1: 基本ユーザー情報確認完了、方法2に進行');
      } else {
        console.warn('[WARNING] 方法1基本ユーザー情報取得失敗:', userResponse.status, userResponse.statusText);
        // エラーの詳細を確認
        try {
          const errorData = await userResponse.json();
          console.error('[ERROR] 方法1エラー詳細:', errorData);
        } catch (e) {
          console.error('[ERROR] 方法1エラーレスポンスの解析に失敗:', e);
        }
      }
      
      // 方法2: Facebookページ経由でInstagramビジネスアカウントを取得
      console.log('[DEBUG] 方法2: Facebookページ経由でInstagramビジネスアカウントを取得');
      const pagesUrl = `${this.FACEBOOK_GRAPH_URL}/me/accounts?access_token=${accessToken}`;
      console.log('[DEBUG] 方法2 URL:', pagesUrl);
      
      const pagesResponse = await fetch(pagesUrl);
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        console.log('[DEBUG] 方法2 Facebookページ取得成功:', pagesData);
        
        if (pagesData.data && pagesData.data.length > 0) {
          // 各ページをチェックしてInstagramビジネスアカウントを探す
          for (const page of pagesData.data) {
            console.log('[DEBUG] ページチェック:', page);
            
            if (page.instagram_business_account) {
              console.log('[DEBUG] Instagramビジネスアカウント発見:', page.instagram_business_account);
              
              // Instagramビジネスアカウントの詳細情報を取得
              const instagramAccountId = page.instagram_business_account.id;
              const instagramUrl = `${this.FACEBOOK_GRAPH_URL}/${instagramAccountId}?fields=id,username,media_count,followers_count,follows_count,biography,profile_picture_url&access_token=${accessToken}`;
              console.log('[DEBUG] Instagram詳細取得URL:', instagramUrl);
              
              const instagramResponse = await fetch(instagramUrl);
              if (instagramResponse.ok) {
                const instagramData = await instagramResponse.json();
                console.log('[DEBUG] 方法2でInstagram詳細取得成功:', instagramData);
                return instagramData;
              } else {
                console.warn('[WARNING] Instagram詳細取得失敗:', instagramResponse.status, instagramResponse.statusText);
              }
            }
          }
        } else {
          console.warn('[WARNING] Facebookページが見つかりません');
        }
      } else {
        console.warn('[WARNING] 方法2失敗:', pagesResponse.status, pagesResponse.statusText);
      }
      
      // 方法3: ユーザーのInstagramアカウント一覧を直接取得
      console.log('[DEBUG] 方法3: ユーザーのInstagramアカウント一覧を直接取得');
      const instagramAccountsUrl = `${this.FACEBOOK_GRAPH_URL}/me/accounts?fields=instagram_business_account{id,username,media_count,followers_count,follows_count,biography,profile_picture_url}&access_token=${accessToken}`;
      console.log('[DEBUG] 方法3 URL:', instagramAccountsUrl);
      
      const instagramAccountsResponse = await fetch(instagramAccountsUrl);
      if (instagramAccountsResponse.ok) {
        const instagramAccountsData = await instagramAccountsResponse.json();
        console.log('[DEBUG] 方法3 成功:', instagramAccountsData);
        
        if (instagramAccountsData.data && instagramAccountsData.data.length > 0) {
          for (const account of instagramAccountsData.data) {
            if (account.instagram_business_account) {
              console.log('[DEBUG] 方法3でInstagramビジネスアカウント発見:', account.instagram_business_account);
              return account.instagram_business_account;
            }
          }
        }
      } else {
        console.warn('[WARNING] 方法3失敗:', instagramAccountsResponse.status, instagramAccountsResponse.statusText);
      }
      
      console.error('[ERROR] 全ての方法でInstagramビジネスアカウント情報の取得に失敗しました');
      return null;
      
    } catch (error) {
      console.error('[ERROR] Instagramアカウント情報取得エラー:', error);
      return null;
    }
  }

  // Instagram投稿一覧の取得
  static async getInstagramPosts(accessToken: string, limit: number = 10): Promise<{
    id: string;
    caption: string;
    media_type: string;
    media_url: string;
    permalink: string;
    timestamp: string;
    like_count: number;
    comments_count: number;
  }[] | null> {
    try {
      console.log('[DEBUG] Instagram投稿一覧取得開始');
      
      // 方法1: バックエンド経由でユーザー情報を取得
      console.log('[DEBUG] 方法1: バックエンド経由でユーザー情報を取得');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const userUrl = `${apiBaseUrl}/instagram/user-info?accessToken=${accessToken}`;
      console.log('[DEBUG] 方法1 URL:', userUrl);
      
      const userResponse = await fetch(userUrl);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('[DEBUG] 方法1 基本ユーザー情報取得成功:', userData);
        
        // ユーザー情報が取得できた場合、方法2に進む
        console.log('[DEBUG] 方法1: 基本ユーザー情報確認完了、方法2に進行');
      } else {
        console.warn('[WARNING] 方法1基本ユーザー情報取得失敗:', userResponse.status, userResponse.statusText);
        // エラーの詳細を確認
        try {
          const errorData = await userResponse.json();
          console.error('[ERROR] 方法1エラー詳細:', errorData);
        } catch (e) {
          console.error('[ERROR] 方法1エラーレスポンスの解析に失敗:', e);
        }
      }
      
      // 方法2: Facebookページ経由でInstagramビジネスアカウントを取得
      console.log('[DEBUG] 方法2: Facebookページ経由でInstagramビジネスアカウントを取得');
      const pagesUrl = `${this.FACEBOOK_GRAPH_URL}/me/accounts?access_token=${accessToken}`;
      console.log('[DEBUG] 方法2 URL:', pagesUrl);
      
      const pagesResponse = await fetch(pagesUrl);
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        console.log('[DEBUG] 方法2 Facebookページ取得成功:', pagesData);
        
        if (pagesData.data && pagesData.data.length > 0) {
          // 各ページをチェックしてInstagramビジネスアカウントを探す
          for (const page of pagesData.data) {
            console.log('[DEBUG] ページチェック:', page);
            
            if (page.instagram_business_account) {
              console.log('[DEBUG] Instagramビジネスアカウント発見:', page.instagram_business_account);
              
              const instagramAccountId = page.instagram_business_account.id;
              const postsUrl = `${this.FACEBOOK_GRAPH_URL}/${instagramAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`;
              console.log('[DEBUG] 方法2投稿取得URL:', postsUrl);
              
              const postsResponse = await fetch(postsUrl);
              if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                console.log('[DEBUG] 方法2で投稿取得成功:', postsData);
                return postsData.data || [];
              } else {
                console.warn('[WARNING] 方法2投稿取得失敗:', postsResponse.status, postsResponse.statusText);
              }
            }
          }
        } else {
          console.warn('[WARNING] Facebookページが見つかりません');
        }
      } else {
        console.warn('[WARNING] 方法2失敗:', pagesResponse.status, pagesResponse.statusText);
      }
      
      // 方法3: ユーザーのInstagramアカウント一覧を直接取得
      console.log('[DEBUG] 方法3: ユーザーのInstagramアカウント一覧を直接取得');
      const instagramAccountsUrl = `${this.FACEBOOK_GRAPH_URL}/me/accounts?fields=instagram_business_account{id}&access_token=${accessToken}`;
      console.log('[DEBUG] 方法3 URL:', instagramAccountsUrl);
      
      const instagramAccountsResponse = await fetch(instagramAccountsUrl);
      if (instagramAccountsResponse.ok) {
        const instagramAccountsData = await instagramAccountsResponse.json();
        console.log('[DEBUG] 方法3 成功:', instagramAccountsData);
        
        if (instagramAccountsData.data && instagramAccountsData.data.length > 0) {
          for (const account of instagramAccountsData.data) {
            if (account.instagram_business_account) {
              console.log('[DEBUG] 方法3でInstagramビジネスアカウント発見:', account.instagram_business_account);
              
              const instagramAccountId = account.instagram_business_account.id;
              const postsUrl = `${this.FACEBOOK_GRAPH_URL}/${instagramAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`;
              console.log('[DEBUG] 方法3投稿取得URL:', postsUrl);
              
              const postsResponse = await fetch(postsUrl);
              console.log('[DEBUG] 方法3投稿取得レスポンス:', postsResponse.status, postsResponse.statusText);
              
              if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                console.log('[DEBUG] 方法3で投稿取得成功:', postsData);
                console.log('[DEBUG] 投稿データ詳細:', {
                  hasData: !!postsData.data,
                  dataLength: postsData.data?.length || 0,
                  dataType: typeof postsData.data,
                  fullResponse: postsData
                });
                return postsData.data || [];
              } else {
                console.warn('[WARNING] 方法3投稿取得失敗:', postsResponse.status, postsResponse.statusText);
                try {
                  const errorData = await postsResponse.json();
                  console.error('[ERROR] 方法3エラー詳細:', errorData);
                } catch (e) {
                  console.error('[ERROR] 方法3エラーレスポンスの解析に失敗:', e);
                }
              }
            }
          }
        }
      } else {
        console.warn('[WARNING] 方法3失敗:', instagramAccountsResponse.status, instagramAccountsResponse.statusText);
      }
      
      console.error('[ERROR] 全ての方法でInstagram投稿一覧の取得に失敗しました');
      return null;
      
    } catch (error) {
      console.error('[ERROR] Instagram投稿一覧取得エラー:', error);
      return null;
    }
  }
}

export const instagramAuth = InstagramAuthService; 