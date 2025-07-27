import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface TrendPost {
  id: string;
  content: string;
  engagementRate: number;
  likes: number;
  reposts: number;
  replies: number;
  hashtags: string[];
  category: string;
  postedAt: string;
}

interface HashtagRanking {
  tag: string;
  usageCount: number;
  growthRate: number;
  category: string;
}

interface BestPostingTimes {
  heatmapData: { [key: string]: { [key: string]: { engagementRate: number; postCount: number } } };
  bestTime: { day: string; hour: number; engagementRate: number };
  summary: {
    bestDay: string;
    bestHour: number;
    bestEngagementRate: string;
    totalPosts: number;
    averageEngagement: string;
  };
}

interface ConversationTheme {
  id: string;
  content: string;
  replies: number;
  likes: number;
  reposts: number;
  category: string;
  hashtags: string[];
  conversationScore: number;
  postedAt: string;
}

interface ThreadsTrendData {
  trendPosts: TrendPost[];
  hashtagRanking: HashtagRanking[];
  bestPostingTimes: BestPostingTimes;
  conversationThemes: {
    themes: ConversationTheme[];
    summary: {
      totalConversations: number;
      averageReplies: string;
      topCategory: string;
      mostEngagingHashtag: string;
    };
  };
}

const ThreadsTrendAnalysis: React.FC = () => {
  const { token } = useAppStore();
  const [trendData, setTrendData] = useState<ThreadsTrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'hashtags' | 'timing' | 'conversations'>('posts');

  const fetchTrendData = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/threads/trend?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTrendData(data.data);
      } else {
        setError(data.error || 'トレンド分析の取得に失敗しました');
      }
    } catch (error) {
      console.error('トレンド分析取得エラー:', error);
      setError('トレンド分析の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendData();
  }, [token]);

  const getEngagementColor = (rate: number) => {
    if (rate >= 5) return 'text-green-600';
    if (rate >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementBgColor = (rate: number) => {
    if (rate >= 5) return 'bg-green-100';
    if (rate >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Threadsトレンド分析を実行中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
        <button
          onClick={fetchTrendData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">データがありません</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">🧵 Threadsトレンド分析</h2>
        <button
          onClick={fetchTrendData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          🔄 更新
        </button>
      </div>

      {/* タブ切り替え */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          🔥 人気投稿
        </button>
        <button
          onClick={() => setActiveTab('hashtags')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'hashtags'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          📈 ハッシュタグ
        </button>
        <button
          onClick={() => setActiveTab('timing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'timing'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          🕒 投稿時間
        </button>
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'conversations'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          💬 会話テーマ
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">🔥 人気投稿例</h3>
          <div className="space-y-4">
            {trendData.trendPosts.map((post, index) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.category}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(post.postedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getEngagementColor(post.engagementRate)}`}>
                      {post.engagementRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">エンゲージメント</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-800 line-clamp-3">{post.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>❤️ {post.likes.toLocaleString()}</span>
                    <span>🔄 {post.reposts.toLocaleString()}</span>
                    <span>💬 {post.replies.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{post.hashtags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">📈 人気ハッシュタグランキング（トップ10）</h3>
          <div className="space-y-3">
            {trendData.hashtagRanking.map((hashtag, index) => (
              <div key={hashtag.tag} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{hashtag.tag}</h4>
                    <p className="text-sm text-gray-600">{hashtag.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${hashtag.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {hashtag.growthRate > 0 ? '+' : ''}{hashtag.growthRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">成長率</div>
                  <div className="text-sm text-gray-600">{hashtag.usageCount.toLocaleString()}回使用</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timing' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">🕒 ベスト投稿時間帯（曜日×時間のヒートマップ）</h3>
          
          {/* サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{trendData.bestPostingTimes.summary.bestDay}</div>
              <div className="text-sm text-purple-700">ベスト曜日</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{trendData.bestPostingTimes.summary.bestHour}時</div>
              <div className="text-sm text-blue-700">ベスト時間</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{trendData.bestPostingTimes.summary.bestEngagementRate}%</div>
              <div className="text-sm text-green-700">最高エンゲージメント</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{trendData.bestPostingTimes.summary.totalPosts}</div>
              <div className="text-sm text-orange-700">分析投稿数</div>
            </div>
          </div>

          {/* ヒートマップ */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-left">時間</th>
                  {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                    <th key={day} className="p-2 text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 24 }, (_, hour) => (
                  <tr key={hour}>
                    <td className="p-2 text-sm text-gray-600">{hour.toString().padStart(2, '0')}:00</td>
                    {['日', '月', '火', '水', '木', '金', '土'].map(day => {
                      const data = trendData.bestPostingTimes.heatmapData[day]?.[hour];
                      const rate = data?.engagementRate || 0;
                      const isBest = day === trendData.bestPostingTimes.bestTime.day && hour === trendData.bestPostingTimes.bestTime.hour;
                      
                      return (
                        <td key={day} className={`p-2 text-center text-xs ${
                          isBest ? 'bg-yellow-200 font-bold' : 
                          rate > 4 ? 'bg-green-100' :
                          rate > 2 ? 'bg-yellow-100' :
                          rate > 0 ? 'bg-red-100' : 'bg-gray-50'
                        }`}>
                          {rate > 0 ? rate.toFixed(1) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'conversations' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">💬 会話が生まれているテーマ</h3>
          
          {/* サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{trendData.conversationThemes.summary.totalConversations}</div>
              <div className="text-sm text-purple-700">会話数</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{trendData.conversationThemes.summary.averageReplies}</div>
              <div className="text-sm text-blue-700">平均リプライ</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{trendData.conversationThemes.summary.topCategory}</div>
              <div className="text-sm text-green-700">トップカテゴリ</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{trendData.conversationThemes.summary.mostEngagingHashtag}</div>
              <div className="text-sm text-orange-700">最適ハッシュタグ</div>
            </div>
          </div>

          <div className="space-y-4">
            {trendData.conversationThemes.themes.map((theme, index) => (
              <div key={theme.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{theme.category}</h4>
                      <p className="text-sm text-gray-600">
                        会話スコア: {theme.conversationScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{theme.replies}</div>
                    <div className="text-xs text-gray-500">リプライ数</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-800 line-clamp-2">{theme.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>❤️ {theme.likes.toLocaleString()}</span>
                    <span>🔄 {theme.reposts.toLocaleString()}</span>
                    <span>💬 {theme.replies.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {theme.hashtags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF出力ボタン */}
      <div className="flex justify-center">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <span>📄</span>
          <span>PDFレポート出力</span>
        </button>
      </div>
    </div>
  );
};

export default ThreadsTrendAnalysis; 