# 📱 Instagram/Threads 投稿分析・AI提案アプリ

InstagramとThreadsの投稿を分析し、AIによる最適化提案を行うWebアプリケーションです。スマートフォンからも簡単にアクセスでき、投稿のエンゲージメント向上をサポートします。

## 🎯 主な機能

- **📊 投稿分析**: エンゲージメント率、最適投稿時間、ハッシュタグ効果を分析
- **🤖 AI投稿生成**: OpenAI APIを使用した最適化された投稿文の自動生成
- **📈 Threadsトレンド分析**: 人気投稿、ハッシュタグランキング、会話テーマを分析
- **💡 アルゴリズム対応アドバイス**: Instagram/Threads最新アルゴリズムに基づく改善提案
- **📋 分析履歴管理**: ユーザー別の分析結果保存とPDF出力
- **📧 メール認証**: SendGridを使用した安全な認証システム

## 📊 現在の開発状況（2025年7月28日）

### ✅ 完了済み機能
- **認証システム**: メールアドレス・パスワードログイン ✅ 本番動作確認済み
- **AI分析機能**: 投稿分析・改善提案
- **UI/UX**: Instagram風デザイン・レスポンシブ対応
- **分析履歴**: ユーザー別履歴管理
- **Threads分析**: トレンド分析・ランキング
- **PWA機能**: 実装済み（Service Worker削除により安定化）
- **セキュリティ**: HTTPS強制、JWT強度チェック、CORS設定
- **OAuth認証**: 本番対応済み（Facebook開発者コンソール設定完了）

### 🚀 本番デプロイ完了
- **フロントエンド**: Vercelデプロイ完了 ✅
  - URL: https://instagram-marketing-g8ujpngu8-trillnihons-projects.vercel.app
- **バックエンド**: Renderデプロイ完了 ✅
  - URL: https://instagram-marketing-backend-v2.onrender.com
- **データベース**: MongoDB Atlas接続確認済み ✅
- **環境変数**: 本番用設定完了 ✅

### 🎯 動作確認済み
- **ログイン機能**: デモ認証情報で正常動作確認済み
- **バックエンドAPI**: HTTP 200 OK応答確認済み
- **フロントエンド状態管理**: Zustand + useEffect監視実装済み
- **ページ遷移**: 認証成功後のダッシュボード遷移確認済み

### 🔧 技術的改善完了
- **Service Worker問題**: 完全削除により解決
- **ルーティング**: 修正完了（ルート→ダッシュボード、ログイン→ダッシュボード）
- **エラーハンドリング**: 強化済み
- **デバッグ機能**: 詳細ログ追加済み

## 🖥️ 画面構成図（UIフロー）

### 📱 メインフロー
```
📱 ランディングページ
    ↓
🔐 ログイン/登録
    ↓
🏠 ダッシュボード
    ↓
├── 📊 投稿分析
│   ├── キャプション入力
│   ├── AI分析実行
│   └── 結果表示・改善提案
├── 🤖 AI投稿生成
│   ├── キーワード・ターゲット設定
│   ├── プラットフォーム選択（Instagram/Threads）
│   └── 生成結果・編集
├── 📈 Threadsトレンド
│   ├── 人気投稿一覧
│   ├── ハッシュタグランキング
│   └── 会話テーマ分析
├── 📋 分析履歴
│   ├── 履歴一覧
│   ├── 詳細表示
│   └── PDF出力
└── ⚙️ 設定
    ├── プロフィール編集
    ├── プラン管理
    └── 通知設定
```

### 📄 ページ構成
- **ランディングページ**: アプリ紹介・機能説明
- **認証ページ**: ログイン・登録・パスワードリセット
- **ダッシュボード**: 機能選択・統計表示
- **投稿分析ページ**: キャプション分析・改善提案
- **AI投稿生成ページ**: キーワード入力・生成結果
- **Threadsトレンドページ**: トレンド分析・ランキング
- **履歴ページ**: 分析履歴・詳細表示
- **設定ページ**: ユーザー設定・プラン管理
- **管理者ページ**: ユーザー管理・システム設定

