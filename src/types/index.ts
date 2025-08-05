// Instagram投稿データの型定義
export interface InstagramPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  hashtags: string[];
  timestamp: string;
  permalink?: string;
  engagement: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    reach: number;
    impressions: number;
  };
  performance: {
    engagementRate: number;
    saveRate: number;
    shareRate: number;
    reachRate: number;
  };
}

// アカウント分析データ
export interface AccountAnalytics {
  accountId: string;
  username: string;
  followers: number;
  following: number;
  totalPosts: number;
  averageEngagement: number;
  bestPerformingPosts: InstagramPost[];
  worstPerformingPosts: InstagramPost[];
  engagementTrend: {
    date: string;
    engagement: number;
  }[];
  timeAnalysis: {
    hour: number;
    averageEngagement: number;
    postCount: number;
  }[];
}

// アルゴリズム分析結果
export interface AlgorithmAnalysis {
  postId: string;
  score: number;
  recommendations: {
    type: 'timing' | 'content' | 'hashtag' | 'cta' | 'visual';
    priority: 'high' | 'medium' | 'low';
    message: string;
    suggestion?: string;
  }[];
  strengths: string[];
  weaknesses: string[];
}

// コンテンツ提案
export interface ContentSuggestion {
  id: string;
  type: 'reel' | 'post' | 'story';
  title: string;
  description: string;
  hashtags: string[];
  suggestedTime: string;
  estimatedEngagement: number;
  contentIdeas: string[];
  visualStyle: string;
}

// 投稿スケジュール
export interface PostSchedule {
  id: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  estimatedEngagement: number;
}

// 投稿スケジューラー用の型定義
export interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  datetime: string;
  image?: string;
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ハッシュタグ分析用の型定義
export interface HashtagAnalysis {
  tag: string;
  usageCount: number;
  averageEngagement: number;
  averageScore: number;
  posts: string[]; // 投稿IDの配列
  lastUsed: string;
}

export interface RecommendedHashtag {
  tag: string;
  category: string;
  description: string;
  estimatedEngagement: number;
}

// Instagram API認証
export interface InstagramAuth {
  accessToken: string;
  userId: string;
  expiresAt: string;
  permissions: string[];
  instagramBusinessAccountId?: string; // InstagramビジネスアカウントID
}

// Instagram Graph API関連の型定義
export interface InstagramBusinessAccount {
  id: string;
  username: string;
  media_count: number;
  page_id: string;
  page_name: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramInsight {
  name: string;
  period: string;
  values: {
    value: number;
    end_time: string;
  }[];
  title: string;
  description: string;
  id: string;
}

export interface InstagramAuthResponse {
  success: boolean;
  data: {
    access_token: string;
    instagram_business_account: InstagramBusinessAccount;
    recent_posts: InstagramMedia[];
    debug?: any;
  };
  error?: string;
}

export interface InstagramPostsResponse {
  success: boolean;
  data: InstagramMedia[];
  error?: string;
}

export interface InstagramInsightsResponse {
  success: boolean;
  data: InstagramInsight[];
  error?: string;
}

// キャプション生成の型定義
export interface CaptionGenerationRequest {
  genre: PostGenre;
  purpose: PostPurpose;
  targetAudience: TargetAudience;
  additionalContext?: string;
  userId?: string; // ユーザーID（必須）
}

export interface CaptionGenerationResponse {
  captions: CaptionOption[];
  hashtags: string[];
  estimatedEngagement: number;
  tips: string[];
  usage?: {
    current: number;
    limit: number;
  };
}

export interface CaptionOption {
  id: string;
  text: string;
  style: 'conversational' | 'professional' | 'casual' | 'inspirational';
  estimatedSaveRate: number;
  estimatedShareRate: number;
  wordCount: number;
}

// 投稿ジャンル
export type PostGenre = 
  | 'beauty' 
  | 'travel' 
  | 'lifestyle' 
  | 'food' 
  | 'fashion' 
  | 'fitness' 
  | 'business' 
  | 'education' 
  | 'entertainment' 
  | 'technology' 
  | 'health' 
  | 'other';

// 投稿目的
export type PostPurpose = 
  | 'save_focused' 
  | 'share_viral' 
  | 'comment_engagement' 
  | 'brand_awareness' 
  | 'lead_generation';

// ターゲット層
export type TargetAudience = 
  | 'young_women_20s' 
  | 'young_men_20s' 
  | 'business_professionals' 
  | 'parents' 
  | 'students' 
  | 'seniors' 
  | 'general';

// ユーザープラン
export interface UserPlan {
  type: 'free' | 'premium' | 'enterprise';
  captionGenerationLimit: number;
  captionGenerationUsed: number;
  imageGenerationLimit: number;
  imageGenerationUsed: number;
  expiresAt: string;
}

// アプリケーションの状態
export interface AppState {
  isAuthenticated: boolean;
  currentUser: InstagramAuth | null;
  accountAnalytics: AccountAnalytics | null;
  posts: InstagramPost[];
  analysis: AlgorithmAnalysis[];
  suggestions: ContentSuggestion[];
  schedule: PostSchedule[];
  userPlan: UserPlan | null;
  loading: boolean;
  error: string | null;
}

// APIレスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// フィルター設定
export interface FilterSettings {
  dateRange: {
    start: string;
    end: string;
  };
  mediaType: ('IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM')[];
  minEngagement: number;
  sortBy: 'date' | 'engagement' | 'saves' | 'shares';
  sortOrder: 'asc' | 'desc';
}

// エラーハンドリング用の型定義
export interface AppError {
  id: string;
  timestamp: string;
  location: string; // エラーが発生した場所（ファイル名:行番号）
  function: string; // エラーが発生した関数名
  type: 'API_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  stack?: string;
  userAction?: string; // ユーザーが実行していたアクション
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
}

// エラーコンテキスト
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  currentPage?: string;
  userAction?: string;
  apiEndpoint?: string;
  requestData?: any;
  responseData?: any;
  postId?: string;
  caption?: string;
  insights?: any;
  engagement?: any;
  userInfo?: any;
  postsCount?: number;
}

// エラーレポート
export interface ErrorReport {
  error: AppError;
  context: ErrorContext;
  browserInfo: {
    userAgent: string;
    url: string;
    timestamp: string;
  };
}

// 投稿時間分析用の型定義
export interface PostingTimeData {
  dayOfWeek: number; // 0-6 (日曜日-土曜日)
  hour: number; // 0-23
  engagementRate: number; // 0-1
  postCount: number;
}

export interface PostingTimeAnalysis {
  topTimes: PostingTimeData[];
  dayAverages: { day: number; average: number }[];
  hourAverages: { hour: number; average: number }[];
  overallAverage: number;
}

export interface PostingRecommendation {
  type: 'optimal_time' | 'best_day' | 'best_hour';
  priority: number;
  title: string;
  description: string;
  engagementRate: number;
  reasoning: string;
} 