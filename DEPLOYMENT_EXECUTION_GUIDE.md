# 🚀 デプロイ実行手順書

## 📋 実行前確認事項

### 必要なアカウント
- [ ] MongoDB Atlas アカウント
- [ ] Facebook開発者アカウント
- [ ] Vercel アカウント
- [ ] Render アカウント
- [ ] GitHub アカウント

### 必要なAPIキー
- [ ] OpenAI API キー
- [ ] Stripe API キー（オプション）
- [ ] SendGrid API キー（オプション）

---

## 🔹 Step 1: MongoDB Atlas設定

### 1.1 クラスター作成
1. [MongoDB Atlas](https://www.mongodb.com/atlas) にアクセス
2. 無料アカウントを作成
3. 「Build a Database」をクリック
4. 「FREE」プランを選択
5. クラウドプロバイダーとリージョンを選択
6. クラスター名を入力（例: `instagram-marketing-cluster`）
7. 「Create」をクリック

### 1.2 データベースユーザー作成
1. 「Database Access」をクリック
2. 「Add New Database User」をクリック
3. ユーザー名とパスワードを設定
4. 「Built-in Role」で「Read and write to any database」を選択
5. 「Add User」をクリック

### 1.3 ネットワークアクセス設定
1. 「Network Access」をクリック
2. 「Add IP Address」をクリック
3. 「Allow Access from Anywhere」を選択（0.0.0.0/0）
4. 「Confirm」をクリック

### 1.4 接続文字列取得
1. 「Database」をクリック
2. 「Connect」をクリック
3. 「Connect to your application」を選択
4. 接続文字列をコピー

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

## 🔹 Step 2: Facebook開発者コンソール設定

### 2.1 アプリ作成
1. [Facebook開発者コンソール](https://developers.facebook.com/) にアクセス
2. 「My Apps」をクリック
3. 「Create App」をクリック
4. 「Consumer」を選択
5. アプリ名を入力（例: `Instagram Marketing App`）
6. 「Create App」をクリック

### 2.2 Facebook Login設定
1. 「Add Product」をクリック
2. 「Facebook Login」を選択
3. 「Web」プラットフォームを選択
4. サイトURLを入力: `https://instagram-marketing-app.vercel.app`

### 2.3 リダイレクトURI設定
1. 「Facebook Login」→「Settings」をクリック
2. 「Valid OAuth Redirect URIs」に以下を追加：
```
https://instagram-marketing-app.vercel.app/oauth/facebook/callback
```

### 2.4 App ID / App Secret取得
1. 「Settings」→「Basic」をクリック
2. App ID と App Secret をコピー

---

## 🔹 Step 3: Vercelデプロイ（フロントエンド）

### 3.1 プロジェクト作成
1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでログイン
3. 「New Project」をクリック
4. GitHubリポジトリを選択
5. 以下の設定を確認：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.2 環境変数設定
Vercelのダッシュボードで以下を設定：

```env
NODE_ENV=production
VITE_API_BASE_URL=https://instagram-marketing-backend.onrender.com/api
NEXT_PUBLIC_API_URL=https://instagram-marketing-backend.onrender.com
VITE_FACEBOOK_APP_ID=<your-facebook-app-id>
VITE_FACEBOOK_APP_SECRET=<your-facebook-app-secret>
VITE_INSTAGRAM_APP_ID=<your-instagram-app-id>
VITE_INSTAGRAM_APP_SECRET=<your-instagram-app-secret>
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/callback
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
VITE_FREE_PLAN_CAPTION_LIMIT=10
VITE_PREMIUM_PLAN_CAPTION_LIMIT=100
VITE_ENTERPRISE_PLAN_CAPTION_LIMIT=1000
```

### 3.3 デプロイ実行
1. 「Deploy」をクリック
2. ビルドが成功するまで待機
3. デプロイ完了後、URLを確認

---

## 🔹 Step 4: Renderデプロイ（バックエンド）

### 4.1 Web Service作成
1. [Render](https://render.com) にアクセス
2. GitHubアカウントでログイン
3. 「New Web Service」をクリック
4. GitHubリポジトリを選択
5. 以下の設定を確認：
   - **Name**: `instagram-marketing-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`

### 4.2 環境変数設定
Renderのダッシュボードで以下を設定：

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
OPENAI_API_KEY=<your-openai-api-key>
JWT_SECRET=<16文字以上の強固なJWTシークレット>
CORS_ORIGIN=https://instagram-marketing-app.vercel.app
STRIPE_SECRET_KEY=<your-stripe-secret-key>
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SESSION_SECRET=<16文字以上の強固なセッションシークレット>
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
INSTAGRAM_APP_ID=<your-instagram-app-id>
INSTAGRAM_APP_SECRET=<your-instagram-app-secret>
INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/callback
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 4.3 デプロイ実行
1. 「Create Web Service」をクリック
2. ビルドが成功するまで待機
3. デプロイ完了後、URLを確認

---

## 🔹 Step 5: 動作確認

### 5.1 基本動作確認
1. フロントエンドURLにアクセス
2. メインページが正常に表示されることを確認
3. レスポンシブデザインが正常に動作することを確認

### 5.2 認証機能確認
1. 新規登録機能をテスト
2. メールアドレス・パスワードログインをテスト
3. Facebookログインをテスト
4. ログアウト機能をテスト

### 5.3 主要機能確認
1. 投稿分析機能をテスト
2. AI投稿生成機能をテスト
3. Threadsトレンド分析をテスト
4. 分析履歴機能をテスト

### 5.4 PWA機能確認
1. スマートフォンでアクセス
2. PWAとしてインストール可能か確認
3. オフライン時の動作を確認

### 5.5 セキュリティ確認
1. HTTPS接続が正常か確認
2. セキュリティヘッダーが設定されているか確認
3. CORS設定が正常か確認

---

## 🔹 Step 6: トラブルシューティング

### よくある問題と対処法

#### 問題1: ビルドエラー
**対処法**: 
- ログを確認してエラー箇所を特定
- 依存関係の問題の場合は `npm install` を再実行
- 環境変数の設定を確認

#### 問題2: MongoDB接続エラー
**対処法**:
- 接続文字列が正しいか確認
- ネットワークアクセス設定を確認
- データベースユーザーの権限を確認

#### 問題3: OAuth認証エラー
**対処法**:
- Facebook開発者コンソールの設定を確認
- リダイレクトURIが正しいか確認
- App ID / App Secretが正しいか確認

#### 問題4: CORSエラー
**対処法**:
- CORS_ORIGIN環境変数が正しいか確認
- フロントエンドとバックエンドのURLが一致しているか確認

---

## 🎯 完了基準

すべてのステップが完了し、以下が確認できた場合にデプロイ完了とする：

1. ✅ フロントエンドが正常に動作する
2. ✅ バックエンドが正常に動作する
3. ✅ データベース接続が正常
4. ✅ OAuth認証が正常に動作する
5. ✅ PWA機能が正常に動作する
6. ✅ セキュリティ設定が有効
7. ✅ 主要機能が正常に動作する

---

**📋 この手順書に従って、段階的にデプロイを実行してください。** 