## 🤖 使用中のAIプロンプト例

### 📊 投稿分析プロンプト
```javascript
const analysisPrompt = `
以下のInstagram投稿のキャプションを分析し、スコア（0-100）、評価理由、改善提案を提供してください。

キャプション: "${caption}"

以下のJSON形式で回答してください：
{
  "score": 数値（0-100）,
  "reasons": ["評価理由1", "評価理由2"],
  "suggestions": ["改善提案1", "改善提案2"]
}
`;
```

### 🤖 AI投稿生成プロンプト
```javascript
const generationPrompt = `
以下の情報を基に、Instagram用の最適化された投稿文を生成してください：

キーワード: ${keywords}
ターゲット層: ${targetAudience}
ハッシュタグ候補: ${hashtagCandidates}
トーン: ${tone}

以下の要素を含めてください：
- 魅力的なキャプション（150文字以内）
- 適切なハッシュタグ（5-10個）
- CTA（行動喚起）
- エンゲージメントを促す質問
- 2025年のInstagramアルゴリズムに最適化

JSON形式で返してください：
{
  "caption": "投稿文",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2"],
  "cta": "CTA文",
  "engagement_question": "エンゲージメント質問",
  "optimization_tips": ["最適化のヒント1", "最適化のヒント2"]
}
`;
```

### 📈 マーケティングファネル分析プロンプト
```javascript
const funnelAnalysisPrompt = `
以下のInstagram投稿を分析し、マーケティングファネルの観点から評価してください。

【投稿内容】
キャプション: ${postData.caption}
ハッシュタグ: ${postData.hashtags.join(', ')}
ターゲット層: ${postData.targetAudience}
事業形態: ${postData.businessType}

【分析要求】
以下のJSON形式で結果を返してください：

{
  "scores": {
    "awareness": 0-100,
    "engagement": 0-100,
    "conversion": 0-100,
    "overall": 0-100
  },
  "feedback": {
    "positive": ["良い点1", "良い点2"],
    "improvements": ["改善点1", "改善点2"],
    "suggestions": ["提案1", "提案2"]
  },
  "hashtagAnalysis": {
    "recommended": ["推奨ハッシュタグ1", "推奨ハッシュタグ2"],
    "current": ["現在のハッシュタグ1", "現在のハッシュタグ2"],
    "score": 0-100
  },
  "marketingStage": "awareness|engagement|conversion"
}
`;
```

## 📁 主要なディレクトリ構成と役割

