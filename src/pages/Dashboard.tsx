import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { algorithmAnalysis } from '../services/algorithmAnalysis';
import { fetchInstagramPosts } from '../services/instagramApi';
import AccountAnalytics from '../components/AccountAnalytics';
import PostAnalysis from '../components/PostAnalysis';
import ContentSuggestions from '../components/ContentSuggestions';
import PostScheduler from '../components/PostScheduler';
import Navigation from '../components/Navigation';
import AdvancedPostAnalysis from '../components/AdvancedPostAnalysis';
import AIProviderSettings from '../components/AIProviderSettings';
import UserTutorial from '../components/UserTutorial';
import QuickStartGuide from '../components/QuickStartGuide';
import ApiStatusMonitor from '../components/ApiStatusMonitor';
// import { RSSFeedPanel, FeedItem } from '../components/RSSFeedPanel';
// import { fetchLatestFeeds } from '../../lib/rssFetcher';
// import RSSFeedSearchBar from '../components/RSSFeedSearchBar';
// import { useRSSFeeds } from '../hooks/useRSSFeeds';

const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    accountAnalytics, 
    posts, 
    analysis, 
    suggestions,
    setAccountAnalytics, 
    setPosts, 
    setAnalysis, 
    setSuggestions,
    setLoading, 
    setError 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('advanced-analysis');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  // const {
  //   feeds,
  //   filteredFeeds,
  //   searchQuery,
  //   setSearchQuery,
  //   isSaved,
  //   toggleSave,
  //   savedFeeds
  // } = useRSSFeeds();

  useEffect(() => {
    // 初回ログイン時のチュートリアル表示チェック
    const tutorialSeen = localStorage.getItem('tutorial-completed');
    if (!tutorialSeen && currentUser) {
      setShowTutorial(true);
      setHasSeenTutorial(false);
    } else {
      setHasSeenTutorial(true);
    }

    if (currentUser) {
      loadData();
    }
    // RSSフィード取得
    // fetchLatestFeeds().then(setFeeds);
  }, [currentUser]);

  const loadData = async () => {
    setLoading?.(true);
    setError?.(null);

    try {
      // デモユーザーの場合はAPI呼び出しをスキップ
      if (currentUser?.id === 'demo_user') {
        console.log('🎭 [DEBUG] デモユーザーのためAPI呼び出しをスキップ');
        // デモユーザーの場合は既にストアにダミーデータが設定されているはず
        setLoading?.(false);
        return;
      }

      // Instagram認証情報を確認
      const instagramAuth = localStorage.getItem('instagram_auth');
      
      if (instagramAuth) {
        console.log('📱 [DEBUG] Instagram認証情報を確認 - 実際のAPIを呼び出し');
        const authData = JSON.parse(instagramAuth);
        
        // Instagram投稿データを取得
        if (authData.accessToken && authData.instagramBusinessAccount?.id && currentUser?.id) {
          const posts = await fetchInstagramPosts(
            currentUser.id,
            authData.accessToken,
            authData.instagramBusinessAccount.id
          );
          setPosts?.(posts);
          console.log('✅ [DEBUG] Instagram投稿データ取得成功:', posts.length, '件');
        }
      } else {
        console.log('📱 [DEBUG] Instagram認証情報なし - デモデータを使用');
        // Instagram認証が完了していない場合はデモデータを使用
      }

    } catch (error) {
      console.error('[ERROR] データ取得エラー:', error);
      setError?.('データの取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading?.(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analytics':
        return <AccountAnalytics />;
      case 'analysis':
        return <PostAnalysis />;
      case 'suggestions':
        return <ContentSuggestions />;
      case 'scheduler':
        return <PostScheduler />;
      case 'advanced-analysis':
        return <AdvancedPostAnalysis />;
      case 'ai-settings':
        return <AIProviderSettings />;
      case 'api-status':
        return <ApiStatusMonitor />;
      default:
        return <AdvancedPostAnalysis />;
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('tutorial-completed', 'true');
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('tutorial-completed', 'true');
  };

  // 管理者権限の判定（デモユーザーまたは特定のユーザーID）
  const isAdmin = currentUser?.id === 'demo_user' || currentUser?.id === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} showAdminLink={isAdmin} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Instagram マーケティング ダッシュボード
          </h1>
          <p className="mt-2 text-gray-600">
            {currentUser?.id} としてログイン中
          </p>
        </div>

        {/* クイックスタートガイド（初回利用者向け） */}
        {!hasSeenTutorial && showQuickStart && (
          <div className="mb-8">
            <QuickStartGuide 
              onTabChange={setActiveTab}
              onShowTutorial={() => setShowTutorial(true)}
            />
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab('advanced-analysis')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'advanced-analysis'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤖 AI投稿分析
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 アカウント分析
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analysis'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📈 投稿分析
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'suggestions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💡 コンテンツ提案
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'scheduler'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 投稿スケジューラー
            </button>
            <button
              onClick={() => setActiveTab('ai-settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'ai-settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ AI設定
            </button>
            <button
              onClick={() => setActiveTab('api-status')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'api-status'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 API状態
            </button>
          </div>
        </div>

        {renderActiveTab()}

        {/* 使い方ガイドボタン */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowTutorial(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-instagram-secondary to-instagram-primary text-white rounded-md hover:from-instagram-primary hover:to-instagram-secondary transition-all duration-200 font-medium"
          >
            <span>📚</span>
            <span>使い方ガイドを見る</span>
          </button>
        </div>

        {/* 🔍 検索バー + RSSパネル表示 */}
        {/*
        <div className="mt-12">
          <RSSFeedSearchBar value={searchQuery} onChange={setSearchQuery} />
          <RSSFeedPanel feeds={filteredFeeds} isSaved={isSaved} onToggleSave={toggleSave} />
        </div>
        {savedFeeds.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-4">🔖 保存済みフィード</h2>
            <RSSFeedPanel
              feeds={savedFeeds}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
          </div>
        )}
        */}
      </main>

      {/* ユーザーチュートリアル */}
      <UserTutorial
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
};

export default Dashboard; 