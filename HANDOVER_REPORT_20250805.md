# Instagram Marketing App 引継ぎ書 v1.0.0

**作成日**: 2025年8月5日  
**最終更新**: 2025年8月5日  
**プロジェクト状況**: 本番稼働中 ✅

---

## 📊 プロジェクト概要

### アプリケーション情報
- **名称**: Instagram Marketing App
- **バージョン**: 1.0.0
- **種類**: PWA（Progressive Web App）
- **目的**: Instagramビジネスアカウント向け投稿管理・分析ツール

### デプロイ環境
- **フロントエンド**: Vercel (https://instagram-marketing-app.vercel.app)
- **バックエンド**: Render.com (https://instagram-marketing-backend-v2.onrender.com)
- **データベース**: MongoDB Atlas
- **認証**: Facebook Login for Business

---

## 🔧 最近の修正内容（2025年8月5日）

### 1. TypeScriptファイル拡張子エラー修正

#### 問題
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /opt/render/project/src/server/routes/threads.ts
```

#### 原因
- Node.jsが本番環境で`.ts`ファイルを直接実行しようとした
- TypeScriptコンパイル設定が不適切

#### 解決方法
1. **`threads.ts` → `threads.js` 変換**
   - TypeScript型注釈を削除
   - JavaScript形式に変換
   - 全機能を保持

2. **インポート文の修正**
   ```javascript
   // server.js
   import threadsRouter from './routes/threads.js';  // .ts → .js
   ```

3. **ファイル削除**
   - 古い`threads.ts`ファイルを削除

#### 結果
- ✅ Render.comデプロイ成功
- ✅ バックエンドサービス正常稼働
- ✅ TypeScriptファイル拡張子エラー解消

---

## 🏗️ 技術スタック詳細

### フロントエンド
- **React 18**: メインUIフレームワーク
- **Vite**: ビルドツール・開発サーバー
- **TypeScript**: 部分的に使用（一部JavaScriptに移行）
- **Tailwind CSS**: スタイリング
- **PWA**: Service Worker + Manifest

### バックエンド
- **Node.js 20.18.1**: ランタイム環境
- **Express.js**: Webサーバーフレームワーク
- **JavaScript**: メイン言語（TypeScriptから移行）
- **MongoDB Atlas**: データベース

### 外部サービス
- **Vercel**: フロントエンドホスティング
- **Render.com**: バックエンドホスティング
- **OpenAI API**: AI機能
- **Facebook Graph API**: Instagram連携

---

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

---

## 📁 プロジェクト構造

```
instagram-marketing-app/
├── src/                          # フロントエンドソース
│   ├── components/               # Reactコンポーネント
│   ├── pages/                    # ページコンポーネント
│   ├── store/                    # 状態管理
│   └── services/                 # APIサービス
├── server/                       # バックエンドソース
│   ├── routes/                   # APIルート
│   │   └── threads.js           # Threads API（JS版）
│   ├── models/                   # データモデル
│   ├── middleware/               # ミドルウェア
│   └── server.js                # メインサーバーファイル
├── public/                       # 静的ファイル
│   ├── manifest.json            # PWA Manifest
│   └── service-worker.js        # PWA Service Worker
├── tests/                        # テストファイル
├── env.production               # 本番環境変数
├── package.json                 # 依存関係
├── tsconfig.json               # TypeScript設定
└── README.md                   # プロジェクトドキュメント
```

---

## 🚀 デプロイ手順

### フロントエンド（Vercel）
```bash
# 自動デプロイ（GitHub連携）
git push origin main

# 手動デプロイ
vercel --prod
```

### バックエンド（Render.com）
```bash
# 自動デプロイ（mainブランチへのプッシュで自動実行）
git push origin main
```

---

## 🧪 テスト実行

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test -- --testPathPattern=api

# カバレッジ付きテスト
npm run test:coverage
```

---

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. TypeScriptファイル拡張子エラー
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
```
**解決方法**: 
- TypeScriptファイルをJavaScriptに変換
- インポート文を`.js`に変更

#### 2. 環境変数読み込みエラー
**解決方法**: 
- `.env.production`ファイルの確認
- Vercel/Render.comの環境変数設定確認

#### 3. デプロイ失敗
**解決方法**: 
1. ログの確認（Render.com/Vercel）
2. 環境変数の設定確認
3. 依存関係の確認

#### 4. 認証エラー
**解決方法**: 
1. Meta Developer Console設定確認
2. リダイレクトURI設定確認
3. アプリID・シークレット確認

---

## 📞 緊急時の対応

### 1. デプロイ失敗時
1. **Render.comログ確認**
   - ダッシュボード → Logs
   - エラーメッセージの特定

2. **Vercelログ確認**
   - ダッシュボード → Functions
   - デプロイログの確認

3. **環境変数確認**
   - 両プラットフォームの環境変数設定
   - 機密情報の漏洩チェック

### 2. アプリケーションエラー時
1. **ブラウザコンソール確認**
   - フロントエンドエラーの特定
   - ネットワークリクエストの確認

2. **APIエンドポイント確認**
   - バックエンドAPIの動作確認
   - データベース接続確認

### 3. 認証問題時
1. **Meta Developer Console確認**
   - アプリ設定の確認
   - 権限設定の確認

2. **リダイレクトURI確認**
   - 開発・本番環境の設定
   - ドメイン設定の確認

---

## 📝 今後の改善点

### 短期目標
1. **TypeScript完全移行**
   - 残りのJavaScriptファイルをTypeScriptに変換
   - 型安全性の向上

2. **テストカバレッジ向上**
   - 統合テストの追加
   - E2Eテストの実装

3. **パフォーマンス最適化**
   - バンドルサイズの最適化
   - 画像最適化

### 長期目標
1. **機能拡張**
   - より詳細な分析機能
   - 自動投稿機能

2. **セキュリティ強化**
   - 認証フローの改善
   - データ暗号化

---

## 📞 連絡先・参考資料

### 重要なURL
- **本番アプリ**: https://instagram-marketing-app.vercel.app
- **バックエンドAPI**: https://instagram-marketing-backend-v2.onrender.com
- **GitHubリポジトリ**: https://github.com/trillnihon/instagram-marketing-app
- **Meta Developer Console**: https://developers.facebook.com/

### 参考資料
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Vercel Documentation](https://vercel.com/docs)
- [Render.com Documentation](https://render.com/docs)

---

**この引継ぎ書は2025年8月5日の最新状況を反映しています。**  
**プロジェクトの変更があった場合は、このドキュメントを更新してください。** 