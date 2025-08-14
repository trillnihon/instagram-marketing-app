import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    index: true,
    enum: ['ig_long_lived', 'fb_long_lived', 'ig_short_lived', 'fb_short_lived']
  },
  token: { 
    type: String, 
    required: true 
  },
  expireAt: { 
    type: Date, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// 有効期限インデックス
tokenSchema.index({ expireAt: 1 });

// トークンタイプと有効期限で複合インデックス
tokenSchema.index({ type: 1, expireAt: 1 });

// 有効なトークンを取得する静的メソッド
tokenSchema.statics.getValidToken = async function(type) {
  const now = new Date();
  return await this.findOne({
    type: type,
    expireAt: { $gt: now }
  }).sort({ updatedAt: -1 });
};

// トークンの有効性をチェックするメソッド
tokenSchema.methods.isValid = function() {
  return this.expireAt > new Date();
};

// トークンの残り有効期間を取得するメソッド
tokenSchema.methods.getRemainingTime = function() {
  const now = new Date();
  const diffMs = this.expireAt.getTime() - now.getTime();
  return Math.max(0, diffMs);
};

// トークンの残り日数を取得するメソッド
tokenSchema.methods.getRemainingDays = function() {
  const remainingMs = this.getRemainingTime();
  return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
};

export const Token = mongoose.model('Token', tokenSchema);
