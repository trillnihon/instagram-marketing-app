import React from 'react';

interface ContentTheme {
  category: string;
  averageEngagement: number;
  postCount: number;
  topHashtags: string[];
  description: string;
  trend: 'up' | 'down' | 'stable';
}

const ContentThemes: React.FC = () => {
  // デモデータ
  const contentThemes: ContentTheme[] = [
    {
      category: '日常系',
      averageEngagement: 4.2,
      postCount: 45,
      topHashtags: ['#朝活', '#コーヒー', '#日常'],
      description: '日常生活やルーティンに関する投稿',
      trend: 'up'
    },
    {
      category: '教育系',
      averageEngagement: 3.8,
      postCount: 32,
      topHashtags: ['#自己啓発', '#学習', '#スキルアップ'],
      description: '知識共有や学習に関する投稿',
      trend: 'stable'
    },
    {
      category: '時事系',
      averageEngagement: 3.5,
      postCount: 18,
      topHashtags: ['#ニュース', '#時事', '#社会'],
      description: '最新ニュースや社会問題に関する投稿',
      trend: 'down'
    },
    {
      category: 'ビジネス系',
      averageEngagement: 4.1,
      postCount: 28,
      topHashtags: ['#プロジェクト', '#ビジネス', '#成功'],
      description: 'ビジネスやキャリアに関する投稿',
      trend: 'up'
    },
    {
      category: 'ライフスタイル系',
      averageEngagement: 3.9,
      postCount: 38,
      topHashtags: ['#ライフスタイル', '#健康', '#趣味'],
      description: '生活スタイルや趣味に関する投稿',
      trend: 'stable'
    },
    {
      category: 'モチベーション系',
      averageEngagement: 4.5,
      postCount: 22,
      topHashtags: ['#モチベーション', '#目標', '#成長'],
      description: 'やる気や目標達成に関する投稿',
      trend: 'up'
    }
  ];

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 4.0) return 'text-green-600';
    if (engagement >= 3.5) return 'text-blue-600';
    if (engagement >= 3.0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '日常系': return 'bg-blue-100 text-blue-700';
      case '教育系': return 'bg-green-100 text-green-700';
      case '時事系': return 'bg-red-100 text-red-700';
      case 'ビジネス系': return 'bg-purple-100 text-purple-700';
      case 'ライフスタイル系': return 'bg-yellow-100 text-yellow-700';
      case 'モチベーション系': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 棒グラフの最大値を計算
  const maxEngagement = Math.max(...contentThemes.map(theme => theme.averageEngagement));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 コンテンツテーマ別傾向</h3>
        <span className="text-sm text-gray-500">平均エンゲージメント率</span>
      </div>

      <div className="space-y-4">
        {contentThemes.map((theme) => (
          <div key={theme.category} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(theme.category)}`}>
                  {theme.category}
                </span>
                <span className={`text-lg ${getTrendIcon(theme.trend)} ${getTrendColor(theme.trend)}`}></span>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getEngagementColor(theme.averageEngagement)}`}>
                  {theme.averageEngagement.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">平均エンゲージメント</div>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
              
              {/* 棒グラフ */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(theme.averageEngagement / maxEngagement) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{maxEngagement.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">投稿数: </span>
                <span className="font-medium">{theme.postCount}件</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {theme.topHashtags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {theme.topHashtags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{theme.topHashtags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">📈 パフォーマンス分析</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">最高エンゲージメント:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-green-600">モチベーション系</span>
                <span className="text-sm text-gray-500">4.5%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">最多投稿数:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-blue-600">日常系</span>
                <span className="text-sm text-gray-500">45件</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">急成長中:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-600">ビジネス系</span>
                <span className="text-sm text-gray-500">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">💡 戦略提案</h4>
          <ul className="text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>モチベーション系の投稿頻度を増加</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>日常系と教育系を組み合わせた投稿</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">✓</span>
              <span>ビジネス系コンテンツの強化</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">⚠</span>
              <span>時事系は慎重に投稿</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">🎯 最適化のポイント</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• エンゲージメント率の高いテーマを中心に投稿戦略を構築</li>
          <li>• 複数のテーマを組み合わせてコンテンツの多様性を確保</li>
          <li>• トレンドの変化を定期的にチェックして戦略を調整</li>
          <li>• 各テーマの特徴を活かしたハッシュタグ戦略を実装</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentThemes; 