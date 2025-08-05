import React, { useState, useEffect } from 'react';
import { getThreadsPosts, deleteThreadsPost, analyzeThreadsPost } from '../services/threadsService';

interface ThreadsPost {
  id: string;
  content: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    alt_text?: string;
  }>;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

interface ThreadsPostListProps {
  onPostDeleted?: (postId: string) => void;
  onError?: (error: string) => void;
}

const ThreadsPostList: React.FC<ThreadsPostListProps> = ({
  onPostDeleted,
  onError
}) => {
  const [posts, setPosts] = useState<ThreadsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, any>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const fetchedPosts = await getThreadsPosts(20);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('投稿一覧取得エラー:', error);
      onError?.(error instanceof Error ? error.message : '投稿一覧の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }

    try {
      setIsDeleting(postId);
      const success = await deleteThreadsPost(postId);
      
      if (success) {
        setPosts(posts.filter(post => post.id !== postId));
        onPostDeleted?.(postId);
      } else {
        onError?.('投稿の削除に失敗しました');
      }
    } catch (error) {
      console.error('投稿削除エラー:', error);
      onError?.(error instanceof Error ? error.message : '投稿の削除に失敗しました');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAnalyze = async (postId: string) => {
    try {
      setIsAnalyzing(postId);
      const analysisData = await analyzeThreadsPost(postId);
      setAnalytics(prev => ({
        ...prev,
        [postId]: analysisData
      }));
    } catch (error) {
      console.error('投稿分析エラー:', error);
      onError?.(error instanceof Error ? error.message : '投稿分析に失敗しました');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">投稿を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">投稿がありません</h3>
          <p className="text-gray-500">新しい投稿を作成してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">投稿一覧</h2>
        <button
          onClick={loadPosts}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          更新
        </button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            {/* 投稿内容 */}
            <div className="mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">
                {truncateContent(post.content)}
              </p>
            </div>

            {/* メディア表示 */}
            {post.media && post.media.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {post.media.map((media, index) => (
                    <div key={index} className="relative">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.alt_text || `Media ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-24 object-cover rounded-md"
                          controls
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 投稿情報 */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>投稿日時: {formatDate(post.created_at)}</span>
              <div className="flex items-center space-x-4">
                {post.likes_count !== undefined && (
                  <span>❤️ {post.likes_count}</span>
                )}
                {post.comments_count !== undefined && (
                  <span>💬 {post.comments_count}</span>
                )}
                {post.shares_count !== undefined && (
                  <span>🔄 {post.shares_count}</span>
                )}
              </div>
            </div>

            {/* 分析結果表示 */}
            {analytics[post.id] && (
              <div className="mb-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">分析結果</h4>
                <div className="text-sm text-blue-700">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(analytics[post.id], null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleAnalyze(post.id)}
                disabled={isAnalyzing === post.id}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing === post.id ? (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>分析中...</span>
                  </div>
                ) : (
                  '分析'
                )}
              </button>
              
              <button
                onClick={() => handleDelete(post.id)}
                disabled={isDeleting === post.id}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === post.id ? (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>削除中...</span>
                  </div>
                ) : (
                  '削除'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadsPostList; 