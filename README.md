# 📱 Instagram Marketing App

AIがあなたのSNS投稿を分析・最適化するWebアプリケーション

## 🎯 プロジェクト概要

Instagram Marketing Appは、Instagram・Threadsの投稿分析と最適化を支援するSaaSアプリケーションです。AI技術を活用して、投稿の効果を分析し、改善提案を提供します。

### 主要機能
- ✅ AI投稿分析・改善提案
- ✅ Threadsトレンド分析
- ✅ 投稿履歴管理
- ✅ AI投稿文自動生成
- ✅ アルゴリズム対応アドバイス
- ✅ PWA対応（オフライン対応）
- ✅ Instagram Business連携
- ✅ OAuth認証フロー（404エラー解決済み）
- ✅ カスタム404ページ（認証コールバック自動処理機能）
- ✅ 緊急対応：Instagram認証コールバック404エラーの最終解決
- ✅ Vercel設定競合解決（APIルーティング修正）
- ✅ デバッグ機能強化（ステップ別ログ・デバッグモード制御）

## 🚀 デプロイ状況

### 本番環境
- **フロントエンド**: [Vercel](https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app)
- **バックエンド**: [Render](https://instagram-marketing-backend-v2.onrender.com)
- **データベース**: MongoDB Atlas

### 開発環境
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:4000

## 🛠️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS** (スタイリング)
- **React Router** (ルーティング)
- **Zustand** (状態管理)
- **Axios** (HTTP通信)

### バックエンド
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** (認証)
- **Passport** (OAuth認証)
- **OpenAI API** (AI機能)

### インフラ
- **Vercel** (フロントエンドホスティング)
- **Render** (バックエンドホスティング)
- **MongoDB Atlas** (データベース)

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- MongoDB Atlas アカウント
- Facebook開発者アカウント

### 1. リポジトリのクローン
```bash
git clone https://github.com/trillnihon/instagram-marketing-app.git
cd instagram-marketing-app
```

### 2. 依存関係のインストール
```bash
# フロントエンド
npm install

# バックエンド
cd server
npm install
cd ..
```

### 3. 環境変数の設定

#### フロントエンド (.env.local)
```env
VITE_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_API_URL=http://localhost:4000
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
CORS_ORIGIN=http://localhost:3000

# デバッグ設定
VITE_DEBUG=true
```

#### バックエンド (server/.env)
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=your_mongodb_connection_string
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# デバッグ設定
DEBUG=true
```

### 4. 開発サーバーの起動
```bash
# フロントエンド
npm run dev

# バックエンド（別ターミナル）
cd server
npm run dev
```

## 🔧 開発ガイド

### プロジェクト構造
```
instagram-marketing-app/
├── src/
│   ├── components/          # Reactコンポーネント
│   ├── pages/              # ページコンポーネント
│   ├── services/           # API通信サービス
│   ├── store/              # Zustand状態管理
│   ├── types/              # TypeScript型定義
│   └── utils/              # ユーティリティ関数
├── server/
│   ├── models/             # MongoDBモデル
│   ├── routes/             # Expressルート
│   ├── middleware/         # ミドルウェア
│   └── services/           # バックエンドサービス
├── public/                 # 静的ファイル
└── docs/                   # ドキュメント
```

### 重要なファイル
- `src/App.tsx` - メインアプリケーション
- `src/services/authService.ts` - 認証サービス
- `src/services/instagramApi.ts` - Instagram API連携
- `server/server.js` - バックエンドサーバー
- `vercel.json` - Vercel設定（APIルーティング含む）

### 開発時の注意事項

#### 1. 統一URL設定
以下のURL設定は絶対に変更しないでください：
- フロントエンド: `https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app`
- バックエンド: `https://instagram-marketing-backend-v2.onrender.com`

#### 2. Vercel設定ルール
- `vercel.json`では`rewrites`のみを使用
- `routes`と`rewrites`の同時使用は禁止
- InstagramコールバックURLの優先順位を適切に設定
- APIルーティングをバックエンドに直接設定
- カスタム404ページで認証コールバックを自動処理

#### 3. API_BASE_URL設定
- 本番環境では直接URLを設定
- 環境変数依存を避ける

#### 4. 標準作業手順
改善・修正作業時は必ず以下の4ファイルを更新：
- `HANDOVER_REPORT_20250730_FINAL.md` - 改善内容の詳細追記
- `vercel.json` - フロントエンド構成変更の反映
- `src/services/authService.ts` - 認証・API設定の同期
- `README.md` - プロジェクト現状・セットアップ手順の更新

作業完了時には以下のGit操作を実施：
```bash
git add HANDOVER_REPORT_20250730_FINAL.md vercel.json src/services/authService.ts README.md
git commit -m "🔧 <対応内容の簡潔な説明>"
git push origin main
```

## 🧪 テスト

### テストアカウント
- **メール**: trill.0310.0321@gmail.com
- **パスワード**: password123

### テスト手順
1. フロントエンドにアクセス
2. テストアカウントでログイン
3. Instagram連携ページにアクセス
4. デモモードまたは実際の連携をテスト

## 🚨 トラブルシューティング

### よくある問題

#### 1. 404エラー（Instagram連携）
**原因**: Vercelルーティング設定の問題
**解決**: 
- `vercel.json`の`rewrites`設定を確認
- APIルーティングがバックエンドに正しく設定されているか確認
- カスタム404ページ（`public/404.html`）で自動処理
- フォールバック処理でクエリパラメータから認証コードを処理

#### 2. 認証エラー
**原因**: API_BASE_URL設定の問題
**解決**: `src/services/authService.ts`の設定を確認

#### 3. MongoDB接続エラー
**原因**: 接続文字列の問題
**解決**: 環境変数の設定を確認

### デバッグ手順
1. **ブラウザ開発者ツールでエラーログを確認**
   - F12キーで開発者ツールを開く
   - Consoleタブでステップ別ログを確認（`[STEP X]`形式）
   - 現在のステップ番号と処理状況を確認

2. **NetworkタブでAPIリクエストを確認**
   - リクエストの送信先とレスポンスを確認
   - ステータスコードとエラー内容を確認

3. **Renderダッシュボードでバックエンドログを確認**
   - サーバー側のステップ別ログ（`[SERVER STEP X]`形式）を確認
   - エラーの詳細情報を確認

4. **デバッグモード制御**
   - 環境変数`DEBUG=true`でログ出力を制御
   - 本番環境では必要に応じてデバッグモードを有効化

## 📚 ドキュメント

### 関連ドキュメント
- [申し送り書](./HANDOVER_REPORT_20250730_FINAL.md) - 詳細な運用ガイド
- [セットアップガイド](./SETUP.md) - 詳細なセットアップ手順
- [API仕様書](./docs/API.md) - APIエンドポイント仕様

### 外部リンク
- [Facebook開発者コンソール](https://developers.facebook.com/apps/1003724798254754)
- [Vercelダッシュボード](https://vercel.com/dashboard)
- [Renderダッシュボード](https://dashboard.render.com)
- [MongoDB Atlas](https://cloud.mongodb.com)

## 🤝 コントリビューション

### 開発フロー
1. 新しいブランチを作成
2. 機能開発・修正
3. テスト実行
4. プルリクエスト作成
5. コードレビュー
6. マージ

### コーディング規約
- TypeScriptを使用
- ESLint・Prettierの設定に従う
- コミットメッセージは日本語で記述
- 重要な変更は申し送り書を更新

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

### 連絡先
- **GitHub Issues**: [プロジェクトのIssues](https://github.com/trillnihon/instagram-marketing-app/issues)
- **開発者**: [連絡先情報]

### 緊急時
問題が発生した場合は、まず[申し送り書](./HANDOVER_REPORT_20250730_FINAL.md)を確認してください。

---

**注意**: このプロジェクトは開発中です。本番環境での使用前に十分なテストを行ってください。
# Force Vercel deployment - 07/30/2025 13:15:26
# Force deployment - 2025-07-30 13:22:34
# Force deployment
# Force deployment for callback fix
# Instagram OAuth 404エラー解決 - vercel.json APIルーティング修正完了
