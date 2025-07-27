// Instagram投稿のメトリクス型定義
export interface PostMetrics {
  saves: number;
  shares: number;
  engagementRate: number; // ％
  hashtagCount: number;
  isOptimalTime: boolean;
  contentQualityScore: number; // 1〜5で評価
  videoCompletionRate?: number; // 動画の場合の視聴完了率
  captionLength: number;
  hasCallToAction: boolean;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

// アルゴリズムスコア計算（2025年版Instagram）
export function calculateAlgorithmScore(metrics: PostMetrics): number {
  let score = 0;

  // 1. 保存率（最重要指標）- 最大40点
  const saveScore = Math.min(metrics.saves * 10, 40);
  score += saveScore;

  // 2. 共有率（重要指標）- 最大32点
  const shareScore = Math.min(metrics.shares * 8, 32);
  score += shareScore;

  // 3. エンゲージメント率 - 最大15点
  const engagementScore = Math.min(metrics.engagementRate * 0.3, 15);
  score += engagementScore;

  // 4. ハッシュタグ最適化 - 最大6点
  const hashtagScore = Math.min(Math.min(metrics.hashtagCount, 15) * 0.4, 6);
  score += hashtagScore;

  // 5. 投稿時間最適化 - 2点
  if (metrics.isOptimalTime) {
    score += 2;
  }

  // 6. コンテンツ品質 - 最大15点
  const qualityScore = Math.min(metrics.contentQualityScore * 3, 15);
  score += qualityScore;

  // 7. 動画完了率（動画の場合）- 最大10点
  if (metrics.mediaType === 'VIDEO' && metrics.videoCompletionRate) {
    const videoScore = Math.min(metrics.videoCompletionRate * 0.1, 10);
    score += videoScore;
  }

  // 8. キャプション品質ボーナス - 最大5点
  if (metrics.captionLength >= 100 && metrics.captionLength <= 500) {
    score += 3;
  } else if (metrics.captionLength > 0) {
    score += 1;
  }

  // 9. CTA（行動喚起）ボーナス - 2点
  if (metrics.hasCallToAction) {
    score += 2;
  }

  // 10. メディアタイプボーナス
  if (metrics.mediaType === 'VIDEO') {
    score += 1;
  } else if (metrics.mediaType === 'CAROUSEL_ALBUM') {
    score += 1;
  }

  return Math.min(Math.round(score), 100); // 最大100点、整数に丸める
}

// スコアレベル判定
export function getScoreLevel(score: number): {
  level: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor';
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      level: 'Excellent',
      color: 'text-green-600',
      description: 'アルゴリズムに最適化された投稿です！'
    };
  } else if (score >= 60) {
    return {
      level: 'Good',
      color: 'text-blue-600',
      description: '良好なパフォーマンスを示しています。'
    };
  } else if (score >= 40) {
    return {
      level: 'Average',
      color: 'text-yellow-600',
      description: '平均的なパフォーマンスです。改善の余地があります。'
    };
  } else if (score >= 20) {
    return {
      level: 'Poor',
      color: 'text-orange-600',
      description: '改善が必要です。推奨事項を確認してください。'
    };
  } else {
    return {
      level: 'Very Poor',
      color: 'text-red-600',
      description: '大幅な改善が必要です。'
    };
  }
}

// 改善提案の生成
export function generateImprovementSuggestions(metrics: PostMetrics): {
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}[] {
  const suggestions: {
    priority: 'high' | 'medium' | 'low';
    message: string;
    suggestion: string;
  }[] = [];

  // 保存率が低い場合
  if (metrics.saves < 2) {
    suggestions.push({
      priority: 'high',
      message: '保存率が低いです',
      suggestion: 'より実用的で価値のあるコンテンツを作成してください。How-to、Tips、チェックリストなどが効果的です。'
    });
  }

  // 共有率が低い場合
  if (metrics.shares < 1) {
    suggestions.push({
      priority: 'high',
      message: '共有率が低いです',
      suggestion: 'より話題性のあるコンテンツや感動的なストーリーを提供してください。'
    });
  }

  // エンゲージメント率が低い場合
  if (metrics.engagementRate < 3) {
    suggestions.push({
      priority: 'high',
      message: 'エンゲージメント率が低いです',
      suggestion: 'フォロワーとの対話を促進する質問や投票を投稿に含めてください。'
    });
  }

  // ハッシュタグが少ない場合
  if (metrics.hashtagCount < 5) {
    suggestions.push({
      priority: 'medium',
      message: 'ハッシュタグが不足しています',
      suggestion: '5-10個の関連ハッシュタグを追加してください。'
    });
  }

  // ハッシュタグが多すぎる場合
  if (metrics.hashtagCount > 20) {
    suggestions.push({
      priority: 'medium',
      message: 'ハッシュタグが多すぎます',
      suggestion: 'ハッシュタグは15個以下に抑えてください。'
    });
  }

  // 投稿時間が最適でない場合
  if (!metrics.isOptimalTime) {
    suggestions.push({
      priority: 'medium',
      message: '投稿時間が最適化されていません',
      suggestion: '午前9-11時、午後7-9時の投稿を試してください。'
    });
  }

  // コンテンツ品質が低い場合
  if (metrics.contentQualityScore < 3) {
    suggestions.push({
      priority: 'medium',
      message: 'コンテンツ品質の向上が必要です',
      suggestion: 'より魅力的なビジュアルと価値のある情報を提供してください。'
    });
  }

  // CTAが不足している場合
  if (!metrics.hasCallToAction) {
    suggestions.push({
      priority: 'low',
      message: '行動喚起（CTA）が不足しています',
      suggestion: '「保存してください」「友達にシェアしてください」などのCTAを追加してください。'
    });
  }

  return suggestions;
}

// 最適投稿時間の判定
export function isOptimalPostingTime(timestamp: string): boolean {
  const hour = new Date(timestamp).getHours();
  
  // 日本時間での最適投稿時間帯
  const optimalHours = [9, 10, 11, 19, 20, 21];
  const goodHours = [8, 12, 13, 18, 22];
  
  return optimalHours.includes(hour) || goodHours.includes(hour);
}

// コンテンツ品質スコアの計算
export function calculateContentQualityScore(
  captionLength: number,
  hashtagCount: number,
  mediaType: string,
  hasCallToAction: boolean
): number {
  let score = 0;

  // キャプションの長さ
  if (captionLength >= 100 && captionLength <= 500) {
    score += 2;
  } else if (captionLength > 0) {
    score += 1;
  }

  // ハッシュタグの適切性
  if (hashtagCount >= 5 && hashtagCount <= 15) {
    score += 2;
  } else if (hashtagCount > 0) {
    score += 1;
  }

  // メディアタイプ
  if (mediaType === 'VIDEO') {
    score += 1;
  } else if (mediaType === 'CAROUSEL_ALBUM') {
    score += 1;
  }

  // CTAの有無
  if (hasCallToAction) {
    score += 1;
  }

  return Math.min(score, 5); // 最大5点
} 