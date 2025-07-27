import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export const generatePDF = async (element: HTMLElement, filename: string = 'report.pdf') => {
  try {
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as 'portrait' | 'landscape'
      }
    };

    await html2pdf().set(opt).from(element).save();
    return { success: true };
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return { success: false, error: error instanceof Error ? error.message : 'PDF生成に失敗しました' };
  }
};

interface PDFData {
  trendPosts: any[];
  hashtagRanking: any[];
  contentThemes: any[];
  followerCorrelation: any[];
  analysisDate: string;
  userId: string;
}

interface PDFGeneratorProps {
  data: PDFData;
  onGenerate?: (success: boolean) => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, onGenerate }) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    try {
      const element = pdfRef.current;
      const opt = {
        margin: 1,
        filename: `threads_analysis_${data.userId}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as 'portrait' | 'landscape' }
      };

      await html2pdf().set(opt).from(element).save();
      onGenerate?.(true);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      onGenerate?.(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getEngagementStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">📄 PDFレポート生成</h3>
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📥 PDFをダウンロード
        </button>
      </div>

      {/* PDFプレビュー（非表示） */}
      <div ref={pdfRef} className="hidden">
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          {/* ヘッダー */}
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
              🧵 Threads分析レポート
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              分析日: {formatDate(data.analysisDate)} | ユーザーID: {data.userId}
            </p>
          </div>

          {/* 総合サマリー */}
          <div style={{ marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
              📊 総合サマリー
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '12px' }}>
              <div>
                <strong>分析対象期間:</strong> 過去30日間<br />
                <strong>総投稿数:</strong> {data.trendPosts.length}件<br />
                <strong>平均エンゲージメント率:</strong> {
                  (data.trendPosts.reduce((sum, post) => sum + post.engagementScore, 0) / data.trendPosts.length).toFixed(1)
                }%
              </div>
              <div>
                <strong>急上昇ハッシュタグ:</strong> {data.hashtagRanking.length}件<br />
                <strong>コンテンツテーマ:</strong> {data.contentThemes.length}カテゴリ<br />
                <strong>分析完了日時:</strong> {formatDate(data.analysisDate)}
              </div>
            </div>
          </div>

          {/* トレンド投稿 */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              🔥 トレンド投稿 TOP 5
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f3f4' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>順位</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>投稿日</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>いいね数</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>エンゲージメント</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>キャプション</th>
                </tr>
              </thead>
              <tbody>
                {data.trendPosts.map((post, index) => (
                  <tr key={post.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatDate(post.date)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{post.likes.toLocaleString()}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {getEngagementStars(post.engagementScore)} ({post.engagementScore.toFixed(1)})
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {post.caption.length > 50 ? `${post.caption.substring(0, 50)}...` : post.caption}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ハッシュタグランキング */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              🏷️ 急上昇ハッシュタグ TOP 10
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f3f4' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>順位</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ハッシュタグ</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>使用回数</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>増加率</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>カテゴリ</th>
                </tr>
              </thead>
              <tbody>
                {data.hashtagRanking.map((tag, index) => (
                  <tr key={tag.tag}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tag.tag}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tag.usageCount}回</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>+{tag.growthRate.toFixed(1)}%</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tag.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* コンテンツテーマ分析 */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              📊 コンテンツテーマ別傾向
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f3f4' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>カテゴリ</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>平均エンゲージメント</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>投稿数</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>トレンド</th>
                </tr>
              </thead>
              <tbody>
                {data.contentThemes.map((theme) => (
                  <tr key={theme.category}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{theme.category}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{theme.averageEngagement}%</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{theme.postCount}件</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {theme.trend === 'up' ? '📈 上昇' : theme.trend === 'down' ? '📉 下降' : '➡️ 安定'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* フォロワー成長相関分析 */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              📈 投稿頻度 × フォロワー増加の相関
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f3f4' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>週</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>投稿数</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>フォロワー増加</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>相関</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>コメント</th>
                </tr>
              </thead>
              <tbody>
                {data.followerCorrelation.map((correlation, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{correlation.week}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{correlation.postCount}回</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>+{correlation.followerGrowth}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {correlation.correlation === 'positive' ? '📈 ポジティブ' : '📉 ネガティブ'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{correlation.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 改善提案 */}
          <div style={{ marginBottom: '30px', backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              💡 改善提案
            </h2>
            <ul style={{ fontSize: '12px', lineHeight: '1.6', color: '#333' }}>
              <li>• エンゲージメント率の高い投稿パターンを分析し、類似コンテンツの投稿頻度を増加</li>
              <li>• 急上昇ハッシュタグを戦略的に組み合わせて投稿効果を最大化</li>
              <li>• 週3-5回の一貫した投稿スケジュールを維持</li>
              <li>• フォロワーとの積極的な交流を促進</li>
              <li>• 定期的な分析結果の確認と戦略の調整</li>
            </ul>
          </div>

          {/* フッター */}
          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '10px', color: '#666' }}>
            <p>このレポートは自動生成されました。詳細な分析やカスタマイズされた戦略については、専門家にご相談ください。</p>
            <p>生成日時: {new Date().toLocaleString('ja-JP')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator; 