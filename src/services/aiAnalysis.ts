import axios from 'axios';

export interface AiAnalysisRequest {
  userId: string;
  caption: string;
  imagePrompt?: string;
  aiProvider?: 'openai' | 'google' | 'local';
  analysisType?: 'engagement' | 'reach' | 'brand' | 'hashtag' | 'timing';
  targetAudience?: string;
  industry?: string;
}

export interface AiAnalysisResult {
  score: number;
  reasons: string[];
  suggestions: string[];
  hashtagRecommendations?: string[];
  optimalPostingTime?: string;
  engagementPrediction?: number;
  reachPrediction?: number;
  brandAlignment?: number;
  competitorAnalysis?: {
    similarAccounts: string[];
    trendingHashtags: string[];
    contentThemes: string[];
  };
  [key: string]: any;
}

export interface AiProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isEnabled: boolean;
}

// キャッシュ設定
interface CacheConfig {
  ttl: number; // キャッシュの有効期限（ミリ秒）
  maxSize: number; // 最大キャッシュサイズ
}

const CACHE_CONFIG: CacheConfig = {
  ttl: 30 * 60 * 1000, // 30分
  maxSize: 100 // 最大100件
};

// キャッシュストレージ
class AnalysisCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  private generateKey(request: AiAnalysisRequest): string {
    return `${request.userId}_${request.caption}_${request.analysisType || 'default'}_${request.targetAudience || 'default'}_${request.industry || 'default'}_${request.aiProvider || 'default'}`;
  }

  get(request: AiAnalysisRequest): any | null {
    const key = this.generateKey(request);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.ttl) {
      console.log('📦 [CACHE] キャッシュから結果を取得:', key);
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key); // 期限切れのキャッシュを削除
    }
    
    return null;
  }

  set(request: AiAnalysisRequest, data: any): void {
    const key = this.generateKey(request);
    
    // キャッシュサイズ制限チェック
    if (this.cache.size >= CACHE_CONFIG.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    console.log('💾 [CACHE] 結果をキャッシュに保存:', key);
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ [CACHE] キャッシュをクリアしました');
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: ヒット率の計算を実装
    };
  }
}

// グローバルキャッシュインスタンス
const analysisCache = new AnalysisCache();

// AIプロバイダー設定
export const AI_PROVIDERS: Record<string, AiProviderConfig> = {
  openai: {
    name: 'OpenAI GPT-4',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    isEnabled: true
  },
  google: {
    name: 'Google Gemini',
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    model: 'gemini-pro',
    maxTokens: 2000,
    temperature: 0.7,
    isEnabled: true
  },
  local: {
    name: 'Local AI',
    apiKey: '',
    model: 'local-model',
    maxTokens: 1000,
    temperature: 0.5,
    isEnabled: false
  }
};

// テスト用モックデータ
const MOCK_ANALYSIS_RESULTS: Record<string, AiAnalysisResult> = {
  openai: {
    score: 85,
    reasons: [
      'キャプションが感情的に魅力的で、ユーザーの共感を呼び起こしている',
      'ハッシュタグの使用が適切で、検索可能性が高い',
      '質問形式のキャプションにより、コメント率が向上する可能性が高い'
    ],
    suggestions: [
      '画像との一貫性をさらに高める',
      '投稿時間を午前9-11時または午後7-9時に設定',
      'フォロワーとの対話を促進する質問を追加'
    ],
    hashtagRecommendations: ['#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び'],
    optimalPostingTime: '午前9:00-11:00',
    engagementPrediction: 78,
    reachPrediction: 1200,
    brandAlignment: 90
  },
  google: {
    score: 80,
    reasons: [
      'Googleの最新AI技術による高精度な分析',
      '多言語対応による幅広いユーザーへのアプローチ',
      'リアルタイムトレンドとの連携'
    ],
    suggestions: [
      '現在のトレンドを反映した内容に更新',
      '地域性を考慮したローカライゼーション',
      'SEO要素の強化'
    ],
    hashtagRecommendations: ['#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び'],
    optimalPostingTime: '午前8:00-10:00',
    engagementPrediction: 72,
    reachPrediction: 1000,
    brandAlignment: 85
  }
};

// テストモード判定
const isTestMode = () => {
  return import.meta.env.DEV || 
         import.meta.env.VITE_TEST_MODE === 'true' ||
         !import.meta.env.VITE_OPENAI_API_KEY;
};

