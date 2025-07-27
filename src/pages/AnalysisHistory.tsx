import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import Navigation from '../components/Navigation';

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

interface AnalysisStats {
  overall: {
    totalAnalyses: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    analysisTypes: string[];
    totalExported: number;
  };
  byType: Array<{
    _id: string;
    count: number;
    averageScore: number;
    bestScore: number;
    lastAnalysis: string;
  }>;
}

const AnalysisHistory: React.FC = () => {
  const { token, currentUser } = useAppStore();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<AnalysisHistoryItem | null>(null);
  const [searchParams, setSearchParams] = useState({
    query: '',
    analysisType: '',
    dateFrom: '',
    dateTo: '',
    minScore: '',
    maxScore: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 分析履歴を取得
  const fetchHistory = async (page = 1, append = false) => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '10',
        skip: ((page - 1) * 10).toString(),
        ...searchParams
      });

      const response = await fetch(`/api/analysis-history/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        if (append) {
          setHistory(prev => [...prev, ...data.data]);
        } else {
          setHistory(data.data);
        }
        setHasMore(data.data.length === 10);
      } else {
        setError(data.error || '分析履歴の取得に失敗しました');
      }
    } catch (error) {
      console.error('分析履歴取得エラー:', error);
      setError('分析履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 統計情報を取得
  const fetchStats = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/analysis-history/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('統計情報取得エラー:', error);
    }
  };

  // 分析履歴を検索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchHistory(1, false);
  };

  // 分析履歴を削除
  const handleDelete = async (historyId: string) => {
    if (!token || !window.confirm('この分析履歴を削除しますか？')) return;

    try {
      const response = await fetch(`/api/analysis-history/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setHistory(prev => prev.filter(item => item._id !== historyId));
        fetchStats(); // 統計を更新
      } else {
        setError(data.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      setError('削除に失敗しました');
    }
  };

  // PDFエクスポート状態を更新
  const handleMarkAsExported = async (historyId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/analysis-history/history/${historyId}/export`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setHistory(prev => prev.map(item => 
          item._id === historyId ? { ...item, exportedToPDF: true } : item
        ));
      }
    } catch (error) {
      console.error('エクスポート状態更新エラー:', error);
    }
  };

  // 分析履歴をエクスポート
  const handleExport = async (format: 'json' | 'csv') => {
    if (!token) return;

    try {
      const params = new URLSearchParams({
        format,
        ...searchParams
      });

      const response = await fetch(`/api/analysis-history/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        if (data.success) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: 'application/json'
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analysis_history_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('エクスポートエラー:', error);
      setError('エクスポートに失敗しました');
    }
  };

  useEffect(() => {
    fetchHistory(1, false);
    fetchStats();
  }, [token]);

  const getAnalysisTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'instagram_post': 'Instagram投稿',
      'threads_post': 'Threads投稿',
      'url_analysis': 'URL分析',
      'hashtag_analysis': 'ハッシュタグ分析',
      'account_analytics': 'アカウント分析',
      'content_suggestion': 'コンテンツ提案'
    };
    return labels[type] || type;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Navigation activeTab="history" onTabChange={() => {}} showAdminLink={currentUser.isAdmin} />
        
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">📊 分析履歴</h1>
              <p className="text-gray-600 mt-1">過去の分析結果を確認・管理できます</p>
            </div>

            {/* 統計情報 */}
            {stats && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.overall.totalAnalyses}</div>
                    <div className="text-sm text-gray-600">総分析数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.overall.averageScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">平均スコア</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.overall.bestScore}</div>
                    <div className="text-sm text-gray-600">最高スコア</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.overall.totalExported}</div>
                    <div className="text-sm text-gray-600">PDF出力済み</div>
                  </div>
                </div>
              </div>
            )}

            {/* 検索・フィルター */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="検索キーワード..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={searchParams.analysisType}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, analysisType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべての分析タイプ</option>
                  <option value="instagram_post">Instagram投稿</option>
                  <option value="threads_post">Threads投稿</option>
                  <option value="url_analysis">URL分析</option>
                  <option value="hashtag_analysis">ハッシュタグ分析</option>
                  <option value="account_analytics">アカウント分析</option>
                  <option value="content_suggestion">コンテンツ提案</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  検索
                </button>
              </div>
            </div>

            {/* エクスポートボタン */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  📄 JSONエクスポート
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  📊 CSVエクスポート
                </button>
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <div className="text-red-700">{error}</div>
              </div>
            )}

            {/* 分析履歴リスト */}
            <div className="divide-y divide-gray-200">
              {loading && history.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">分析履歴を読み込み中...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-600">分析履歴がありません</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getAnalysisTypeLabel(item.analysisType)}
                          </span>
                          <span className={`text-lg font-semibold ${getScoreColor(item.engagementScore)}`}>
                            {item.engagementScore.toFixed(1)}点
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                          </span>
                          {item.exportedToPDF && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              📄 PDF出力済み
                            </span>
                          )}
                        </div>
                        
                        {item.postData?.caption && (
                          <p className="text-gray-700 mt-2 line-clamp-2">
                            {item.postData.caption}
                          </p>
                        )}
                        
                        <p className="text-gray-600 mt-1 text-sm line-clamp-1">
                          {item.feedback}
                        </p>

                        {item.strengths.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">強み: </span>
                            {item.strengths.slice(0, 3).map((strength, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                                {strength}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedHistory(item)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          詳細
                        </button>
                        {!item.exportedToPDF && (
                          <button
                            onClick={() => handleMarkAsExported(item._id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            PDF出力
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ページネーション */}
            {hasMore && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    fetchHistory(currentPage + 1, true);
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {loading ? '読み込み中...' : 'さらに読み込む'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 詳細モーダル */}
        {selectedHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">分析詳細</h2>
                  <button
                    onClick={() => setSelectedHistory(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">基本情報</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">分析タイプ:</span>
                        <span className="ml-2">{getAnalysisTypeLabel(selectedHistory.analysisType)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">エンゲージメントスコア:</span>
                        <span className={`ml-2 font-semibold ${getScoreColor(selectedHistory.engagementScore)}`}>
                          {selectedHistory.engagementScore.toFixed(1)}点
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">作成日:</span>
                        <span className="ml-2">{new Date(selectedHistory.createdAt).toLocaleString('ja-JP')}</span>
                      </div>
                    </div>

                    {selectedHistory.postData?.caption && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">投稿内容</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedHistory.postData.caption}</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">フィードバック</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded">{selectedHistory.feedback}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">アルゴリズム要因</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedHistory.algorithmFactors).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm font-medium text-gray-500">{key}:</span>
                          <span className="ml-2">{value?.toFixed(1) || 'N/A'}</span>
                        </div>
                      ))}
                    </div>

                    {selectedHistory.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">推奨事項</h4>
                        <div className="space-y-2">
                          {selectedHistory.recommendations.map((rec, index) => (
                            <div key={index} className="bg-yellow-50 p-3 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-yellow-800">{rec.message}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-sm text-yellow-700 mt-1">{rec.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">強み</h4>
                        <div className="space-y-1">
                          {selectedHistory.strengths.map((strength, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-1 mb-1">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">改善点</h4>
                        <div className="space-y-1">
                          {selectedHistory.weaknesses.map((weakness, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mr-1 mb-1">
                              {weakness}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory; 