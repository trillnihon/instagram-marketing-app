import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import AuthCallback from './pages/AuthCallback';
import CreatePost from './pages/CreatePost';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AnalysisHistory from './pages/AnalysisHistory';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Admin from './pages/Admin';
import ErrorPanel from './components/ErrorPanel';
import DebugPanel from './components/DebugPanel';
import History from './pages/History';
import PostAnalytics from './components/PostAnalytics';
import PostScheduler from './components/PostScheduler';
import HashtagAnalysis from './components/HashtagAnalysis';
import InstagramAuth from './components/InstagramAuth';
import Diagnostics from './pages/Diagnostics';
import AnalyzeUrl from './pages/AnalyzeUrl';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import ThreadsAnalysis from './pages/ThreadsAnalysis';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
import './App.css';

// 認証が必要なルートのラッパーコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useAppStore();
  
  // デバッグ情報を出力（頻度を制限）
  const now = Date.now();
  if (!(window as any).lastAuthCheck || now - (window as any).lastAuthCheck > 1000) {
    console.log('🔒 [DEBUG] ProtectedRoute - 認証チェック:', {
      isAuthenticated,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username
      } : null,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    (window as any).lastAuthCheck = now;
  }
  
  // 認証チェックを強化
  if (!isAuthenticated || !currentUser) {
    console.log('❌ [DEBUG] ProtectedRoute - 認証失敗、ログイン画面にリダイレクト');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ [DEBUG] ProtectedRoute - 認証成功、コンテンツ表示');
  return <>{children}</>;
};

const App: React.FC = () => {
  // アプリ起動時の認証状態チェック
  React.useEffect(() => {
    const { isAuthenticated, currentUser } = useAppStore.getState();
    console.log('🚀 [DEBUG] アプリ起動 - 初期認証状態:', {
      isAuthenticated,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username
      } : null,
      timestamp: new Date().toISOString()
    });
    
    // 現在のURLとパスをログ出力
    console.log('📍 [DEBUG] 現在のURL情報:', {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin
    });
    
    // コールバックURLの特別チェック
    if (window.location.pathname === '/auth/instagram/callback') {
      console.log('🎯 [DEBUG] InstagramコールバックURLを検出！');
      console.log('🔍 [DEBUG] クエリパラメータ:', window.location.search);
    }
    
    // クエリパラメータからのコールバック処理
    const urlParams = new URLSearchParams(window.location.search);
    const authCallback = urlParams.get('auth_callback');
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (authCallback === 'true' && code) {
      console.log('🔄 [DEBUG] クエリパラメータからのコールバック処理を開始');
      console.log('📝 [DEBUG] 認証コード:', code.substring(0, 10) + '...');
      
      // AuthCallbackコンポーネントにリダイレクト
      window.location.href = `/auth/instagram/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
    } else if (authCallback === 'true' && urlParams.get('no_code') === 'true') {
      console.log('⚠️ [DEBUG] 認証コードなしのコールバック処理');
      
      // 認証コードなしでもデモモードで継続
      const { setAuthenticated } = useAppStore.getState();
      setAuthenticated?.(true);
      
      // ダッシュボードにリダイレクト
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Instagramコールバックを最優先に配置 */}
          <Route 
            path="/auth/instagram/callback" 
            element={
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Instagram認証処理中...
                    </h2>
                    <p className="text-gray-600">
                      認証情報を処理しています。しばらくお待ちください。
                    </p>
                  </div>
                </div>
              }>
                <AuthCallback />
              </React.Suspense>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analysis-history" element={<AnalysisHistory />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics-dashboard" 
            element={
              <ProtectedRoute>
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <PostAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scheduler" 
            element={
              <ProtectedRoute>
                <PostScheduler />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hashtags" 
            element={
              <ProtectedRoute>
                <HashtagAnalysis />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auth/instagram" 
            element={
              <ProtectedRoute>
                <InstagramAuth />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/diagnostics" 
            element={
              <ProtectedRoute>
                <Diagnostics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analyze-url" 
            element={
              <ProtectedRoute>
                <AnalyzeUrl />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/threads-analysis" 
            element={
              <ProtectedRoute>
                <ThreadsAnalysis />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-post" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ErrorPanel />
        <DebugPanel />
      </div>
    </Router>
  );
};

export default App; 