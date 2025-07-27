import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import Navigation from '../components/Navigation';
import PostHistory from '../components/PostHistory';
import AdvancedAnalytics from '../components/AdvancedAnalytics';

interface ThreadsAnalysisHistory {
  id: string;
  username: string;
  followers: number;
  averageEngagement: number;
  analysisDate: string;
  topHashtags: string[];
  contentTone: string;
}

interface AnalysisHistoryItem {
  _id: string;
  analysisType: string;
  createdAt: string;
  engagementScore: number;
  postData: {
    postId?: string;
    caption?: string;
    hashtags?: string[];
    mediaType?: string;
  };
  feedback: string;
  exportedToPDF: boolean;
  algorithmFactors: {
    initialVelocity?: number;
    shareRate?: number;
    saveRate?: number;
    commentQuality?: number;
    hashtagEffectiveness?: number;
    timingScore?: number;
    contentRelevance?: number;
    audienceMatch?: number;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    suggestion: string;
  }>;
  strengths: string[];
  weaknesses: string[];
}

const History: React.FC = () => {
  const { analysisHistory: analysis, currentUser, token } = useAppStore();
  const [activeTab, setActiveTab] = useState<'analysis' | 'posts' | 'advanced' | 'threads'>('posts');
  const [showThreadsOnly, setShowThreadsOnly] = useState(false);
  const [threadsHistory, setThreadsHistory] = useState<ThreadsAnalysisHistory[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  
  // 分析履歴の状態
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisStats, setAnalysisStats] = useState<any>(null);
  
  // 管理者権限の判定（デモユーザーまたは特定のユーザーID）
  const isAdmin = currentUser?.id === 'demo_user' || currentUser?.id === 'admin';

  // 分析履歴を取得
  const fetchAnalysisHistory = async () => {
    if (!token) return;
    
    setLoadingAnalysis(true);
    try {
      const response = await fetch('/api/analysis-history/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisHistory(data.data);
      } else {
        console.error('分析履歴取得エラー:', data.error);
      }
    } catch (error) {
      console.error('分析履歴取得エラー:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // 分析統計を取得
  const fetchAnalysisStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/analysis-history/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisStats(data.data);
      }
    } catch (error) {
      console.error('分析統計取得エラー:', error);
    }
  };

  // Threads分析履歴を取得
  const fetchThreadsHistory = async () => {
    if (!currentUser?.id) return;
    
    setLoadingThreads(true);
    try {
      const response = await fetch(`/api/threads/analysis-history/${currentUser.id}`);
      const data = await response.json();
      
      if (data.success) {
        setThreadsHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to fetch threads history:', error);
    } finally {
      setLoadingThreads(false);
    }
  };

  // コンポーネントマウント時に履歴を取得
  useEffect(() => {
    if (activeTab === 'threads') {
      fetchThreadsHistory();
    } else if (activeTab === 'analysis') {
      fetchAnalysisHistory();
      fetchAnalysisStats();
    }
  }, [activeTab, token, currentUser?.id]);

  // 分析タイプを日本語に変換
  const getAnalysisTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'instagram_post': 'Instagram投稿',
      'threads_post': 'Threads投稿',
      'url_analysis': 'URL分析',
      'hashtag_analysis': 'ハッシュタグ分析',
      'account_analytics': 'アカウント分析',
      'content_suggestion': 'コンテンツ提案'
    };
    return typeMap[type] || type;
  };

  // 分析タイプのアイコンを取得
  const getAnalysisTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'instagram_post': '📸',
      'threads_post': '🧵',
      'url_analysis': '🔗',
      'hashtag_analysis': '🏷️',
      'account_analytics': '📊',
      'content_suggestion': '💡'
    };
    return iconMap[type] || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Navigation activeTab="history" onTabChange={() => {}} showAdminLink={isAdmin} />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">履歴・分析</h1>
          
          {/* タブ切り替え */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📸 Instagram投稿履歴
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🤖 AI分析履歴
            </button>
            <button
              onClick={() => setActiveTab('threads')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'threads'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🧵 Threads分析履歴
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📊 詳細分析
            </button>
          </div>

          {/* Threadsフィルター */}
          {activeTab === 'posts' && (
            <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <h3 className="text-sm font-medium text-gray-700">フィルター:</h3>
                <button
                  onClick={() => setShowThreadsOnly(!showThreadsOnly)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    showThreadsOnly
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-purple-600">🧵</span>
                  <span>Threads投稿のみ</span>
                </button>
              </div>
              {showThreadsOnly && (
                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  Threads投稿を表示中
                </div>
              )}
            </div>
          )}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'posts' && (
          <PostHistory 
            accessToken={currentUser?.id}
            instagramBusinessAccountId={currentUser?.id}
          />
        )}
        {activeTab === 'advanced' && (
          <AdvancedAnalytics 
            posts={[]} // 実際の投稿データを渡す
            userId={currentUser?.id}
          />
        )}
        {activeTab === 'threads' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">🧵 Threads分析履歴</h2>
              <button
                onClick={fetchThreadsHistory}
                disabled={loadingThreads}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loadingThreads ? '更新中...' : '🔄 更新'}
              </button>
            </div>
            
            {loadingThreads ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">分析履歴を読み込み中...</p>
              </div>
            ) : threadsHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🧵</div>
                <p className="text-gray-500">Threads分析履歴がありません。</p>
                <p className="text-sm text-gray-400 mt-2">
                  Threads分析機能を使用すると、ここに履歴が表示されます。
                </p>
                <div className="mt-4">
                  <a
                    href="/threads-analysis"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    🧵 Threads分析を実行
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {threadsHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">T</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">@{item.username}</h3>
                          <p className="text-sm text-gray-600">{item.followers.toLocaleString()}フォロワー</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{item.averageEngagement.toFixed(2)}%</div>
                        <div className="text-xs text-gray-500">エンゲージメント</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">🏷️ 人気ハッシュタグ</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.topHashtags.slice(0, 5).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {item.topHashtags.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{item.topHashtags.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">📝 コンテンツトーン</h4>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-800">{item.contentTone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>分析日: {new Date(item.analysisDate).toLocaleDateString('ja-JP')}</span>
                        <a
                          href={`/threads-analysis?username=${item.username}`}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          詳細を見る →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'analysis' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">AI分析履歴</h2>
              <button
                onClick={() => {
                  fetchAnalysisHistory();
                  fetchAnalysisStats();
                }}
                disabled={loadingAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingAnalysis ? '更新中...' : '🔄 更新'}
              </button>
            </div>

            {/* 統計情報 */}
            {analysisStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysisStats.totalAnalyses || 0}</div>
                  <div className="text-sm text-blue-700">総分析数</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisStats.averageScore ? Math.round(analysisStats.averageScore) : 0}
                  </div>
                  <div className="text-sm text-green-700">平均スコア</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysisStats.bestScore || 0}</div>
                  <div className="text-sm text-purple-700">最高スコア</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analysisStats.totalExported || 0}</div>
                  <div className="text-sm text-orange-700">PDF出力済み</div>
                </div>
              </div>
            )}
            
            {loadingAnalysis ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">分析履歴を読み込み中...</p>
              </div>
            ) : analysisHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-gray-500">AI分析履歴がありません。</p>
                <p className="text-sm text-gray-400 mt-2">
                  投稿分析機能を使用すると、ここに履歴が表示されます。
                </p>
                <div className="mt-4">
                  <a
                    href="/analyze-url"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔗 URL分析を実行
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {analysisHistory.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getAnalysisTypeIcon(item.analysisType)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{getAnalysisTypeLabel(item.analysisType)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString('ja-JP')} {new Date(item.createdAt).toLocaleTimeString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-blue-600">
                          スコア: {item.engagementScore}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${
                          item.engagementScore >= 80 ? 'bg-green-500' :
                          item.engagementScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        {item.exportedToPDF && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            📄 PDF出力済み
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 投稿内容 */}
                    {item.postData?.caption && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">📝 投稿内容</h4>
                        <p className="text-sm text-gray-800 line-clamp-2">{item.postData.caption}</p>
                        {item.postData.hashtags && item.postData.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.postData.hashtags.slice(0, 5).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {item.postData.hashtags.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{item.postData.hashtags.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 評価理由 */}
                    {item.strengths.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          評価理由
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {item.strengths.slice(0, 3).map((strength, i) => (
                            <li key={i} className="text-green-700">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 改善案 */}
                    {item.recommendations.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <span className="text-blue-600 mr-2">💡</span>
                          改善案
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {item.recommendations.slice(0, 3).map((rec, i) => (
                            <li key={i} className="text-blue-700">
                              {rec.suggestion || rec.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 弱点 */}
                    {item.weaknesses.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <span className="text-red-600 mr-2">⚠️</span>
                          改善が必要な点
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {item.weaknesses.slice(0, 2).map((weakness, i) => (
                            <li key={i} className="text-red-700">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                            詳細を見る
                          </button>
                          {!item.exportedToPDF && (
                            <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                              PDF出力
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          ID: {item._id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History; 