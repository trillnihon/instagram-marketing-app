import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { InstagramPost } from '../types';
import { apiWithFallback } from '../services/mockApi';

interface PostHistoryProps {
  accessToken?: string;
  instagramBusinessAccountId?: string;
}

const PostHistory: React.FC<PostHistoryProps> = ({ 
  accessToken, 
  instagramBusinessAccountId 
}) => {
  const { currentUser, setLoading, setError } = useAppStore();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    mediaType: 'all' as 'all' | 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM',
    dateRange: '7days' as '7days' | '30days' | '90days' | 'all'
  });

  // 投稿履歴を取得
  const fetchPosts = async () => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      // 現在のユーザーIDを取得
      const userId = currentUser?.id || 'demo_user';
      
      // モックAPIを使用（フォールバック付き）
      const result = await apiWithFallback.getInstagramHistory(userId);

      if (!result.success) {
        throw new Error(result.error || '投稿履歴の取得に失敗しました');
      }

      // APIレスポンスをアプリの形式に変換
      const convertedPosts: InstagramPost[] = result.data.map((post: any) => ({
        id: post.id,
        mediaType: post.media_type,
        mediaUrl: post.media_url || post.thumbnail_url,
        caption: post.caption || '',
        hashtags: extractHashtags(post.caption || ''),
        timestamp: post.timestamp,
        permalink: post.permalink,
        engagement: {
          likes: post.likes || 0,
          comments: post.comments || 0,
          saves: 0, // Instagram APIでは取得できない場合がある
          shares: 0,
          reach: 0,
          impressions: 0
        }
      }));

      setPosts(convertedPosts);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '投稿履歴の取得に失敗しました';
      setLocalError(errorMsg);
      setError?.(errorMsg);
    } finally {
      setLocalLoading(false);
    }
  };

  // ハッシュタグを抽出する関数
  const extractHashtags = (caption: string): string[] => {
    const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
    return caption.match(hashtagRegex) || [];
  };

  // フィルタリングされた投稿を取得
  const getFilteredPosts = () => {
    let filtered = posts;

    // メディアタイプでフィルタリング
    if (filter.mediaType !== 'all') {
      filtered = filtered.filter(post => post.mediaType === filter.mediaType);
    }

    // 日付範囲でフィルタリング
    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    switch (filter.dateRange) {
      case '7days':
        filtered = filtered.filter(post => new Date(post.timestamp) > daysAgo(7));
        break;
      case '30days':
        filtered = filtered.filter(post => new Date(post.timestamp) > daysAgo(30));
        break;
      case '90days':
        filtered = filtered.filter(post => new Date(post.timestamp) > daysAgo(90));
        break;
      // 'all'の場合はフィルタリングしない
    }

    return filtered;
  };

  // エンゲージメント率を計算
  const calculateEngagementRate = (post: InstagramPost) => {
    const totalEngagement = post.engagement.likes + post.engagement.comments + post.engagement.saves + post.engagement.shares;
    const reach = post.engagement.reach || 1000; // デフォルト値
    return reach > 0 ? ((totalEngagement / reach) * 100).toFixed(2) : '0.00';
  };

  // 投稿をフォーマット
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // メディアタイプの日本語表示
  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'IMAGE': return '画像';
      case 'VIDEO': return '動画';
      case 'CAROUSEL_ALBUM': return 'カルーセル';
      default: return mediaType;
    }
  };

  useEffect(() => {
    if (accessToken && instagramBusinessAccountId) {
      fetchPosts();
    }
  }, [accessToken, instagramBusinessAccountId]);

  const filteredPosts = getFilteredPosts();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">投稿履歴</h2>
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '更新中...' : '更新'}
        </button>
      </div>

      {/* フィルター */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter.mediaType}
          onChange={(e) => setFilter(prev => ({ ...prev, mediaType: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">すべての投稿</option>
          <option value="IMAGE">画像</option>
          <option value="VIDEO">動画</option>
          <option value="CAROUSEL_ALBUM">カルーセル</option>
        </select>

        <select
          value={filter.dateRange}
          onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">過去7日間</option>
          <option value="30days">過去30日間</option>
          <option value="90days">過去90日間</option>
          <option value="all">すべて</option>
        </select>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">投稿履歴を取得中...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">投稿が見つかりません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* メディア */}
                {post.mediaUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={post.mediaUrl}
                      alt="投稿メディア"
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* 投稿情報 */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded mr-2">
                        {getMediaTypeLabel(post.mediaType)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.timestamp)}
                      </span>
                    </div>
                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        投稿を見る →
                      </a>
                    )}
                  </div>

                  {/* キャプション */}
                  {post.caption && (
                    <p className="text-gray-800 mb-2 line-clamp-2">
                      {post.caption.length > 100 
                        ? `${post.caption.substring(0, 100)}...` 
                        : post.caption
                      }
                    </p>
                  )}

                  {/* ハッシュタグ */}
                  {post.hashtags.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="text-blue-600 text-sm">
                            {tag}
                          </span>
                        ))}
                        {post.hashtags.length > 5 && (
                          <span className="text-gray-500 text-sm">
                            +{post.hashtags.length - 5}個
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* エンゲージメント */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>❤️ {post.engagement.likes.toLocaleString()}</span>
                    <span>💬 {post.engagement.comments.toLocaleString()}</span>
                    <span>💾 {post.engagement.saves.toLocaleString()}</span>
                    <span>📤 {post.engagement.shares.toLocaleString()}</span>
                    <span className="font-medium">
                      エンゲージメント率: {calculateEngagementRate(post)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 統計情報 */}
      {filteredPosts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">統計情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">総投稿数:</span>
              <span className="ml-2 font-medium">{filteredPosts.length}</span>
            </div>
            <div>
              <span className="text-gray-600">平均いいね:</span>
              <span className="ml-2 font-medium">
                {Math.round(
                  filteredPosts.reduce((sum, post) => sum + post.engagement.likes, 0) / filteredPosts.length
                ).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均コメント:</span>
              <span className="ml-2 font-medium">
                {Math.round(
                  filteredPosts.reduce((sum, post) => sum + post.engagement.comments, 0) / filteredPosts.length
                ).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均エンゲージメント率:</span>
              <span className="ml-2 font-medium">
                {(
                  filteredPosts.reduce((sum, post) => sum + parseFloat(calculateEngagementRate(post)), 0) / filteredPosts.length
                ).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostHistory; 