```
instagram-marketing-app/
├── 📱 フロントエンド (React + TypeScript)
│   ├── src/
│   │   ├── components/          # UIコンポーネント
│   │   │   ├── common/         # 共通コンポーネント
│   │   │   ├── forms/          # フォームコンポーネント
│   │   │   ├── charts/         # グラフ・チャート
│   │   │   └── layout/         # レイアウトコンポーネント
│   │   ├── pages/              # ページコンポーネント
│   │   │   ├── auth/           # 認証関連ページ
│   │   │   ├── dashboard/      # ダッシュボード
│   │   │   ├── analysis/       # 分析ページ
│   │   │   ├── generation/     # AI生成ページ
│   │   │   └── settings/       # 設定ページ
│   │   ├── services/           # API通信サービス
│   │   │   ├── authService.ts  # 認証API
│   │   │   ├── aiAnalysis.ts   # AI分析API
│   │   │   └── api.ts          # 共通API
│   │   ├── store/              # 状態管理 (Zustand)
│   │   │   └── useAppStore.ts  # アプリ状態管理
│   │   ├── types/              # TypeScript型定義
│   │   ├── utils/              # ユーティリティ関数
│   │   └── hooks/              # カスタムフック
│   ├── public/                 # 静的ファイル
│   ├── vercel.json             # Vercel設定
│   └── vite.config.ts          # Vite設定
├── 🖥️ バックエンド (Node.js + Express)
│   ├── server/
│   │   ├── config/             # 設定ファイル
│   │   │   ├── database.js     # データベース設定
│   │   │   └── settings.js     # アプリ設定
│   │   ├── middleware/         # ミドルウェア
│   │   │   ├── auth.js         # 認証ミドルウェア
│   │   │   ├── security.js     # セキュリティ設定
│   │   │   └── errorHandler.js # エラーハンドリング
│   │   ├── models/             # データモデル (Mongoose)
│   │   │   ├── User.js         # ユーザーモデル
│   │   │   ├── AnalysisHistory.js # 分析履歴モデル
│   │   │   └── ThreadsData.js  # Threadsデータモデル
│   │   ├── routes/             # APIルート
│   │   │   ├── auth.js         # 認証ルート
│   │   │   ├── ai.js           # AI分析ルート
│   │   │   └── analysis.js     # 分析履歴ルート
│   │   ├── services/           # ビジネスロジック
│   │   │   ├── aiPostGenerator.js # AI投稿生成
│   │   │   ├── analysisService.js # 分析サービス
│   │   │   └── emailService.js # メールサービス
│   │   ├── utils/              # ユーティリティ
│   │   │   ├── logger.js       # ログ機能
│   │   │   └── helpers.js      # ヘルパー関数
│   │   └── tests/              # テストファイル
│   ├── Dockerfile              # Docker設定
│   └── render.yaml             # Render設定
├── 📚 ドキュメント
│   ├── README.md               # プロジェクト説明書
│   ├── DEPLOYMENT.md           # デプロイ手順書
│   └── .github/workflows/      # CI/CD設定
└── 🔧 設定ファイル
    ├── .env.production.example # 本番環境変数テンプレート
    ├── .gitignore              # Git除外設定
    └── docker-compose.yml      # Docker Compose設定
```

## 🗄️ データベース構造（ER図）

### 📊 主要コレクション

#### 👤 Users（ユーザー）
```javascript
{
  _id: ObjectId,
  username: String,           // ユーザー名
  email: String,              // メールアドレス
  password: String,           // ハッシュ化パスワード
  oauthProvider: String,      // OAuthプロバイダー
  oauthId: String,            // OAuth ID
  instagramAccessToken: String, // Instagramアクセストークン
  instagramUserId: String,    // InstagramユーザーID
  profile: {
    displayName: String,      // 表示名
    bio: String,              // 自己紹介
    avatar: String            // アバター画像URL
  },
  isActive: Boolean,          // アクティブ状態
  isAdmin: Boolean,           // 管理者権限
  lastLogin: Date,            // 最終ログイン
  loginCount: Number,         // ログイン回数
  preferences: {
    theme: String,            // テーマ設定
    language: String,         // 言語設定
    notifications: {
      email: Boolean,         // メール通知
      push: Boolean           // プッシュ通知
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 📊 AnalysisHistory（分析履歴）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // ユーザーID（参照）
  analysisType: String,       // 分析タイプ
  createdAt: Date,            // 作成日時
  postData: {
    postId: String,           // 投稿ID
    caption: String,          // キャプション
    hashtags: [String],       // ハッシュタグ
    mediaType: String,        // メディアタイプ
    mediaUrl: String,         // メディアURL
    timestamp: Date,          // 投稿日時
    engagement: {
      likes: Number,          // いいね数
      comments: Number,       // コメント数
      saves: Number,          // 保存数
      shares: Number,         // シェア数
      reach: Number,          // リーチ数
      impressions: Number     // インプレッション数
    },
    performance: {
      engagementRate: Number, // エンゲージメント率
      saveRate: Number,       // 保存率
      shareRate: Number,      // シェア率
      reachRate: Number       // リーチ率
    }
  },
  engagementScore: Number,    // エンゲージメントスコア
  algorithmFactors: {
    initialVelocity: Number,  // 初速
    shareRate: Number,        // シェア率
    saveRate: Number,         // 保存率
    commentQuality: Number,   // コメント品質
    hashtagEffectiveness: Number, // ハッシュタグ効果
    timingScore: Number,      // タイミングスコア
    contentRelevance: Number, // コンテンツ関連性
    audienceMatch: Number     // オーディエンスマッチ度
  },
  feedback: String,           // フィードバック
  recommendations: [{
    type: String,             // 推奨タイプ
    priority: String,         // 優先度
    description: String,      // 説明
    actionItems: [String]     // アクション項目
  }],
  aiProvider: String,         // 使用AIプロバイダー
  processingTime: Number,     // 処理時間
  isExported: Boolean,        // PDF出力済みフラグ
  exportData: {
    exportedAt: Date,         // 出力日時
    exportFormat: String,     // 出力形式
    fileUrl: String           // ファイルURL
  }
}
```

