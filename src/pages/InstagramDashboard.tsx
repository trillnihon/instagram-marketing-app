import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  PlusCircle, 
  Heart, 
  UserCircle,
  Heart as HeartSolid,
  MessageCircle,
  MoreHorizontal,
  X,
  Eye,
  Users,
  Bookmark,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import InstagramService, { 
  InstagramUser, 
  InstagramMedia, 
  InstagramInsights, 
  InstagramAccount,
  InstagramPage 
} from '../services/instagramService';

interface InstagramDashboardProps {}

const InstagramDashboard: React.FC<InstagramDashboardProps> = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<InstagramUser | null>(null);
  const [pages, setPages] = useState<InstagramPage[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<InstagramMedia | null>(null);
  const [insights, setInsights] = useState<InstagramInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ヘルスチェック
        const isHealthy = await InstagramService.healthCheck();
        if (!isHealthy) {
          throw new Error('Instagram APIサービスが利用できません');
        }

        // ユーザー情報取得
        const user = await InstagramService.getUserInfo();
        setUserInfo(user);

        // ページ一覧取得
        const pagesData = await InstagramService.getPages();
        setPages(pagesData);

        // Instagram Business Accountがある場合、最初のアカウントを選択
        const instagramPage = pagesData.find(page => page.instagram_business_account);
        if (instagramPage?.instagram_business_account) {
          const account = await InstagramService.getInstagramAccount(
            instagramPage.instagram_business_account.id
          );
          setSelectedAccount(account);

          // 投稿一覧取得
          const mediaData = await InstagramService.getMedia(account.id, 25);
          setMedia(mediaData);
        }

      } catch (err: any) {
        console.error('データ取得エラー:', err);
        setError(err.message || 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // インサイト取得
  const handleMediaClick = async (mediaItem: InstagramMedia) => {
    try {
      setSelectedMedia(mediaItem);
      setShowInsights(true);
      
      const insightsData = await InstagramService.getInsights(mediaItem.id);
      setInsights(insightsData);
    } catch (err: any) {
      console.error('インサイト取得エラー:', err);
      setError(err.message || 'インサイトの取得に失敗しました');
    }
  };

  // インサイトデータをグラフ用に変換
  const getInsightsChartData = () => {
    if (!insights) return [];

    return [
      { name: 'インプレッション', value: insights.impressions || 0, color: '#8B5CF6' },
      { name: 'リーチ', value: insights.reach || 0, color: '#06B6D4' },
      { name: 'エンゲージメント', value: insights.engagement || 0, color: '#10B981' },
      { name: '保存数', value: insights.saved || 0, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  };

  // 日付フォーマット
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1日前';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  // 数値フォーマット
  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // ナビゲーションタブ
  const navTabs = [
    { id: 'home', icon: Home, label: 'ホーム', path: '/instagram-dashboard' },
    { id: 'search', icon: Search, label: '検索', path: '/search' },
    { id: 'create', icon: PlusCircle, label: '投稿', path: '/create-post' },
    { id: 'activity', icon: Heart, label: '通知', path: '/notifications' },
    { id: 'profile', icon: UserCircle, label: 'プロフィール', path: '/instagram-dashboard' }
  ];

  const handleTabClick = (tab: any) => {
    if (tab.id === 'home' || tab.id === 'profile') {
      setActiveTab(tab.id);
    } else {
      navigate(tab.path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
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
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* デスクトップサイドバー */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* ロゴ */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <h1 className="text-2xl font-bold text-black">Instagram</h1>
          </div>
          
          {/* ナビゲーション */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="lg:pl-64">
        {/* モバイルヘッダー */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h1 className="text-xl font-bold text-black">Instagram</h1>
          <button className="p-2">
            <MoreHorizontal className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* プロフィールセクション */}
        {selectedAccount && activeTab === 'profile' && (
          <div className="px-4 py-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-black">{selectedAccount.username}</h2>
                <p className="text-gray-600">{selectedAccount.name}</p>
              </div>
            </div>

            {/* 統計 */}
            <div className="flex justify-around border-t border-b border-gray-200 py-4 mb-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-black">{formatNumber(selectedAccount.media_count)}</p>
                <p className="text-sm text-gray-600">投稿</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-black">{formatNumber(selectedAccount.followers_count)}</p>
                <p className="text-sm text-gray-600">フォロワー</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-black">{formatNumber(selectedAccount.follows_count)}</p>
                <p className="text-sm text-gray-600">フォロー中</p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-100 text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                プロフィールを編集
              </button>
              <button className="flex-1 bg-gray-100 text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                設定
              </button>
            </div>
          </div>
        )}

        {/* 投稿一覧 */}
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto">
            {/* ストーリー風ヘッダー */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex space-x-4 overflow-x-auto">
                {media.slice(0, 8).map((item, index) => (
                  <div key={item.id} className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-white p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-gray-500" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600 truncate w-16">
                      {selectedAccount?.username || 'user'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 投稿グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {media.map((mediaItem) => (
                <div
                  key={mediaItem.id}
                  onClick={() => handleMediaClick(mediaItem)}
                  className="relative aspect-square bg-gray-100 cursor-pointer group"
                >
                  {mediaItem.media_url && (
                    <img
                      src={mediaItem.media_url}
                      alt={mediaItem.caption || 'Instagram投稿'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* ホバー時のオーバーレイ */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-4 text-white">
                      <div className="flex items-center space-x-1">
                        <HeartSolid className="w-5 h-5" />
                        <span className="font-semibold">{formatNumber(mediaItem.like_count)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">{formatNumber(mediaItem.comments_count)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 検索タブ */}
        {activeTab === 'search' && (
          <div className="px-4 py-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="検索"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-0 focus:ring-0 focus:bg-white"
              />
            </div>
            <div className="text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>検索結果がここに表示されます</p>
            </div>
          </div>
        )}

        {/* 投稿作成タブ */}
        {activeTab === 'create' && (
          <div className="px-4 py-6 text-center">
            <PlusCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">新しい投稿を作成</h3>
            <p className="text-gray-600 mb-6">写真や動画を共有して、あなたのストーリーを伝えましょう</p>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              投稿を作成
            </button>
          </div>
        )}

        {/* 通知タブ */}
        {activeTab === 'activity' && (
          <div className="px-4 py-6 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">アクティビティ</h3>
            <p className="text-gray-600">新しい通知がここに表示されます</p>
          </div>
        )}
      </div>

      {/* モバイル下部タブバー */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center py-2 px-3 ${
                  activeTab === tab.id ? 'text-black' : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 投稿詳細モーダル */}
      {showInsights && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-black">{selectedAccount?.username}</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedMedia.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsights(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 投稿画像 */}
            <div className="relative">
              {selectedMedia.media_url && (
                <img
                  src={selectedMedia.media_url}
                  alt={selectedMedia.caption || 'Instagram投稿'}
                  className="w-full h-auto"
                />
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="p-1">
                  <HeartSolid className="w-6 h-6 text-red-500" />
                </button>
                <button className="p-1">
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                </button>
                <button className="p-1">
                  <Share2 className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <button className="p-1">
                <Bookmark className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* いいね数 */}
            <div className="px-4 py-2">
              <p className="font-semibold text-black">
                {formatNumber(selectedMedia.like_count)}件のいいね
              </p>
            </div>

            {/* キャプション */}
            {selectedMedia.caption && (
              <div className="px-4 py-2">
                <p className="text-black">
                  <span className="font-semibold">{selectedAccount?.username}</span>{' '}
                  {selectedMedia.caption}
                </p>
              </div>
            )}

            {/* コメント表示 */}
            <div className="px-4 py-2 text-gray-600">
              <p className="text-sm">
                {selectedMedia.comments_count && selectedMedia.comments_count > 0
                  ? `${formatNumber(selectedMedia.comments_count)}件のコメントを表示`
                  : 'コメントを追加...'
                }
              </p>
            </div>

            {/* インサイトセクション */}
            {insights && (
              <div className="px-4 py-4 border-t border-gray-200">
                <h4 className="font-semibold text-black mb-4">インサイト</h4>
                
                {/* インサイト数値 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-black">{formatNumber(insights.impressions)}</p>
                    <p className="text-sm text-gray-600">インプレッション</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-black">{formatNumber(insights.reach)}</p>
                    <p className="text-sm text-gray-600">リーチ</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <HeartSolid className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-black">{formatNumber(insights.engagement)}</p>
                    <p className="text-sm text-gray-600">エンゲージメント</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bookmark className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-black">{formatNumber(insights.saved)}</p>
                    <p className="text-sm text-gray-600">保存数</p>
                  </div>
                </div>

                {/* 円グラフ */}
                {getInsightsChartData().length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-black mb-3 text-center">パフォーマンス分布</h5>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={getInsightsChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {getInsightsChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* モバイル用の下部パディング */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default InstagramDashboard;