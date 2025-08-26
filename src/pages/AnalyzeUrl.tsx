import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useAppStore } from '../store/useAppStore';

interface AnalysisResult {
  engagement: string;
  style: string;
  hashtags: string;
  cta: string;
  overall: string;
}

interface AnalysisHistory {
  id: string;
  url: string;
  result: AnalysisResult;
  timestamp: string;
}

const AnalyzeUrl: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisTemplate, setAnalysisTemplate] = useState('general');
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  
  const { currentUser } = useAppStore();

  // 分析テンプレート
  const templates = {
    general: '一般的な分析',
    sales: '売上向上重視',
    engagement: 'エンゲージメント重視',
    saves: '保存率重視',
    brand: 'ブランド認知重視'
  };

  // 履歴をローカルストレージから読み込み
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('urlAnalysisHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('履歴の読み込みに失敗しました:', e);
      }
    }
  }, []);

  // 履歴をローカルストレージに保存
  const saveHistory = (newHistory: AnalysisHistory[]) => {
    localStorage.setItem('urlAnalysisHistory', JSON.stringify(newHistory));
  };

  // URLバリデーション
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/;
    return instagramRegex.test(url);
  };

  // 分析実行
  const analyzeUrl = async () => {
    if (!validateUrl(url)) {
      setError('有効なInstagram投稿URLを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api'}/analyze-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          template: analysisTemplate,
          userId: currentUser?.id || 'anonymous'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const analysisResult = data.result;
        setResult(analysisResult);

        // 履歴に追加
        const newHistoryItem: AnalysisHistory = {
          id: Date.now().toString(),
          url,
          result: analysisResult,
          timestamp: new Date().toISOString()
        };
        
        const newHistory = [newHistoryItem, ...history.slice(0, 9)]; // 最新10件を保持
        setHistory(newHistory);
        saveHistory(newHistory);
      } else {
        setError(data.error || '分析に失敗しました');
      }
    } catch (err) {
      setError('分析ツールへの接続に失敗しました');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 結果をセクションごとに表示
  const renderAnalysisSection = (title: string, content: string, icon: string) => (
    <div key={title} className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab="analyze-url" onTabChange={() => {}} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 Instagram投稿URL分析
            </h1>
            <p className="text-gray-600">
              Instagram投稿のURLを入力して、AIによる詳細分析を実行します
            </p>
          </div>

          {/* 入力フォーム */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram投稿URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分析テンプレート
              </label>
              <select
                value={analysisTemplate}
                onChange={(e) => setAnalysisTemplate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {Object.entries(templates).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={analyzeUrl}
              disabled={loading || !url.trim()}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white ${
                loading || !url.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '分析中...' : '分析を開始'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* 分析結果 */}
          {result && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 分析結果</h2>
              <div className="space-y-4">
                {renderAnalysisSection('推定エンゲージメント率', result.engagement, '📈')}
                {renderAnalysisSection('投稿スタイルの特徴', result.style, '🎨')}
                {renderAnalysisSection('ハッシュタグ改善案', result.hashtags, '🏷️')}
                {renderAnalysisSection('CTA最適化案', result.cta, '🎯')}
                {renderAnalysisSection('総合評価', result.overall, '⭐')}
              </div>
            </div>
          )}

          {/* 分析履歴 */}
          {history.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 分析履歴</h2>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate flex-1"
                      >
                        {item.url}
                      </a>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(item.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      エンゲージメント: {item.result.engagement.split('\n')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeUrl; 