#### 📈 ThreadsData（Threadsデータ）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // ユーザーID（参照）
  dataType: String,           // データタイプ
  collectedAt: Date,          // 収集日時
  trends: {
    popularPosts: [{
      postId: String,         // 投稿ID
      caption: String,        // キャプション
      engagement: Number,     // エンゲージメント
      hashtags: [String],     // ハッシュタグ
      timestamp: Date         // 投稿日時
    }],
    trendingHashtags: [{
      hashtag: String,        // ハッシュタグ
      frequency: Number,      // 使用頻度
      engagement: Number      // エンゲージメント
    }],
    conversationThemes: [{
      theme: String,          // テーマ
      frequency: Number,      // 頻度
      sentiment: String       // 感情分析
    }]
  },
  analytics: {
    postingTimes: [{
      hour: Number,           // 時間
      engagement: Number      // エンゲージメント
    }],
    contentTypes: [{
      type: String,           // コンテンツタイプ
      performance: Number     // パフォーマンス
    }]
  }
}
```

### 🔗 リレーションシップ
- **Users** → **AnalysisHistory** (1:N)
- **Users** → **ThreadsData** (1:N)
- **AnalysisHistory** → **ThreadsData** (N:1)

## 🚀 今後の開発予定リスト

### 📋 短期目標（1-2ヶ月）

#### 🔧 機能改善
- [ ] **PWA対応**
  - Service Worker実装
  - オフライン対応
  - プッシュ通知機能
  - ホーム画面追加

- [ ] **AI機能強化**
  - 画像分析機能追加
  - 複数AIプロバイダー対応（Claude、Gemini）
  - カスタムプロンプト機能
  - AI学習機能（ユーザーフィードバック）

- [ ] **分析機能拡張**
  - 競合分析機能
  - トレンド予測機能
  - 自動レポート生成
  - リアルタイム分析

#### 📱 UX/UI改善
- [ ] **モバイル最適化**
  - タッチジェスチャー対応
  - スワイプナビゲーション
  - モバイル専用機能

- [ ] **パフォーマンス向上**
  - 画像遅延読み込み
  - コード分割最適化
  - キャッシュ戦略改善

### 📈 中期目標（3-6ヶ月）

#### 💰 商用機能
- [ ] **課金システム**
  - Stripe統合完了
  - プラン管理機能
  - 使用量制限
  - 請求書生成

- [ ] **チーム機能**
  - チーム管理
  - 権限設定
  - 共同作業機能
  - 共有ワークスペース

#### 🔗 外部連携
- [ ] **SNS連携拡張**
  - Twitter/X連携
  - TikTok連携
  - YouTube連携
  - LinkedIn連携

- [ ] **API提供**
  - RESTful API
  - Webhook機能
  - サードパーティ連携
  - 開発者向けドキュメント

### 🎯 長期目標（6ヶ月以上）

#### 🤖 AI高度化
- [ ] **機械学習機能**
  - ユーザー行動分析
  - パーソナライゼーション
  - 予測分析
  - 自動最適化

- [ ] **コンテンツ生成**
  - 画像生成（DALL-E、Midjourney）
  - 動画生成
  - ストーリー生成
  - リール生成

#### 🌐 プラットフォーム拡張
- [ ] **マルチプラットフォーム**
  - Webアプリ
  - iOSアプリ
  - Androidアプリ
  - デスクトップアプリ

- [ ] **エンタープライズ機能**
  - 大企業向け機能
  - カスタム開発
  - オンプレミス対応
  - セキュリティ強化

### 🛠️ 技術的改善

#### 🔒 セキュリティ強化
- [ ] **認証・認可**
  - 多要素認証（MFA）
  - SSO対応
  - ロールベースアクセス制御
  - 監査ログ

- [ ] **データ保護**
  - データ暗号化
  - GDPR対応
  - プライバシー設定
  - データ削除機能

#### 📊 監視・運用
- [ ] **監視システム**
  - アプリケーションパフォーマンス監視
  - エラー追跡
  - ユーザー行動分析
  - アラート機能

- [ ] **運用自動化**
  - 自動スケーリング
  - バックアップ自動化
  - デプロイ自動化
  - テスト自動化

### 💡 アイディア・検討中

#### 🎨 クリエイティブ機能
- [ ] **デザインツール**
  - 投稿テンプレート
  - 画像編集機能
  - ブランドガイドライン
  - デザインシステム

- [ ] **コンテンツカレンダー**
  - 投稿スケジュール
  - コンテンツ計画
  - 自動投稿
  - カレンダー連携

#### 📈 分析・レポート
- [ ] **高度分析**
  - 感情分析
  - 競合分析
  - ROI分析
  - 予測分析

- [ ] **レポート機能**
  - 自動レポート生成
  - カスタムダッシュボード
  - データエクスポート
  - 共有機能

---

## ⚙️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS** (スタイリング)
- **Zustand** (状態管理)
- **React Router** (ルーティング)
- **Recharts** (グラフ表示)

### バックエンド
- **Node.js 18** + **Express.js**
- **MongoDB Atlas** (データベース)
- **Mongoose** (ODM)
- **JWT** (認証)
- **Winston** (ログ管理)

### インフラ・デプロイ
- **Vercel** (フロントエンド)
- **Render** (バックエンド)
- **MongoDB Atlas** (データベース)
- **Docker** (コンテナ化)
- **GitHub Actions** (CI/CD)

### 外部API
- **OpenAI API** (GPT-4)
- **SendGrid** (メール送信)
- **Stripe** (決済)

## 🎯 本番環境での利用

### デプロイ済みURL
- **フロントエンド**: https://instagram-marketing-g8ujpngu8-trillnihons-projects.vercel.app
- **バックエンド**: https://instagram-marketing-backend-v2.onrender.com

### 🔐 デモ認証情報
本番環境でテストする際は、以下のデモ認証情報を使用してください：

- **メールアドレス**: `trill.0310.0321@gmail.com`
- **パスワード**: `password123`

## 🚀 セットアップ手順（ローカル開発）

### 前提条件
- Node.js 18以上
- npm または yarn
- Git

### 1. リポジトリのクローン
```bash
git clone https://github.com/trillnihon/instagram-marketing-app.git
cd instagram-marketing-app
```

### 2. 環境変数の設定

#### フロントエンド
```bash
# .env ファイルを作成
cp env.production.example .env
```

#### バックエンド
```bash
cd server
# .env ファイルを作成
cp env.production.example .env
```

### 3. 依存関係のインストール
```bash
# フロントエンド
npm install

