import mongoose from 'mongoose';

const analysisHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  analysisType: {
    type: String,
    required: true,
    enum: ['instagram_post', 'threads_post', 'url_analysis', 'hashtag_analysis', 'account_analytics', 'content_suggestion'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  postData: {
    // 投稿の基本情報
    postId: String,
    caption: String,
    hashtags: [String],
    mediaType: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'TEXT']
    },
    mediaUrl: String,
    timestamp: Date,
    // エンゲージメントデータ
    engagement: {
      likes: Number,
      comments: Number,
      saves: Number,
      shares: Number,
      reach: Number,
      impressions: Number
    },
    // パフォーマンス指標
    performance: {
      engagementRate: Number,
      saveRate: Number,
      shareRate: Number,
      reachRate: Number
    }
  },
  engagementScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  algorithmFactors: {
    // アルゴリズム要因
    initialVelocity: {
      type: Number,
      description: '初速（投稿後1時間のエンゲージメント）'
    },
    shareRate: {
      type: Number,
      description: 'シェア率'
    },
    saveRate: {
      type: Number,
      description: '保存率'
    },
    commentQuality: {
      type: Number,
      description: 'コメント品質スコア'
    },
    hashtagEffectiveness: {
      type: Number,
      description: 'ハッシュタグ効果'
    },
    timingScore: {
      type: Number,
      description: '投稿タイミングスコア'
    },
    contentRelevance: {
      type: Number,
      description: 'コンテンツ関連性'
    },
    audienceMatch: {
      type: Number,
      description: 'オーディエンスマッチ度'
    }
  },
  feedback: {
    type: String,
    required: true,
    description: '改善案・戦略提案'
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['content', 'hashtag', 'timing', 'audience', 'format']
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    message: String,
    suggestion: String
  }],
  strengths: [String],
  weaknesses: [String],
  exportedToPDF: {
    type: Boolean,
    default: false
  },
  metadata: {
    // 追加のメタデータ
    platform: {
      type: String,
      enum: ['instagram', 'threads', 'facebook', 'tiktok'],
      default: 'instagram'
    },
    analysisVersion: {
      type: String,
      default: '1.0'
    },
    processingTime: Number, // 分析にかかった時間（ミリ秒）
    aiModel: String, // 使用したAIモデル
    confidence: Number // 分析の信頼度（0-1）
  }
}, {
  timestamps: true
});

// インデックスを追加してクエリパフォーマンスを向上
analysisHistorySchema.index({ userId: 1, createdAt: -1 });
analysisHistorySchema.index({ userId: 1, analysisType: 1, createdAt: -1 });
analysisHistorySchema.index({ userId: 1, engagementScore: -1 });

// 仮想フィールド：総合スコア
analysisHistorySchema.virtual('overallScore').get(function() {
  const factors = this.algorithmFactors;
  if (!factors) return this.engagementScore;
  
  const scores = [
    factors.initialVelocity || 0,
    factors.shareRate || 0,
    factors.saveRate || 0,
    factors.commentQuality || 0,
    factors.hashtagEffectiveness || 0,
    factors.timingScore || 0,
    factors.contentRelevance || 0,
    factors.audienceMatch || 0
  ];
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
});

// インスタンスメソッド：PDFエクスポート状態を更新
analysisHistorySchema.methods.markAsExported = function() {
  this.exportedToPDF = true;
  return this.save();
};

// スタティックメソッド：ユーザーの分析履歴を取得
analysisHistorySchema.statics.getUserHistory = function(userId, options = {}) {
  const {
    analysisType,
    limit = 50,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  const query = { userId };
  if (analysisType) {
    query.analysisType = analysisType;
  }
  
  return this.find(query)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username email profile.displayName');
};

// スタティックメソッド：ユーザーの統計情報を取得
analysisHistorySchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        averageScore: { $avg: '$engagementScore' },
        bestScore: { $max: '$engagementScore' },
        worstScore: { $min: '$engagementScore' },
        analysisTypes: { $addToSet: '$analysisType' },
        totalExported: { $sum: { $cond: ['$exportedToPDF', 1, 0] } }
      }
    }
  ]);
};

// スタティックメソッド：分析タイプ別の統計
analysisHistorySchema.statics.getAnalysisTypeStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$analysisType',
        count: { $sum: 1 },
        averageScore: { $avg: '$engagementScore' },
        bestScore: { $max: '$engagementScore' },
        lastAnalysis: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

export const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema); 