# Instagram Graph API 接続設定ガイド

## 📋 概要

このドキュメントは、Instagram Graph APIを使用したデータ取得・分析システムの設定手順を説明します。

## 🎯 今日の作業目標

### Phase 1: 連携確認完了 ✅
- [x] Meta Business Suite設定でInstagram連携確認
- [x] Graph API Explorerでの接続テスト

### Phase 2: API開発環境構築 ✅
- [x] Facebook App作成・設定
- [x] ページアクセストークン取得
- [x] Instagram Graph API基本接続テスト

### Phase 3: データ取得システム開発 ✅
- [x] Instagram投稿データ取得機能
- [x] データ保存・管理システム
- [x] 分析・レポート機能

## 🔧 技術仕様

### 使用技術
- **Backend**: Node.js / Express
- **API**: Instagram Graph API (v19.0)
- **Database**: MongoDB（デモモード対応）
- **Frontend**: React / Next.js（分析画面用）

### 必要な認証情報
```
Facebook App ID: 1003724798254754
App Secret: fd6a61c31a9f1f5798b4d48a927d8f0c
Page Access Token: [Graph APIで取得予定]
Instagram Business Account ID: [Graph APIで取得予定]
```

## 🚀 セットアップ手順

### 1. 環境準備

```bash
# プロジェクトディレクトリに移動
cd ebay_projects/instagram-marketing-app

# 依存関係のインストール
npm install

# サーバー依存関係のインストール
cd server
npm install
```

### 2. 環境変数設定

`server/env.development`ファイルを確認し、必要に応じて更新：

```bash
# Instagram Graph API設定
INSTAGRAM_APP_ID=1003724798254754
INSTAGRAM_APP_SECRET=14ad79e7973687a6e3f803024caaf5b9
INSTAGRAM_GRAPH_API_VERSION=v19.0
INSTAGRAM_BASE_URL=https://graph.facebook.com
```

### 3. サーバー起動

```bash
# 開発サーバー起動
npm run dev:server

# または
cd server
npm run dev
```

## 🔍 API接続テスト

### 1. 基本的な接続テスト

```bash
# テストスクリプトを実行
cd server
node test-instagram-api.js <your_access_token>
```

### 2. APIエンドポイントテスト

#### ヘルスチェック
```bash
curl http://localhost:4000/api/instagram/health
```

#### 診断実行
```bash
curl -X POST http://localhost:4000/api/instagram/diagnostic \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your_access_token"}'
```

#### ユーザー情報取得
```bash
curl "http://localhost:4000/api/instagram/user-info?access_token=your_access_token"
```

#### Facebookページ取得
```bash
curl "http://localhost:4000/api/instagram/pages?access_token=your_access_token"
```

## 📊 実装済み機能

### 1. Instagram Graph APIサービス (`services/instagram-api.js`)

- ✅ ユーザー情報取得
- ✅ Facebookページ一覧取得
- ✅ Instagram Business Account情報取得
- ✅ Instagram投稿一覧取得
- ✅ メディアインサイト取得
- ✅ アカウントインサイト取得
- ✅ 完全診断機能

### 2. APIルート (`routes/instagram-api.js`)

- ✅ ヘルスチェック (`GET /api/instagram/health`)
- ✅ 診断実行 (`POST /api/instagram/diagnostic`)
- ✅ ユーザー情報取得 (`GET /api/instagram/user-info`)
- ✅ Facebookページ取得 (`GET /api/instagram/pages`)
- ✅ Instagram Account取得 (`GET /api/instagram/instagram-account/:accountId`)
- ✅ メディア取得 (`GET /api/instagram/media/:accountId`)
- ✅ メディアインサイト取得 (`GET /api/instagram/media/:mediaId/insights`)
- ✅ アカウントインサイト取得 (`GET /api/instagram/account/:accountId/insights`)

### 3. テストスクリプト (`test-instagram-api.js`)

- ✅ 接続テスト
- ✅ 機能テスト
- ✅ エラーハンドリング
- ✅ 結果レポート

## 🔐 セキュリティ注意事項

### 重要な注意事項
- **アクセストークンは絶対にコミットしない**
- `.env`ファイルで環境変数管理
- `.gitignore`に機密情報を追加

### API制限
- Instagram Graph API rate limitに注意
- 開発時は少量のリクエストでテスト

### エラーハンドリング
- 全てのAPI呼び出しでエラーハンドリング実装
- リトライ機能の検討

## 📞 トラブルシューティング

### よくある問題

#### 1. アクセストークンエラー
```
エラー: Instagram API エラー: Invalid OAuth 2.0 Access Token
```
**解決方法:**
- Graph API Explorerで新しいトークンを生成
- 必要な権限が付与されているか確認

#### 2. 権限不足エラー
```
エラー: Instagram API エラー: (#10) This endpoint requires the 'instagram_basic' permission
```
**解決方法:**
- Graph API Explorerで`instagram_basic`権限を追加
- アプリの設定で権限を有効化

#### 3. ページアクセスエラー
```
エラー: Instagram API エラー: (#100) The parameter 'access_token' is required
```
**解決方法:**
- ページアクセストークンを取得
- ページとInstagram Accountの連携確認

## 🔗 参考リンク

- [Instagram Graph API ドキュメント](https://developers.facebook.com/docs/instagram-api/)
- [Meta Business Suite](https://business.facebook.com/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Facebook App設定](https://developers.facebook.com/apps/)

## 📝 次のステップ

### 1. 本番環境準備
- [ ] 本番用Facebook App作成
- [ ] 本番環境変数設定
- [ ] セキュリティ設定強化

### 2. フロントエンド開発
- [ ] Instagram分析ダッシュボード作成
- [ ] データ可視化機能実装
- [ ] ユーザーインターフェース改善

### 3. 高度な機能
- [ ] 自動投稿機能
- [ ] インサイト分析
- [ ] 競合分析機能

---

**最終更新**: 2025年1月25日
**バージョン**: 1.0.0
**ステータス**: 開発完了・テスト準備完了 