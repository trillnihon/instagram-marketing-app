# Render環境変数設定ガイド

## 📋 概要

このガイドは、Render本番環境での環境変数設定手順を説明します。

## 🚀 設定手順

### 1. Renderダッシュボードにアクセス
- [Render Dashboard](https://dashboard.render.com/) にログイン
- `instagram-marketing-backend-v2` サービスを選択

### 2. 環境変数設定

#### 必須環境変数（手動設定）

##### AIプロバイダー設定
```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key
GOOGLE_API_KEY=your-actual-google-api-key
```

##### セキュリティ設定
```bash
JWT_SECRET=instagram-marketing-app-jwt-secret-2024-production
SESSION_SECRET=instagram-marketing-app-session-secret-2024-production
```

##### CORS設定
```bash
CORS_ORIGIN=https://instagram-marketing-app.vercel.app
CORS_ORIGINS=https://instagram-marketing-app.vercel.app,https://*.vercel.app
```

##### Facebook設定
```bash
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
```

##### データベース設定（必要に応じて）
```bash
MONGODB_URI=your-mongodb-connection-string
```

### 3. 設定後の確認

#### 自動設定済み（render.yaml）
- ✅ `NODE_ENV=production`
- ✅ `PORT=4000`
- ✅ `INSTAGRAM_GRAPH_API_VERSION=v19.0`
- ✅ `FB_REDIRECT_URI`
- ✅ `FB_PAGE_ID`
- ✅ `RATE_LIMIT_WINDOW_MS`
- ✅ `RATE_LIMIT_MAX_REQUESTS`
- ✅ `LOG_LEVEL=info`

#### 手動設定が必要
- ❌ `OPENAI_API_KEY`
- ❌ `GOOGLE_API_KEY`
- ❌ `JWT_SECRET`
- ❌ `SESSION_SECRET`
- ❌ `CORS_ORIGIN`
- ❌ `FACEBOOK_APP_ID`
- ❌ `FACEBOOK_APP_SECRET`

## 🔧 設定方法

### 1. Renderダッシュボードでの設定
1. サービス一覧から `instagram-marketing-backend-v2` を選択
2. `Environment` タブをクリック
3. `Add Environment Variable` をクリック
4. 上記の環境変数を一つずつ追加

### 2. 設定後の再デプロイ
- 環境変数設定後、自動的に再デプロイが開始されます
- デプロイ完了まで待機（通常5-10分）

## ✅ 設定完了確認

### ヘルスチェック
```bash
curl https://instagram-marketing-backend-v2.onrender.com/health
```

### 期待されるレスポンス
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-08-24T...",
  "environment": "production"
}
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. 環境変数が反映されない
- 設定後、必ず再デプロイを実行
- 環境変数名のスペルミスを確認

#### 2. CORSエラー
- `CORS_ORIGIN` の値が正しいか確認
- フロントエンドのURLと一致しているか確認

#### 3. AI分析エラー
- `OPENAI_API_KEY` と `GOOGLE_API_KEY` が正しく設定されているか確認
- APIキーの有効性を確認

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. 環境変数の値が正しいか
2. 再デプロイが完了しているか
3. ログでエラーの詳細を確認

## 🎯 次のステップ

環境変数設定完了後：
1. 本番接続確認
2. AI機能テスト
3. Instagram認証テスト
4. 全機能リグレッションテスト
