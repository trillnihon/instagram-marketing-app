import React, { useState } from 'react';
import { Search, Hash, TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';
import InstagramService, { InstagramHashtag, InstagramMedia } from '../services/instagramService';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [hashtags, setHashtags] = useState<InstagramHashtag[]>([]);
  const [topMedia, setTopMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<InstagramHashtag | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHashtags([]);
      setTopMedia([]);
      setSelectedHashtag(null);

      // ハッシュタグ検索
      const hashtagResults = await InstagramService.searchHashtags(query);
      setHashtags(hashtagResults);

      // 最初のハッシュタグの人気投稿を取得
      if (hashtagResults.length > 0) {
        const firstHashtag = hashtagResults[0];
        setSelectedHashtag(firstHashtag);
        const mediaResults = await InstagramService.getHashtagTopMedia(firstHashtag.id);
        setTopMedia(mediaResults);
      }

    } catch (err: any) {
      console.error('検索エラー:', err);
      setError(err.message || '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = async (hashtag: InstagramHashtag) => {
    try {
      setLoading(true);
      setSelectedHashtag(hashtag);
      
      const mediaResults = await InstagramService.getHashtagTopMedia(hashtag.id);
      setTopMedia(mediaResults);
    } catch (err: any) {
      console.error('ハッシュタグ投稿取得エラー:', err);
      setError(err.message || 'ハッシュタグの投稿取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ハッシュタグを検索"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:ring-0 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ハッシュタグ一覧 */}
        {hashtags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-3">ハッシュタグ</h3>
            <div className="space-y-2">
              {hashtags.map((hashtag) => (
                <button
                  key={hashtag.id}
                  onClick={() => handleHashtagClick(hashtag)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selectedHashtag?.id === hashtag.id
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-black">#{hashtag.name}</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 人気投稿一覧 */}
        {selectedHashtag && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Hash className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-black">#{selectedHashtag.name} の人気投稿</h3>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            ) : topMedia.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">人気投稿が見つかりませんでした</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {topMedia.map((media) => (
                  <div
                    key={media.id}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                  >
                    {media.media_url && (
                      <img
                        src={media.media_url}
                        alt={media.caption || 'Instagram投稿'}
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
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-semibold">{formatNumber(media.like_count)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">{formatNumber(media.comments_count)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 初期状態 */}
        {!hashtags.length && !loading && !error && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ハッシュタグを検索</h3>
            <p className="text-gray-600 mb-6">興味のあるハッシュタグを検索して、人気投稿を発見しましょう</p>
            
            {/* 人気ハッシュタグのサンプル */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-3">人気のハッシュタグ例:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['photography', 'travel', 'food', 'fashion', 'art', 'nature'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      handleSearch();
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
