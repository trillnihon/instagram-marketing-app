import mongoose from 'mongoose';

// 投稿データスキーマ
const postSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  hashtags: [{ type: String }],
  likes: { type: Number, default: 0 },
  reposts: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  category: { type: String, enum: ['日常系', '教育系', '時事系', 'ビジネス系', 'ライフスタイル系', 'モチベーション系'] },
  postedAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ハッシュタグ統計スキーマ
const hashtagStatsSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  previousCount: { type: Number, default: 0 },
  growthRate: { type: Number, default: 0 },
  category: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

// フォロワー成長データスキーマ
const followerGrowthSchema = new mongoose.Schema({
  week: { type: String, required: true, unique: true },
  postCount: { type: Number, default: 0 },
  followerGrowth: { type: Number, default: 0 },
  correlation: { type: String, enum: ['positive', 'negative', 'neutral'] },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 分析結果スキーマ
const analysisResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  analysisType: { type: String, enum: ['trend_posts', 'hashtag_ranking', 'content_themes', 'follower_correlation'] },
  data: { type: mongoose.Schema.Types.Mixed },
  period: { type: String, default: '30days' },
  createdAt: { type: Date, default: Date.now }
});

export const Post = mongoose.model('Post', postSchema);
export const HashtagStats = mongoose.model('HashtagStats', hashtagStatsSchema);
export const FollowerGrowth = mongoose.model('FollowerGrowth', followerGrowthSchema);
export const AnalysisResult = mongoose.model('AnalysisResult', analysisResultSchema); 