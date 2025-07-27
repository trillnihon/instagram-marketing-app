import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import ThreadsCompetitorAnalysis from '../components/ThreadsCompetitorAnalysis';
import { useAppStore } from '../store/useAppStore';

const ThreadsAnalysisPage: React.FC = () => {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'competitor' | 'trends'>('competitor');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Navigation activeTab="threads-analysis" onTabChange={() => {}} showAdminLink={true} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧵 Threads分析
          </h1>
          <p className="text-gray-600">
            Threadsアカウントの競合分析とトレンド分析を実行できます
          </p>
          {currentUser && (
            <p className="text-sm text-gray-500 mt-1">
              {currentUser.userId} としてログイン中
            </p>
          )}
        </div>

        {/* タブ切り替え */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('competitor')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'competitor'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🔍 競合分析
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trends'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📈 トレンド分析
            </button>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'competitor' ? (
          <ThreadsCompetitorAnalysis />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Threadsトレンド分析</h3>
              <p className="text-gray-600 mb-4">
                人気ハッシュタグやトレンド分析機能は開発中です
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  今後、以下の機能を追加予定です：
                </p>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• 人気ハッシュタグランキング</li>
                  <li>• トレンド分析</li>
                  <li>• 投稿最適時間分析</li>
                  <li>• コンテンツパフォーマンス予測</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadsAnalysisPage; 