// AI分析実行
export async function analyzePost(data: AiAnalysisRequest): Promise<AiAnalysisResult> {
  // Anthropicが指定された場合はエラーを返す
  if (data.aiProvider && typeof data.aiProvider === 'string' && data.aiProvider.includes('anthropic')) {
    throw new Error('Anthropic Claudeは現在利用できません。OpenAI GPT-4またはGoogle Geminiをご利用ください。');
  }

  // キャッシュチェック
  const cachedResult = analysisCache.get(data);
  if (cachedResult) {
    return cachedResult;
  }

  // テストモードの場合はモックデータを返す
  if (isTestMode()) {
    console.log('🧪 [TEST MODE] AI分析をモックデータで実行');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機でリアルな体験
    
    const provider = data.aiProvider || 'openai';
    const mockResult = MOCK_ANALYSIS_RESULTS[provider] || MOCK_ANALYSIS_RESULTS.openai;
    
    // 分析タイプに応じて結果を調整
    if (data.analysisType === 'hashtag') {
      mockResult.hashtagRecommendations = [
        '#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び',
        '#朝活', '#コーヒー', '#ルーティン', '#新しい一日', '#感謝'
      ];
    } else if (data.analysisType === 'timing') {
      mockResult.optimalPostingTime = '午前9:00-11:00、午後7:00-9:00';
    }
    
    // 結果をキャッシュに保存
    analysisCache.set(data, mockResult);
    
    return mockResult;
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com';
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai/analyze`, {
      ...data,
      aiProvider: data.aiProvider || 'openai',
      analysisType: data.analysisType || 'engagement'
    });
    
    if (response.data && response.data.success) {
      const result = response.data.data;
      
      // 結果をキャッシュに保存
      analysisCache.set(data, result);
      
      return result;
    } else {
      throw new Error(response.data?.error || 'AI分析APIエラー');
    }
  } catch (error) {
    console.error('AI分析エラー:', error);
    
    // エラーハンドリングの改善
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('API利用制限に達しました。しばらく時間をおいてから再試行してください。');
      } else if (error.response?.status === 401) {
        throw new Error('APIキーが無効です。設定を確認してください。');
      } else if (error.response?.status === 500) {
        throw new Error('サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。');
      }
    }
    
    throw new Error('AI分析中にエラーが発生しました');
  }
}

// 複数のAIプロバイダーで分析実行（比較分析）
export async function analyzePostWithMultipleProviders(
  data: AiAnalysisRequest,
  providers: string[] = ['openai']
): Promise<Record<string, AiAnalysisResult>> {
  const results: Record<string, AiAnalysisResult> = {};
  
  for (const provider of providers) {
    if (AI_PROVIDERS[provider]?.isEnabled) {
      try {
        const result = await analyzePost({
          ...data,
          aiProvider: provider as any
        });
        results[provider] = result;
      } catch (error) {
        console.warn(`${provider}での分析に失敗:`, error);
        results[provider] = {
          score: 0,
          reasons: [`${provider}での分析に失敗しました`],
          suggestions: ['別のAIプロバイダーを試してください']
        };
      }
    }
  }
  
  return results;
}

// ハッシュタグ分析
export async function analyzeHashtags(
  caption: string,
  industry: string = 'general'
): Promise<{
  recommended: string[];
  trending: string[];
  industrySpecific: string[];
  engagement: Record<string, number>;
}> {
  // キャッシュチェック用のリクエストオブジェクト
  const cacheRequest: AiAnalysisRequest = {
    userId: 'cache_check',
    caption,
    analysisType: 'hashtag',
    industry
  };
  
  // キャッシュチェック
  const cachedResult = analysisCache.get(cacheRequest);
  if (cachedResult) {
    return cachedResult;
  }

  // テストモードの場合はモックデータを返す
  if (isTestMode()) {
    console.log('🧪 [TEST MODE] ハッシュタグ分析をモックデータで実行');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const industryHashtags: Record<string, string[]> = {
      fashion: ['#ファッション', '#スタイル', '#トレンド', '#コーデ', '#おしゃれ'],
      beauty: ['#ビューティー', '#メイク', '#スキンケア', '#美容', '#コスメ'],
      food: ['#フード', '#グルメ', '#料理', '#レシピ', '#美味しい'],
      travel: ['#トラベル', '#旅行', '#観光', '#旅', '#アドベンチャー'],
      fitness: ['#フィットネス', '#運動', '#健康', '#トレーニング', '#ダイエット'],
      business: ['#ビジネス', '#仕事', '#キャリア', '#起業', '#成功'],
      technology: ['#テクノロジー', '#IT', '#プログラミング', '#AI', '#イノベーション'],
      lifestyle: ['#ライフスタイル', '#生活', '#日常', '#暮らし', '#シンプルライフ'],
      entertainment: ['#エンターテイメント', '#映画', '#音楽', '#アート', '#クリエイティブ'],
      general: ['#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び']
    };
    
    const result = {
      recommended: ['#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び'],
      trending: ['#朝活', '#コーヒー', '#ルーティン', '#新しい一日', '#感謝'],
      industrySpecific: industryHashtags[industry] || industryHashtags.general,
      engagement: {
        '#ライフスタイル': 85,
        '#日常': 78,
        '#発見': 92,
        '#幸せ': 88,
        '#学び': 76,
        '#朝活': 95,
        '#コーヒー': 82,
        '#ルーティン': 70,
        '#新しい一日': 89,
        '#感謝': 91
      }
    };
    
    // 結果をキャッシュに保存
    analysisCache.set(cacheRequest, result);
    
    return result;
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com';
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai/analyze-hashtags`, {
      caption,
      industry
    });
    
    if (response.data && response.data.success) {
      const result = response.data.data;
      
      // 結果をキャッシュに保存
      analysisCache.set(cacheRequest, result);
      
      return result;
    } else {
      throw new Error(response.data?.error || 'ハッシュタグ分析APIエラー');
    }
  } catch (error) {
    console.error('ハッシュタグ分析エラー:', error);
    throw new Error('ハッシュタグ分析中にエラーが発生しました');
  }
}

