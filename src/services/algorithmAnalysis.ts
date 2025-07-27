import { InstagramPost, AlgorithmAnalysis, ContentSuggestion } from '../types';

// コンテンツパターン分析の型定義
interface ContentPatterns {
  popularHashtags: Map<string, number>;
  bestTimes: Map<number, number>;
  contentTypes: Map<string, number>;
}

// 時間分析の型定義
interface TimeAnalysis {
  hour: number;
  averageEngagement: number;
  postCount: number;
}

// Instagramアルゴリズム分析サービス
export class AlgorithmAnalysisService {
  
  // 投稿のアルゴリズム分析
  analyzePost(post: InstagramPost): AlgorithmAnalysis {
    const score = this.calculateAlgorithmScore(post);
    const recommendations = this.generateRecommendations(post);
    const strengths = this.identifyStrengths(post);
    const weaknesses = this.identifyWeaknesses(post);

    return {
      postId: post.id,
      score,
      recommendations,
      strengths,
      weaknesses
    };
  }

  // アルゴリズムスコア計算（2025年版）
  private calculateAlgorithmScore(post: InstagramPost): number {
    let score = 0;
    const { engagement, performance } = post;

    // 1. 保存率（最重要指標）
    score += performance.saveRate * 10;
    
    // 2. 共有率
    score += performance.shareRate * 8;
    
    // 3. エンゲージメント率
    score += performance.engagementRate * 5;
    
    // 4. 視聴完了率（動画の場合）
    if (post.mediaType === 'VIDEO') {
      // 動画の場合は視聴完了率も考慮
      score += this.estimateVideoCompletionRate(post) * 3;
    }
    
    // 5. ハッシュタグ最適化
    score += this.analyzeHashtagOptimization(post.hashtags) * 2;
    
    // 6. 投稿時間最適化
    score += this.analyzePostingTime(post.timestamp) * 2;
    
    // 7. コンテンツ品質
    score += this.analyzeContentQuality(post) * 3;

    return Math.min(score, 100); // 最大100点
  }

