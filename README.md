# Instagram Marketing App

## 🚀 本番リリース完了 ✅

**✅ 本番デプロイ済み・動作確認完了**
- Vercel + Render デプロイ設定完了
- PWA対応（Service Worker + Manifest）✅ 動作確認済み
- レスポンシブデザイン対応
- 全テスト（ユニット/統合）パス
- OpenAI API連携
- Facebook Login for Business認証
- **SPAルーティング404問題解決済み** ✅
- **投稿時間分析機能実装完了** ✅

## 🚀 デプロイ

### 開発環境
```bash
npm run dev
# http://localhost:3001/login でアクセス
```

### 本番環境
```bash
# 自動デプロイ（GitHub連携）
git push origin main

# 手動デプロイ
vercel --prod
# https://instagram-marketing-app.vercel.app/login でアクセス
```## 🚨 重要な通知

**Instagram Basic Display APIは2024年12月4日に廃止されました。**

- ❌ **Instagram Basic Display API**: 提供終了
- ✅ **Facebook Login for Business**: 実装完了
- ✅ **デモモード**: 引き続き利用可能

### 現在の対応
- Facebook Login for Businessを使用
- Instagram Business Account / Creator Account向け
- 必要な権限: `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`
- デモモードも引き続き利用可能

## 📱 アプリケーション概要

## 📋 プロジェクト概要

Instagram/Threads投稿分析・AI提案SaaSアプリケーション

### 主要機能
- ✅ AI投稿分析・改善提案
- ✅ Threadsトレンド分析
- ✅ 投稿履歴管理
- ✅ AI投稿文自動生成
- ✅ アルゴリズム対応アドバイス
- ✅ PWA対応（オフライン対応）
- ✅ Facebook Login for Business認証
- ✅ Instagram Business Account連携
- ✅ **投稿時間分析・ヒートマップ機能**（新機能）
- ✅ **最適投稿時間推奨機能**（新機能）

## 🚀 クイックスタート

### 1. 環境構築

```bash
# リポジトリクローン
git clone https://github.com/trillnihon/instagram-marketing-app.git
cd instagram-marketing-app

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### 2. テスト実行

```bash
# 本番テスト実行（推奨）
./run-tests.sh

# 個別テスト実行
npm test                                    # 全テスト
npm run test:component                      # ユニットテストのみ
npm run test:api                           # 統合テストのみ
npm run test:coverage                      # カバレッジレポート
npm run verify                             # ビルド + テスト検証
```

### 2. 環境変数設定

#### 開発環境（`env.development`）
```env
# Facebook OAuth設定
VITE_INSTAGRAM_APP_ID=1003724798254754
VITE_INSTAGRAM_APP_SECRET=14ad79e7973687a6e3f803024caaf5b9
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:3001/auth/facebook/callback

# API設定
VITE_API_BASE_URL=http://localhost:4000/api

# デバッグ設定
VITE_DEBUG=true
```

#### 本番環境（`env.production`）
```env
# Facebook OAuth設定
VITE_INSTAGRAM_APP_ID=1003724798254754
VITE_INSTAGRAM_APP_SECRET=14ad79e7973687a6e3f803024caaf5b9
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app.vercel.app/auth/facebook/callback

# API設定
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api
VITE_API_URL=https://api.myservice.com

# OpenAI API設定
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# PWA設定
VITE_APP_NAME=Instagram Marketing App
VITE_APP_DESCRIPTION=AIがあなたのSNS投稿を分析し、最適な投稿内容を提案するツール
```

### 3. Meta Developer Console設定

#### 必須設定項目
1. **Facebook Login for Business追加**
2. **Valid OAuth redirect URIs**:
   ```
   開発環境: http://localhost:3001/auth/facebook/callback
   本番環境: https://instagram-marketing-app.vercel.app/auth/facebook/callback
   ```

#### 必要な権限
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`

## 🔧 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Zustand** (状態管理)
- **React Router** (ルーティング)
- **Tailwind CSS** (スタイリング)
- **PWA対応** (Service Worker + Manifest)

### バックエンド
- **Node.js** + **Express**
- **MongoDB Atlas** (データベース)
- **OpenAI API** (AI機能)
- **Jest + Supertest** (テスト)

### デプロイ
- **Vercel** (フロントエンド)
- **Render** (バックエンド)
- **GitHub Actions** (CI/CD)

## 📁 プロジェクト構造

