import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  ChartBarIcon, 
  LightBulbIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import PostingTimeHeatmap from '../components/PostingTimeHeatmap';
import { 
  PostingTimeData, 
  PostingTimeAnalysis, 
  PostingRecommendation 
} from '../types';
import { 
  fetchPostingTimeData, 
  analyzeOptimalPostingTimes, 
  generatePostingRecommendations,
  generateMockPostingTimeData 
} from '../services/postingTimeService';
import { useAppStore } from '../store/useAppStore';
import DemoTokenAlert from '../components/DemoTokenAlert';

const PostingTimeAnalysisPage: React.FC = () => {
  const { currentUser, isDemoToken } = useAppStore();
  const [postingTimeData, setPostingTimeData] = useState<PostingTimeData[]>([]);
  const [analysis, setAnalysis] = useState<PostingTimeAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<PostingRecommendation[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // デモユーザーの場合はAPIを呼ばずサンプルデータで表示
        if (isDemoToken()) {
          const mockData = generateMockPostingTimeData();
          setPostingTimeData(mockData);
          const analysisResult = analyzeOptimalPostingTimes(mockData);
          setAnalysis(analysisResult);
          setRecommendations(generatePostingRecommendations(mockData));
          setLoading(false);
          return;
        }
        
        // Instagram認証情報を取得（複数のソースから）
        let instagramBusinessAccountId = currentUser?.instagramBusinessAccountId;
        let accessToken = currentUser?.accessToken;
        
        // ローカルストレージからも取得を試行
        if (!instagramBusinessAccountId || !accessToken) {
          const instagramAuth = localStorage.getItem('instagram_auth');
          if (instagramAuth) {
            const authData = JSON.parse(instagramAuth);
            instagramBusinessAccountId = instagramBusinessAccountId || authData.instagramBusinessAccount?.id;
            accessToken = accessToken || authData.accessToken;
          }
        }
        
        if (!instagramBusinessAccountId || !accessToken) {
          // より詳細なエラーメッセージを提供
          const missingInfo = [];
          if (!instagramBusinessAccountId) missingInfo.push('Instagram Business Account ID');
          if (!accessToken) missingInfo.push('アクセストークン');
          
          throw new Error(`Instagram認証情報が不足しています: ${missingInfo.join(', ')}。Instagram連携を再度実行してください。`);
        }
        
        try {
          const data = await fetchPostingTimeData(
            instagramBusinessAccountId, 
            accessToken, 
            selectedPeriod
          );
          setPostingTimeData(data);
          
          // 分析実行
          const analysisResult = analyzeOptimalPostingTimes(data);
          setAnalysis(analysisResult);
          
          // 推奨事項生成
          const recommendationsResult = generatePostingRecommendations(data);
          setRecommendations(recommendationsResult);
        } catch (apiError: any) {
          // APIエラーの詳細な処理
          if (apiError.status === 404) {
            setError('バックエンドに履歴データが存在しません。初回利用か、まだ投稿データが保存されていません。');
          } else if (apiError.status >= 500) {
            setError('バックエンドサーバーエラーが発生しました。しばらくしてから再試行してください。');
          } else {
            setError('データの取得に失敗しました');
          }
          console.error('投稿時間分析APIエラー:', apiError);
        }
        
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error('投稿時間分析エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod, currentUser]);

  // 期間選択ハンドラー
  const handlePeriodChange = (period: 'week' | 'month' | 'quarter') => {
    setSelectedPeriod(period);
  };

  // 時間選択ハンドラー
  const handleTimeSelect = (dayOfWeek: number, hour: number) => {
    const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    const selectedTime = `${dayLabels[dayOfWeek]} ${hour.toString().padStart(2, '0')}:00`;
    
    // 選択された時間の詳細情報を表示（モーダルやトースト通知など）
    console.log(`選択された時間: ${selectedTime}`);
    
    // ここで投稿スケジューラーに時間を設定するなどの処理を追加
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">投稿時間データを分析中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          {/* デモトークン警告 */}
          <DemoTokenAlert 
            isVisible={isDemoToken()} 
            className="mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
                投稿時間分析
              </h1>
              <p className="mt-2 text-gray-600">
                エンゲージメント率に基づいて最適な投稿時間を分析します
              </p>
            </div>
            
            {/* 期間選択 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">分析期間:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as 'week' | 'month' | 'quarter')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">1週間</option>
                <option value="month">1ヶ月</option>
                <option value="quarter">3ヶ月</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ - ヒートマップ */}
          <div className="lg:col-span-2">
            <PostingTimeHeatmap
              data={postingTimeData}
              onTimeSelect={handleTimeSelect}
              className="mb-8"
            />
            
            {/* 統計サマリー */}
            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">平均エンゲージメント率</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(analysis.overallAverage * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">最適な曜日</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(() => {
                          const bestDay = analysis.dayAverages.reduce((best, current) => 
                            current.average > best.average ? current : best
                          );
                          const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
                          return dayLabels[bestDay.day];
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">最適な時間帯</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(() => {
                          const bestHour = analysis.hourAverages.reduce((best, current) => 
                            current.average > best.average ? current : best
                          );
                          return `${bestHour.hour.toString().padStart(2, '0')}:00`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー - 推奨事項 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                投稿時間推奨
              </h3>
              
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {recommendation.title}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {(recommendation.engagementRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {recommendation.description}
                    </p>
                    
                    <p className="text-xs text-gray-600">
                      {recommendation.reasoning}
                    </p>
                    
                    <button
                      onClick={() => {
                        // 投稿スケジューラーに時間を設定
                        console.log(`推奨時間を設定: ${recommendation.description}`);
                      }}
                      className="mt-3 w-full bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                    >
                      この時間に投稿予約
                    </button>
                  </div>
                ))}
              </div>
              
              {/* アクションボタン */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  投稿スケジューラーを開く
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingTimeAnalysisPage; 