import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('example@email.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, setAuthenticated } = useAppStore();

  // 認証状態監視
  useEffect(() => {
    console.log('🔍 [DEBUG] 認証状態監視:', { isAuthenticated });
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramLogin = () => {
    // Facebook Login for BusinessによるInstagram API認証
    console.log('📸 [DEBUG] Facebook Login for Business認証開始');
    
    // Facebook OAuth URLを構築
    const facebookAppId = import.meta.env.VITE_INSTAGRAM_APP_ID;
    const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || 'https://instagram-marketing-app.vercel.app/auth/facebook/callback';
    
    // 開発環境の場合はlocalhostを使用
    const isDevelopment = window.location.hostname === 'localhost';
    const finalRedirectUri = isDevelopment 
      ? 'http://localhost:3001/auth/facebook/callback'
      : redirectUri;
    
    // Facebook Login for BusinessのOAuth URL（Metaドキュメント準拠）
    const facebookAuthUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${facebookAppId}&display=page&extras=${encodeURIComponent('{"setup":{"channel":"IG_API_ONBOARDING"}}')}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&response_type=token&scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`;
    
    console.log('🔗 [DEBUG] Facebook Login for Business URL:', {
      facebookAppId,
      redirectUri: finalRedirectUri,
      display: 'page',
      extras: '{"setup":{"channel":"IG_API_ONBOARDING"}}',
      response_type: 'token',
      scope: 'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement',
      isDevelopment,
      fullUrl: facebookAuthUrl
    });
    
    // Facebook認証ページにリダイレクト
    window.location.href = facebookAuthUrl;
  };

  const handleDemoMode = () => {
    console.log('🎮 [DEBUG] デモモード開始');
    
    // デモユーザーを作成
    const demoUser = {
      id: 'demo-user-001',
      username: 'demo_user',
      email: 'demo@example.com',
      profile: {
        displayName: 'デモユーザー',
        bio: 'デモアカウント',
        avatar: ''
      },
      isAdmin: false,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // デモ認証を設定
    const { setDemoAuth } = useAppStore.getState();
    setDemoAuth(demoUser);
    
    console.log('✅ [DEBUG] デモモード認証完了:', {
      isAuthenticated: true,
      currentUser: demoUser
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Instagram Marketing App</h1>
          <p className="text-gray-600">AIがあなたのSNS投稿を分析・最適化</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ログイン</h2>
            <p className="text-gray-600 mb-6">アカウントにログインしてください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="パスワードを入力"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-orange-600 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <button
            onClick={handleInstagramLogin}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>📸 Facebook Login for Business</span>
          </button>

          {/* デモモードボタン */}
          <button
            onClick={handleDemoMode}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-all duration-200"
          >
            🎮 デモモードで開始
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              アカウントをお持ちでない方は{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                新規登録
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 