  // 推奨事項生成
  private generateRecommendations(post: InstagramPost): AlgorithmAnalysis['recommendations'] {
    const recommendations: AlgorithmAnalysis['recommendations'] = [];

    // 保存率が低い場合
    if (post.performance.saveRate < 2) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        message: '保存率が低いです。より価値のある情報や実用的なコンテンツを提供しましょう。',
        suggestion: 'How-to、Tips、チェックリストなどの実用的なコンテンツを増やしてください。'
      });
    }

    // 共有率が低い場合
    if (post.performance.shareRate < 1) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        message: '共有率が低いです。より話題性のあるコンテンツを作成しましょう。',
        suggestion: 'トレンド、ニュース、感動的なストーリーなどを取り入れてください。'
      });
    }

    // ハッシュタグが少ない場合
    if (post.hashtags.length < 5) {
      recommendations.push({
        type: 'hashtag',
        priority: 'medium',
        message: 'ハッシュタグが不足しています。',
        suggestion: '5-10個の関連ハッシュタグを追加してください。'
      });
    }

    // 投稿時間の改善提案
    const timeAnalysis = this.analyzePostingTime(post.timestamp);
    if (timeAnalysis < 3) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        message: '投稿時間が最適化されていません。',
        suggestion: '午前9-11時、午後7-9時の投稿を試してください。'
      });
    }

    // CTA（行動喚起）の確認
    if (!this.hasCallToAction(post.caption || '')) {
      recommendations.push({
        type: 'cta',
        priority: 'medium',
        message: '行動喚起（CTA）が不足しています。',
        suggestion: '「保存してください」「友達にシェアしてください」などのCTAを追加してください。'
      });
    }

    return recommendations;
  }

  // 強みの特定
  private identifyStrengths(post: InstagramPost): string[] {
    const strengths: string[] = [];

    if (post.performance.saveRate > 5) {
      strengths.push('高い保存率を達成しています');
    }

    if (post.performance.shareRate > 2) {
      strengths.push('良い共有率を維持しています');
    }

    if (post.performance.engagementRate > 3) {
      strengths.push('エンゲージメント率が良好です');
    }

    if (post.hashtags.length >= 5 && post.hashtags.length <= 15) {
      strengths.push('ハッシュタグの使用量が適切です');
    }

    if (this.hasCallToAction(post.caption || '')) {
      strengths.push('効果的なCTAが含まれています');
    }

    return strengths;
  }

  // 弱みの特定
  private identifyWeaknesses(post: InstagramPost): string[] {
    const weaknesses: string[] = [];

    if (post.performance.saveRate < 2) {
      weaknesses.push('保存率が低い');
    }

    if (post.performance.shareRate < 1) {
      weaknesses.push('共有率が低い');
    }

    if (post.hashtags.length < 3) {
      weaknesses.push('ハッシュタグが不足している');
    }

    if (post.hashtags.length > 20) {
      weaknesses.push('ハッシュタグが多すぎる');
    }

    if (!this.hasCallToAction(post.caption || '')) {
      weaknesses.push('CTAが不足している');
    }

    return weaknesses;
  }

  // 動画完了率の推定
  private estimateVideoCompletionRate(post: InstagramPost): number {
    // 実際のAPIでは視聴完了率を取得できるが、ここでは推定
    const engagementRate = post.performance.engagementRate;
    return Math.min(engagementRate * 0.8, 100);
  }

  // ハッシュタグ最適化分析
  private analyzeHashtagOptimization(hashtags: string[]): number {
    if (hashtags.length === 0) return 0;
    if (hashtags.length < 3) return 2;
    if (hashtags.length >= 5 && hashtags.length <= 15) return 5;
    if (hashtags.length > 20) return 1;
    return 3;
  }

  // 投稿時間分析
  private analyzePostingTime(timestamp: string): number {
    const hour = new Date(timestamp).getHours();
    
    // 最適な投稿時間帯（日本時間）
    const optimalHours = [9, 10, 11, 19, 20, 21];
    const goodHours = [8, 12, 13, 18, 22];
    
    if (optimalHours.includes(hour)) return 5;
    if (goodHours.includes(hour)) return 3;
    return 1;
  }

  // コンテンツ品質分析
  private analyzeContentQuality(post: InstagramPost): number {
    let score = 0;
    
    // キャプションの長さ
    const captionLength = post.caption?.length || 0;
    if (captionLength >= 100 && captionLength <= 500) score += 2;
    else if (captionLength > 0) score += 1;
    
    // ハッシュタグの適切性
    score += this.analyzeHashtagOptimization(post.hashtags);
    
    // メディアタイプ
    if (post.mediaType === 'VIDEO') score += 1;
    if (post.mediaType === 'CAROUSEL_ALBUM') score += 1;
    
    return score;
  }

  // CTA（行動喚起）の確認
  private hasCallToAction(caption: string): boolean {
    const ctaKeywords = [
      '保存', 'シェア', 'フォロー', 'いいね', 'コメント',
      'save', 'share', 'follow', 'like', 'comment',
      'チェック', '見て', '試して', 'やってみて'
    ];
    
    return ctaKeywords.some(keyword => 
      caption.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // コンテンツ提案生成
  generateContentSuggestions(posts: InstagramPost[]): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];
    
    // 過去の投稿からパターンを分析
    const patterns = this.analyzeContentPatterns(posts);
    
    // 高エンゲージメント投稿の特徴を分析
    const topPosts = posts
      .sort((a, b) => (b.engagement.likes + b.engagement.comments) - (a.engagement.likes + a.engagement.comments))
      .slice(0, 5);
    
    // 提案を生成
    suggestions.push(
      this.createReelSuggestion(topPosts),
      this.createPostSuggestion(patterns),
      this.createStorySuggestion(topPosts)
    );
    
    return suggestions.filter(Boolean) as ContentSuggestion[];
  }

  // コンテンツパターン分析
  private analyzeContentPatterns(posts: InstagramPost[]): ContentPatterns {
    const patterns: ContentPatterns = {
      popularHashtags: new Map<string, number>(),
      bestTimes: new Map<number, number>(),
      contentTypes: new Map<string, number>()
    };
    
    posts.forEach(post => {
      // ハッシュタグ分析
      post.hashtags.forEach(tag => {
        const currentCount = patterns.popularHashtags.get(tag) || 0;
        patterns.popularHashtags.set(tag, currentCount + 1);
      });
      
      // 時間分析
      const hour = new Date(post.timestamp).getHours();
      const currentTimeCount = patterns.bestTimes.get(hour) || 0;
      patterns.bestTimes.set(hour, currentTimeCount + 1);
      
      // コンテンツタイプ分析
      const currentTypeCount = patterns.contentTypes.get(post.mediaType) || 0;
      patterns.contentTypes.set(post.mediaType, currentTypeCount + 1);
    });
    
    return patterns;
  }

  // Reels提案作成
  private createReelSuggestion(topPosts: InstagramPost[]): ContentSuggestion {
    const bestTime = this.findBestPostingTime(topPosts);
    
    return {
      id: `reel-${Date.now()}`,
      type: 'reel',
      title: 'トレンドを活用したReels作成',
      description: '人気の投稿パターンを分析したReelsコンテンツを提案します',
      hashtags: this.getTopHashtags(topPosts),
      suggestedTime: bestTime,
      estimatedEngagement: 85,
      contentIdeas: [
        'Behind the scenes（制作過程）',
        'Before/After 比較',
        'Tips & Tricks シリーズ',
        'Q&A 形式',
        'トレンドチャレンジ'
      ],
      visualStyle: '動的で魅力的な編集、音楽との同期'
    };
  }

  // 投稿提案作成
  private createPostSuggestion(patterns: ContentPatterns): ContentSuggestion {
    return {
      id: `post-${Date.now()}`,
      type: 'post',
      title: 'エンゲージメント向上投稿',
      description: '保存・共有を促進する実用的なコンテンツ',
      hashtags: Array.from(patterns.popularHashtags.keys()).slice(0, 10),
      suggestedTime: '09:00',
      estimatedEngagement: 75,
      contentIdeas: [
        'チェックリスト形式',
        'How-to ガイド',
        '統計・データの可視化',
        'ユーザー生成コンテンツ（UGC）',
        '季節・イベント関連'
      ],
      visualStyle: '清潔で読みやすいデザイン、ブランドカラーの活用'
    };
  }

  // ストーリー提案作成
  private createStorySuggestion(topPosts: InstagramPost[]): ContentSuggestion {
    return {
      id: `story-${Date.now()}`,
      type: 'story',
      title: 'インタラクティブストーリー',
      description: '投票や質問を活用したエンゲージメント向上ストーリー',
      hashtags: this.getTopHashtags(topPosts).slice(0, 5),
      suggestedTime: '19:00',
      estimatedEngagement: 90,
      contentIdeas: [
        '投票・アンケート',
        '質問ボックス活用',
        'スライダー機能',
        'カウントダウン',
        'スワイプアップ誘導'
      ],
      visualStyle: 'カラフルで動的な要素、インタラクティブ機能の活用'
    };
  }

  // 最適投稿時間の特定
  private findBestPostingTime(posts: InstagramPost[]): string {
    const timeAnalysis = new Map<number, number>();
    
    posts.forEach(post => {
      const hour = new Date(post.timestamp).getHours();
      const engagement = post.engagement.likes + post.engagement.comments;
      const currentEngagement = timeAnalysis.get(hour) || 0;
      timeAnalysis.set(hour, currentEngagement + engagement);
    });
    
    let bestHour = 9; // デフォルト
    let maxEngagement = 0;
    
    timeAnalysis.forEach((engagement, hour) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        bestHour = hour;
      }
    });
    
    return `${bestHour.toString().padStart(2, '0')}:00`;
  }

  // トップハッシュタグ取得
  private getTopHashtags(posts: InstagramPost[]): string[] {
    const hashtagCount = new Map<string, number>();
    
    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        const currentCount = hashtagCount.get(tag) || 0;
        hashtagCount.set(tag, currentCount + 1);
      });
    });
    
    return Array.from(hashtagCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([tag]) => tag);
  }
}

export const algorithmAnalysis = new AlgorithmAnalysisService(); 