import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  userId?: string; // 後方互換性のため
  username: string;
  email: string;
  accessToken?: string;
  instagramBusinessAccountId?: string;
  profile: {
    displayName?: string;
    bio?: string;
    avatar?: string;
  };
  isAdmin: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthState {
  // 認証状態
  isAuthenticated: boolean;
  token: string | null;
  currentUser: User | null;
  
  // ローディング状態
  isLoading: boolean;
  
  // 認証メソッド
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<User['profile']>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  
  // OAuth認証
  oauthLogin: (provider: 'instagram' | 'facebook') => void;
  handleOAuthCallback: (data: any) => void;
  
  // ユーザー情報取得
  fetchProfile: () => Promise<void>;
  
  // 既存の状態
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
  analysisHistory: any[];
  addAnalysisToHistory: (analysis: any) => void;
  clearAnalysisHistory: () => void;
  
  // 追加の状態（後方互換性のため）
  accountAnalytics?: any;
  posts?: any[];
  analysis?: any[];
  errors?: any[];
  resolveError?: (errorId: string) => void;
  clearErrors?: () => void;
  getErrorStats?: () => any;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
  aiProvider?: string;
  setAiProvider?: (provider: string) => void;
  
  // 追加のメソッド
  setAuthenticated: (authenticated: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setDemoAuth: (user: User) => void;
  isDemoToken: (token?: string) => boolean;
  hydrateFromStorage: () => void;
  suggestions?: any[];
  setAccountAnalytics?: (analytics: any) => void;
  setPosts?: (posts: any[]) => void;
  setAnalysis?: (analysis: any[]) => void;
  setSuggestions?: (suggestions: any[]) => void;
}

export const useAppStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 認証状態
      isAuthenticated: false,
      token: null,
      currentUser: null,
      isLoading: false,

      // 認証状態を設定するメソッド（無限ループ解決のため）
      setAuthenticated: (authenticated: boolean) => {
        console.log('[DEBUG] setAuthenticated called:', authenticated);
        set({ isAuthenticated: authenticated });
      },

      // ユーザー情報を設定するメソッド
      setCurrentUser: (user: User | null) => {
        console.log('[DEBUG] setCurrentUser called:', user);
        set({ currentUser: user });
      },

      // デモモード用の認証設定
      setDemoAuth: (user: User) => {
        console.log('[DEBUG] setDemoAuth called:', user);
        set({ 
          isAuthenticated: true,
          currentUser: user,
          token: 'demo-token-' + Date.now()
        });
      },

      // ローディング状態を設定
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // エラーを設定
      setError: (error: string | null) => {
        // エラー処理の実装
        if (error) {
          console.error('[ERROR] App Error:', error);
        }
      },

      // デモトークンかどうかを判定
      isDemoToken: (token?: string): boolean => {
        const currentToken = token || get().token;
        return !!(currentToken && (
          currentToken.startsWith('demo-token') ||
          currentToken === 'demo_token' ||
          currentToken.includes('demo')
        ));
      },

      // localStorageから状態を復元
      hydrateFromStorage: () => {
        console.log('[DEBUG] hydrateFromStorage開始');
        
        const token = localStorage.getItem('IG_JWT');
        const userRaw = localStorage.getItem('IG_USER');
        
        if (token && userRaw) {
          try {
            const user = JSON.parse(userRaw) as User;
            console.log('[DEBUG] localStorageから復元:', { user, hasToken: !!token });
            set({ currentUser: user, isAuthenticated: true, token });
          } catch (error) {
            console.error('[ERROR] localStorageデータの解析に失敗:', error);
            // 破損データはクリア
            localStorage.removeItem('IG_JWT');
            localStorage.removeItem('IG_USER');
            set({ currentUser: null, isAuthenticated: false, token: null });
          }
        } else {
          console.log('[DEBUG] localStorageに認証データなし');
          set({ currentUser: null, isAuthenticated: false, token: null });
        }
      },

      // ログイン
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          console.log('[DEBUG] ログイン開始:', { email });
          
          // 環境変数からAPI_BASE_URLを取得（/apiを含む）
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
          
          console.log('[DEBUG] ログイン - API_BASE_URL:', API_BASE_URL);
          
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          console.log('[DEBUG] レスポンスステータス:', response.status);
          console.log('[DEBUG] レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));

          // レスポンスの内容を確認
          const responseText = await response.text();
          console.log('[DEBUG] レスポンス内容:', responseText);

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('[ERROR] JSON解析エラー:', parseError);
            console.error('[ERROR] レスポンス内容:', responseText);
            set({ isLoading: false });
            alert('サーバーからの応答が不正です。しばらく待ってから再試行してください。');
            return false;
          }

          if (data.success) {
            console.log('[DEBUG] ログイン成功:', data);
            set({
              isAuthenticated: true,
              token: data.token,
              currentUser: data.user,
              isLoading: false,
            });
            return true;
          } else {
            console.log('[DEBUG] ログイン失敗:', data);
            set({ isLoading: false });
            alert(data.error || 'ログインに失敗しました');
            return false;
          }
        } catch (error) {
          console.error('[ERROR] ログインエラー:', error);
          set({ isLoading: false });
          
          // エラーの種類に応じてメッセージを変更
          if (error instanceof TypeError && error.message.includes('fetch')) {
            alert('サーバーに接続できません。しばらく待ってから再試行してください。');
          } else {
            alert('ログイン中にエラーが発生しました。しばらく待ってから再試行してください。');
          }
          return false;
        }
      },

      // 新規登録
      signup: async (username: string, email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // 環境変数からAPI_BASE_URLを取得
          const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://instagram-marketing-backend-v2.onrender.com';
          
          const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              isAuthenticated: true,
              token: data.token,
              currentUser: data.user,
              isLoading: false,
            });
            return true;
          } else {
            set({ isLoading: false });
            alert(data.error || '新規登録に失敗しました');
            return false;
          }
        } catch (error) {
          console.error('[ERROR] 新規登録エラー:', error);
          set({ isLoading: false });
          alert('新規登録中にエラーが発生しました');
          return false;
        }
      },

      // ログアウト
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          currentUser: null,
          isLoading: false,
        });
        console.log('[DEBUG] ログアウト完了');
      },

      // プロフィール更新
      updateProfile: async (profile: Partial<User['profile']>) => {
        try {
          const { token } = get();
          if (!token) return false;

          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profile),
          });

          const data = await response.json();

          if (data.success) {
            set((state) => ({
              currentUser: state.currentUser ? {
                ...state.currentUser,
                profile: { ...state.currentUser.profile, ...profile }
              } : null
            }));
            return true;
          } else {
            alert(data.error || 'プロフィール更新に失敗しました');
            return false;
          }
        } catch (error) {
          console.error('[ERROR] プロフィール更新エラー:', error);
          alert('プロフィール更新中にエラーが発生しました');
          return false;
        }
      },

      // パスワード変更
      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          const { token } = get();
          if (!token) return false;

          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });

          const data = await response.json();

          if (data.success) {
            alert('パスワードを変更しました');
            return true;
          } else {
            alert(data.error || 'パスワード変更に失敗しました');
            return false;
          }
        } catch (error) {
          console.error('[ERROR] パスワード変更エラー:', error);
          alert('パスワード変更中にエラーが発生しました');
          return false;
        }
      },

      // アカウント削除
      deleteAccount: async () => {
        try {
          const { token } = get();
          if (!token) return false;

          const response = await fetch('/api/auth/delete-account', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            set({
              isAuthenticated: false,
              token: null,
              currentUser: null,
            });
            alert('アカウントを削除しました');
            return true;
          } else {
            alert(data.error || 'アカウント削除に失敗しました');
            return false;
          }
        } catch (error) {
          console.error('アカウント削除エラー:', error);
          alert('アカウント削除中にエラーが発生しました');
          return false;
        }
      },

      // OAuth認証
      oauthLogin: (provider: 'instagram' | 'facebook') => {
        // 本番環境用OAuth処理
        if (provider === 'instagram') {
          // Instagram OAuth
          const instagramAppId = import.meta.env.VITE_INSTAGRAM_APP_ID;
          const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI;
          
          if (instagramAppId && redirectUri) {
            const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;
            window.location.href = authUrl;
          } else {
            alert('Instagram OAuth設定が不完全です。管理者にお問い合わせください。');
          }
        } else {
          // Facebook OAuth
          const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
          const redirectUri = `${window.location.origin}/auth/callback`;
          
          if (facebookAppId) {
            const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&response_type=code`;
            window.location.href = authUrl;
          } else {
            alert('Facebook OAuth設定が不完全です。管理者にお問い合わせください。');
          }
        }
      },

      // OAuthコールバック処理
      handleOAuthCallback: (data: any) => {
        if (data.success && data.token) {
          set({
            isAuthenticated: true,
            token: data.token,
            currentUser: data.user,
          });
        }
      },

      // プロフィール取得
      fetchProfile: async () => {
        try {
          const { token } = get();
          if (!token) return;

          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            set({
              currentUser: data.user,
            });
          }
        } catch (error) {
          console.error('プロフィール取得エラー:', error);
        }
      },

      // 既存の状態
      currentUrl: '',
      setCurrentUrl: (url: string) => set({ currentUrl: url }),
      analysisHistory: [],
      addAnalysisToHistory: (analysis: any) =>
        set((state) => ({
          analysisHistory: [analysis, ...state.analysisHistory.slice(0, 9)],
        })),
      clearAnalysisHistory: () => set({ analysisHistory: [] }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        currentUser: state.currentUser,
        analysisHistory: state.analysisHistory,
      }),
    }
  )
); 