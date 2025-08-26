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
        // レスポンスステータスに基づく詳細なエラーハンドリング
        if (response.status === 404) {
          setError('バックエンドにアナリティクスデータが存在しません。初回利用か、まだデータが保存されていません。');
        } else if (response.status >= 500) {
          setError('バックエンドサーバーエラーが発生しました。しばらくしてから再試行してください。');
        } else {
          setError(data.error || 'データの取得に失敗しました');
        }
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

  // データが読み込み中またはエラーの場合
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">アナリティクスデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // データが存在しない場合
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">データがありません</h2>
          <p className="text-gray-600 mb-4">アナリティクスデータを取得できませんでした</p>
          <button 
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // データの安全なアクセス用ヘルパー関数
  const safeGet = (obj: any, path: string, defaultValue: any = 0) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 アナリティクスダッシュボード</h1>
        <p className="text-gray-600">Instagramアカウントのパフォーマンスを分析</p>
        
        {/* 期間選択 */}
        <div className="mt-4 flex space-x-2">
          {(['7days', '30days', '90days'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {period === '7days' ? '7日間' : period === '30days' ? '30日間' : '90日間'}
            </button>
          ))}
        </div>
      </div>

      {/* 主要メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">フォロワー数</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeGet(analyticsData, 'followers.total', 0).toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="mt-2 flex items-center">
            <span className={`text-sm font-medium ${getGrowthColor(safeGet(analyticsData, 'followers.growth', 0))}`}>
              {getGrowthIcon(safeGet(analyticsData, 'followers.growth', 0))} {Math.abs(safeGet(analyticsData, 'followers.growth', 0))}%
            </span>
            <span className="text-sm text-gray-500 ml-1">前月比</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均エンゲージメント率</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeGet(analyticsData, 'engagement.average', 0).toFixed(2)}%
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {safeGet(analyticsData, 'posts.total', 0)}
              </p>
            </div>
            <div className="text-2xl">📸</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">今月: {safeGet(analyticsData, 'posts.thisMonth', 0)}件</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均リーチ</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeGet(analyticsData, 'reach.average', 0).toLocaleString()}
              </p>
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
          {safeGet(analyticsData, 'topPosts', []).map((post: any, index: number) => (
            <div key={post.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 line-clamp-2">
                    {safeGet(post, 'caption', '投稿').length > 50 ? `${safeGet(post, 'caption', '投稿').substring(0, 50)}...` : safeGet(post, 'caption', '投稿')}
                  </p>
                  <p className="text-sm text-gray-500">{safeGet(post, 'date', '日付不明')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{safeGet(post, 'engagement', 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">エンゲージメント</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 