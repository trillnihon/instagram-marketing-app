import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { InstagramPost, AlgorithmAnalysis } from '../types';
import ErrorHandler from './ErrorHandler';

interface PostAnalyticsProps {
  accessToken?: string;
  instagramBusinessAccountId?: string;
}

const PostAnalytics: React.FC<PostAnalyticsProps> = ({ 
  accessToken, 
  instagramBusinessAccountId 
}) => {
  const { currentUser, setLoading, setError } = useAppStore();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [analysis, setAnalysis] = useState<AlgorithmAnalysis[]>([]);
  const [loading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // 投稿履歴を取得
  const fetchPosts = async () => {
    // 認証情報のチェックを緩和
    // 実際にGraph APIでデータが取得できている場合は認証エラーを出さない
    if (!accessToken && !instagramBusinessAccountId) {
      // ローカルストレージからInstagram認証情報を確認
      const instagramAuth = localStorage.getItem('instagram_auth');
      if (instagramAuth) {
        const authData = JSON.parse(instagramAuth);
        if (authData.accessToken && authData.instagramBusinessAccount?.id) {
          // 認証情報が存在する場合は、それを使用してデータ取得を試行
          console.log('[DEBUG] ローカルストレージからInstagram認証情報を取得');
        } else {
          setLocalError('Instagram認証が必要です');
          return;
        }
      } else {
        setLocalError('Instagram認証が必要です');
        return;
      }
    }

    setLocalLoading(true);
    setLocalError(null);

    try {
      // 認証情報を決定（propsまたはローカルストレージから）
      let token = accessToken;
      let accountId = instagramBusinessAccountId;
      
      if (!token || !accountId) {
        const instagramAuth = localStorage.getItem('instagram_auth');
        if (instagramAuth) {
          const authData = JSON.parse(instagramAuth);
          token = token || authData.accessToken;
          accountId = accountId || authData.instagramBusinessAccount?.id;
        }
      }
      
      if (!token || !accountId) {
        throw new Error('Instagram認証情報が不足しています');
      }

      const response = await fetch(
        `/api/instagram/posts/${currentUser?.id || 'demo_user'}?access_token=${token}&instagram_business_account_id=${accountId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '投稿履歴の取得に失敗しました');
      }

      // Instagram APIのレスポンスをアプリの形式に変換
      const convertedPosts: InstagramPost[] = result.data.map((post: any) => ({
        id: post.id,
        mediaType: post.media_type,
        mediaUrl: post.media_url || post.thumbnail_url,
        caption: post.caption || '',
        hashtags: extractHashtags(post.caption || ''),
        timestamp: post.timestamp,
        engagement: {
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
          saves: 0,
          shares: 0,
          reach: 0,
          impressions: 0
        },
        performance: {
          engagementRate: 0,
          saveRate: 0,
          shareRate: 0,
          reachRate: 0
        }
      }));

      setPosts(convertedPosts);

    } catch (error) {
      console.error('投稿データ取得エラー:', error);
      const errorMsg = error instanceof Error ? error.message : '投稿データの取得に失敗しました';
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

  // 投稿を分析
  const analyzePost = async (post: InstagramPost) => {
    setAnalyzing(true);
    setLocalError(null);

    try {
      const response = await fetch('/api/analyze-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          caption: post.caption,
          hashtags: post.hashtags,
          engagement: post.engagement,
          mediaType: post.mediaType
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '投稿分析に失敗しました');
      }

      // 分析結果を追加
      setAnalysis(prev => [result.data, ...prev]);
      setSelectedPost(post);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '投稿分析に失敗しました';
      setLocalError(errorMsg);
      setError?.(errorMsg);
    } finally {
      setAnalyzing(false);
    }
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

  // パフォーマンス評価
  const getPerformanceRating = (engagementRate: number) => {
    if (engagementRate >= 5) return { label: '優秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (engagementRate >= 3) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (engagementRate >= 1) return { label: '普通', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: '改善必要', color: 'text-red-600', bg: 'bg-red-100' };
  };

  useEffect(() => {
    if (accessToken || instagramBusinessAccountId) {
      fetchPosts();
    }
  }, [accessToken, instagramBusinessAccountId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">投稿分析</h2>
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '更新中...' : '更新'}
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <ErrorHandler 
          error={error} 
          onDismiss={() => setLocalError(null)}
          showDetails={true}
        />
      )}

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">投稿履歴を取得中...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">分析可能な投稿が見つかりません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const engagementRate = parseFloat(calculateEngagementRate(post));
            const performance = getPerformanceRating(engagementRate);
            
            return (
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
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${performance.bg} ${performance.color}`}>
                          {performance.label}
                        </span>
                        <button
                          onClick={() => analyzePost(post)}
                          disabled={analyzing}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          {analyzing ? '分析中...' : '詳細分析'}
                        </button>
                      </div>
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

                    {/* エンゲージメント */}
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span>❤️ {post.engagement.likes.toLocaleString()}</span>
                      <span>💬 {post.engagement.comments.toLocaleString()}</span>
                      <span>💾 {post.engagement.saves.toLocaleString()}</span>
                      <span>📤 {post.engagement.shares.toLocaleString()}</span>
                      <span className="font-medium">
                        エンゲージメント率: {calculateEngagementRate(post)}%
                      </span>
                    </div>

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
                  </div>
                </div>

                                 {/* 分析結果 */}
                 {(() => {
                   const postAnalysis = analysis.find(a => a.postId === post.id);
                   return postAnalysis ? (
                     <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                       <h4 className="font-semibold text-gray-700 mb-2">分析結果</h4>
                       <div className="space-y-2">
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">総合スコア:</span>
                           <span className="text-lg font-bold text-pink-500">
                             {postAnalysis.score}/100
                           </span>
                         </div>
                         <div className="text-sm text-gray-600">
                           <strong>強み:</strong> {postAnalysis.strengths.slice(0, 2).join(', ')}
                         </div>
                         {postAnalysis.weaknesses.length > 0 && (
                           <div className="text-sm text-gray-600">
                             <strong>改善点:</strong> {postAnalysis.weaknesses.slice(0, 2).join(', ')}
                           </div>
                         )}
                       </div>
                     </div>
                   ) : null;
                 })()}
              </div>
            );
          })}
        </div>
      )}

      {/* 統計情報 */}
      {posts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">統計情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">総投稿数:</span>
              <span className="ml-2 font-medium">{posts.length}</span>
            </div>
            <div>
              <span className="text-gray-600">平均エンゲージメント率:</span>
              <span className="ml-2 font-medium">
                {(
                  posts.reduce((sum, post) => sum + parseFloat(calculateEngagementRate(post)), 0) / posts.length
                ).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">分析済み:</span>
              <span className="ml-2 font-medium">
                {analysis.length}/{posts.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均スコア:</span>
              <span className="ml-2 font-medium">
                {analysis.length > 0 
                  ? Math.round(analysis.reduce((sum, a) => sum + a.score, 0) / analysis.length)
                  : 0
                }/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAnalytics; 