import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import ThreadsCompetitorAnalysis from '../components/ThreadsCompetitorAnalysis';
import ThreadsTrendAnalysis from '../components/ThreadsTrendAnalysis';
import TrendPosts from '../components/TrendPosts';
import HashtagRanking from '../components/HashtagRanking';
import ContentThemes from '../components/ContentThemes';
import FollowerGrowthCorrelation from '../components/FollowerGrowthCorrelation';
import PDFGenerator from '../components/PDFGenerator';
import { useAppStore } from '../store/useAppStore';

const ThreadsAnalysis: React.FC = () => {
  const { currentUser } = useAppStore();
  const isAdmin = currentUser?.id === 'demo_user' || currentUser?.id === '17841474953463077';
  const [activeTab, setActiveTab] = useState<'competitor' | 'trends'>('competitor');
  
  // PDF生成用のデータ状態
  const [pdfData, setPdfData] = useState<any>(null);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);

  const tabs = [
    { id: 'competitor', label: '🧵 競合分析', icon: '📊' },
    { id: 'trends', label: '📈 トレンド分析', icon: '🔥' }
  ];

  // 分析データを収集してPDFデータを準備
  const preparePDFData = async () => {
    try {
      const userId = currentUser?.id || 'demo_user';
      
      // 各APIからデータを取得
      const [trendPostsRes, hashtagRankingRes, contentThemesRes, followerCorrelationRes] = await Promise.all([
        fetch(`/api/threads/trend-posts?userId=${userId}&days=30`),
        fetch(`/api/threads/hashtag-ranking?userId=${userId}`),
        fetch(`/api/threads/content-themes?userId=${userId}&days=30`),
        fetch(`/api/threads/follower-correlation?userId=${userId}`)
      ]);

      const [trendPostsData, hashtagRankingData, contentThemesData, followerCorrelationData] = await Promise.all([
        trendPostsRes.json(),
        hashtagRankingRes.json(),
        contentThemesRes.json(),
        followerCorrelationRes.json()
      ]);

      if (trendPostsData.success && hashtagRankingData.success && 
          contentThemesData.success && followerCorrelationData.success) {
        
        setPdfData({
          trendPosts: trendPostsData.posts,
          hashtagRanking: hashtagRankingData.hashtags,
          contentThemes: contentThemesData.themes,
          followerCorrelation: followerCorrelationData.correlationData,
          analysisDate: new Date().toISOString(),
          userId: userId
        });
        
        setShowPDFGenerator(true);
      } else {
        alert('データの取得に失敗しました。PDFレポートを生成できません。');
      }
    } catch (error) {
      console.error('PDFデータ準備エラー:', error);
      alert('PDFレポートの準備中にエラーが発生しました。');
    }
  };

  const handlePDFGenerated = (success: boolean) => {
    if (success) {
      alert('PDFレポートが正常に生成されました！');
    } else {
      alert('PDFレポートの生成に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Navigation activeTab="threads-analysis" onTabChange={() => {}} showAdminLink={isAdmin} />
        
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900">🧵 Threads分析ツール</h1>
              <p className="text-gray-600">
                Threadsアカウントの競合分析とトレンド分析を行い、エンゲージメント向上のための戦略を立てましょう。
              </p>
            </div>
            {activeTab === 'trends' && (
              <button
                onClick={preparePDFData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📄 PDFレポート生成
              </button>
            )}
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'competitor' | 'trends')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* PDFジェネレーター */}
        {showPDFGenerator && pdfData && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <PDFGenerator data={pdfData} onGenerate={handlePDFGenerated} />
          </div>
        )}

        {/* タブコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'competitor' && (
            <div className="p-6">
              <ThreadsCompetitorAnalysis />
            </div>
          )}
          
          {activeTab === 'trends' && (
            <div className="p-6">
              {/* 新しいThreadsTrendAnalysisコンポーネント */}
              <ThreadsTrendAnalysis />
              
              {/* 既存の個別コンポーネント（将来的に統合予定） */}
              <div className="mt-8 space-y-8">
                {/* トレンド投稿抽出 */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">🔥 トレンド投稿抽出（詳細）</h2>
                  <TrendPosts />
                </div>

                {/* 急上昇ハッシュタグランキング */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">🏆 急上昇ハッシュタグランキング（詳細）</h2>
                  <HashtagRanking />
                </div>

                {/* コンテンツテーマ別傾向 */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">📊 コンテンツテーマ別傾向（詳細）</h2>
                  <ContentThemes />
                </div>

                {/* 投稿頻度 × フォロワー増加の相関 */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">📈 投稿頻度 × フォロワー増加の相関（詳細）</h2>
                  <FollowerGrowthCorrelation />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadsAnalysis; 