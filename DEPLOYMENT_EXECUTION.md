# 🚀 本番デプロイ実行手順

## 📋 実行状況

### 現在の状況
- ✅ ローカル環境でアプリが正常動作中
- ✅ ビルド成功確認済み
- ✅ 設定ファイル準備完了
- ✅ ドキュメント整備完了
- ❌ Gitが利用できない状況

### 対応方針
Gitが利用できないため、手動でのデプロイ手順を実行します。

## 🗄️ Step 1: MongoDB Atlas設定

### 実行手順
1. **MongoDB Atlasアカウント作成**
   - [MongoDB Atlas](https://www.mongodb.com/atlas) にアクセス
   - 無料アカウントを作成
   - クラスターを作成（無料プラン: M0）

2. **データベース接続設定**
   - クラスター作成後、「Connect」をクリック
   - 「Connect to your application」を選択
   - 接続文字列をコピー

3. **ネットワークアクセス設定**
   - 「Network Access」タブをクリック
   - 「Add IP Address」をクリック
   - 「Allow Access from Anywhere」を選択（0.0.0.0/0）

4. **データベースユーザー作成**
   - 「Database Access」タブをクリック
   - 「Add New Database User」をクリック
   - ユーザー名とパスワードを設定
   - 「Built-in Role」で「Read and write to any database」を選択

### 取得する情報
- **MONGODB_URI**: `mongodb+srv://username:password@cluster.mongodb.net/threads_analysis`

## ⚙️ Step 2: Renderデプロイ（バックエンド）

### 実行手順
1. **Renderアカウント作成**
   - [Render](https://render.com) にアクセス
   - GitHubアカウントでログイン

2. **Web Service作成**
   - 「New Web Service」をクリック
   - GitHubリポジトリを選択（`instagram-marketing-app`）
   - 以下の設定を確認：
     - **Name**: `instagram-marketing-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && node server.js`

3. **環境変数設定**
   Renderのダッシュボードで以下を設定：

   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threads_analysis
   OPENAI_API_KEY=sk-your-openai-api-key
   JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production
   CORS_ORIGIN=https://instagram-marketing-app.vercel.app
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   SENDGRID_API_KEY=SG.your_sendgrid_api_key
   SESSION_SECRET=your-super-secure-session-secret-key-here
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

4. **デプロイ確認**
   - デプロイが成功したら、以下のURLでアクセス可能：
   - `https://instagram-marketing-backend.onrender.com`

## 🌐 Step 3: Vercelデプロイ（フロントエンド）

### 実行手順
1. **Vercelアカウント作成**
   - [Vercel](https://vercel.com) にアクセス
   - GitHubアカウントでログイン

2. **プロジェクトデプロイ**
   - 「New Project」をクリック
   - GitHubリポジトリを選択（`instagram-marketing-app`）
   - 以下の設定を確認：
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **環境変数設定**
   Vercelのダッシュボードで以下を設定：

   ```env
   VITE_API_BASE_URL=https://instagram-marketing-backend.onrender.com/api
   NEXT_PUBLIC_API_URL=https://instagram-marketing-backend.onrender.com
   VITE_INSTAGRAM_APP_ID=9452125458225000
   VITE_INSTAGRAM_APP_SECRET=216867a452db7ec5e59f7045b19884bc
   VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/callback
   VITE_FACEBOOK_APP_ID=1003724798254754
   VITE_FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   VITE_FREE_PLAN_CAPTION_LIMIT=10
   VITE_PREMIUM_PLAN_CAPTION_LIMIT=100
   VITE_ENTERPRISE_PLAN_CAPTION_LIMIT=1000
   ```

4. **デプロイ確認**
   - デプロイが成功したら、以下のURLでアクセス可能：
   - `https://instagram-marketing-app.vercel.app`

## 🔗 Step 4: 連携設定確認

### 実行手順
1. **フロントエンド設定更新**
   Vercelでデプロイ後、フロントエンドのAPI URLを更新：
   ```env
   VITE_API_BASE_URL=https://instagram-marketing-backend.onrender.com/api
   ```

2. **バックエンドCORS設定更新**
   Renderでデプロイ後、バックエンドのCORS設定を更新：
   ```env
   CORS_ORIGIN=https://instagram-marketing-app.vercel.app
   ```

## 🧪 Step 5: 動作確認

### 実行手順
1. **フロントエンド確認**
   - Vercelで提供されるURLにアクセス
   - ログイン・登録機能の確認
   - AI分析機能の確認
   - レスポンシブデザインの確認

2. **バックエンド確認**
   - Renderで提供されるURLにアクセス
   - API エンドポイントの確認
   - データベース接続の確認
   - セキュリティ機能の確認

3. **統合テスト**
   - フロントエンドからバックエンドAPIへの接続確認
   - ユーザー登録・ログインの動作確認
   - AI分析機能の動作確認
   - 分析履歴の保存・表示確認
   - PDF出力機能の確認

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. CORS エラー
```
Access to fetch at 'https://backend-url' from origin 'https://frontend-url' has been blocked by CORS policy
```
**解決方法**: バックエンドのCORS設定でフロントエンドのURLを許可

#### 2. MongoDB接続エラー
```
MongoDB connection error: MongooseServerSelectionError
```
**解決方法**: MongoDB Atlasの接続文字列とネットワークアクセス設定を確認

#### 3. 環境変数エラー
```
Environment variable not found
```
**解決方法**: Vercel/Renderのダッシュボードで環境変数を正しく設定

#### 4. ビルドエラー
```
Build failed
```
**解決方法**: ローカルで `npm run build` を実行してエラーを確認

## 📱 最終確認事項

### 機能確認
- [ ] フロントエンドが正常に表示される
- [ ] ユーザー登録・ログインが動作する
- [ ] AI分析機能が動作する
- [ ] データベースにデータが保存される
- [ ] レスポンシブデザインが正常に表示される
- [ ] エラーハンドリングが正常に動作する
- [ ] PDF出力機能が動作する
- [ ] 分析履歴が正常に表示される

### セキュリティ確認
- [ ] HTTPS接続が正常に動作する
- [ ] JWT認証が正常に動作する
- [ ] レート制限が正常に動作する
- [ ] CORS設定が正常に動作する

### パフォーマンス確認
- [ ] ページ読み込み速度が適切
- [ ] API応答時間が適切
- [ ] データベース接続が安定

## 🎉 デプロイ完了

すべての確認が完了したら、アプリケーションは本番環境で利用可能です！

### 本番URL
- **フロントエンド**: https://instagram-marketing-app.vercel.app
- **バックエンド**: https://instagram-marketing-backend.onrender.com
- **データベース**: MongoDB Atlas

### 次のステップ
1. **ユーザーフィードバック収集**
2. **パフォーマンス監視**
3. **セキュリティ監査**
4. **機能拡張計画**

---

**🚀 本番デプロイ実行手順が完了しました！** 