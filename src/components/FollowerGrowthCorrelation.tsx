import React from 'react';

interface WeeklyData {
  week: string;
  postCount: number;
  followerGrowth: number;
  correlation: 'positive' | 'negative' | 'neutral';
  comment: string;
}

const FollowerGrowthCorrelation: React.FC = () => {
  // デモデータ
  const weeklyData: WeeklyData[] = [
    {
      week: '2024年1月第1週',
      postCount: 5,
      followerGrowth: 127,
      correlation: 'positive',
      comment: '投稿頻度が高く、フォロワー増加も良好'
    },
    {
      week: '2024年1月第2週',
      postCount: 3,
      followerGrowth: 89,
      correlation: 'positive',
      comment: '投稿数は減少したが、質の高いコンテンツでフォロワー獲得'
    },
    {
      week: '2024年1月第3週',
      postCount: 7,
      followerGrowth: 234,
      correlation: 'positive',
      comment: '投稿頻度とフォロワー増加が最も高い週'
    },
    {
      week: '2024年1月第4週',
      postCount: 2,
      followerGrowth: 45,
      correlation: 'negative',
      comment: '投稿頻度の低下によりフォロワー増加も減少'
    },
    {
      week: '2024年2月第1週',
      postCount: 4,
      followerGrowth: 156,
      correlation: 'positive',
      comment: '適度な投稿頻度で安定したフォロワー増加'
    },
    {
      week: '2024年2月第2週',
      postCount: 6,
      followerGrowth: 198,
      correlation: 'positive',
      comment: '投稿頻度の増加に比例してフォロワー増加も向上'
    },
    {
      week: '2024年2月第3週',
      postCount: 1,
      followerGrowth: 23,
      correlation: 'negative',
      comment: '投稿頻度の大幅な減少によりフォロワー増加も停滞'
    },
    {
      week: '2024年2月第4週',
      postCount: 5,
      followerGrowth: 167,
      correlation: 'positive',
      comment: '投稿頻度の回復によりフォロワー増加も回復'
    }
  ];

  // 相関分析の統計
  const totalPosts = weeklyData.reduce((sum, week) => sum + week.postCount, 0);
  const totalGrowth = weeklyData.reduce((sum, week) => sum + week.followerGrowth, 0);
  const avgPostsPerWeek = (totalPosts / weeklyData.length).toFixed(1);
  const avgGrowthPerWeek = Math.round(totalGrowth / weeklyData.length);
  
  const positiveWeeks = weeklyData.filter(week => week.correlation === 'positive').length;
  const negativeWeeks = weeklyData.filter(week => week.correlation === 'negative').length;
  const positiveRate = Math.round((positiveWeeks / weeklyData.length) * 100);

  const getCorrelationIcon = (correlation: string) => {
    switch (correlation) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getCorrelationColor = (correlation: string) => {
    switch (correlation) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">📊 投稿頻度 × フォロワー増加の相関分析</h2>
        <p className="text-blue-100">
          週間投稿数とフォロワー増加数の相関関係を分析し、最適な投稿戦略を提案します
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{totalPosts}</div>
          <div className="text-sm text-gray-600">総投稿数</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{totalGrowth}</div>
          <div className="text-sm text-gray-600">総フォロワー増加数</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{avgPostsPerWeek}</div>
          <div className="text-sm text-gray-600">週平均投稿数</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{avgGrowthPerWeek}</div>
          <div className="text-sm text-gray-600">週平均フォロワー増加</div>
        </div>
      </div>

      {/* 相関分析結果 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 相関分析結果</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{positiveWeeks}</div>
            <div className="text-sm text-gray-600">ポジティブ相関週</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{negativeWeeks}</div>
            <div className="text-sm text-gray-600">ネガティブ相関週</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{positiveRate}%</div>
            <div className="text-sm text-gray-600">ポジティブ相関率</div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 分析インサイト</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 週3-5回の投稿頻度が最も効果的</li>
            <li>• 投稿頻度が1回以下の週はフォロワー増加が停滞</li>
            <li>• 質の高いコンテンツは投稿頻度を補完できる</li>
            <li>• 一貫した投稿スケジュールが重要</li>
          </ul>
        </div>
      </div>

      {/* 週別データテーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">📅 週別詳細データ</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  週
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  フォロワー増加
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  相関
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  コメント
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyData.map((week, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {week.week}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {week.postCount}回
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{week.followerGrowth}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCorrelationColor(week.correlation)}`}>
                      {getCorrelationIcon(week.correlation)} {week.correlation === 'positive' ? 'ポジティブ' : week.correlation === 'negative' ? 'ネガティブ' : '中立'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {week.comment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 推奨戦略 */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">🎯 推奨投稿戦略</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">📅 最適投稿頻度</h4>
            <ul className="text-sm space-y-1">
              <li>• 週3-5回の一貫した投稿</li>
              <li>• 毎週同じ曜日・時間帯を維持</li>
              <li>• 投稿間隔を2-3日空ける</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">📈 フォロワー増加最大化</h4>
            <ul className="text-sm space-y-1">
              <li>• エンゲージメント率の高いコンテンツ</li>
              <li>• トレンドハッシュタグの活用</li>
              <li>• フォロワーとの積極的な交流</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowerGrowthCorrelation; 