# バックエンド
cd server
npm install
```

### 4. アプリケーションの起動

#### 開発モード（推奨）
```bash
# ターミナル1: フロントエンド
npm run dev

# ターミナル2: バックエンド
cd server
npm run dev
```

#### 本番モード
```bash
# フロントエンドビルド
npm run build

# バックエンド起動
cd server
npm start
```

### 5. アクセス
- フロントエンド: http://localhost:3000 (または3001, 3002)
- バックエンド: http://localhost:4000
- ヘルスチェック: http://localhost:4000/health

### 6. ログイン方法
- **新規ユーザー**: 新規登録ページでアカウント作成
- **既存ユーザー**: メールアドレス・パスワードでログイン
- **OAuth機能**: Facebook開発者コンソール設定完了済み

## 🌐 本番環境構成

### デプロイ先
- **フロントエンド**: [Vercel](https://vercel.com)
- **バックエンド**: [Render](https://render.com)
- **データベース**: [MongoDB Atlas](https://www.mongodb.com/atlas)

### URL構成例
```
フロントエンド: https://instagram-marketing-app.vercel.app
バックエンド: https://instagram-marketing-backend.onrender.com
API: https://instagram-marketing-backend.onrender.com/api
```

## 🔐 環境変数一覧

### フロントエンド (.env)
```env
# API設定
VITE_API_BASE_URL=https://instagram-marketing-backend.onrender.com/api
NEXT_PUBLIC_API_URL=https://instagram-marketing-backend.onrender.com