```
instagram-marketing-app/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── ThreadsPostCreator.tsx  # Threads投稿作成コンポーネント
│   │   ├── ThreadsPostList.tsx     # Threads投稿一覧コンポーネント
│   │   └── __tests__/              # ユニットテスト
│   │       └── ThreadsPostCreator.test.tsx
│   ├── pages/              # ページコンポーネント
│   │   ├── Login.tsx       # ログインページ（Facebook Login for Business）
│   │   ├── AuthCallback.tsx # 認証コールバック処理
│   │   └── ThreadsManagement.tsx   # Threads管理ページ
│   ├── store/              # Zustand状態管理
│   │   └── useAppStore.ts  # アプリケーション状態
│   └── services/           # APIサービス
│       ├── authService.ts  # 認証サービス（ログステップ実装）
│       └── threadsService.ts # Threads APIサービス
├── server/
│   └── routes/
│       └── threads.ts      # Threads APIルーター
├── tests/
│   └── threadsApi.test.ts  # 統合テスト
├── public/                 # 静的ファイル
│   ├── manifest.json      # PWA Manifest
│   ├── service-worker.js  # PWA Service Worker
│   └── icons/             # PWAアイコン
├── env.development         # 開発環境変数
├── env.production          # 本番環境変数
├── vercel.json            # Vercel設定
├── jest.config.js         # Jest設定
├── run-tests.sh           # 本番テストスクリプト
└── README.md              # プロジェクトドキュメント
```

## 🔐 認証フロー

### Facebook Login for Business認証

1. **認証開始**
   ```javascript
   // Login.tsxでFacebook OAuth URL構築
   const facebookAuthUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${facebookAppId}&display=page&extras=${encodeURIComponent('{"setup":{"channel":"IG_API_ONBOARDING"}}')}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&response_type=token&scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`;
   ```

2. **トークン取得**
   ```javascript
   // AuthCallback.tsxでフラグメント（#）からトークン取得
   const hash = window.location.hash.substring(1);
   const urlParams = new URLSearchParams(hash);
   const accessToken = urlParams.get('access_token');
   const longLivedToken = urlParams.get('long_lived_token');
   ```

3. **Instagram Business Account取得**
   ```javascript
   // バックエンドAPIでPagesとInstagram Business Account取得
   const pagesResponse = await fetch(`https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`);
   ```

## 📝 ログステップ仕様

### 認証フローログ
```
📸 [AUTH STEP 1] Facebook Login for Business認証開始
✅ [AUTH STEP 2] Facebook認証成功
📸 [AUTH STEP 3] Instagram Media取得開始
✅ [AUTH STEP 4] Instagram Media取得成功
```

### エラーハンドリングアクセス
```

## 🐛 トラブルシューティング

### ✅ 解決済み問題

#### SPAルーティング404エラー（解決済み）
- **問題**: `/threads-management`などのルートに直接アクセスで404エラー
- **解決**: vercel.jsonのrewrites設定で全ルートを`/index.html`にリダイレクト
- **確認済み**: 本番環境で全ルートが正常に動作

#### 投稿時間分析機能（実装完了）
- **機能**: エンゲージメント率ベースのヒートマップ表示
- **実装**: PostingTimeHeatmapコンポーネント、分析サービス
- **確認済み**: モックデータで正常動作

### Instagram連携404エラーチェックポイント

1. **Meta Developer Console設定確認**
   - Facebook Login for Businessが追加されているか
   - Valid OAuth redirect URIsが正しく設定されているか
   - 必要な権限が追加されているか

2. **環境変数確認**
   - `VITE_INSTAGRAM_APP_ID`が正しいか
   - `VITE_INSTAGRAM_REDIRECT_URI`が正しいか

3. **Vercel設定確認**
   - `vercel.json`のルーティング設定が正しいか
   - `/auth/facebook/callback`が`/`にルーティングされているか

4. **ブラウザキャッシュクリア**
   - 古い設定がキャッシュされている可能性

### よくある問題

- **「Invalid platform app」エラー**: App IDの不一致
- **「URL blocked」エラー**: Meta Developer Consoleの設定不備
- **「認証エラー」**: コールバックURLの設定ミス

## 📞 サポート

### 緊急時の連絡先
1. **HANDOVER_REPORT_20250730_FINAL.md**を確認
2. **Meta Developer Console**設定を確認
3. **環境変数**の整合性を確認
4. **ログステップ**で問題を特定

### 参考資料
- [Facebook Login for Business Documentation](https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-started)
- [Meta Developer Console](https://developers.facebook.com/)
- [Vercel Documentation](https://vercel.com/docs)

## 📊 本番環境動作確認結果（2025-08-03）

### ✅ SPAルーティング確認済み
- `/threads-management` → ✅ 200 OK
- `/posting-time-analysis` → ✅ 200 OK  
- `/non-existent-route` → ✅ 200 OK（SPA NotFound表示）
- `/auth/facebook/callback` → ✅ 200 OK

### ✅ PWA機能確認済み
- manifest.json → ✅ 正常配信
- service-worker.js → ✅ 正常配信
- ホーム画面追加可能 → ✅ 確認済み

### ✅ 新機能確認済み
- 投稿時間分析ヒートマップ → ✅ 動作確認済み
- 最適投稿時間推奨 → ✅ 動作確認済み

---

**このプロジェクトはFacebook Login for Businessを使用してInstagram Business Accountと連携します。Meta Developer Consoleの設定が重要です。**

**🎉 本番環境デプロイ完了・全機能動作確認済み**
