import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface RewriteSuggestion {
  id: string;
  originalContent: string;
  improvedContent: string;
  improvements: string[];
  expectedEngagement: number;
}

interface ContentRewriteProps {
  originalContent?: string;
}

const ContentRewrite: React.FC<ContentRewriteProps> = ({ originalContent: initialContent }) => {
  const [originalContent, setOriginalContent] = useState(initialContent || '');
  const [suggestions, setSuggestions] = useState<RewriteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  const { currentUser } = useAppStore();

  const generateRewriteSuggestions = async () => {
    if (!originalContent.trim()) {
      setError('改善したいコンテンツを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/threads/content-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: originalContent.trim(),
          userId: currentUser?.userId || 'demo_user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions);
        setSelectedSuggestion(null);
      } else {
        setError(data.error || 'コンテンツリライト提案の取得に失敗しました');
      }
    } catch (err) {
      console.error('Content rewrite error:', err);
      setError('コンテンツリライトツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 4.0) return 'text-green-600';
    if (engagement >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementBadge = (engagement: number) => {
    if (engagement >= 4.0) return 'bg-green-100 text-green-800';
    if (engagement >= 3.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // コピー成功のフィードバックを表示
      const button = document.getElementById('copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'コピー完了！';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">✍️ コンテンツリライト提案</h3>
        <button
          onClick={generateRewriteSuggestions}
          disabled={loading || !originalContent.trim()}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            loading || !originalContent.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {loading ? '生成中...' : '改善案を生成'}
        </button>
      </div>

      {/* 入力エリア */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          改善したいコンテンツ
        </label>
        <textarea
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          placeholder="改善したい投稿内容を入力してください..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {originalContent.length}文字 / 500文字
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            ✨ {suggestions.length}件の改善案を生成しました
          </div>
          
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-800">改善案 {suggestion.id.split('_')[1]}</h4>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getEngagementColor(suggestion.expectedEngagement)}`}>
                    {suggestion.expectedEngagement.toFixed(1)}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getEngagementBadge(suggestion.expectedEngagement)}`}>
                    期待エンゲージメント
                  </div>
                </div>
              </div>

              {/* 改善点 */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">🔧 改善点</h5>
                <ul className="space-y-1">
                  {suggestion.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 改善されたコンテンツ */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">📝 改善されたコンテンツ</h5>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{suggestion.improvedContent}</p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={() => setSelectedSuggestion(selectedSuggestion === suggestion.id ? null : suggestion.id)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  {selectedSuggestion === suggestion.id ? '詳細を隠す' : '詳細を見る'}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOriginalContent(suggestion.improvedContent)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    この案を使用
                  </button>
                  <button
                    id="copy-button"
                    onClick={() => copyToClipboard(suggestion.improvedContent)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    コピー
                  </button>
                </div>
              </div>

              {/* 詳細表示 */}
              {selectedSuggestion === suggestion.id && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h6 className="font-medium text-gray-700 mb-2">📊 詳細分析</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">文字数:</span>
                      <span className="ml-2">{suggestion.improvedContent.length}文字</span>
                    </div>
                    <div>
                      <span className="font-medium">ハッシュタグ数:</span>
                      <span className="ml-2">{(suggestion.improvedContent.match(/#/g) || []).length}個</span>
                    </div>
                    <div>
                      <span className="font-medium">絵文字数:</span>
                      <span className="ml-2">{(suggestion.improvedContent.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length}個</span>
                    </div>
                    <div>
                      <span className="font-medium">改善率:</span>
                      <span className="ml-2 text-green-600 font-medium">
                        +{((suggestion.expectedEngagement - 2.46) / 2.46 * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✍️</div>
          <p className="text-gray-500">コンテンツを入力して改善案を生成してください</p>
          <p className="text-sm text-gray-400 mt-2">
            AIが投稿内容を分析して、エンゲージメント向上のための改善案を提案します
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">改善案を生成中...</p>
        </div>
      )}
    </div>
  );
};

export default ContentRewrite; 