import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface TrendPost {
  id: string;
  date: string;
  likes: number;
  caption: string;
  engagementScore: number;
  hashtags: string[];
  reposts: number;
  replies: number;
}

const TrendPosts: React.FC = () => {
  const { currentUser } = useAppStore();
  const [trendPosts, setTrendPosts] = useState<TrendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendPosts();
  }, []);

  const fetchTrendPosts = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.userId || 'demo_user';
      
      const response = await fetch(`/api/threads/trend-posts?userId=${userId}&days=30`);
      const data = await response.json();
      
      if (data.success) {
        setTrendPosts(data.posts);
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      console.error('トレンド投稿取得エラー:', err);
      setError('データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({score.toFixed(1)})</span>
      </div>
    );
  };

  const getEngagementColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
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
            onClick={fetchTrendPosts}
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
        <h3 className="text-lg font-semibold text-gray-800">🔥 トレンド投稿 TOP 5</h3>
        <span className="text-sm text-gray-500">過去30日間</span>
      </div>

      {trendPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          トレンド投稿が見つかりませんでした
        </div>
      ) : (
        <div className="space-y-4">
          {trendPosts.map((post, index) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(post.date).toLocaleDateString('ja-JP')}
                      </span>
                      <span className={`text-sm font-medium ${getEngagementColor(post.engagementScore)}`}>
                        エンゲージメント: {post.engagementScore.toFixed(1)}
                      </span>
                    </div>
                    {getEngagementStars(post.engagementScore)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{post.likes.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">いいね</div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {post.caption.length > 80 ? `${post.caption.substring(0, 80)}...` : post.caption}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {post.hashtags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{post.hashtags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>🔄 {post.reposts}</span>
                  <span>💬 {post.replies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📊 トレンド分析結果</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 朝活・自己啓発系の投稿が高いエンゲージメントを獲得</li>
          <li>• ハッシュタグを3-4個使用した投稿が効果的</li>
          <li>• 読者の行動を促す内容が人気</li>
          <li>• 週末の投稿はリフレッシュ系が好評</li>
        </ul>
      </div>
    </div>
  );
};

export default TrendPosts; 