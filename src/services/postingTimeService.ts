import { PostingTimeData } from '../types';

// モックデータ生成
export const generateMockPostingTimeData = (): PostingTimeData[] => {
  const data: PostingTimeData[] = [];
  
  // 各曜日・時間帯のデータを生成
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour += 3) {
      // 平日の朝（9-12時）と夜（18-21時）に高いエンゲージメント率
      let baseEngagement = 0.02; // 基本エンゲージメント率
      
      if (day >= 1 && day <= 5) { // 平日
        if (hour >= 9 && hour <= 12) {
          baseEngagement = 0.08; // 朝の時間帯
        } else if (hour >= 18 && hour <= 21) {
          baseEngagement = 0.12; // 夜の時間帯
        }
      } else { // 週末
        if (hour >= 10 && hour <= 15) {
          baseEngagement = 0.10; // 週末の昼間
        } else if (hour >= 19 && hour <= 22) {
          baseEngagement = 0.09; // 週末の夜
        }
      }
      
      // ランダムな変動を追加
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2の範囲
      const engagementRate = Math.min(baseEngagement * randomFactor, 0.15);
      
      // 投稿数もランダムに生成
      const postCount = Math.floor(Math.random() * 5) + 1;
      
      data.push({
        dayOfWeek: day,
        hour: hour,
        engagementRate: engagementRate,
        postCount: postCount
      });
    }
  }
  
  return data;
};

// APIから投稿時間データを取得
export const fetchPostingTimeData = async (
  userId: string,
  accessToken: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<PostingTimeData[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/instagram/posting-times/${userId}?period=${period}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('投稿時間データの取得に失敗しました');
    }
    
    const data = await response.json();
    return data.postingTimes || [];
  } catch (error) {
    console.warn('API接続エラー、モックデータを使用:', error);
    // API接続エラー時はモックデータを返す
    return generateMockPostingTimeData();
  }
};

// 最適投稿時間を分析
export const analyzeOptimalPostingTimes = (data: PostingTimeData[]) => {
  if (data.length === 0) return null;
  
  // エンゲージメント率でソート
  const sortedData = [...data].sort((a, b) => b.engagementRate - a.engagementRate);
  
  // 上位3つの時間帯を取得
  const topTimes = sortedData.slice(0, 3);
  
  // 曜日別の平均エンゲージメント率を計算
  const dayAverages = Array.from({ length: 7 }, (_, day) => {
    const dayData = data.filter(d => d.dayOfWeek === day);
    if (dayData.length === 0) return { day, average: 0 };
    
    const average = dayData.reduce((sum, d) => sum + d.engagementRate, 0) / dayData.length;
    return { day, average };
  });
  
  // 時間帯別の平均エンゲージメント率を計算
  const hourAverages = Array.from({ length: 8 }, (_, i) => {
    const hour = i * 3;
    const hourData = data.filter(d => d.hour === hour);
    if (hourData.length === 0) return { hour, average: 0 };
    
    const average = hourData.reduce((sum, d) => sum + d.engagementRate, 0) / hourData.length;
    return { hour, average };
  });
  
  return {
    topTimes,
    dayAverages,
    hourAverages,
    overallAverage: data.reduce((sum, d) => sum + d.engagementRate, 0) / data.length
  };
};

// 投稿時間推奨を生成
export const generatePostingRecommendations = (data: PostingTimeData[]) => {
  const analysis = analyzeOptimalPostingTimes(data);
  if (!analysis) return [];
  
  const recommendations = [];
  
  // 最適な投稿時間の推奨
  analysis.topTimes.forEach((time, index) => {
    const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    recommendations.push({
      type: 'optimal_time' as const,
      priority: index + 1,
      title: `最適投稿時間 ${index + 1}`,
      description: `${dayLabels[time.dayOfWeek]} ${time.hour.toString().padStart(2, '0')}:00`,
      engagementRate: time.engagementRate,
      reasoning: `エンゲージメント率 ${(time.engagementRate * 100).toFixed(1)}% で最も高い時間帯です`
    });
  });
  
  // 曜日別推奨
  const bestDay = analysis.dayAverages.reduce((best, current) => 
    current.average > best.average ? current : best
  );
  
  if (bestDay.average > 0) {
    const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    recommendations.push({
      type: 'best_day' as const,
      priority: 4,
      title: '最適な投稿曜日',
      description: `${dayLabels[bestDay.day]}曜日`,
      engagementRate: bestDay.average,
      reasoning: `平均エンゲージメント率 ${(bestDay.average * 100).toFixed(1)}% で最も高い曜日です`
    });
  }
  
  // 時間帯別推奨
  const bestHour = analysis.hourAverages.reduce((best, current) => 
    current.average > best.average ? current : best
  );
  
  if (bestHour.average > 0) {
    recommendations.push({
      type: 'best_hour' as const,
      priority: 5,
      title: '最適な投稿時間帯',
      description: `${bestHour.hour.toString().padStart(2, '0')}:00`,
      engagementRate: bestHour.average,
      reasoning: `平均エンゲージメント率 ${(bestHour.average * 100).toFixed(1)}% で最も高い時間帯です`
    });
  }
  
  return recommendations.sort((a, b) => a.priority - b.priority);
}; 