# Instagram API設定
VITE_INSTAGRAM_APP_ID=25252287587694713
VITE_INSTAGRAM_APP_SECRET=14ad79e7973687a6e3f803024caaf5b9
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/callback

# Facebook API設定
VITE_FACEBOOK_APP_ID=1193533602546658
VITE_FACEBOOK_APP_SECRET=5f337d6e7ad05fd7a74cd78f13d7d5c1

# Stripe設定
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# プラン設定
VITE_FREE_PLAN_CAPTION_LIMIT=10
VITE_PREMIUM_PLAN_CAPTION_LIMIT=100
VITE_ENTERPRISE_PLAN_CAPTION_LIMIT=1000
```

### バックエンド (.env)
```env
# 基本設定
NODE_ENV=production
PORT=4000

# データベース
MONGODB_URI=mongodb+srv://trill03100321:mYvoYpl10yxf9Py2@instagram-app-cluster.hnahwkn.mongodb.net/?retryWrites=true&w=majority&appName=instagram-app-cluster

# API設定
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# 認証
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# 決済
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# メール
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# セキュリティ
SESSION_SECRET=your-super-secure-session-secret
CORS_ORIGIN=https://instagram-marketing-app.vercel.app

# レート制限
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ログ
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

## 🧪 テスト手順

### ユニットテスト
```bash
# バックエンドテスト
cd server
npm test

# テストカバレッジ
npm run test:coverage
```

### E2Eテスト
```bash
# ヘルスチェック
curl http://localhost:4000/health

# API動作確認
curl http://localhost:4000/api/ai/analyze \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","caption":"test post"}'
```

### 手動テスト項目
1. **認証フロー**: 登録・ログイン・ログアウト
2. **AI機能**: 投稿分析・投稿生成
3. **分析機能**: Threadsトレンド・履歴管理
4. **レスポンシブ**: スマートフォン・タブレット表示

## 🛠 デプロイ方法（CI/CD）

### 自動デプロイ（推奨）

1. **GitHubリポジトリにプッシュ**
   ```bash
   git add .
   git commit -m "Update app"
   git push origin main
   ```

2. **GitHub Actionsが自動実行**
   - テスト実行
   - フロントエンドビルド
   - Vercel・Renderに自動デプロイ

### 手動デプロイ

#### フロントエンド（Vercel）
```bash
npm install -g vercel
vercel --prod
```

#### バックエンド（Render）
1. Renderダッシュボードで手動デプロイ
2. またはGitHub連携で自動デプロイ

