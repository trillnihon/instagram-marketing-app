import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface AIGeneratedPost {
  instagram?: {
    caption: string;
    hashtags: string[];
    cta: string;
    engagement_question: string;
    optimization_tips: string[];
  };
  threads?: {
    post: string;
    hashtags: string[];
    follow_up_question: string;
    conversation_starters: string[];
    optimization_tips: string[];
  };
}

interface AIPostGeneratorProps {
  onPostGenerated: (post: AIGeneratedPost) => void;
}

export const AIPostGenerator: React.FC<AIPostGeneratorProps> = ({ onPostGenerated }) => {
  const { token } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    keywords: '',
    targetAudience: '',
    hashtagCandidates: '',
    platform: 'both' as 'instagram' | 'threads' | 'both',
    tone: 'professional' as 'professional' | 'casual' | 'friendly' | 'conversational'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePost = async () => {
    if (!formData.keywords || !formData.targetAudience) {
      setError('キーワードとターゲット層は必須です');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '投稿文の生成に失敗しました');
      }

      onPostGenerated(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿文の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        🤖 AIに任せる - 投稿文自動生成
      </h3>
      
      <div className="space-y-4">
        {/* キーワード入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            キーワード *
          </label>
          <textarea
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            placeholder="例: フィッシング, 釣り具, アウトドア, 自然"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* ターゲット層 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ターゲット層 *
          </label>
          <input
            type="text"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleInputChange}
            placeholder="例: 30-50代の釣り愛好家、アウトドア初心者"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ハッシュタグ候補 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ハッシュタグ候補（任意）
          </label>
          <input
            type="text"
            name="hashtagCandidates"
            value={formData.hashtagCandidates}
            onChange={handleInputChange}
            placeholder="例: #フィッシング #釣り #アウトドア #自然"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* プラットフォーム選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プラットフォーム
          </label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="both">Instagram & Threads</option>
            <option value="instagram">Instagramのみ</option>
            <option value="threads">Threadsのみ</option>
          </select>
        </div>

        {/* トーン選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            トーン
          </label>
          <select
            name="tone"
            value={formData.tone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">プロフェッショナル</option>
            <option value="casual">カジュアル</option>
            <option value="friendly">フレンドリー</option>
            <option value="conversational">会話的</option>
          </select>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* 生成ボタン */}
        <button
          onClick={generatePost}
          disabled={isLoading || !formData.keywords || !formData.targetAudience}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isLoading || !formData.keywords || !formData.targetAudience
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              AIが投稿文を生成中...
            </div>
          ) : (
            '🤖 AIに任せる - 投稿文を生成'
          )}
        </button>

        {/* ヒント */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
          <p className="font-medium mb-1">💡 ヒント:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>具体的なキーワードを入力すると、より適切な投稿文が生成されます</li>
            <li>ターゲット層は年齢、興味、行動パターンを含めると効果的です</li>
            <li>ハッシュタグ候補を指定すると、より関連性の高いハッシュタグが提案されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 