import React, { useState, useEffect } from 'react';
import { CaptionOption } from '../types';

interface PostEditorProps {
  initialCaption: CaptionOption | null;
  onSave: (caption: CaptionOption) => void;
  onCancel: () => void;
  isThreadsMode?: boolean;
}

interface ImprovementSuggestion {
  type: 'cta' | 'hashtag' | 'engagement' | 'timing' | 'seo';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  applied: boolean;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialCaption,
  onSave,
  onCancel,
  isThreadsMode = false
}) => {
  const [caption, setCaption] = useState<CaptionOption | null>(initialCaption);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ImprovementSuggestion | null>(null);

  // 改善提案を生成
  const generateSuggestions = (text: string): ImprovementSuggestion[] => {
    const suggestions: ImprovementSuggestion[] = [];

    // CTAチェック
    if (!text.includes('保存') && !text.includes('シェア') && !text.includes('コメント') && !text.includes('フォロー')) {
      suggestions.push({
        type: 'cta',
        priority: 'high',
        message: 'CTA（行動喚起）が不足しています',
        suggestion: isThreadsMode ? '「皆さんはどう思いますか？」「経験談を聞かせてください」' : '「保存して後で見返そう！」「友達にもシェアしてね」',
        applied: false
      });
    }

    // ハッシュタグチェック
    const hashtagCount = (text.match(/#/g) || []).length;
    if (hashtagCount < 3) {
      suggestions.push({
        type: 'hashtag',
        priority: 'medium',
        message: 'ハッシュタグが少なすぎます',
        suggestion: '関連性の高いハッシュタグを3-5個追加してください',
        applied: false
      });
    } else if (hashtagCount > 10) {
      suggestions.push({
        type: 'hashtag',
        priority: 'medium',
        message: 'ハッシュタグが多すぎます',
        suggestion: 'ハッシュタグは5-10個が最適です',
        applied: false
      });
    }

    // エンゲージメントチェック
    if (!text.includes('?') && !text.includes('？')) {
      suggestions.push({
        type: 'engagement',
        priority: 'medium',
        message: '質問が含まれていません',
        suggestion: isThreadsMode ? '「皆さんはどう思いますか？」のような質問を追加' : '「どう思いますか？」のような質問を追加',
        applied: false
      });
    }

    // SEOキーワードチェック
    const seoKeywords = ['#朝活', '#ライフスタイル', '#自己啓発', '#モチベーション', '#フィッシング', '#アウトドア'];
    const hasSeoKeywords = seoKeywords.some(keyword => text.includes(keyword));
    if (!hasSeoKeywords) {
      suggestions.push({
        type: 'seo',
        priority: 'low',
        message: 'SEOキーワードが不足しています',
        suggestion: '検索されやすいキーワードを自然に組み込んでください',
        applied: false
      });
    }

    return suggestions;
  };

  useEffect(() => {
    if (caption?.text) {
      const newSuggestions = generateSuggestions(caption.text);
      setSuggestions(newSuggestions);
    }
  }, [caption?.text, isThreadsMode]);

  const applySuggestion = (suggestion: ImprovementSuggestion) => {
    if (!caption) return;

    let newText = caption.text;
    
    switch (suggestion.type) {
      case 'cta':
        if (isThreadsMode) {
          newText += '\n\n皆さんはどう思いますか？経験談を聞かせてください！';
        } else {
          newText += '\n\n保存して後で見返そう！友達にもシェアしてね✨';
        }
        break;
      case 'engagement':
        if (isThreadsMode) {
          newText += '\n\n皆さんはどう思いますか？';
        } else {
          newText += '\n\nどう思いますか？';
        }
        break;
      case 'hashtag':
        if (suggestion.message.includes('少なすぎます')) {
          newText += '\n\n#ライフスタイル #自己啓発 #モチベーション';
        }
        break;
      case 'seo':
        newText += '\n\n#朝活 #ライフスタイル #自己啓発';
        break;
    }

    const updatedCaption: CaptionOption = {
      ...caption,
      text: newText,
      wordCount: newText.split(' ').length
    };

    setCaption(updatedCaption);
    setSuggestions(prev => prev.map(s => 
      s === suggestion ? { ...s, applied: true } : s
    ));
  };

  const handleSave = () => {
    if (caption) {
      onSave(caption);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (caption) {
      const newText = e.target.value;
      setCaption({
        ...caption,
        text: newText,
        wordCount: newText.split(' ').length
      });
    }
  };

  if (!caption) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">編集するキャプションがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          ✏️ 投稿エディタ
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 投稿文エディタ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            投稿文
          </label>
          <textarea
            value={caption.text}
            onChange={handleTextChange}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="投稿文を入力してください..."
          />
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>文字数: {caption.text.length}</span>
            <span>単語数: {caption.wordCount}</span>
          </div>
        </div>

        {/* 改善提案 */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            💡 改善提案
          </h4>
          
          {suggestions.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                ✅ 投稿文は最適化されています！
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${
                    suggestion.applied
                      ? 'bg-green-50 border-green-200'
                      : suggestion.priority === 'high'
                      ? 'bg-red-50 border-red-200'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        suggestion.applied
                          ? 'text-green-700'
                          : suggestion.priority === 'high'
                          ? 'text-red-700'
                          : suggestion.priority === 'medium'
                          ? 'text-yellow-700'
                          : 'text-blue-700'
                      }`}>
                        {suggestion.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {suggestion.suggestion}
                      </p>
                    </div>
                    {!suggestion.applied && (
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        適用
                      </button>
                    )}
                  </div>
                  {suggestion.applied && (
                    <div className="mt-2 flex items-center text-green-600 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      適用済み
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 統計情報 */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">📊 統計</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">推定保存率</p>
                <p className="font-semibold text-gray-800">{(caption.estimatedSaveRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600">推定シェア率</p>
                <p className="font-semibold text-gray-800">{(caption.estimatedShareRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600">ハッシュタグ数</p>
                <p className="font-semibold text-gray-800">{(caption.text.match(/#/g) || []).length}</p>
              </div>
              <div>
                <p className="text-gray-600">質問数</p>
                <p className="font-semibold text-gray-800">{(caption.text.match(/[?？]/g) || []).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 