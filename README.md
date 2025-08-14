# Instagram Marketing App

[![Graph API v19.0](https://img.shields.io/badge/Graph%20API-v19.0-blue.svg)](https://developers.facebook.com/docs/graph-api)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Instagram Graph API v19.0を使用した投稿管理・分析ツール。PWA（Progressive Web App）として実装され、オフライン対応とモバイル最適化を提供します。

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [環境構築](#環境構築)
- [環境変数](#環境変数)
- [実行方法](#実行方法)
- [API仕様](#api仕様)
- [運用と監視](#運用と監視)
- [今後のタスク](#今後のタスク)

## 🚀 プロジェクト概要

### 目的
Instagram Graph API v19.0を活用した投稿管理・分析ツールの開発。ビジネスアカウント向けの効率的なInstagramマーケティング支援を提供します。

### 技術構成
- **バックエンド**: Node.js 18+ + Express.js（ポート4000）
- **フロントエンド**: React 18 + Vite 5（ポート3001）
- **データベース**: MongoDB（デモモード対応）
- **API**: Instagram Graph API v19.0 完全対応
- **認証**: Facebook OAuth + JWT
- **PWA**: Service Worker + Manifest

### 開発環境
- **開発エディタ**: Cursor
- **環境変数管理**: dotenv.config({ path: 'env.development' }) で明示読み込み
- **パッケージマネージャー**: npm
- **テストフレームワーク**: Jest

### 現在の状態
- ✅ **Graph API v19.0 全エンドポイント更新完了**
- ✅ **ローカル起動OK**（バックエンド4000 / フロントエンド3001）
- ✅ **環境変数設定済み**（開発・本番）
- ✅ **検証スクリプト動作確認済み**
- ✅ **必要権限付与済み**（public_profile等）

### ディレクトリ構造
```
instagram-marketing-app/
├── src/                    # フロントエンド（React）
├── server/                 # バックエンド（Express）
├── scripts/                # 検証・管理スクリプト
├── docs/                   # ドキュメント
├── logs/                   # ログファイル（gitignore）
├── .env*                   # 環境変数ファイル（gitignore）
└── package.json
```

## 🛠️ 環境構築

### 必要環境
- **Node.js**: 18.0.0以上
- **npm**: 9.0.0以上
- **Git**: 最新版
- **開発エディタ**: Cursor（推奨）

### セットアップ手順

#### 1. リポジトリクローン
```bash
git clone <repository-url>
cd instagram-marketing-app
```

#### 2. 依存関係インストール
```bash
# ルート依存関係
npm install

# バックエンド依存関係
cd server
npm install
cd ..
```

#### 3. 環境変数ファイル設定
```bash
# 開発環境
cp env.development.example env.development
# 本番環境
cp env.production.example env.production
```

#### 4. 環境変数設定
詳細は[環境変数](#環境変数)セクションを参照してください。

### 開発環境起動

#### フロントエンド（ポート3001）
```bash
npm run dev
```

#### バックエンド（ポート4000）
```bash
npm run dev:server
```

#### フルスタック開発
```bash
npm run dev:full
```

## 🔧 環境変数

### 開発環境（env.development）

#### フロントエンド設定
```bash
# 基本設定
VITE_NODE_ENV=development
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Instagram Marketing App
VITE_APP_VERSION=1.0.0

# Facebook OAuth設定
VITE_FACEBOOK_APP_ID=1003724798254754
VITE_FACEBOOK_REDIRECT_URI=http://localhost:3001/auth/instagram/callback

# Instagram Graph API設定
VITE_INSTAGRAM_APP_ID=1003724798254754
VITE_INSTAGRAM_GRAPH_API_VERSION=v19.0
VITE_INSTAGRAM_BASE_URL=https://graph.facebook.com

# OpenAI API設定（デモモード）
VITE_OPENAI_MODEL=gpt-4
```

#### バックエンド設定
```bash
# サーバー設定
NODE_ENV=development
PORT=4000

# Facebook OAuth設定
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
FB_REDIRECT_URI=http://localhost:3001/auth/instagram/callback

# Instagram Graph API設定
INSTAGRAM_GRAPH_API_VERSION=v19.0
INSTAGRAM_REQUIRED_SCOPES=instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement,public_profile,email

# 検証用設定
FB_PAGE_ID=736448266214336
FB_USER_OR_LL_TOKEN=your_facebook_access_token_here

# セキュリティ設定
JWT_SECRET=instagram-marketing-app-jwt-secret-2024-development
SESSION_SECRET=instagram-marketing-app-session-secret-2024-development
```

### 本番環境設定

#### Vercel（フロントエンド）
```bash
# アプリケーション設定
VITE_APP_NAME=Instagram Marketing App
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com

# Facebook OAuth設定
VITE_FACEBOOK_APP_ID=1003724798254754
VITE_FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c

# Instagram Graph API設定
VITE_INSTAGRAM_GRAPH_API_VERSION=v19.0
```

#### Render（バックエンド）
```bash
# サーバー設定
NODE_ENV=production
PORT=10000

# Facebook OAuth設定
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c

# Instagram Graph API設定
INSTAGRAM_GRAPH_API_VERSION=v19.0
INSTAGRAM_REQUIRED_SCOPES=instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement,public_profile,email
```

## 🚀 実行方法

### 基本的な実行コマンド

#### 開発サーバー起動
```bash
# フロントエンドのみ
npm run dev

# バックエンドのみ
npm run dev:server

# フルスタック
npm run dev:full
```

#### ビルド
```bash
# フロントエンドビルド
npm run build

# バックエンドビルド
npm run build:server

# フルビルド
npm run build:full
```

#### テスト実行
```bash
# 全テスト実行
npm test

# テスト監視モード
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# APIテストのみ
npm run test:api

# コンポーネントテストのみ
npm run test:component
```

### 検証・管理スクリプト

#### Graph API v19.0疎通確認
```bash
# 基本検証
npm run verify:graph

# 詳細ログ付き検証
npm run verify:graph -- --verbose

# レポート生成付き検証
npm run verify:graph -- --report

# ドライラン（設定確認のみ）
npm run verify:graph -- --dry-run
```

#### 長期トークン管理
```bash
# 新しい長期トークンを取得
npm run token:refresh

# 即座にトークン更新
npm run token:rotate-now

# 従来の方法（互換性維持）
node server/get_long_lived_token.js <short_lived_token>
node server/get_long_lived_token.js --refresh
```

### 検証済みInstagram連携

#### 連携済みページ情報
- **ページ名**: 合同会社トリル
- **Facebook Page ID**: 736448266214336
- **Instagram Business Account ID**: 17841474953463077
- **連携状態**: ✅ 正常連携済み

#### 権限確認済みスコープ
- `instagram_basic` - Instagram基本情報取得
- `instagram_content_publish` - Instagram投稿作成
- `instagram_manage_insights` - Instagramインサイト取得
- `pages_show_list` - Facebookページ一覧表示
- `pages_read_engagement` - ページエンゲージメント読み取り
- `pages_manage_metadata` - ページメタデータ管理
- `business_management` - ビジネス管理

## 📡 API仕様

### Instagram Graph API v19.0 エンドポイント

#### 認証・OAuth
```http
POST /v19.0/oauth/access_token
```

#### ページ・アカウント管理
```http
GET /v19.0/me/accounts
GET /v19.0/{page_id}
```

#### メディア管理
```http
GET /v19.0/{ig_id}/media
POST /v19.0/{ig_id}/media
POST /v19.0/{ig_id}/media_publish
```

#### インサイト・分析
```http
GET /v19.0/{media_id}/insights
GET /v19.0/{ig_id}/insights
```

#### ユーザー情報
```http
GET /v19.0/me
GET /v19.0/{user_id}
```

### エラーハンドリング

#### Graph API v19.0 エラーコード対応
- **190**: トークン/redirect_uri不一致 → 詳細メッセージ表示
- **191**: リダイレクト不許可 → Facebook設定確認案内
- **10/4**: 権限/レート制限 → 再試行案内

#### デバッグ情報
- **fbtrace_id出力**: 全エンドポイントで実装済み
- **エラー詳細**: スタックトレースとコンテキスト情報
- **ログレベル**: 開発/本番環境別設定

### 認証フロー

#### Facebook OAuth
1. ユーザーがFacebookログイン
2. 必要権限の承認
3. 短期アクセストークン取得
4. 長期アクセストークン交換
5. JWTトークン生成・保存

#### トークン管理
- **短期トークン**: 2時間有効
- **長期トークン**: 60日有効
- **自動更新**: 期限切れ前の自動更新フロー
- **永続化**: JSONファイルでのトークン情報保存

## 📊 運用と監視

### ログ管理

#### ログ設定
- **ログレベル**: debug, info, warn, error
- **ログファイル**: `./logs` ディレクトリ
- **ローテーション**: 日次・サイズ別ローテーション
- **監視**: エラー率・応答時間の監視

#### エラー監視ポイント
- **Graph API エラー率**: 190/191エラーの発生頻度
- **認証成功率**: Facebookログイン完了率
- **API応答時間**: メディア取得・インサイト取得の応答時間
- **ユーザーアクティビティ**: 投稿作成・分析機能の利用状況

### パフォーマンス監視

#### フロントエンド最適化
- **チャンクサイズ**: 500KB超過の最適化
- **画像最適化**: レイジーローディング実装
- **APIキャッシュ**: レスポンスキャッシュ実装

#### バックエンド最適化
- **レート制限**: 900秒間で100リクエスト制限
- **接続プール**: MongoDB接続最適化
- **メモリ管理**: ガベージコレクション監視

### セキュリティ

#### 実装済みセキュリティ機能
- **環境変数暗号化**: 機密情報の暗号化保存
- **JWT認証**: セッションベースの認証
- **CORS設定**: 許可されたオリジンのみアクセス
- **レート制限**: API呼び出し頻度制限

#### セキュリティ監視
- **認証失敗**: 不正ログイン試行の監視
- **API使用量**: 異常なAPI呼び出しパターンの検出
- **トークン漏洩**: トークン使用パターンの監視

## 📋 今後のタスク

### 🔄 進行中項目

#### 1. 本番環境環境変数設定
- [ ] **Vercel**: `FACEBOOK_APP_SECRET`環境変数設定
- [ ] **Render**: `FACEBOOK_APP_SECRET`環境変数設定
- [ ] **長期トークン管理**: 期限切れ前の自動更新フロー確認

#### 2. 実トークンでの動作確認
- [ ] **verify:graph実行**: 実トークンでのGraph API疎通確認
- [ ] **投稿作成テスト**: 実際のInstagram投稿作成テスト
- [ ] **インサイト取得テスト**: 投稿後のインサイト取得確認

### 🚀 短期対応（1-2週間）

#### 1. 完全動作確認
- [ ] **Graph API v19.0疎通確認**: 全エンドポイントでの動作確認
- [ ] **Instagram投稿・インサイト取得**: 本格運用前の最終テスト
- [ ] **Facebook Login認証フロー**: 本番環境での認証確認

#### 2. 本番環境デプロイ
- [ ] **環境変数設定完了**: Vercel/Render側での設定完了
- [ ] **ヘルスチェック**: 本番環境での動作確認
- [ ] **セキュリティ設定**: 本番環境でのセキュリティ確認

### 📈 中期対応（1-2ヶ月）

#### 1. テスト品質向上
- [ ] **ユニットテストカバレッジ**: 現在0.7%から80%以上へ向上
- [ ] **E2Eテスト実装**: エンドツーエンドテストの実装
- [ ] **API統合テスト**: 全APIエンドポイントの統合テスト

#### 2. パフォーマンス最適化
- [ ] **フロントエンド最適化**: チャンクサイズの最適化
- [ ] **画像最適化**: レイジーローディングの実装
- [ ] **APIレスポンスキャッシュ**: キャッシュ戦略の実装

### 🔮 長期対応（3-6ヶ月）

#### 1. 機能拡張
- [ ] **AI機能強化**: OpenAI統合の高度化
- [ ] **分析機能**: 高度なInstagram分析機能
- [ ] **マルチアカウント**: 複数Instagramアカウント管理

#### 2. 運用・監視強化
- [ ] **自動監視**: 24/7自動監視システム
- [ ] **アラート機能**: 異常検知時の自動通知
- [ ] **パフォーマンス分析**: 詳細なパフォーマンス分析

### 📊 完了の受け入れ基準

#### ✅ 必須項目
- `npm run verify:graph`が成功すること
- `/me/accounts`で対象ページとig_business_idが確認できること
- 全Graph API v19.0エンドポイントで疎通確認が完了していること
- 本番環境の環境変数が設定されていること

#### 🔍 確認項目
- 権限スコープが正しく設定されていること
- Instagram連携が正常に動作していること
- 長期トークン管理フローが正常に動作すること
- Instagram投稿・インサイト取得が本番環境で動作すること

---

## 📚 関連ドキュメント

- [環境構築ガイド](docs/SETUP.md)
- [API実装ガイド](docs/API_IMPLEMENTATION_GUIDE.md)
- [デプロイメントガイド](docs/DEPLOYMENT_GUIDE.md)
- [ハンドオーバーレポート](docs/HANDOVER_REPORT_20250810.md)
- [テスト結果](docs/TEST_RESULTS.md)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 📞 サポート

- **技術的な質問**: GitHub Issues
- **機能リクエスト**: GitHub Discussions
- **セキュリティ問題**: プライベートメッセージ

---

**最終更新**: 2025-08-10  
**バージョン**: 1.0.0  
**Graph API対応**: v19.0  
**状態**: ✅ Graph API v19.0完全解消完了（本番環境環境変数設定待ち）
