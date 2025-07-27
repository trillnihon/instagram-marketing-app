import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface PerformanceMetrics {
  engagementRate: number;
  reachRate: number;
  saveRate: number;
  shareRate: number;
  commentRate: number;
  optimalPostingTime: string;
  bestHashtags: string[];
  audienceInsights: {
    ageRange: string;
    gender: string;
    interests: string[];
    activeHours: string[];
  };
}

interface AlgorithmScore {
  overall: number;
  contentQuality: number;
  engagement: number;
  consistency: number;
  timing: number;
  hashtagOptimization: number;
  recommendations: string[];
}

interface AdvancedAnalyticsProps {
  posts: any[];
  userId?: string;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ posts, userId }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [algorithmScore, setAlgorithmScore] = useState<AlgorithmScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  
  const { currentUser } = useAppStore();

  // パフォーマンス分析を実行
  const analyzePerformance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || currentUser?.userId || 'demo_user',
          timeRange: selectedTimeRange,
          posts: posts
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPerformanceMetrics(data.metrics);
        setAlgorithmScore(data.algorithmScore);
      } else {
        setError(data.error || '分析に失敗しました');
      }
    } catch (err) {
      console.error('Performance analysis error:', err);
      setError('分析ツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時に分析実行
  useEffect(() => {
    if (posts.length > 0) {
      analyzePerformance();
    }
  }, [posts, selectedTimeRange]);

  // スコアに基づく色を取得
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // スコアに基づく背景色を取得
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">詳細分析を実行中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 時間範囲選択 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">分析期間</h3>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">過去7日間</option>
            <option value="30days">過去30日間</option>
            <option value="90days">過去90日間</option>
          </select>
        </div>
      </div>

      {/* アルゴリズムスコア */}
      {algorithmScore && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Instagramアルゴリズム分析</h3>
          
          {/* 総合スコア */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">総合スコア</span>
              <span className={`text-2xl font-bold ${getScoreColor(algorithmScore.overall)}`}>
                {algorithmScore.overall}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getScoreBgColor(algorithmScore.overall)}`}
                style={{ width: `${algorithmScore.overall}%` }}
              ></div>
            </div>
          </div>

          {/* 詳細スコア */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">コンテンツ品質</span>
                <span className={`font-semibold ${getScoreColor(algorithmScore.contentQuality)}`}>
                  {algorithmScore.contentQuality}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBgColor(algorithmScore.contentQuality)}`}
                  style={{ width: `${algorithmScore.contentQuality}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">エンゲージメント</span>
                <span className={`font-semibold ${getScoreColor(algorithmScore.engagement)}`}>
                  {algorithmScore.engagement}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBgColor(algorithmScore.engagement)}`}
                  style={{ width: `${algorithmScore.engagement}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">投稿頻度</span>
                <span className={`font-semibold ${getScoreColor(algorithmScore.consistency)}`}>
                  {algorithmScore.consistency}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBgColor(algorithmScore.consistency)}`}
                  style={{ width: `${algorithmScore.consistency}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">投稿タイミング</span>
                <span className={`font-semibold ${getScoreColor(algorithmScore.timing)}`}>
                  {algorithmScore.timing}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBgColor(algorithmScore.timing)}`}
                  style={{ width: `${algorithmScore.timing}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 改善提案 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 改善提案</h4>
            <ul className="space-y-1">
              {algorithmScore.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <span className="mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* パフォーマンス指標 */}
      {performanceMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 パフォーマンス指標</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{performanceMetrics.engagementRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">エンゲージメント率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{performanceMetrics.reachRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">リーチ率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{performanceMetrics.saveRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">保存率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{performanceMetrics.shareRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">シェア率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{performanceMetrics.commentRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">コメント率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{performanceMetrics.optimalPostingTime}</div>
              <div className="text-sm text-gray-600">最適投稿時間</div>
            </div>
          </div>

          {/* オーディエンス分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">👥 オーディエンス分析</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">年齢層:</span>
                  <span className="text-sm font-medium">{performanceMetrics.audienceInsights.ageRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">性別:</span>
                  <span className="text-sm font-medium">{performanceMetrics.audienceInsights.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">興味:</span>
                  <span className="text-sm font-medium">{performanceMetrics.audienceInsights.interests.join(', ')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">⏰ アクティブ時間</h4>
              <div className="space-y-1">
                {performanceMetrics.audienceInsights.activeHours.map((hour, index) => (
                  <div key={index} className="text-sm text-gray-600">{hour}</div>
                ))}
              </div>
            </div>
          </div>

          {/* 最適ハッシュタグ */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">🏷️ 最適ハッシュタグ</h4>
            <div className="flex flex-wrap gap-2">
              {performanceMetrics.bestHashtags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics; 