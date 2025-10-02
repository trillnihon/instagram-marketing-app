import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Users, Clock, ChevronRight } from 'lucide-react';
import InstagramService, { InstagramComment, InstagramLike, InstagramMedia } from '../services/instagramService';

interface Notification {
  id: string;
  type: 'like' | 'comment';
  username: string;
  text?: string;
  timestamp: string;
  mediaId: string;
  mediaUrl?: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMedia, setUserMedia] = useState<InstagramMedia[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // まず自分の投稿を取得
      const pages = await InstagramService.getPages();
      const instagramPage = pages.find(page => page.instagram_business_account);
      
      if (!instagramPage?.instagram_business_account) {
        throw new Error('Instagram Business Accountが見つかりません');
      }

      const account = await InstagramService.getInstagramAccount(
        instagramPage.instagram_business_account.id
      );
      
      // 自分の投稿一覧を取得
      const media = await InstagramService.getMedia(account.id, 10);
      setUserMedia(media);

      // 各投稿のコメントといいねを取得
      const allNotifications: Notification[] = [];

      for (const mediaItem of media.slice(0, 5)) { // 最新5投稿のみ
        try {
          const [comments, likes] = await Promise.all([
            InstagramService.getMediaComments(mediaItem.id),
            InstagramService.getMediaLikes(mediaItem.id)
          ]);

          // コメント通知
          comments.forEach((comment) => {
            allNotifications.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              username: comment.username,
              text: comment.text,
              timestamp: comment.timestamp,
              mediaId: mediaItem.id,
              mediaUrl: mediaItem.media_url
            });
          });

          // いいね通知
          likes.forEach((like) => {
            allNotifications.push({
              id: `like-${like.id}`,
              type: 'like',
              username: like.username,
              timestamp: new Date().toISOString(),
              mediaId: mediaItem.id,
              mediaUrl: mediaItem.media_url
            });
          });
        } catch (err) {
          console.warn(`投稿 ${mediaItem.id} の通知取得に失敗:`, err);
        }
      }

      // タイムスタンプでソート（新しい順）
      allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotifications(allNotifications);

    } catch (err: any) {
      console.error('通知取得エラー:', err);
      setError(err.message || '通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffTime = Math.abs(now.getTime() - time.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1日前';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const getNotificationIcon = (type: 'like' | 'comment') => {
    if (type === 'like') {
      return <Heart className="w-5 h-5 text-red-500" />;
    }
    return <MessageCircle className="w-5 h-5 text-blue-500" />;
  };

  const getNotificationText = (notification: Notification) => {
    if (notification.type === 'like') {
      return `${notification.username} があなたの投稿にいいねしました`;
    }
    return `${notification.username} がコメントしました: "${notification.text}"`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black mx-auto mb-4"></div>
          <p className="text-gray-600">通知を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h3 className="font-semibold">エラーが発生しました</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={fetchNotifications}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">アクティビティ</h1>
          <button
            onClick={fetchNotifications}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Clock className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">通知はありません</h3>
            <p className="text-gray-600 mb-6">新しいいいねやコメントがあると、ここに表示されます</p>
            
            {/* 自分の投稿統計 */}
            {userMedia.length > 0 && (
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">あなたの投稿統計</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-black">{userMedia.length}</p>
                    <p className="text-sm text-gray-600">投稿数</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">
                      {userMedia.reduce((sum, media) => sum + (media.like_count || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">総いいね数</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">
                      {userMedia.reduce((sum, media) => sum + (media.comments_count || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">総コメント数</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 通知一覧 */}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* アイコン */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* 通知内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-black font-medium">
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    
                    {/* 投稿画像 */}
                    {notification.mediaUrl && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={notification.mediaUrl}
                            alt="投稿画像"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 矢印アイコン */}
                <div className="flex-shrink-0 mt-1">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}

            {/* 統計情報 */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">今週のアクティビティ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">いいね</span>
                  </div>
                  <p className="text-xl font-bold text-black">
                    {notifications.filter(n => n.type === 'like').length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">コメント</span>
                  </div>
                  <p className="text-xl font-bold text-black">
                    {notifications.filter(n => n.type === 'comment').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
