# 🚀 本番デプロイ手順書

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント
- Renderアカウント
- MongoDB Atlasアカウント

## 🔧 1. 環境変数の設定

### フロントエンド（Vercel）

1. Vercelでプロジェクトを作成
2. 環境変数を設定：
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

### バックエンド（Render）

1. RenderでWeb Serviceを作成
2. 環境変数を設定：
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   OPENAI_API_KEY=sk-your-openai-api-key
   JWT_SECRET=your-super-secure-jwt-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

## 🗄️ 2. MongoDB Atlas設定

1. MongoDB Atlasでクラスターを作成
2. データベースユーザーを作成
3. ネットワークアクセスを設定（0.0.0.0/0）
4. 接続文字列を取得

## 🔗 3. GitHub連携設定

### GitHub Secrets設定

1. リポジトリのSettings > Secrets and variables > Actions
2. 以下のシークレットを追加：
   ```
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-vercel-org-id
   VERCEL_PROJECT_ID=your-vercel-project-id
   RENDER_TOKEN=your-render-token
   RENDER_SERVICE_ID=your-render-service-id
   ```

## 🚀 4. デプロイ実行

### 自動デプロイ（推奨）

1. mainブランチにプッシュ
2. GitHub Actionsが自動実行
3. フロントエンドとバックエンドが自動デプロイ

### 手動デプロイ

#### フロントエンド（Vercel）
```bash
npm install -g vercel
vercel --prod
```

#### バックエンド（Render）
1. Renderダッシュボードで手動デプロイ
2. またはGitHub連携で自動デプロイ

## ✅ 5. 動作確認

### ヘルスチェック
```bash
curl https://your-backend-url.onrender.com/health
```

### フロントエンド確認
- https://your-frontend.vercel.app にアクセス
- ログイン・投稿生成・分析機能をテスト

## 🔧 6. トラブルシューティング

### よくある問題

1. **CORSエラー**
   - CORS_ORIGIN環境変数を確認
   - フロントエンドURLが正しく設定されているか確認

2. **MongoDB接続エラー**
   - MONGODB_URIが正しく設定されているか確認
   - ネットワークアクセス設定を確認

3. **API呼び出しエラー**
   - VITE_API_BASE_URLが正しく設定されているか確認
   - バックエンドが正常に起動しているか確認

## 📊 7. 監視・ログ

### ログ確認
- Render: ダッシュボード > Logs
- Vercel: ダッシュボード > Functions > Logs

### メトリクス
- Render: ダッシュボード > Metrics
- Vercel: ダッシュボード > Analytics

## 🔄 8. 更新手順

1. コードを修正
2. mainブランチにプッシュ
3. GitHub Actionsが自動実行
4. デプロイ完了を確認

## 📞 サポート

問題が発生した場合は以下を確認：
1. 環境変数の設定
2. ログの確認
3. ネットワーク接続
4. APIキーの有効性 