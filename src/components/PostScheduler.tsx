import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiWithFallback } from '../services/mockApi';

interface ScheduledPost {
  id: string;
  caption: string;
  imageUrl?: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  hashtags: string[];
  createdAt: string;
}

interface PostSchedulerProps {
  onPostSelect?: (post: ScheduledPost) => void;
}

const PostScheduler: React.FC<PostSchedulerProps> = ({ onPostSelect }) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  const { currentUser } = useAppStore();

  // スケジュール済み投稿を取得
  const fetchScheduledPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      // 現在のユーザーIDを取得（instagramBusinessAccountId を優先、フォールバックで id を使用）
      const userId = currentUser?.instagramBusinessAccountId || currentUser?.id || 'demo_user';
      
      console.log(`🔍 [DEBUG] PostScheduler - ユーザーID取得:`, {
        instagramBusinessAccountId: currentUser?.instagramBusinessAccountId,
        id: currentUser?.id,
        selectedUserId: userId
      });
      
      // モックAPIを使用（フォールバック付き）
      const data = await apiWithFallback.getScheduledPosts(userId);

      if (data.success && data.data && Array.isArray(data.data)) {
        // モックデータをScheduledPost形式に変換
        const convertedPosts: ScheduledPost[] = data.data.map((post: any) => ({
          id: post.id,
          caption: post.caption,
          scheduledTime: post.scheduled_time,
          status: post.status,
          hashtags: extractHashtags(post.caption),
          createdAt: new Date().toISOString()
        }));
        setScheduledPosts(convertedPosts);
      } else {
        // データが存在しない場合は空配列を設定
        setScheduledPosts([]);
        if (!data.success) {
          setError(data.error || 'スケジュール済み投稿の取得に失敗しました');
        }
      }
    } catch (err) {
      console.error('Scheduled posts fetch error:', err);
      setError('スケジュール済み投稿の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ハッシュタグを抽出する関数
  const extractHashtags = (caption: string): string[] => {
    const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
    return caption.match(hashtagRegex) || [];
  };

  // 投稿を削除
  const deleteScheduledPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/scheduler/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.instagramBusinessAccountId || currentUser?.id || 'demo_user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScheduledPosts(posts => posts.filter(post => post.id !== postId));
      } else {
        setError(data.error || '投稿の削除に失敗しました');
      }
    } catch (err) {
      console.error('Delete scheduled post error:', err);
      setError('投稿の削除に失敗しました');
    }
  };

  // 投稿を編集
  const editScheduledPost = async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      const response = await fetch(`/api/scheduler/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.instagramBusinessAccountId || currentUser?.id || 'demo_user',
          updates
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScheduledPosts(posts => 
          posts.map(post => 
            post.id === postId ? { ...post, ...updates } : post
          )
        );
      } else {
        setError(data.error || '投稿の編集に失敗しました');
      }
    } catch (err) {
      console.error('Edit scheduled post error:', err);
      setError('投稿の編集に失敗しました');
    }
  };

  // コンポーネントマウント時にデータ取得
  useEffect(() => {
    fetchScheduledPosts();
  }, [selectedDate]);

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // 指定日の投稿を取得
  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledTime);
      return postDate.toDateString() === date.toDateString();
    });
  };

  // ステータスに基づく色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // ステータスの日本語表示
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return '投稿済み';
      case 'failed': return '失敗';
      default: return '予約済み';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">スケジュール済み投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📅 投稿スケジューラー</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              カレンダー
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              リスト
            </button>
          </div>
        </div>

        {/* 月選択 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            ← 前月
          </button>
          <h4 className="text-lg font-medium text-gray-900">
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
          </h4>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            翌月 →
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* カレンダービュー */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const posts = getPostsForDate(date);
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border border-gray-200 ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className={`text-sm font-medium ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {posts.map(post => (
                      <div
                        key={post.id}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => onPostSelect?.(post)}
                        title={post.caption.substring(0, 50) + '...'}
                      >
                        <div className={`px-1 py-0.5 rounded text-xs ${getStatusColor(post.status)}`}>
                          {getStatusLabel(post.status)}
                        </div>
                        <div className="text-gray-700 truncate">
                          {post.caption.substring(0, 20)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* リストビュー */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 スケジュール済み投稿一覧</h4>
          {scheduledPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">スケジュール済みの投稿がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts
                .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                .map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {getStatusLabel(post.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(post.scheduledTime).toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2 line-clamp-2">
                          {post.caption}
                        </p>
                        {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.hashtags.slice(0, 5).map((tag, index) => (
                              <span key={index} className="text-xs text-blue-600">
                                {tag}
                              </span>
                            ))}
                            {post.hashtags.length > 5 && (
                              <span className="text-xs text-gray-500">
                                +{post.hashtags.length - 5}個
                              </span>
                            )}
                          </div>
                        )}
                        {post.imageUrl && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500">画像あり</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => onPostSelect?.(post)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteScheduledPost(post.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {scheduledPosts.filter(p => p.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">予約済み</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scheduledPosts.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">投稿済み</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {scheduledPosts.filter(p => p.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">失敗</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScheduler; 