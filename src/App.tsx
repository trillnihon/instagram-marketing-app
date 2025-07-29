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
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
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
            path="/auth/instagram/callback" 
            element={<AuthCallback />} 
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