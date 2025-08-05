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
import ThreadsManagement from './pages/ThreadsManagement';
import PostingTimeAnalysis from './pages/PostingTimeAnalysis';
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
  // アプリ起動時の認証状態チェックとフォールバック処理
  React.useEffect(() => {
    const { isAuthenticated, currentUser, setAuthenticated } = useAppStore.getState();
    console.log('🚀 [DEBUG] アプリ起動 - 初期認証状態:', {
      isAuthenticated,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username
      } : null,
      pathname: window.location.pathname,
      search: window.location.search,
      timestamp: new Date().toISOString()
    });

    // リダイレクトループ防止のため、認証状態をリセット
    if (isAuthenticated && !currentUser) {
      console.log('🔄 [DEBUG] 認証状態の不整合を検出、リセットします');
      setAuthenticated?.(false);
      localStorage.removeItem('instagram-marketing-app-storage');
    }

    // ルーティングデバッグ情報を追加
    console.log('🎯 [DEBUG] 現在のルーティング状況:', {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      fullUrl: window.location.href,
      isInstagramCallback: window.location.pathname === '/auth/instagram/callback'
    });

    // Instagram OAuthコールバックのフォールバック処理
    const urlParams = new URLSearchParams(window.location.search);
    const authCallback = urlParams.get('auth_callback');
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (authCallback === 'true' && code) {
      console.log('🔄 [DEBUG] クエリパラメータからのコールバック処理を開始');
      console.log('📝 [DEBUG] 認証コード:', code.substring(0, 10) + '...');
      window.location.href = `/auth/facebook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
    } else if (authCallback === 'true' && urlParams.get('no_code') === 'true') {
      console.log('⚠️ [DEBUG] 認証コードなしのコールバック処理');
      setAuthenticated?.(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analysis-history" element={<AnalysisHistory />} />
          
          {/* Facebook OAuthコールバックルート */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/facebook/callback" element={<AuthCallback />} />
          <Route path="/auth/instagram/callback" element={<AuthCallback />} /> {/* フォールバック */}
          
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
            path="/threads-management" 
            element={
              <ProtectedRoute>
                <ThreadsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/posting-time-analysis" 
            element={
              <ProtectedRoute>
                <PostingTimeAnalysis />
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