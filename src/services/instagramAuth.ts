import { InstagramAuth } from '../types';

// Instagram Basic Display API認証サービス
export class InstagramAuthService {
  private static readonly INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
  private static readonly INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
  private static readonly INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com';

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

  // 認証URLの生成
  static generateAuthUrl(): string {
    const clientId = '1003724798254754'; // 統一されたApp ID
    const redirectUri = 'https://localhost:3000/auth/callback'; // 統一されたリダイレクトURI
    const scope = 'public_profile,email,instagram_basic,instagram_manage_insights';
    const state = this.generateState();

    // 状態をCookieに保存
    this.setStateCookie(state);
    console.log('保存したstate:', state, '(Cookie)');

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
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
      const redirectUri = 'https://localhost:3000/auth/callback'; // 統一されたリダイレクトURI
      const state = this.getStateCookie() || '';
      
      console.log('[DEBUG] 認証コード送信開始:', code.substring(0, 20) + '...');
      
      const response = await fetch(`/api/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ERROR] サーバーエラー:', response.status, errorText);
        throw new Error('Token exchange failed: ' + response.statusText + ' ' + errorText);
      }
      
      const data = await response.json();
      console.log('[DEBUG] 認証成功:', data);
      
      // サーバーからのレスポンス形式に合わせて処理
      const authData: InstagramAuth = {
        accessToken: data.access_token,
        userId: data.user_id || data.instagram_business_account_id || '',
        expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
        permissions: ['user_profile', 'user_media'],
        instagramBusinessAccountId: data.instagram_business_account_id
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
    const url = `${this.INSTAGRAM_GRAPH_URL}/access_token?grant_type=ig_exchange_token&client_secret=${import.meta.env.VITE_INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Long-lived token exchange failed');
    }

    return response.json();
  }

  // アクセストークンの有効性を確認
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      const url = `${this.INSTAGRAM_GRAPH_URL}/me?fields=id,username&access_token=${accessToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !!data.id;
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
    const url = `${this.INSTAGRAM_GRAPH_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;

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
}

export const instagramAuth = InstagramAuthService; 