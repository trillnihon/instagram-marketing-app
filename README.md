# Instagram Marketing App v1.0.0

## 🚀 プロジェクト概要

Instagram Marketing Appは、Instagramビジネスアカウント向けの投稿管理・分析ツールです。PWA（Progressive Web App）として実装され、オフライン対応とモバイル最適化を提供します。

## 📊 現在の状況

### ✅ 完了済み機能
- **PWA実装**: オフライン対応、インストール可能
- **Facebook Login for Business**: Instagramビジネスアカウント連携
- **OpenAI統合**: AIキャプション生成機能
- **Jestテスト**: ユニットテスト・APIテスト実装済み
- **Instagram Graph API**: 最新APIへの移行完了
- **デプロイ環境**: Vercel（フロントエンド）+ Render.com（バックエンド）

### 🔧 最近の修正（2025年8月5日）
- **TypeScriptファイル拡張子エラー修正**: `threads.ts` → `threads.js` 変換
- **Node.js互換性向上**: 本番環境での実行エラーを解消
- **デプロイ成功**: Render.comでのバックエンドサービスが正常稼働

## 🏗️ 技術スタック

### フロントエンド
- **React 18** + **Vite**
- **TypeScript** (部分的)
- **Tailwind CSS**
- **PWA** (Service Worker, Manifest)

### バックエンド
- **Node.js 20.18.1**
- **Express.js**
- **MongoDB Atlas**
- **JavaScript** (TypeScriptから移行)

### 外部サービス
- **Vercel**: フロントエンドホスティング
- **Render.com**: バックエンドホスティング
- **OpenAI API**: AI機能
- **Facebook Graph API**: Instagram連携

## 🌐 デプロイURL

- **フロントエンド**: https://instagram-marketing-app.vercel.app
- **バックエンド**: https://instagram-marketing-backend-v2.onrender.com

## 🔑 環境変数設定

### 本番環境（Vercel）
```env
# アプリケーション設定
VITE_APP_NAME=Instagram Marketing App
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com

# Facebook OAuth設定
VITE_FACEBOOK_APP_ID=1003724798254754
VITE_FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c

# Instagram Graph API設定
VITE_INSTAGRAM_APP_ID=1003724798254754
VITE_INSTAGRAM_APP_SECRET=14ad79e7973687a6e3f803024caaf5b9
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/instagram/callback
VITE_INSTAGRAM_AUTH_URL=https://www.facebook.com/v18.0/dialog/oauth
VITE_INSTAGRAM_TOKEN_URL=https://graph.facebook.com/v18.0/oauth/access_token

# OpenAI API設定
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 本番環境（Render.com）
```env
# サーバー設定
NODE_ENV=production
PORT=10000

# データベース設定
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/instagram-marketing-app?retryWrites=true&w=majority

# Facebook OAuth設定
FACEBOOK_CLIENT_ID=1003724798254754
FACEBOOK_CLIENT_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c

# NextAuth設定
NEXTAUTH_URL=https://instagram-marketing-backend-v2.onrender.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# API認証
API_TOKEN=your_actual_token_here

# OpenAI API設定
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## 🧪 テスト実行

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test -- --testPathPattern=api

# カバレッジ付きテスト
npm run test:coverage
```

## 🚀 開発・デプロイ手順

### ローカル開発
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# バックエンド起動
cd server && npm start
```

### デプロイ
```bash
# フロントエンド（Vercel）
git push origin main

# バックエンド（Render.com）
# 自動デプロイ（mainブランチへのプッシュで自動実行）
```

## 📝 主要な修正履歴

### 2025年8月5日
- **TypeScriptファイル拡張子エラー修正**
  - `server/routes/threads.ts` → `server/routes/threads.js` 変換
  - Node.js本番環境での実行エラーを解消
  - Render.comデプロイ成功

### 2025年8月5日
- **Instagram Graph API移行**
  - Instagram Basic Display APIからGraph APIに移行
  - Facebook OAuth設定の更新
  - 環境変数の整理

### 2025年8月5日
- **環境変数設定の統一**
  - Render.com環境変数の追加
  - NextAuth設定の追加
  - 本番環境での動作確認

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. TypeScriptファイル拡張子エラー
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
```
**解決方法**: TypeScriptファイルをJavaScriptに変換

#### 2. 環境変数読み込みエラー
**解決方法**: `.env.production`ファイルの確認と更新

#### 3. デプロイ失敗
**解決方法**: 
1. ログの確認
2. 環境変数の設定確認
3. 依存関係の確認

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. Render.comのログ
2. Vercelのデプロイログ
3. ブラウザのコンソールエラー
4. 環境変数の設定状況

---

**最終更新**: 2025年8月5日  
**バージョン**: 1.0.0  
**ステータス**: 本番稼働中 ✅
