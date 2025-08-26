import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import SimilarAccounts from './SimilarAccounts';
import BestPostingTimes from './BestPostingTimes';
import ContentRewrite from './ContentRewrite';
import PDFReport from './PDFReport';

interface CompetitorPost {
  id: string;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  date: string;
  hashtags: string[];
}

interface AIAnalysis {
  contentTone: { tone: string; confidence: number; keywords: string[]; };
  frequentWords: { [key: string]: number; };
  postingPattern: { bestTime: string; frequency: string; contentLength: string; hashtagUsage: string; };
  engagementInsights: { highEngagementTopics: string[]; lowEngagementTopics: string[]; recommendedHashtags: string[]; contentSuggestions: string[]; };
}

interface CompetitorAnalysis {
  username: string;
  followers: number;
  posts: CompetitorPost[];
  hashtagFrequency: { [key: string]: number; };
  postingFrequency: number;
  lastPosted: string;
  averageEngagement: number;
  aiAnalysis?: AIAnalysis;
}

interface ThreadsCompetitorAnalysisProps {
  onCompetitorSelect?: (analysis: CompetitorAnalysis) => void;
}

const ThreadsCompetitorAnalysis: React.FC<ThreadsCompetitorAnalysisProps> = ({ onCompetitorSelect }) => {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'similar' | 'timing' | 'rewrite' | 'pdf'>('analysis');

  const { currentUser } = useAppStore();

  const validateThreadsUrl = (url: string) => {
    const threadsPattern = /^https?:\/\/(www\.)?threads\.net\/@[\w.-]+/;
    return threadsPattern.test(url);
  };

  const analyzeCompetitor = async () => {
    if (!validateThreadsUrl(competitorUrl)) {
      setError('有効なThreadsアカウントURLを入力してください（例: https://www.threads.net/@username）');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/threads/analyze-competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitorUrl,
          userId: currentUser?.id || 'demo_user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const competitorAnalysis = data.analysis;
        setAnalysis(competitorAnalysis);
        setRecentAnalyses(prev => {
          const filtered = prev.filter(a => a.username !== competitorAnalysis.username);
          return [competitorAnalysis, ...filtered.slice(0, 4)];
        });
        await saveAnalysisHistory(competitorAnalysis);
        if (onCompetitorSelect) {
          onCompetitorSelect(competitorAnalysis);
        }
      } else {
        setError(data.error || '競合分析に失敗しました');
      }
    } catch (err) {
      console.error('Competitor analysis error:', err);
      setError('競合分析ツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 分析履歴を保存
  const saveAnalysisHistory = async (analysisData: CompetitorAnalysis) => {
    try {
      await fetch('/api/threads/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id || 'demo_user',
          analysis: analysisData
        }),
      });
    } catch (err) {
      console.error('Failed to save analysis history:', err);
    }
  };

  const getTopHashtags = (hashtagFrequency: { [key: string]: number }) => {
    return Object.entries(hashtagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTopPosts = (posts: CompetitorPost[]) => {
    return posts
      .sort((a, b) => (b.likes + b.reposts + b.replies) - (a.likes + a.reposts + a.replies))
      .slice(0, 3);
  };

  // 頻出語をソート
  const getTopWords = (frequentWords: { [key: string]: number }) => {
    return Object.entries(frequentWords).sort(([, a], [, b]) => b - a).slice(0, 8);
  };

  // スコアリング関数
  const calculateOverallScore = (analysis: CompetitorAnalysis) => {
    const engagementScore = calculateEngagementScore(analysis);
    const consistencyScore = calculateConsistencyScore(analysis);
    const contentScore = calculateContentScore(analysis);
    const engagementWeight = 0.4;
    const consistencyWeight = 0.3;
    const contentWeight = 0.3;
    return Math.round((engagementScore * engagementWeight) + (consistencyScore * consistencyWeight) + (contentScore * contentWeight));
  };

  const calculateEngagementScore = (analysis: CompetitorAnalysis) => {
    const avgEngagement = analysis.averageEngagement;
    if (avgEngagement >= 5.0) return 100;
    if (avgEngagement >= 3.0) return 85;
    if (avgEngagement >= 2.0) return 70;
    if (avgEngagement >= 1.0) return 50;
    if (avgEngagement >= 0.5) return 30;
    return 10;
  };

  const calculateConsistencyScore = (analysis: CompetitorAnalysis) => {
    const postingFreq = analysis.postingFrequency;
    if (postingFreq >= 5) return 100;
    if (postingFreq >= 3) return 80;
    if (postingFreq >= 2) return 60;
    if (postingFreq >= 1) return 40;
    return 20;
  };

  const calculateContentScore = (analysis: CompetitorAnalysis) => {
    if (!analysis.aiAnalysis) return 50;
    const contentTone = analysis.aiAnalysis.contentTone;
    const tone = contentTone.tone;
    const confidence = contentTone.confidence;
    let toneScore = 50;
    if (tone.includes('親しみやすい') || tone.includes('前向き')) {
      toneScore = 90;
    } else if (tone.includes('専門的')) {
      toneScore = 80;
    } else if (tone.includes('激励的')) {
      toneScore = 75;
    } else if (tone.includes('中立的')) {
      toneScore = 60;
    } else {
      toneScore = 40;
    }
    const adjustedScore = toneScore * confidence;
    return Math.round(adjustedScore);
  };

  return (
    <div className="space-y-6">
      {/* 競合アカウントURL入力 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🧵 Threads競合分析</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            placeholder="https://www.threads.net/@username"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={analyzeCompetitor}
            disabled={loading || !competitorUrl.trim()}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${
              loading || !competitorUrl.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {loading ? '分析中...' : '分析開始'}
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* タブナビゲーション */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 基本分析
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'similar'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔍 類似アカウント
              </button>
              <button
                onClick={() => setActiveTab('timing')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'timing'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⏰ 投稿時間
              </button>
              <button
                onClick={() => setActiveTab('rewrite')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'rewrite'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✍️ リライト提案
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pdf'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 PDF出力
              </button>
            </div>
          </div>

          {/* タブコンテンツ */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">📊 基本情報</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">@{analysis.username}</span>
                    {/* スコアリング表示 */}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-purple-600">
                        スコア: {calculateOverallScore(analysis)}
                      </span>
                      <div className={`w-4 h-4 rounded-full ${
                        calculateOverallScore(analysis) >= 80 ? 'bg-green-500' :
                        calculateOverallScore(analysis) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{analysis.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">フォロワー</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{analysis.posts.length}</div>
                    <div className="text-sm text-gray-600">投稿数</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analysis.averageEngagement.toFixed(2)}%</div>
                    <div className="text-sm text-gray-600">平均エンゲージメント</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysis.postingFrequency}</div>
                    <div className="text-sm text-gray-600">週間投稿頻度</div>
                  </div>
                </div>

                {/* スコアリング詳細 */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-3">📈 スコアリング詳細</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{calculateEngagementScore(analysis)}</div>
                      <div className="text-xs text-gray-600">エンゲージメント</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{calculateConsistencyScore(analysis)}</div>
                      <div className="text-xs text-gray-600">一貫性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{calculateContentScore(analysis)}</div>
                      <div className="text-xs text-gray-600">コンテンツ品質</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 人気ハッシュタグ */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🏷️ 人気ハッシュタグ</h4>
                <div className="flex flex-wrap gap-2">
                  {getTopHashtags(analysis.hashtagFrequency).map(([tag, count]) => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {tag} ({count})
                    </span>
                  ))}
                </div>
              </div>

              {/* 人気投稿 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🔥 人気投稿</h4>
                <div className="space-y-4">
                  {getTopPosts(analysis.posts).map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 mb-3">{post.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex space-x-4">
                          <span>❤️ {post.likes}</span>
                          <span>🔄 {post.reposts}</span>
                          <span>💬 {post.replies}</span>
                        </div>
                        <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI分析結果 */}
              {analysis.aiAnalysis && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">🤖 AI分析結果</h4>
                    <button
                      onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      {showAIAnalysis ? '詳細を隠す' : '詳細を見る'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">📝 コンテンツトーン</h5>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-800">{analysis.aiAnalysis.contentTone.tone}</p>
                        <p className="text-xs text-gray-600 mt-1">信頼度: {(analysis.aiAnalysis.contentTone.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">📊 投稿パターン</h5>
                      <div className="space-y-2 text-sm">
                        <div>最適時間: {analysis.aiAnalysis.postingPattern.bestTime}</div>
                        <div>投稿頻度: {analysis.aiAnalysis.postingPattern.frequency}</div>
                        <div>コンテンツ長: {analysis.aiAnalysis.postingPattern.contentLength}</div>
                        <div>ハッシュタグ使用: {analysis.aiAnalysis.postingPattern.hashtagUsage}</div>
                      </div>
                    </div>
                  </div>

                  {showAIAnalysis && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">🔤 頻出語</h5>
                        <div className="flex flex-wrap gap-2">
                          {getTopWords(analysis.aiAnalysis.frequentWords).map(([word, count]) => (
                            <span key={word} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {word} ({count})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">💡 エンゲージメント洞察</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-medium text-gray-600 mb-1">高エンゲージメントトピック</h6>
                            <ul className="space-y-1">
                              {analysis.aiAnalysis.engagementInsights.highEngagementTopics.map((topic, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-600 mb-1">推奨ハッシュタグ</h6>
                            <div className="flex flex-wrap gap-1">
                              {analysis.aiAnalysis.engagementInsights.recommendedHashtags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">📋 コンテンツ提案</h5>
                        <ul className="space-y-1">
                          {analysis.aiAnalysis.engagementInsights.contentSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'similar' && (
            <SimilarAccounts competitorUrl={competitorUrl} />
          )}

          {activeTab === 'timing' && (
            <BestPostingTimes competitorUrl={competitorUrl} />
          )}

          {activeTab === 'rewrite' && (
            <ContentRewrite originalContent={analysis.posts[0]?.content} />
          )}

          {activeTab === 'pdf' && (
            <PDFReport analysis={analysis} />
          )}
        </div>
      )}

      {/* 最近の分析履歴 */}
      {recentAnalyses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📚 最近の分析履歴</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAnalyses.slice(1).map((recentAnalysis) => (
              <div key={recentAnalysis.username} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setAnalysis(recentAnalysis)}>
                <h5 className="font-semibold text-gray-800">@{recentAnalysis.username}</h5>
                <p className="text-sm text-gray-600">{recentAnalysis.followers.toLocaleString()}フォロワー</p>
                <p className="text-sm text-purple-600 font-medium">{recentAnalysis.averageEngagement.toFixed(2)}% エンゲージメント</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadsCompetitorAnalysis; 