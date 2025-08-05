import React, { useState } from 'react';
import { createThreadsPost, ThreadsPostData } from '../services/threadsService';

interface ThreadsPostCreatorProps {
  onPostCreated?: (postId: string) => void;
  onError?: (error: string) => void;
}

const ThreadsPostCreator: React.FC<ThreadsPostCreatorProps> = ({
  onPostCreated,
  onError
}) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Array<{ url: string; type: 'image' | 'video'; alt_text?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      onError?.('投稿内容を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const postData: ThreadsPostData = {
        content: content.trim(),
        media: media.length > 0 ? media : undefined
      };

      const response = await createThreadsPost(postData);
      
      if (response.success) {
        setContent('');
        setMedia([]);
        onPostCreated?.(response.post_id || '');
      } else {
        onError?.(response.error || '投稿の作成に失敗しました');
      }
    } catch (error) {
      console.error('投稿作成エラー:', error);
      onError?.(error instanceof Error ? error.message : '投稿の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const addMedia = () => {
    if (!mediaUrl.trim()) {
      onError?.('メディアURLを入力してください');
      return;
    }

    const newMedia = {
      url: mediaUrl.trim(),
      type: mediaType,
      alt_text: `Media ${media.length + 1}`
    };

    setMedia([...media, newMedia]);
    setMediaUrl('');
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Threads投稿作成</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 投稿内容 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            投稿内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="投稿内容を入力してください..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="text-sm text-gray-500 mt-1">
            {content.length}/500文字
          </div>
        </div>

        {/* メディア追加 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">メディア追加</h3>
          
          <div className="flex gap-4 mb-4">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="メディアURLを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="image">画像</option>
              <option value="video">動画</option>
            </select>
            <button
              type="button"
              onClick={addMedia}
              disabled={isLoading || !mediaUrl.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>

          {/* 追加されたメディア一覧 */}
          {media.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">追加されたメディア:</h4>
              {media.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {item.type === 'image' ? '🖼️' : '🎥'} {item.url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 投稿ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>投稿中...</span>
              </div>
            ) : (
              '投稿する'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThreadsPostCreator; 