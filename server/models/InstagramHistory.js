import mongoose from 'mongoose';

const instagramPostSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  media_type: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'STORY'],
    default: 'IMAGE'
  },
  media_url: {
    type: String,
    default: ''
  },
  thumbnail_url: {
    type: String,
    default: ''
  },
  permalink: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    required: true
  },
  like_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  },
  engagement_rate: {
    type: Number,
    default: 0
  },
  insights: {
    reach: Number,
    impressions: Number,
    saved: Number
  }
}, { _id: false });

const instagramHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  posts: {
    type: [instagramPostSchema],
    default: []
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  totalPosts: {
    type: Number,
    default: 0
  },
  averageEngagementRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// インデックスを追加
instagramHistorySchema.index({ userId: 1, fetchedAt: -1 });
instagramHistorySchema.index({ 'posts.timestamp': -1 });

// 仮想フィールド: 最新の投稿
instagramHistorySchema.virtual('latestPost').get(function() {
  if (this.posts && this.posts.length > 0) {
    return this.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }
  return null;
});

// 仮想フィールド: 投稿数
instagramHistorySchema.virtual('postCount').get(function() {
  return this.posts ? this.posts.length : 0;
});

// 統計情報を更新するメソッド
instagramHistorySchema.methods.updateStats = function() {
  if (this.posts && this.posts.length > 0) {
    this.totalPosts = this.posts.length;
    const totalEngagement = this.posts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0);
    this.averageEngagementRate = totalEngagement / this.posts.length;
  }
  this.lastUpdated = new Date();
  return this;
};

// 投稿を追加するメソッド
instagramHistorySchema.methods.addPost = function(post) {
  if (!this.posts) {
    this.posts = [];
  }
  
  // 既存の投稿をチェック（ID重複を防ぐ）
  const existingIndex = this.posts.findIndex(p => p.id === post.id);
  if (existingIndex >= 0) {
    // 既存の投稿を更新
    this.posts[existingIndex] = { ...this.posts[existingIndex], ...post };
  } else {
    // 新しい投稿を追加
    this.posts.push(post);
  }
  
  this.updateStats();
  return this;
};

// 複数の投稿を一括追加するメソッド
instagramHistorySchema.methods.addPosts = function(posts) {
  if (!Array.isArray(posts)) {
    return this;
  }
  
  posts.forEach(post => this.addPost(post));
  this.fetchedAt = new Date();
  return this;
};

// 静的メソッド: ユーザーIDで履歴を検索
instagramHistorySchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).sort({ fetchedAt: -1 });
};

// 静的メソッド: ユーザーIDで履歴を作成または更新
instagramHistorySchema.statics.createOrUpdate = async function(userId, posts) {
  let history = await this.findOne({ userId });
  
  if (!history) {
    history = new this({ userId, posts: [] });
  }
  
  history.addPosts(posts);
  return await history.save();
};

// 静的メソッド: 古い履歴を削除（30日以上前）
instagramHistorySchema.statics.cleanOldHistory = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return await this.deleteMany({ fetchedAt: { $lt: thirtyDaysAgo } });
};

const InstagramHistory = mongoose.model('InstagramHistory', instagramHistorySchema);

export { InstagramHistory };
