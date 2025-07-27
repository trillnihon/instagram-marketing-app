import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // OAuthユーザーの場合はパスワード不要
      return !this.oauthProvider;
    },
    minlength: 6
  },
  oauthProvider: {
    type: String,
    enum: ['instagram', 'facebook', null],
    default: null
  },
  oauthId: {
    type: String,
    default: null
  },
  instagramAccessToken: {
    type: String,
    default: null
  },
  instagramUserId: {
    type: String,
    default: null
  },
  profile: {
    displayName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    bio: {
      type: String,
      maxlength: 200
    },
    avatar: {
      type: String,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'ja'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// パスワードハッシュ化（保存前）
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// パスワード検証メソッド
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// パブリックプロフィール取得メソッド
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    profile: this.profile,
    isAdmin: this.isAdmin,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

// OAuthユーザー作成メソッド
userSchema.statics.findOrCreateOAuthUser = async function(oauthData) {
  const { provider, oauthId, email, username, accessToken, instagramUserId } = oauthData;
  
  // 既存のOAuthユーザーを検索
  let user = await this.findOne({
    oauthProvider: provider,
    oauthId: oauthId
  });
  
  if (!user) {
    // 新しいOAuthユーザーを作成
    user = new this({
      username: username || `user_${oauthId}`,
      email: email,
      oauthProvider: provider,
      oauthId: oauthId,
      instagramAccessToken: accessToken,
      instagramUserId: instagramUserId,
      profile: {
        displayName: username || `User ${oauthId}`
      }
    });
    
    await user.save();
  } else {
    // 既存ユーザーの情報を更新
    user.instagramAccessToken = accessToken;
    user.instagramUserId = instagramUserId;
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
  }
  
  return user;
};

export const User = mongoose.model('User', userSchema); 