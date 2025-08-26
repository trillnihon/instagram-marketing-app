import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface PostingTimes {
  [key: string]: {
    [key: string]: number;
  };
}

interface PostingInsights {
  bestDay: string;
  bestTime: string;
  bestEngagement: number;
  recommendations: string[];
}

interface BestPostingTimesProps {
  competitorUrl: string;
}

const BestPostingTimes: React.FC<BestPostingTimesProps> = ({ competitorUrl }) => {
  const [postingTimes, setPostingTimes] = useState<PostingTimes>({});
  const [insights, setInsights] = useState<PostingInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAppStore();

  const analyzePostingTimes = async () => {
    if (!competitorUrl.trim()) {
      setError('競合アカウントURLを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/threads/best-posting-times', {
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
        setPostingTimes(data.postingTimes);
        setInsights(data.insights);
      } else {
        setError(data.error || 'ベスト投稿時間の分析に失敗しました');
      }
    } catch (err) {
      console.error('Best posting times error:', err);
      setError('ベスト投稿時間ツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 5.0) return 'bg-red-500';
    if (engagement >= 4.0) return 'bg-orange-500';
    if (engagement >= 3.0) return 'bg-yellow-500';
    if (engagement >= 2.0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getEngagementIntensity = (engagement: number) => {
    if (engagement >= 5.0) return 'opacity-100';
    if (engagement >= 4.0) return 'opacity-90';
    if (engagement >= 3.0) return 'opacity-70';
    if (engagement >= 2.0) return 'opacity-50';
    return 'opacity-30';
  };

  const timeSlots = ['6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22'];
  const days = [
    { key: 'monday', label: '月' },
    { key: 'tuesday', label: '火' },
    { key: 'wednesday', label: '水' },
    { key: 'thursday', label: '木' },
    { key: 'friday', label: '金' },
    { key: 'saturday', label: '土' },
    { key: 'sunday', label: '日' }
  ];

  const getDayLabel = (dayKey: string) => {
    const day = days.find(d => d.key === dayKey);
    return day ? day.label : dayKey;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">⏰ ベスト投稿時間カレンダー</h3>
        <button
          onClick={analyzePostingTimes}
          disabled={loading || !competitorUrl.trim()}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            loading || !competitorUrl.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {loading ? '分析中...' : '投稿時間を分析'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {Object.keys(postingTimes).length > 0 && (
        <div className="space-y-6">
          {/* ヒートマップカレンダー */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">📅 エンゲージメント率ヒートマップ</h4>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* ヘッダー行 */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="w-16 h-8"></div> {/* 空のセル */}
                  {timeSlots.map((time) => (
                    <div key={time} className="w-16 h-8 flex items-center justify-center text-xs font-medium text-gray-600">
                      {time}
                    </div>
                  ))}
                </div>
                
                {/* データ行 */}
                {days.map((day) => (
                  <div key={day.key} className="grid grid-cols-8 gap-1 mb-1">
                    <div className="w-16 h-8 flex items-center justify-center text-sm font-medium text-gray-700">
                      {day.label}
                    </div>
                    {timeSlots.map((time) => {
                      const engagement = postingTimes[day.key]?.[time] || 0;
                      return (
                        <div
                          key={`${day.key}-${time}`}
                          className={`w-16 h-8 flex items-center justify-center text-xs text-white font-medium ${getEngagementColor(engagement)} ${getEngagementIntensity(engagement)}`}
                          title={`${day.label} ${time}: ${engagement.toFixed(1)}%`}
                        >
                          {engagement > 0 ? engagement.toFixed(1) : '-'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 凡例 */}
            <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-300"></div>
                <span>低</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-500 opacity-50"></div>
                <span>中</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-yellow-500 opacity-70"></div>
                <span>高</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-orange-500 opacity-90"></div>
                <span>最高</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-500"></div>
                <span>最適</span>
              </div>
            </div>
          </div>

          {/* 分析結果 */}
          {insights && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">💡 分析結果</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{getDayLabel(insights.bestDay)}</div>
                  <div className="text-xs text-gray-600">最適な曜日</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{insights.bestTime}</div>
                  <div className="text-xs text-gray-600">最適な時間帯</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{insights.bestEngagement.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">期待エンゲージメント</div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">📋 推奨事項</h5>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">📊 統計サマリー</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>平均エンゲージメント:</span>
                  <span className="font-medium">
                    {(Object.values(postingTimes).flatMap(day => Object.values(day)).reduce((a, b) => a + b, 0) / 
                      Object.values(postingTimes).flatMap(day => Object.values(day)).filter(v => v > 0).length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最高エンゲージメント:</span>
                  <span className="font-medium">
                    {Math.max(...Object.values(postingTimes).flatMap(day => Object.values(day))).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最低エンゲージメント:</span>
                  <span className="font-medium">
                    {Math.min(...Object.values(postingTimes).flatMap(day => Object.values(day)).filter(v => v > 0)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">🎯 最適化のヒント</h5>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 朝の時間帯（8-10時）が全体的に好調</li>
                <li>• 週末は夕方から夜にかけて投稿が効果的</li>
                <li>• 平日は朝の時間帯を重点的に活用</li>
                <li>• 金曜日の朝が最もエンゲージメントが高い</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {Object.keys(postingTimes).length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⏰</div>
          <p className="text-gray-500">ベスト投稿時間を分析してください</p>
          <p className="text-sm text-gray-400 mt-2">
            過去の投稿データから最適な投稿時間を分析します
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">投稿時間を分析中...</p>
        </div>
      )}
    </div>
  );
};

export default BestPostingTimes; 