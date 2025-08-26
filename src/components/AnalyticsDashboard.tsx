import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

interface AnalyticsData {
  followers: {
    total: number;
    growth: number;
    trend: number[];
    dates: string[];
  };
  engagement: {
    average: number;
    trend: number[];
    dates: string[];
  };
  posts: {
    total: number;
    thisMonth: number;
    trend: number[];
    dates: string[];
  };
  reach: {
    average: number;
    trend: number[];
    dates: string[];
  };
  topPosts: {
    id: string;
    caption: string;
    engagement: number;
    reach: number;
    date: string;
  }[];
}

interface AnalyticsDashboardProps {
  userId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days'>('30days');
  
  const { currentUser } = useAppStore();

  // アナリティクスデータを取得
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || currentUser?.id || 'demo_user',
          period: selectedPeriod
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.analytics);
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      console.error('Analytics dashboard error:', err);
      setError('アナリティクスデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時にデータ取得
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  // 成長率の色を取得
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 成長率のアイコンを取得
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '→';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">アナリティクスデータを読み込み中...</p>
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

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 期間選択 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">分析期間</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">過去7日間</option>
            <option value="30days">過去30日間</option>
            <option value="90days">過去90日間</option>
          </select>
        </div>
      </div>

      {/* 主要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">フォロワー数</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.followers.total.toLocaleString()}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="mt-2 flex items-center">
            <span className={`text-sm font-medium ${getGrowthColor(analyticsData.followers.growth)}`}>
              {getGrowthIcon(analyticsData.followers.growth)} {Math.abs(analyticsData.followers.growth)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">前月比</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均エンゲージメント率</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.engagement.average.toFixed(2)}%</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">全投稿の平均</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総投稿数</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.posts.total}</p>
            </div>
            <div className="text-2xl">📸</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">今月: {analyticsData.posts.thisMonth}件</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均リーチ</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.reach.average.toLocaleString()}</p>
            </div>
            <div className="text-2xl">👁️</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">投稿あたり</span>
          </div>
        </div>
      </div>

      {/* トレンドグラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 フォロワー成長トレンド</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">グラフ表示エリア</p>
              <p className="text-sm text-gray-500">Chart.js実装予定</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 エンゲージメントトレンド</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-600">グラフ表示エリア</p>
              <p className="text-sm text-gray-500">Chart.js実装予定</p>
            </div>
          </div>
        </div>
      </div>

      {/* 人気投稿 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔥 人気投稿 TOP 5</h3>
        <div className="space-y-4">
          {analyticsData.topPosts.map((post, index) => (
            <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 line-clamp-2">
                    {post.caption.length > 50 ? `${post.caption.substring(0, 50)}...` : post.caption}
                  </p>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{post.engagement.toLocaleString()}</p>
                <p className="text-sm text-gray-500">エンゲージメント</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* インサイト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 主要インサイト</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <p className="text-sm text-gray-700">投稿頻度が週3回で最適なエンゲージメント率を達成</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <p className="text-sm text-gray-700">19:00-21:00の投稿時間が最も高いリーチ率を記録</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">💡</span>
              <p className="text-sm text-gray-700">質問形式の投稿が平均2.3倍のコメント率を達成</p>
            </div>
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2">⚠️</span>
              <p className="text-sm text-gray-700">ストーリーズ投稿の頻度を増やすことでフォロワー成長を加速</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 改善提案</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">投稿頻度の最適化</p>
              <p className="text-xs text-blue-600 mt-1">週3-4回の投稿でエンゲージメント率を15%向上</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">最適時間の活用</p>
              <p className="text-xs text-green-600 mt-1">19:00-21:00の投稿でリーチ率を25%向上</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-800">コンテンツ戦略</p>
              <p className="text-xs text-purple-600 mt-1">質問形式の投稿を週1回追加でコメント率向上</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 