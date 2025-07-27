# 🚀 Instagram/Threads分析アプリ 本番デプロイ手順書

## 📋 前提条件
- ✅ ローカル環境でアプリが正常動作中
- ✅ フロントエンド: http://localhost:3000/
- ✅ バックエンド: http://localhost:4000/

## 🗄️ Step 1: MongoDB Atlas設定

### 1.1 MongoDB Atlasアカウント作成
1. [MongoDB Atlas](https://www.mongodb.com/atlas) にアクセス
2. 無料アカウントを作成
3. クラスターを作成（無料プラン: M0）

### 1.2 データベース接続設定
1. クラスター作成後、「Connect」をクリック
2. 「Connect to your application」を選択
3. 接続文字列をコピー（例: `mongodb+srv://username:password@cluster.mongodb.net/threads_analysis`）

### 1.3 環境変数設定
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threads_analysis
```

## 🌐 Step 2: Vercelデプロイ（フロントエンド）

### 2.1 Vercelアカウント作成
1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでログイン

### 2.2 プロジェクトデプロイ
1. 「New Project」をクリック
2. GitHubリポジトリを選択
3. 以下の設定を確認：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2.3 環境変数設定
Vercelのダッシュボードで以下を設定：
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## ⚙️ Step 3: Renderデプロイ（バックエンド）

### 3.1 Renderアカウント作成
1. [Render](https://render.com) にアクセス
2. GitHubアカウントでログイン

### 3.2 Web Service作成
1. 「New Web Service」をクリック
2. GitHubリポジトリを選択
3. 以下の設定を確認：
   - Name: `instagram-marketing-backend`
   - Environment: `Node`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node server.js`

### 3.3 環境変数設定
Renderのダッシュボードで以下を設定：
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threads_analysis
OPENAI_API_KEY=sk-your-openai-api-key
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 🔗 Step 4: 連携設定

### 4.1 フロントエンド設定更新
Vercelでデプロイ後、フロントエンドのAPI URLを更新：
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### 4.2 バックエンドCORS設定更新
Renderでデプロイ後、バックエンドのCORS設定を更新：
```env
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 🧪 Step 5: 動作確認

### 5.1 フロントエンド確認
- Vercelで提供されるURLにアクセス
- ログイン・登録機能の確認
- AI分析機能の確認

### 5.2 バックエンド確認
- Renderで提供されるURLにアクセス
- API エンドポイントの確認
- データベース接続の確認

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

## 📱 最終確認事項

- [ ] フロントエンドが正常に表示される
- [ ] ユーザー登録・ログインが動作する
- [ ] AI分析機能が動作する
- [ ] データベースにデータが保存される
- [ ] レスポンシブデザインが正常に表示される
- [ ] エラーハンドリングが正常に動作する

## 🎉 デプロイ完了

すべての確認が完了したら、アプリケーションは本番環境で利用可能です！

### 本番URL
- **フロントエンド**: https://your-app.vercel.app
- **バックエンド**: https://your-backend.onrender.com 