// 投稿時間最適化分析
export async function analyzeOptimalPostingTime(
  targetAudience: string,
  industry: string,
  timezone: string = 'Asia/Tokyo'
): Promise<{
  bestTimes: Array<{ day: string; time: string; engagement: number }>;
  timezone: string;
  recommendations: string[];
}> {
  // キャッシュチェック用のリクエストオブジェクト
  const cacheRequest: AiAnalysisRequest = {
    userId: 'cache_check',
    caption: 'posting_time_analysis',
    analysisType: 'timing',
    targetAudience,
    industry
  };
  
  // キャッシュチェック
  const cachedResult = analysisCache.get(cacheRequest);
  if (cachedResult) {
    return cachedResult;
  }

  // テストモードの場合はモックデータを返す
  if (isTestMode()) {
    console.log('🧪 [TEST MODE] 投稿時間分析をモックデータで実行');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const audienceTimes: Record<string, Array<{ day: string; time: string; engagement: number }>> = {
      teens: [
        { day: '月曜日', time: '19:00-21:00', engagement: 95 },
        { day: '水曜日', time: '18:00-20:00', engagement: 88 },
        { day: '金曜日', time: '20:00-22:00', engagement: 92 }
      ],
      twenties: [
        { day: '火曜日', time: '9:00-11:00', engagement: 85 },
        { day: '木曜日', time: '19:00-21:00', engagement: 90 },
        { day: '土曜日', time: '10:00-12:00', engagement: 87 }
      ],
      thirties: [
        { day: '月曜日', time: '8:00-10:00', engagement: 82 },
        { day: '水曜日', time: '12:00-14:00', engagement: 78 },
        { day: '金曜日', time: '18:00-20:00', engagement: 85 }
      ],
      general: [
        { day: '火曜日', time: '9:00-11:00', engagement: 80 },
        { day: '木曜日', time: '19:00-21:00', engagement: 85 },
        { day: '土曜日', time: '10:00-12:00', engagement: 82 }
      ]
    };
    
    const result = {
      bestTimes: audienceTimes[targetAudience] || audienceTimes.general,
      timezone,
      recommendations: [
        '午前9-11時は通勤時間帯で、多くのユーザーがスマートフォンをチェックします',
        '午後7-9時は夕食後で、リラックスタイムに投稿をチェックするユーザーが多いです',
        '週末は平日より投稿への反応率が高い傾向があります',
        '業界に特化した投稿時間を設定することで、ターゲットオーディエンスの反応率が向上します'
      ]
    };
    
    // 結果をキャッシュに保存
    analysisCache.set(cacheRequest, result);
    
    return result;
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com';
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai/optimal-posting-time`, {
      targetAudience,
      industry,
      timezone
    });
    
    if (response.data && response.data.success) {
      const result = response.data.data;
      
      // 結果をキャッシュに保存
      analysisCache.set(cacheRequest, result);
      
      return result;
    } else {
      throw new Error(response.data?.error || '投稿時間分析APIエラー');
    }
  } catch (error) {
    console.error('投稿時間分析エラー:', error);
    throw new Error('投稿時間分析中にエラーが発生しました');
  }
}

// AIプロバイダーの設定更新
export function updateAiProviderConfig(
  provider: string,
  config: Partial<AiProviderConfig>
): void {
  if (AI_PROVIDERS[provider]) {
    AI_PROVIDERS[provider] = { ...AI_PROVIDERS[provider], ...config };
    
    // 設定をlocalStorageに保存
    localStorage.setItem('ai-provider-config', JSON.stringify(AI_PROVIDERS));
  }
}

// AIプロバイダーの設定読み込み
export function loadAiProviderConfig(): void {
  const savedConfig = localStorage.getItem('ai-provider-config');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      Object.assign(AI_PROVIDERS, config);
    } catch (error) {
      console.error('AIプロバイダー設定の読み込みに失敗:', error);
    }
  }
}

// キャッシュ管理関数
export function clearAnalysisCache(): void {
  analysisCache.clear();
}

export function getCacheStats(): { size: number; hitRate: number } {
  return analysisCache.getStats();
}

// 初期設定の読み込み
loadAiProviderConfig(); 