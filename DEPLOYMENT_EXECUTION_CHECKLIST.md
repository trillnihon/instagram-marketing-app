# 🚀 本番デプロイ実行チェックリスト

## 📋 基本情報
- **アプリ名**: Instagram/Threads分析アプリ
- **バージョン**: v1.0.0
- **デプロイ日**: 2025年7月25日
- **確認者**: Cursor

---

## ✅ 優先度A（本番前の準備）

### 🔹① MongoDB Atlas接続設定

#### 1.1 MongoDB Atlasクラスター作成
- [ ] MongoDB Atlasアカウント作成
- [ ] クラスター作成（無料プラン: M0）
- [ ] データベースユーザー作成
- [ ] ネットワークアクセス設定（0.0.0.0/0）

#### 1.2 接続文字列設定
- [ ] 接続文字列を取得
- [ ] `env.production` に設定
- [ ] `server/env.production` に設定

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### 🔹② Facebook OAuth設定

#### 2.1 Facebook開発者コンソール設定
- [ ] Facebook開発者アカウント作成
- [ ] アプリ作成
- [ ] App ID / App Secret 取得
- [ ] リダイレクトURI設定

#### 2.2 環境変数設定
- [ ] `env.production` に設定
- [ ] `server/env.production` に設定

```env
FACEBOOK_APP_ID=<your-app-id>
FACEBOOK_APP_SECRET=<your-app-secret>
VITE_FACEBOOK_APP_ID=<your-app-id>
VITE_FACEBOOK_APP_SECRET=<your-app-secret>
```

#### 2.3 リダイレクトURI設定
- [ ] Facebook開発者コンソールに以下を登録：
```
https://instagram-marketing-app.vercel.app/oauth/facebook/callback
```

---

## ✅ 優先度B（本番デプロイ実行）

### 🔹③ Vercel（フロントエンド）デプロイ

#### 3.1 Vercelプロジェクト設定
- [ ] Vercelアカウント作成
- [ ] GitHubリポジトリ連携
- [ ] プロジェクト作成

#### 3.2 環境変数設定
Vercelのダッシュボードで以下を設定：

```env
NODE_ENV=production
VITE_API_BASE_URL=https://instagram-marketing-backend.onrender.com/api
NEXT_PUBLIC_API_URL=https://instagram-marketing-backend.onrender.com
VITE_FACEBOOK_APP_ID=<your-app-id>
VITE_FACEBOOK_APP_SECRET=<your-app-secret>
VITE_INSTAGRAM_APP_ID=<your-instagram-app-id>
VITE_INSTAGRAM_APP_SECRET=<your-instagram-app-secret>
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/callback
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
VITE_FREE_PLAN_CAPTION_LIMIT=10
VITE_PREMIUM_PLAN_CAPTION_LIMIT=100
VITE_ENTERPRISE_PLAN_CAPTION_LIMIT=1000
```

#### 3.3 デプロイ確認
- [ ] ビルド成功
- [ ] デプロイ完了
- [ ] URL確認: `https://instagram-marketing-app.vercel.app`

### 🔹④ Render（バックエンド）デプロイ

#### 4.1 Renderプロジェクト設定
- [ ] Renderアカウント作成
- [ ] GitHubリポジトリ連携
- [ ] Web Service作成

#### 4.2 環境変数設定
Renderのダッシュボードで以下を設定：

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
OPENAI_API_KEY=<your-openai-key>
JWT_SECRET=<16文字以上の強固なJWTシークレット>
CORS_ORIGIN=https://instagram-marketing-app.vercel.app
STRIPE_SECRET_KEY=<your-stripe-secret>
SENDGRID_API_KEY=<your-sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SESSION_SECRET=<16文字以上の強固なセッションシークレット>
FACEBOOK_APP_ID=<your-app-id>
FACEBOOK_APP_SECRET=<your-app-secret>
INSTAGRAM_APP_ID=<your-instagram-app-id>
INSTAGRAM_APP_SECRET=<your-instagram-app-secret>
INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/callback
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

#### 4.3 デプロイ確認
- [ ] ビルド成功
- [ ] デプロイ完了
- [ ] URL確認: `https://instagram-marketing-backend.onrender.com`
- [ ] ヘルスチェック: `/health`

---

## ✅ 本番リリース前チェックリスト

### 5.1 基本動作確認
- [ ] MongoDB Atlasクラスターが稼働し、接続文字列が正しく設定されている
- [ ] Facebook開発者コンソールのリダイレクトURIが正しい（Vercel URL）
- [ ] 環境変数が Vercel / Render 両方に正しく設定されている
- [ ] Vercel デプロイ完了（PWA設定済み）
- [ ] Render デプロイ完了（OAuth / DB接続済み）

### 5.2 フロントエンド動作確認
- [ ] メイン画面が正常に表示される
- [ ] レスポンシブデザインが正常に動作する
- [ ] ナビゲーションが正常に動作する
- [ ] ローディング状態が正常に表示される

### 5.3 認証機能確認
- [ ] メールアドレス＋パスワードでログインできる
- [ ] 新規登録機能が正常に動作する
- [ ] Facebookログインが機能している
- [ ] ログアウト機能が正常に動作する

### 5.4 主要機能確認
- [ ] 投稿分析・アドバイス機能が正しく動作
- [ ] Threadsトレンド分析が表示される
- [ ] AI投稿生成機能が正常に動作する
- [ ] 分析履歴が正常に保存・表示される

### 5.5 PWA機能確認
- [ ] PWAとしてインストール可能（スマホ）
- [ ] オフライン時にも最低限のUIが表示される
- [ ] マニフェストが正常に読み込まれる
- [ ] Service Workerが正常に登録される

### 5.6 セキュリティ確認
- [ ] HTTPSリダイレクトが動作している（Vercel）
- [ ] セキュリティヘッダー（Helmetなど）が有効になっている
- [ ] CORS設定が正しく動作している
- [ ] レート制限が正常に動作している

### 5.7 API連携確認
- [ ] フロントエンドからバックエンドAPIへの接続が正常
- [ ] APIリクエストが正常に送信される
- [ ] APIレスポンスが正常に受信される
- [ ] エラーハンドリングが適切に動作する

---

## 📝 デプロイ実行ログ

### 実行日時
- **開始**: 2025年7月25日
- **完了**: 

### 実行者
- **担当者**: 
- **確認者**: 

### 実行結果
- **MongoDB Atlas**: 
- **Facebook OAuth**: 
- **Vercel**: 
- **Render**: 
- **動作確認**: 

### 問題・対応
- **問題1**: 
- **対応1**: 
- **問題2**: 
- **対応2**: 

---

## 🎯 完了基準

すべてのチェック項目が完了し、以下が確認できた場合に本番リリース完了とする：

1. ✅ フロントエンドが正常に動作する
2. ✅ バックエンドが正常に動作する
3. ✅ データベース接続が正常
4. ✅ OAuth認証が正常に動作する
5. ✅ PWA機能が正常に動作する
6. ✅ セキュリティ設定が有効
7. ✅ 主要機能が正常に動作する

---

**📋 このチェックリストに従って、段階的にデプロイを実行してください。** 