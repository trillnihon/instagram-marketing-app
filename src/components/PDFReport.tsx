import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface AnalysisData {
  username: string;
  followers: number;
  averageEngagement: number;
  aiAnalysis?: {
    contentTone: { tone: string; confidence: number; keywords: string[]; };
    frequentWords: { [key: string]: number; };
    postingPattern: { bestTime: string; frequency: string; contentLength: string; hashtagUsage: string; };
    engagementInsights: { highEngagementTopics: string[]; lowEngagementTopics: string[]; recommendedHashtags: string[]; contentSuggestions: string[]; };
  };
}

interface PDFReportProps {
  analysis: AnalysisData | null;
}

const PDFReport: React.FC<PDFReportProps> = ({ analysis }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  
  const { currentUser } = useAppStore();

  const generatePDFReport = async () => {
    if (!analysis) {
      setError('分析データがありません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/threads/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis,
          userId: currentUser?.id || 'demo_user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPdfData(data.pdf);
        // 実際の実装ではPDFをダウンロード
        downloadPDF(data.pdf);
      } else {
        setError(data.error || 'PDFレポートの生成に失敗しました');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('PDFレポートツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (pdf: any) => {
    // 実際の実装ではPDFライブラリを使用してPDFを生成・ダウンロード
    // 現在はダミーのダウンロード処理
    const element = document.createElement('a');
    const file = new Blob([`Threads Analysis Report for @${analysis?.username}\n\nGenerated on: ${new Date().toLocaleString()}\n\nThis is a demo PDF report.`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = pdf.filename || `threads_analysis_${analysis?.username}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getOverallScore = () => {
    if (!analysis) return 0;
    const engagementScore = analysis.averageEngagement >= 5.0 ? 100 : 
                           analysis.averageEngagement >= 3.0 ? 85 : 
                           analysis.averageEngagement >= 2.0 ? 70 : 
                           analysis.averageEngagement >= 1.0 ? 50 : 30;
    return Math.round(engagementScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📄 PDFレポート出力</h3>
        <button
          onClick={generatePDFReport}
          disabled={loading || !analysis}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            loading || !analysis
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {loading ? '生成中...' : 'PDFレポートを生成'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* レポートプレビュー */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">📋 レポート内容プレビュー</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                {/* ヘッダー */}
                <div className="text-center border-b border-gray-300 pb-4">
                  <h2 className="text-xl font-bold text-gray-800">Threads分析レポート</h2>
                  <p className="text-sm text-gray-600">@{analysis.username}</p>
                  <p className="text-xs text-gray-500">生成日: {new Date().toLocaleDateString('ja-JP')}</p>
                </div>

                {/* 基本情報 */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">📊 基本情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">フォロワー数:</span>
                      <span className="ml-2">{analysis.followers.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">平均エンゲージメント:</span>
                      <span className="ml-2">{analysis.averageEngagement.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="font-medium">総合スコア:</span>
                      <span className={`ml-2 font-bold ${getScoreColor(getOverallScore())}`}>
                        {getOverallScore()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI分析結果 */}
                {analysis.aiAnalysis && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">🤖 AI分析結果</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">コンテンツトーン</h4>
                        <p className="text-sm text-gray-600">{analysis.aiAnalysis.contentTone.tone}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">投稿パターン</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>最適時間: {analysis.aiAnalysis.postingPattern.bestTime}</div>
                          <div>投稿頻度: {analysis.aiAnalysis.postingPattern.frequency}</div>
                          <div>コンテンツ長: {analysis.aiAnalysis.postingPattern.contentLength}</div>
                          <div>ハッシュタグ使用: {analysis.aiAnalysis.postingPattern.hashtagUsage}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">推奨ハッシュタグ</h4>
                        <div className="flex flex-wrap gap-1">
                          {analysis.aiAnalysis.engagementInsights.recommendedHashtags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 改善提案 */}
                {analysis.aiAnalysis && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">💡 改善提案</h3>
                    <ul className="space-y-1">
                      {analysis.aiAnalysis.engagementInsights.contentSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* フッター */}
                <div className="text-center border-t border-gray-300 pt-4">
                  <p className="text-xs text-gray-500">
                    このレポートはThreads分析ツールによって自動生成されました
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* レポート情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">📄 レポート情報</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ファイル名:</span>
                  <span className="font-medium">
                    threads_analysis_{analysis.username}_{new Date().toISOString().split('T')[0]}.pdf
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ページ数:</span>
                  <span className="font-medium">約3-4ページ</span>
                </div>
                <div className="flex justify-between">
                  <span>ファイルサイズ:</span>
                  <span className="font-medium">約2-3MB</span>
                </div>
                <div className="flex justify-between">
                  <span>形式:</span>
                  <span className="font-medium">PDF</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">📊 含まれる内容</h5>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 総合スコア・詳細スコア</li>
                <li>• トーン分析結果</li>
                <li>• 頻出語・ハッシュタグ分析</li>
                <li>• 改善提案・推奨事項</li>
                <li>• エンゲージメント統計</li>
                <li>• 投稿パターン分析</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!analysis && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500">分析データがありません</p>
          <p className="text-sm text-gray-400 mt-2">
            まずThreads分析を実行してからPDFレポートを生成してください
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">PDFレポートを生成中...</p>
        </div>
      )}

      {pdfData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            <p className="text-green-800">PDFレポートが正常に生成されました</p>
          </div>
          <p className="text-sm text-green-600 mt-1">
            ファイル名: {pdfData.filename}
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFReport; 