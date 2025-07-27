import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface HashtagTrend {
  tag: string;
  usageCount: number;
  growthRate: number;
  previousCount: number;
  category: string;
}

const HashtagRanking: React.FC = () => {
  const { currentUser } = useAppStore();
  const [hashtagTrends, setHashtagTrends] = useState<HashtagTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHashtagRanking();
  }, []);

  const fetchHashtagRanking = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.userId || 'demo_user';
      
      const response = await fetch(`/api/threads/hashtag-ranking?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setHashtagTrends(data.hashtags);
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      console.error('ハッシュタグランキング取得エラー:', err);
      setError('データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (rate: number) => {
    if (rate >= 30) return 'text-green-600';
    if (rate >= 20) return 'text-blue-600';
    if (rate >= 10) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (rate: number) => {
    if (rate >= 30) return '🚀';
    if (rate >= 20) return '📈';
    if (rate >= 10) return '📊';
    return '📋';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ライフスタイル': return 'bg-purple-100 text-purple-700';
      case '教育': return 'bg-blue-100 text-blue-700';
      case 'ビジネス': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">データを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ エラーが発生しました</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={fetchHashtagRanking}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🏷️ 急上昇ハッシュタグ TOP 10</h3>
        <span className="text-sm text-gray-500">前月比増加率</span>
      </div>

      {hashtagTrends.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ハッシュタグデータが見つかりませんでした
        </div>
      ) : (
        <div className="space-y-3">
          {hashtagTrends.map((hashtag, index) => (
            <div key={hashtag.tag} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{hashtag.tag}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(hashtag.category)}`}>
                      {hashtag.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>使用回数: {hashtag.usageCount}回</span>
                    <span>•</span>
                    <span>前月: {hashtag.previousCount}回</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-1 font-bold ${getGrowthColor(hashtag.growthRate)}`}>
                  <span>{getGrowthIcon(hashtag.growthRate)}</span>
                  <span>+{hashtag.growthRate.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500">増加率</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">📊 カテゴリ別分析</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>ライフスタイル:</span>
              <span className="font-medium">{hashtagTrends.filter(h => h.category === 'ライフスタイル').length}件</span>
            </div>
            <div className="flex justify-between">
              <span>教育:</span>
              <span className="font-medium">{hashtagTrends.filter(h => h.category === '教育').length}件</span>
            </div>
            <div className="flex justify-between">
              <span>ビジネス:</span>
              <span className="font-medium">{hashtagTrends.filter(h => h.category === 'ビジネス').length}件</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">📈 成長率分析</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>平均増加率:</span>
              <span className="font-medium text-green-600">
                {(hashtagTrends.reduce((sum, h) => sum + h.growthRate, 0) / hashtagTrends.length).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>最高増加率:</span>
              <span className="font-medium text-purple-600">
                {Math.max(...hashtagTrends.map(h => h.growthRate)).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>最低増加率:</span>
              <span className="font-medium text-gray-600">
                {Math.min(...hashtagTrends.map(h => h.growthRate)).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">💡 トレンド洞察</h4>
          <ul className="text-sm space-y-1">
            <li>• 朝活系が急成長中</li>
            <li>• 自己啓発コンテンツが人気</li>
            <li>• 教育系ハッシュタグが安定</li>
            <li>• ライフスタイル系が多様化</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">🎯 活用のヒント</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 急上昇ハッシュタグを組み合わせて投稿効果を最大化</li>
          <li>• カテゴリ別のトレンドを把握してコンテンツ戦略を構築</li>
          <li>• 成長率の高いハッシュタグを優先的に使用</li>
          <li>• 定期的にトレンドをチェックして戦略を更新</li>
        </ul>
      </div>
    </div>
  );
};

export default HashtagRanking; 