### GitHub Secrets設定
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
RENDER_TOKEN=your-render-token
RENDER_SERVICE_ID=your-render-service-id
```

## 📱 スマホ対応とPWA対応

### 現在の対応状況
- ✅ **レスポンシブデザイン**: Tailwind CSSで実装済み
- ✅ **モバイル最適化**: Viteで自動最適化
- ✅ **タッチ操作**: タッチフレンドリーなUI
- ✅ **PWA対応**: 完全実装済み（Service Worker、マニフェスト）

### PWA機能
- Service Worker実装済み
- オフライン対応
- プッシュ通知準備完了
- ホーム画面追加対応

## 🧩 トラブルシューティング

### よくあるエラーと対処法

#### 1. ポート競合エラー
```bash
# エラー: EADDRINUSE: address already in use :::3000
# 対処法: 自動で3001, 3002に切り替わります
npm run dev
```

#### 2. MongoDB接続エラー
```bash
# エラー: MongoDB connection error
# 対処法: デモモードで動作（開発環境）
# 本番環境ではMONGODB_URI環境変数を設定
```

#### 3. OAuthログインボタンが動作しない
```bash
# Facebook開発者コンソール設定完了済み
# 対処法: メールアドレス・パスワードでログインしてください
# OAuth機能は本番環境で有効化予定
```

#### 4. CORSエラー
```bash
# エラー: CORS policy blocked
# 対処法: CORS_ORIGIN環境変数を正しく設定
```

#### 5. API呼び出しエラー
```bash
# エラー: Failed to fetch
# 対処法: VITE_API_BASE_URL環境変数を確認
```

#### 6. ビルドエラー
```bash
# TypeScriptエラー
npm run build
# エラー箇所を修正後、再ビルド
```

### ログ確認方法

#### バックエンドログ
```bash
# 開発環境
npm run dev

# 本番環境（Render）
# ダッシュボード > Logs
```

#### フロントエンドログ
```bash
# 開発環境
npm run dev

# 本番環境（Vercel）
# ダッシュボード > Functions > Logs
```

## 📊 パフォーマンス最適化

### 実装済み
- **コード分割**: Viteによる自動分割
- **画像最適化**: WebP形式対応
- **キャッシュ戦略**: ブラウザキャッシュ活用
- **CDN**: Vercel・RenderのCDN活用
- **Service Worker**: オフライン対応実装済み
- **PWA機能**: マニフェスト・アイコン設定済み

### 今後の改善予定
- **画像遅延読み込み**: パフォーマンス向上
- **APIレスポンス最適化**: データ圧縮
- **プッシュ通知**: リアルタイム通知機能

## 🔒 セキュリティ

### 実装済み
- **HTTPS**: 全通信暗号化
- **JWT認証**: セキュアな認証
- **CORS設定**: 適切なオリジン制限
- **レート制限**: API保護
- **入力値検証**: XSS・CSRF対策

### 監視・アラート
- **エラーログ**: Winstonによる詳細ログ
- **パフォーマンス監視**: Vercel・Renderのメトリクス
- **セキュリティスキャン**: 定期的な脆弱性チェック

## 🤝 コントリビューション

### 開発フロー
1. フォークしてブランチ作成
2. 機能開発・バグ修正
3. テスト実行
4. プルリクエスト作成
5. レビュー・マージ

### コーディング規約
- **TypeScript**: 型安全性を重視
- **ESLint**: コード品質維持
- **Prettier**: コードフォーマット統一
- **コミットメッセージ**: 日本語で分かりやすく

## 📞 サポート・連絡先

### ドキュメント
- [デプロイ手順書](./PRODUCTION_DEPLOYMENT.md)
- [実行チェックリスト](./DEPLOYMENT_EXECUTION_CHECKLIST.md)
- [実行手順書](./DEPLOYMENT_EXECUTION_GUIDE.md)
- [開発ログ](./DEV_NOTES.md)
- [リリース確認](./RELEASE_CHECK.md)

### 問題報告
- **GitHub Issues**: バグ報告・機能要望
- **Discord**: 開発者コミュニティ
- **Email**: support@yourdomain.com

### ライセンス
MIT License - 詳細は [LICENSE](./LICENSE) を参照

---

**開発者**: AI Assistant (Cursor)  
**最終更新**: 2025年1月25日  
**バージョン**: 1.0.0
