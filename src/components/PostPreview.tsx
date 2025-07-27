import React from 'react';

interface PostPreviewProps {
  imageUrl: string;
  caption: string;
  hashtags: string[];
  date?: string;
}

const PostPreview: React.FC<PostPreviewProps> = ({ imageUrl, caption, hashtags, date }) => {
  return (
    <div className="max-w-xs mx-auto rounded-2xl overflow-hidden shadow-lg border bg-white relative" style={{ aspectRatio: '9/16', width: '100%', minWidth: 240 }}>
      {/* ヘッダー */}
      <div className="flex items-center px-4 py-3 border-b">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
        <div>
          <div className="font-semibold text-sm text-gray-900">demo_user</div>
          <div className="text-xs text-gray-400">{date ? new Date(date).toLocaleDateString() : '今日'}</div>
        </div>
      </div>
      {/* 画像 */}
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt="preview" className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400">画像未選択</span>
        )}
      </div>
      {/* キャプション・ハッシュタグ */}
      <div className="px-4 py-3">
        <div className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{caption}</div>
        <div className="flex flex-wrap gap-1">
          {hashtags.map((tag, i) => (
            <span key={i} className="text-xs text-blue-500">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostPreview; 