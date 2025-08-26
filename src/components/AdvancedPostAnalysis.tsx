import React, { useState, useEffect } from 'react';
import { 
  analyzePost, 
  analyzePostWithMultipleProviders,
  analyzeHashtags,
  analyzeOptimalPostingTime,
  AiAnalysisRequest,
  AiAnalysisResult
} from '../services/aiAnalysis';
import { useAppStore } from '../store/useAppStore';

interface AdvancedPostAnalysisProps {
  initialCaption?: string;
  onAnalysisComplete?: (results: Record<string, AiAnalysisResult>) => void;
}

const AdvancedPostAnalysis: React.FC<AdvancedPostAnalysisProps> = ({ 
  initialCaption = '', 
  onAnalysisComplete 
}) => {
  const { currentUser } = useAppStore();
  const [caption, setCaption] = useState(initialCaption);
  const [industry, setIndustry] = useState('general');
  const [targetAudience, setTargetAudience] = useState('general');
  const [analysisType, setAnalysisType] = useState<'engagement' | 'reach' | 'brand' | 'hashtag' | 'timing'>('engagement');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['openai']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<string, AiAnalysisResult>>({});
  const [error, setError] = useState<string | null>(null);
  const [hashtagResults, setHashtagResults] = useState<any>(null);
  const [postingTimeResults, setPostingTimeResults] = useState<any>(null);

  const industries = [
    { value: 'general', label: '一般' },
    { value: 'fashion', label: 'ファッション' },
    { value: 'beauty', label: 'ビューティー' },
    { value: 'food', label: 'フード' },
    { value: 'travel', label: 'トラベル' },
    { value: 'fitness', label: 'フィットネス' },
    { value: 'business', label: 'ビジネス' },
    { value: 'technology', label: 'テクノロジー' },
    { value: 'lifestyle', label: 'ライフスタイル' },
    { value: 'entertainment', label: 'エンターテイメント' }
  ];

  const targetAudiences = [
    { value: 'general', label: '一般' },
    { value: 'teens', label: '10代' },
    { value: 'twenties', label: '20代' },
    { value: 'thirties', label: '30代' },
    { value: 'forties', label: '40代' },
    { value: 'fifties', label: '50代以上' },
    { value: 'women', label: '女性' },
    { value: 'men', label: '男性' },
    { value: 'professionals', label: 'ビジネスパーソン' },
    { value: 'students', label: '学生' }
  ];

  const analysisTypes = [
    { value: 'engagement', label: 'エンゲージメント分析', description: '投稿の反応率とユーザー参加度を分析' },
    { value: 'reach', label: 'リーチ分析', description: '投稿の到達範囲と可視性を分析' },
    { value: 'brand', label: 'ブランド分析', description: 'ブランド一貫性とメッセージの効果を分析' },
    { value: 'hashtag', label: 'ハッシュタグ分析', description: '最適なハッシュタグ戦略を提案' },
    { value: 'timing', label: '投稿時間分析', description: '最適な投稿時間とスケジュールを提案' }
  ];

  const aiProviders = [
    { value: 'openai', label: 'OpenAI GPT-4', description: '高精度な自然言語処理' },
    { value: 'google', label: 'Google Gemini', description: 'Googleの最新AI技術' }
  ];

  const handleAnalysis = async () => {
    if (!caption.trim()) {
      setError('キャプションを入力してください');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults({});

    try {
      const analysisRequest: AiAnalysisRequest = {
        userId: currentUser?.id || 'demo_user',
        caption: caption.trim(),
        analysisType,
        targetAudience,
        industry
      };

      // 複数プロバイダーでの分析実行
      const analysisResults = await analyzePostWithMultipleProviders(
        analysisRequest,
        selectedProviders
      );

      setResults(analysisResults);

      // ハッシュタグ分析
      if (analysisType === 'hashtag' || analysisType === 'engagement') {
        try {
          const hashtagAnalysis = await analyzeHashtags(caption, industry);
          setHashtagResults(hashtagAnalysis);
        } catch (error) {
          console.warn('ハッシュタグ分析に失敗:', error);
        }
      }

      // 投稿時間分析
      if (analysisType === 'timing' || analysisType === 'engagement') {
        try {
          const timingAnalysis = await analyzeOptimalPostingTime(
            targetAudience,
            industry
          );
          setPostingTimeResults(timingAnalysis);
        } catch (error) {
          console.warn('投稿時間分析に失敗:', error);
        }
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResults);
      }

    } catch (error) {
      console.error('分析エラー:', error);
      setError(error instanceof Error ? error.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisResults = () => {
    if (Object.keys(results).length === 0) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          分析結果
        </h3>
        
        {Object.entries(results).map(([provider, result]) => (
          <div key={provider} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 capitalize">
                {provider} の分析結果
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">スコア</span>
                <span className="text-2xl font-bold text-instagram-primary">
                  {result.score}/100
                </span>
              </div>
            </div>

            {/* スコアバー */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-instagram-secondary to-instagram-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* 分析結果の詳細 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 理由 */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">分析理由</h5>
                <ul className="space-y-2">
                  {result.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-instagram-primary mt-1">•</span>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 提案 */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">改善提案</h5>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 追加分析結果 */}
            {result.hashtagRecommendations && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">推奨ハッシュタグ</h5>
                <div className="flex flex-wrap gap-2">
                  {result.hashtagRecommendations.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.optimalPostingTime && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">最適投稿時間</h5>
                <p className="text-green-800">{result.optimalPostingTime}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderHashtagResults = () => {
    if (!hashtagResults) return null;

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ハッシュタグ分析結果
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 推奨ハッシュタグ */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">推奨ハッシュタグ</h4>
            <div className="space-y-2">
              {hashtagResults.recommended.map((tag: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">{tag}</span>
                  <span className="text-sm text-gray-500">
                    {hashtagResults.engagement[tag] || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* トレンドハッシュタグ */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">トレンド中</h4>
            <div className="space-y-2">
              {hashtagResults.trending.map((tag: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-orange-700">{tag}</span>
                  <span className="text-sm text-orange-500">🔥</span>
                </div>
              ))}
            </div>
          </div>

          {/* 業界特化ハッシュタグ */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">業界特化</h4>
            <div className="space-y-2">
              {hashtagResults.industrySpecific.map((tag: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-purple-700">{tag}</span>
                  <span className="text-sm text-purple-500">⭐</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPostingTimeResults = () => {
    if (!postingTimeResults) return null;

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          最適投稿時間分析
        </h3>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">ベストタイム</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {postingTimeResults.bestTimes.map((time: any, index: number) => (
              <div key={index} className="p-4 bg-gradient-to-r from-instagram-secondary to-instagram-primary rounded-lg text-white">
                <div className="text-lg font-semibold">{time.day}</div>
                <div className="text-2xl font-bold">{time.time}</div>
                <div className="text-sm opacity-90">
                  エンゲージメント予測: {time.engagement}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">推奨事項</h4>
          <ul className="space-y-2">
            {postingTimeResults.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-instagram-primary mt-1">💡</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI投稿分析
        </h2>
        <p className="text-gray-600">
          最新のAI技術を使用して、投稿の効果を分析し、改善提案を提供します
        </p>
      </div>

      {/* 分析設定 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          分析設定
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* キャプション入力 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投稿キャプション
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="分析したい投稿のキャプションを入力してください..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
            />
          </div>

          {/* 業界選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              業界
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
            >
              {industries.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          {/* ターゲットオーディエンス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ターゲットオーディエンス
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
            >
              {targetAudiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label}
                </option>
              ))}
            </select>
          </div>

          {/* 分析タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分析タイプ
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
            >
              {analysisTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {analysisTypes.find(t => t.value === analysisType)?.description}
            </p>
          </div>

          {/* AIプロバイダー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AIプロバイダー
            </label>
            <div className="space-y-2">
              {aiProviders.map((provider) => (
                <label key={provider.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProviders([...selectedProviders, provider.value]);
                      } else {
                        setSelectedProviders(selectedProviders.filter(p => p !== provider.value));
                      }
                    }}
                    className="rounded border-gray-300 text-instagram-primary focus:ring-instagram-primary"
                  />
                  <span className="text-sm text-gray-700">{provider.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 分析実行ボタン */}
        <div className="mt-6">
          <button
            onClick={handleAnalysis}
            disabled={isAnalyzing || !caption.trim()}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-instagram-secondary to-instagram-primary text-white rounded-md hover:from-instagram-primary hover:to-instagram-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isAnalyzing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>分析中...</span>
              </div>
            ) : (
              'AI分析を実行'
            )}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* 分析結果 */}
      {renderAnalysisResults()}

      {/* ハッシュタグ分析結果 */}
      {renderHashtagResults()}

      {/* 投稿時間分析結果 */}
      {renderPostingTimeResults()}
    </div>
  );
};

export default AdvancedPostAnalysis;
