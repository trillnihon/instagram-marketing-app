# Instagramマーケティングアプリ セットアップガイド

## 1. 環境変数の設定

### フロントエンド（.env）
プロジェクトルートに `.env` ファイルを作成し、以下の内容を設定してください：

```env
# Instagram API設定
VITE_INSTAGRAM_APP_ID=your_instagram_app_id
VITE_INSTAGRAM_APP_SECRET=your_instagram_app_secret
VITE_INSTAGRAM_REDIRECT_URI=https://localhost:3000/auth/callback

# Facebook API設定
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret

# 開発環境設定
VITE_API_BASE_URL=https://localhost:4000
VITE_ENVIRONMENT=development

# プラン設定
VITE_FREE_PLAN_CAPTION_LIMIT=10
VITE_PREMIUM_PLAN_CAPTION_LIMIT=100
VITE_ENTERPRISE_PLAN_CAPTION_LIMIT=1000
```

### サーバーサイド（server/.env）
`server` ディレクトリに `.env` ファイルを作成し、以下の内容を設定してください：

```env
# OpenAI API設定
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Stripe設定
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# プラン設定
FREE_PLAN_CAPTION_LIMIT=10
PREMIUM_PLAN_CAPTION_LIMIT=100
ENTERPRISE_PLAN_CAPTION_LIMIT=1000

# サーバー設定
PORT=4000
REDIRECT_URI=https://localhost:4000/auth/callback

# 管理者設定
ADMIN_TOKEN=your_admin_token_here
```

## 2. Stripe連携のセットアップ

### 2.1 Stripeアカウントの作成
1. [Stripe](https://stripe.com) にアカウントを作成
2. ダッシュボードからAPIキーを取得

### 2.2 商品と価格の設定
Stripeダッシュボードで以下の商品を作成：

#### プレミアムプラン
- 商品名: Premium Plan
- 価格: ¥980/月
- 価格ID: `price_premium_monthly`

#### エンタープライズプラン
- 商品名: Enterprise Plan
- 価格: ¥2,980/月
- 価格ID: `price_enterprise_monthly`

### 2.3 Webhookの設定
1. Stripeダッシュボード → Webhooks
2. 新しいエンドポイントを追加：
   - URL: `https://localhost:4000/api/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.deleted`

### 2.4 環境変数の更新
取得したAPIキーとWebhookシークレットを環境変数に設定：

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. アプリケーションの起動

### 3.1 依存関係のインストール
```bash
# フロントエンド
npm install

# サーバーサイド
cd server
npm install
```

### 3.2 開発サーバーの起動
```bash
# フロントエンド（ターミナル1）
npm run dev

# サーバーサイド（ターミナル2）
cd server
npm start
```

### 3.3 アクセス
- フロントエンド: https://localhost:5173
- サーバー: https://localhost:4000
- 管理者ダッシュボード: https://localhost:5173/admin

## 4. 機能の確認

### 4.1 Stripe連携のテスト
1. アプリケーションにアクセス
2. プランページでプレミアムまたはエンタープライズプランを選択
3. Stripe Checkoutが正常に動作することを確認

### 4.2 管理者ダッシュボードの確認
1. `/admin` にアクセス
2. 収益、ユーザー統計、使用量統計が表示されることを確認

### 4.3 使用量制限のテスト
1. 無料プランでキャプション生成を試行
2. 制限に達した際の適切なメッセージ表示を確認

## 5. トラブルシューティング

### 5.1 HTTPS証明書エラー
開発環境では自己署名証明書を使用しています。ブラウザで警告が表示された場合は「詳細設定」→「安全でないサイトにアクセス」を選択してください。

### 5.2 Stripe Webhookエラー
- Webhook URLが正しく設定されているか確認
- ローカル環境では [Stripe CLI](https://stripe.com/docs/stripe-cli) を使用してWebhookを転送

### 5.3 OpenAI APIエラー
- APIキーが正しく設定されているか確認
- 利用制限に達していないか確認

## 6. 本番環境への移行

### 6.1 環境変数の更新
本番環境用の環境変数に変更：
- `VITE_ENVIRONMENT=production`
- 本番用のStripe APIキー
- 本番用のドメインURL

### 6.2 データベースの設定
現在はインメモリストレージを使用していますが、本番環境では適切なデータベース（PostgreSQL、MongoDB等）の設定が必要です。

### 6.3 セキュリティの強化
- 適切な認証・認可の実装
- HTTPSの強制
- レート制限の設定
- 入力値の検証強化 