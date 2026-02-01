# Cursor 現状把握ドキュメント（Instagram Marketing App）

Claude / Cursor 向けのプロジェクト全体の構造・重要ファイル・エンドポイント・認証フロー・デプロイ設定をまとめたドキュメントです。

---

## 1. ディレクトリ構造の全体像

```
ebay_projects/instagram-marketing-app/
├── server/                    # バックエンド（Node.js + Express）
│   ├── server.js              # メインサーバー（ルート・認証コールバック・多数のAPI）
│   ├── config/
│   │   └── database.js         # MongoDB 接続（mongoose）
│   ├── middleware/
│   │   ├── auth.js             # JWT 認証・管理者・オプショナル認証
│   │   ├── security.js         # CORS・レート制限・Helmet・HTTPS・JWT検証
│   │   └── errorHandler.js    # AppError・エラーハンドラ・404・asyncHandler
│   ├── routes/
│   │   ├── auth.js             # 認証（登録・ログイン・Instagram OAuth・exchange・save-token）
│   │   ├── instagram-api.js    # Instagram API（health・user-info・pages・media・insights等）
│   │   ├── scheduler.js        # GET/POST /posts
│   │   ├── analysisHistory.js  # 分析履歴 CRUD・検索・エクスポート
│   │   ├── diagnostics.js     # Facebook診断
│   │   ├── threads.js          # Threads API（submitPost・listPosts・trend・hashtag）
│   │   ├── upload.js           # 画像アップロード・health・config
│   │   ├── urlAnalysis.js      # analyze-url・analysis-history
│   │   └── debug.js            # tokens・status（デバッグ用）
│   ├── services/
│   │   ├── instagramGraphService.js  # Graph API（トークン検証・投稿・インサイト取得）
│   │   ├── instagram-api.js
│   │   ├── tokenService.js
│   │   └── threadsDataService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Token.js
│   │   ├── InstagramHistory.js
│   │   └── AnalysisHistory.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── exit-watchdog.js
│   └── scripts/
│       └── warmup.mjs           # Render ウォームアップ（/api/health 等）
├── src/                        # フロントエンド（React + Vite）
│   ├── App.tsx                 # ルーティング・ProtectedRoute 定義（認証ラッパー）
│   ├── main.tsx
│   ├── lib/
│   │   └── apiClient.ts         # BASE_URL・リトライ付き fetch（get/post/put/delete）
│   ├── services/
│   │   ├── mockApi.ts           # 本番API専用（apiWithFallback）・VITE_API_BASE_URL
│   │   ├── authService.ts
│   │   ├── instagramAuth.ts
│   │   └── instagramApi.ts
│   ├── store/
│   │   └── useAppStore.ts       # Zustand・認証状態・login/signup/oauth・hydrateFromStorage
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── AuthCallback.tsx     # code または access_token 処理・バックエンド /auth/exchange 等
│   │   ├── Dashboard.tsx
│   │   └── ...
│   └── components/
│       ├── InstagramAuth.tsx
│       └── ...
├── package.json                # ルート（Vite・React・スクリプト）
├── server/package.json         # バックエンド依存関係
├── vite.config.ts
├── vercel.json                 # リライト・環境変数
├── render.yaml                 # Render サービス・環境変数・ヘルスチェック
├── env.example
├── env.production.example
└── immutable-config.md         # 変更禁止URL・環境変数キー
```

**注意**: ルーティングは `server/server.js` に直書きのエンドポイントが多く、一部は `routes/*` を `app.use` でマウント。`server/routes/index.ts` は存在しない（`server.js` が単一エントリ）。

---

## 2. 重要ファイルの内容

### 2.1 バックエンド

#### server/config/database.js

```javascript
import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'instagram-marketing';
mongoose.set('strictQuery', true);
async function connectDB() {
  if (!uri) throw new Error('MONGODB_URI is not set');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, dbName });
    console.log('[mongo] connected');
  } catch (err) { console.error('[mongo] connection error:', err.message); }
  mongoose.connection.on('error', (e) => ...);
  mongoose.connection.on('disconnected', () => ...);
}
export default connectDB;
```

- **dotenv は使わない**（Render は process.env を注入）。mongoose v8 用（useNewUrlParser / useUnifiedTopology は不使用）。

#### server/middleware/security.js（要約）

- **CORS**: 本番は `instagram-marketing-app.vercel.app` 等と `https://*.vercel.app`、開発は localhost:3000/3001/3002。
- **rateLimiter**: 15分100回、`/health` と `/static/` はスキップ。
- **authRateLimiter**: 15分5回（認証用）。
- **helmet**: CSP・connectSrc に `https://api.openai.com`, `https://graph.facebook.com`。
- **securityHeaders**: X-XSS-Protection, X-Frame-Options, X-Content-Type-Options 等。
- **requireHTTPS**: 本番で X-Forwarded-Proto をチェック。
- **validateJWTSecret**: JWT_SECRET 必須・16文字以上推奨。
- **requestSizeLimit**: 10mb。

#### server/middleware/errorHandler.js（要約）

- **AppError**: statusCode, isOperational, status('fail'|'error')。
- **errorHandler**: ValidationError/CastError/11000/JsonWebTokenError/TokenExpiredError を適切なメッセージと statusCode にマッピングし、統一JSONで返す。
- **notFoundHandler**: 404。
- **asyncHandler**: Promise を catch して next に渡す。

#### server/middleware/auth.js（要約）

- **generateToken(userId)**: JWT 7日。
- **verifyToken(token)**: 検証、失敗時 null。
- **authenticateToken**: Authorization Bearer で JWT 検証 → User 取得 → req.user。
- **requireAdmin**: authenticateToken の上に管理者チェック。
- **optionalAuth**: トークンがあれば req.user をセット、なくても next。

---

### 2.2 フロントエンド

#### src/lib/apiClient.ts（要約）

- **BASE_URL**: `import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api'`
- **リトライ**: 503/502/504 およびネットワークエラーで最大5回、指数バックオフ、30秒タイムアウト。
- **apiClient**: get / post / put / delete / request。endpoint が http で始まらなければ `BASE_URL + endpoint`。

#### src/services/mockApi.ts（要約）

- **apiWithFallback**: 本番APIのみ使用（Mock フォールバックなし）。
- **VITE_API_BASE_URL** を参照し、パスは **二重 /api にしない**（base が `.../api` のため `/health`, `/instagram/history/:userId`, `/scheduler/posts` 等）。
- 提供メソッド: getInstagramHistory, getScheduledPosts, getAnalyticsData, getHashtagData, healthCheck, checkProductionApiStatus。

#### ProtectedRoute（src/App.tsx 内）

- **実体**: `const ProtectedRoute = ({ children }) => { ... }`（別ファイルではない）。
- **ロジック**: `useAppStore()` の `isAuthenticated` を参照。`false` なら `<Navigate to="/login" replace />`。`currentUser` がなくても `isAuthenticated` が true なら子を表示。
- **変更禁止**: 認証チェックのこの仕様は immutable-config で固定。

#### src/store/useAppStore.ts（要約）

- **Zustand + persist**（localStorage キー `app-storage`）。
- **状態**: isAuthenticated, token, currentUser, isLoading。currentUser は **id** を持つ（userId は後方互換用）。
- **認証**: login（POST `/auth/login`）、signup（POST `/api/auth/signup`）、logout、oauthLogin（instagram は Instagram OAuth URL、facebook は Facebook v19.0 URL）、handleOAuthCallback。
- **永続化**: hydrateFromStorage で `IG_JWT` と `IG_USER` を読んで復元。login 成功時は token と user をストアにセット（JWT はバックエンドが発行、フロントは保存のみ）。
- **API_BASE_URL**: login は `VITE_API_BASE_URL`、signup は `VITE_BACKEND_URL` も利用。

---

### 2.3 設定ファイル

#### package.json（ルート）

- **scripts**: dev（vite）, dev:server（server）, build（tsc && vite build）, test（jest）, warmup:prod（node server/scripts/warmup.mjs）等。
- **dependencies**: react, react-router-dom, zustand, axios, vite 等。server は別の package.json。

#### server/package.json

- **main**: server.js。**start**: node server.js。
- **dependencies**: express, mongoose, axios, jsonwebtoken, cors, helmet, express-rate-limit, winston 等。**dotenv** はあるが、メインの server.js では読み込まない（process.env のみ）。

#### vite.config.ts（要約）

- **base**: '/'。
- **server.port**: 3001。**proxy**: `/api` → target は本番時 Render、開発時 localhost:4000。**rewrite**: `/api` を削除して転送（※本番バックエンドは `/api/health` 等を期待するため、開発時はプロキシ先を `/api` 付きで転送する必要がある場合あり）。
- **build**: outDir `dist`、manualChunks（vendor, router, ui）。

#### 環境変数（キー一覧）

**フロント（Vite）**

- VITE_API_BASE_URL（必須・変更禁止）
- VITE_INSTAGRAM_APP_ID, VITE_INSTAGRAM_REDIRECT_URI
- VITE_FACEBOOK_APP_ID
- VITE_STRIPE_PUBLISHABLE_KEY
- VITE_FREE_PLAN_CAPTION_LIMIT 等

**バックエンド（Render / server）**

- NODE_ENV, PORT
- MONGODB_URI（または MONGODB_DB）
- JWT_SECRET
- FACEBOOK_APP_ID, FACEBOOK_APP_SECRET（または FB_APP_ID, FB_APP_SECRET）
- FB_REDIRECT_URI（本番は Vercel のコールバックURL）
- FB_USER_OR_LL_TOKEN, FB_PAGE_ID
- INSTAGRAM_GRAPH_API_VERSION（v19.0）
- OPENAI_API_KEY, STRIPE_SECRET_KEY, SENDGRID_API_KEY, SESSION_SECRET
- CORS_ORIGIN / CORS_ORIGINS
- RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
- USE_DEMO_MODE（任意）

**env.example / env.production.example** に上記のサンプルあり（値は本番では設定のみ記載・実際の値は共有しない）。

---

## 3. 現在のエンドポイント一覧

| パス | メソッド | 認証 | 備考 |
|------|----------|------|------|
| / | GET | 不要 | メッセージ・healthCheck: '/api/health' |
| /api/health | GET | 不要 | status, mongodb, connection_status（本番API） |
| /api/instagram/health | GET | 不要 | 同上（互換） |
| /admin/token/current | GET | JWT + Admin | トークン情報（マスク） |
| /api/auth/login | POST | 不要 | メール・パスワード（server.js 直書き） |
| /api/auth/signup | POST | 不要 | 同上 |
| /auth/start | GET | 不要 | OAuth state → Facebook リダイレクト |
| /auth/instagram | GET | 不要 | Instagram OAuth 開始（Facebook v19.0） |
| /auth/callback | GET | 不要 | Facebook code 交換・JWT 返却（server.js） |
| /auth/instagram/callback | GET | 不要 | Instagram callback（code 受信） |
| /auth/instagram/callback | POST | 不要 | フロントから code 送信用 |
| /api/auth/* | - | 一部JWT | auth.js: register, login, me, env-check, instagram, exchange, save-token, tokens |
| /api/instagram/posts/:userId | GET | 不要 | 投稿一覧 |
| /api/instagram/insights/:mediaId | GET | 不要 | インサイト |
| /api/instagram/me | GET | 不要 | ユーザー情報 |
| /api/instagram/media | GET | 不要 | メディア |
| /api/instagram/posts | POST | 不要 | 投稿作成 |
| /api/instagram/schedule | POST | 不要 | スケジュール |
| /api/instagram/history/:userId | GET | 不要 | 履歴（server.js + analysisHistory） |
| /api/instagram/sync/:userId | GET | 不要 | 同期 |
| /api/instagram/posting-times/:userId | GET | 不要 | 投稿時間 |
| /api/instagram/* | - | 不要 | instagram-api.js: health, user-info, pages, media, insights, exchange-token, status 等 |
| /api/scheduler/posts | GET | 不要 | スケジュール一覧 |
| /api/scheduler/posts | POST | 不要 | 作成 |
| /api/scheduler/posts/:postId | PUT / DELETE | 不要 | 更新・削除 |
| /api/plans | GET | 不要 | プラン一覧 |
| /api/user/:userId | GET | 不要 | ユーザー |
| /api/usage/:userId | GET | 不要 | 利用量 |
| /api/usage | GET | 不要 | 利用量 |
| /api/create-checkout-session | POST | 不要 | Stripe |
| /api/webhook | POST | 不要 | Stripe Webhook |
| /api/generate-captions | POST | 不要 | キャプション生成 |
| /api/ai/analyze | POST | 不要 | AI 分析 |
| /api/ai/generate-image | POST | 不要 | 画像生成 |
| /api/ai/generate-post | POST | JWT | 投稿生成 |
| /api/admin/revenue | GET | 不要 | 管理者 |
| /api/admin/users | GET | 不要 | 管理者 |
| /api/admin/usage | GET | 不要 | 管理者 |
| /api/admin/dashboard | GET | requireAdmin | 管理者 |
| /api/analytics/performance | POST | 不要 | パフォーマンス |
| /api/analytics/dashboard | POST | 不要 | ダッシュボード |
| /api/analysis-history/* | - | 不要 | analysisHistory.js |
| /api/diagnostics/* | - | 不要 | diagnostics.js |
| /api/threads/* | - | 一部JWT | threads.js + server.js 直書き（trend, hashtag, save-analysis 等） |
| /upload/* | - | 不要 | upload.js |
| /api/analyze-url | POST | 不要 | urlAnalysis.js |
| /debug/* | - | 不要 | debug.js |
| /threads/api/* | - | 不要/JWT | threads router |

**実装状況**: 本番は Render 上の server.js がそのまま提供。Mock はフロントの mockApi で「本番のみ」に統一済み（成功時に Mock へフォールバックしない）。

---

## 4. Meta / Instagram 連携の現状

### 4.1 Instagram Graph API で使用しているエンドポイント

- **認証**
  - `https://www.facebook.com/v19.0/dialog/oauth`（認証開始）
  - `https://graph.facebook.com/v19.0/oauth/access_token`（code 交換・長期トークン交換）
  - `https://graph.instagram.com/access_token`（ig_exchange_token、auth.js の save-token）
- **ユーザー・ページ**
  - `GET https://graph.facebook.com/v19.0/me`（fields: id,name,email）
  - `GET https://graph.facebook.com/v19.0/me/accounts`（fields: id,name,instagram_business_account）
- **Instagram コンテンツ・インサイト**
  - `GET https://graph.instagram.com/me`（Basic Display 用・一部で v18.0 混在あり）
  - `GET https://graph.instagram.com/me/media`
  - `GET https://graph.facebook.com/v19.0/{ig-user-id}/media`
  - `GET https://graph.facebook.com/v19.0/{media-id}/insights`
  - 投稿作成: `POST .../media`, `POST .../media_publish`

**バージョン**: 多くは **v19.0**。instagramGraphService.js は `INSTAGRAM_GRAPH_API_VERSION || 'v19.0'`。一部 legacy で v18.0 が残っている可能性あり。

### 4.2 必要な権限（permissions）

auth.js および server.js の scope に含まれるもの:

- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`
- `public_profile`
- `email`

### 4.3 アクセストークンの取得・更新フロー

1. **フロント**: ログイン画面で「Instagramでログイン」等 → バックエンドの `/auth/instagram` にリダイレクト（またはフロントから同URLへ遷移）。
2. **バックエンド**: `/auth/instagram` で Facebook v19.0 OAuth URL にリダイレクト（client_id, redirect_uri, scope, response_type=code, state）。
3. **ユーザー**: Facebook で認可 → **コールバックURL**（本番: `https://instagram-marketing-app.vercel.app/auth/instagram/callback`）に code 付きでリダイレクト。
4. **コールバック**:  
   - **GET** `/auth/instagram/callback`: Render が受け、code で短期トークン取得 → 長期トークン交換（fb_exchange_token）→ ユーザー情報・投稿取得 → JWT 発行して JSON で返す。  
   - または **フロント**が `/auth/instagram/callback` で code を拾い、**POST** でバックエンドの `/auth/instagram/callback` に code を送るパターンもあり。  
   - 別ルート: フロントが **POST /api/auth/exchange**（auth.js）に code を送り、バックエンドが短期→長期トークン＋MongoDB 保存し、成功レスポンス（JWT はこの経路では返さない場合あり）を返す。
5. **トークン保存**:  
   - バックエンド: MongoDB の `tokens` コレクションに userId, accessToken, expiresIn, obtainedAt 等を upsert。  
   - フロント: JWT をストア＋localStorage（IG_JWT）、ユーザー情報を IG_USER に保存。API 呼び出しでは **Authorization: Bearer <JWT>** を使用（バックエンドの JWT 認証が必要なエンドポイント用）。
6. **長期トークン**: 60日程度。更新は手動または `scripts/refresh-long-lived-token.ts` 等で実施。本番では Meta 側の権限承認が未完了の場合は実トークンでの検証ができない。

### 4.4 トークンの有効期限・状態

- **長期トークン**: 約 60 日（5184000 秒）。MongoDB に expiresIn, obtainedAt を保存。
- **JWT**: 7 日（server/middleware/auth.js の expiresIn: '7d'）。環境変数で上書き可能。
- **現状**: Meta 側の権限・App Review の最終確認が未完了のため、本番トークンの有効性は「実機・実アカウントでスモークテストするまで未確認」とみなすのが安全。

---

## 5. デプロイ設定

### 5.1 Render（バックエンド）

- **render.yaml** 要約:
  - **type**: web, **env**: node, **plan**: free
  - **buildCommand**: `cd server && npm install`
  - **startCommand**: `cd server && node server.js`
  - **healthCheckPath**: `/health`  
    ※ 実際のサーバーは **/api/health** のみ公開しているため、Render のヘルスチェックを **/api/health** に変更すると確実。
  - **envVars**（キーのみ）: NODE_ENV, PORT, MONGODB_URI, OPENAI_API_KEY, JWT_SECRET, CORS_ORIGIN, STRIPE_SECRET_KEY, SENDGRID_API_KEY, SESSION_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, FB_USER_OR_LL_TOKEN, INSTAGRAM_GRAPH_API_VERSION, FB_REDIRECT_URI, FB_PAGE_ID, RATE_LIMIT_*, LOG_LEVEL

### 5.2 Vercel（フロントエンド）

- **vercel.json** 要約:
  - **rewrites**:
    - `/auth/instagram/callback` → `/`（SPA のコールバック処理）
    - `/auth/(.*)` → `/`
    - `/api/(.*)` → `https://instagram-marketing-backend-v2.onrender.com/api/$1`
    - その他 → `/index.html`
  - **buildCommand**: npm run build
  - **outputDirectory**: dist
  - **framework**: vite
  - **env**: VITE_API_BASE_URL = `https://instagram-marketing-backend-v2.onrender.com/api`

---

## 6. 既知の問題・TODO

### 6.1 既知の問題

- **TODO.md** 記載: 開発環境起動確認・認証フローテスト・Instagram Business Account 連携テストが未完了。Webhooks 未実装。バックエンド API の一部「未実装」と記載あり（実際には多くのエンドポイントは server.js に実装済み）。
- **render.yaml**: healthCheckPath が `/health` のまま。サーバーは `/api/health` のみなので、Render のヘルスチェックが 404 になる可能性あり。→ `/api/health` に変更推奨。
- **server.js の GET /auth/instagram/callback**: レスポンス内で `instagramBusinessAccount` 等の変数を参照しているが、そのスコープで定義されていない可能性がある（要コード確認）。POST 版のコールバックは別途実装が完結している。

### 6.2 未着手・予定機能

- Webhooks（バックエンド・Meta Developer Console 設定）
- App Review 用スクリーンキャスト・説明文書
- 開発環境のプロキシと本番のパス整合（vite の proxy rewrite と `/api` プレフィックス）

### 6.3 テスト

- **server**: Jest（auth.test.js 等）。`server/tests/` にあり。
- **ルート**: Jest（threadsApi.simple.test.js 等）。`npm run test` / `test:api`。
- カバレッジは未記載。E2E は未整備の可能性が高い。

---

## 7. 認証フローの詳細（Instagram OAuth）

### 7.1 流れ（本番想定）

1. **ユーザーがログインボタンを押す**
   - フロント: Login ページで「Instagramでログイン」等 → バックエンドの **GET /auth/instagram** へリダイレクト（または `window.location.href = backendUrl + '/auth/instagram'`）。
   - 注意: useAppStore の `oauthLogin('instagram')` は **Instagram Basic Display** の URL を参照している場合があり、本番で実際に使うのは **Facebook Login for Business**（/auth/instagram）のことが多い。

2. **どこにリダイレクトするか**
   - バックエンドが **Facebook v19.0 OAuth** にリダイレクト:  
     `https://www.facebook.com/v19.0/dialog/oauth?client_id=...&redirect_uri=...&scope=...&response_type=code&state=...`
   - redirect_uri は本番では **https://instagram-marketing-app.vercel.app/auth/instagram/callback**（server.js の NODE_ENV === 'production' 時）。

3. **コールバック URL**
   - **本番**: `https://instagram-marketing-app.vercel.app/auth/instagram/callback`（Vercel の rewrite で `/` に飛ばし、SPA の AuthCallback またはコールバック用ページで処理）。
   - **開発**: `http://localhost:3001/auth/instagram/callback` またはバックエンド直: `https://localhost:4000/auth/instagram/callback`（環境による）。

4. **コールバック後の処理**
   - **A) GET でバックエンドが直接受け取る場合**: ブラウザが Render の `https://instagram-marketing-backend-v2.onrender.com/auth/instagram/callback?code=...&state=...` に飛ぶ。server.js の GET `/auth/instagram/callback` が code でトークン取得 → 長期化 → ユーザー・メディア取得 → **JSON で token, user 等を返す**。フロントはこの URL を iframe やポップアップで開くか、リダイレクト先で JSON を受け取る設計でないと、そのままでは「ページ」としては表示されない。
   - **B) SPA がコールバックを受け、バックエンドに code を送る場合**: ブラウザは Vercel の `/auth/instagram/callback?code=...` に飛ぶ → SPA の AuthCallback が code を取得 → **POST /auth/instagram/callback** または **POST /api/auth/exchange** に code を送る。バックエンドがトークン取得・DB 保存・JWT 発行（exchange の場合は JWT を返さない実装の可能性あり）→ フロントは token/user をストアと localStorage に保存。

5. **トークン保存先**
   - **バックエンド**: MongoDB の `tokens` コレクション（userId, accessToken, expiresIn, obtainedAt, provider 等）。
   - **フロント**: Zustand の token / currentUser と、localStorage の **IG_JWT** / **IG_USER**（persist の partialize と hydrateFromStorage で利用）。

6. **セッション管理**
   - **サーバー**: express-session を使用（oauth state 等）。セッションストアはデフォルト（メモリ）の可能性が高く、Render の複数インスタンスでは別途 Redis 等が必要な場合あり。
   - **フロント**: 「セッション」は JWT と currentUser の有無で表現。API 呼び出しは **Authorization: Bearer <JWT>**。ログアウトはストアと localStorage のクリアのみ（JWT の無効化リストは未実装の可能性）。

### 7.2 図（簡易）

```
[ユーザー] → [Login] → [GET /auth/instagram] → [Facebook OAuth]
                                                      ↓
[Vercel /auth/instagram/callback?code=...] ← [Facebook リダイレクト]
        ↓
[AuthCallback で code 取得]
        ↓
[POST /api/auth/exchange または POST /auth/instagram/callback]（body: { code }）
        ↓
[バックエンド: 短期→長期トークン、MongoDB 保存、JWT 発行]
        ↓
[フロント: token/user を useAppStore + IG_JWT / IG_USER に保存]
        ↓
[Dashboard 等へ遷移]
```

---

以上で、ディレクトリ構造・重要ファイル・エンドポイント・Meta/Instagram 連携・デプロイ・既知の課題・認証フローを一通り把握できる構成にしています。**2. 重要ファイル** と **4. Meta/Instagram 連携** は優先度が高いため、該当ファイルを開いて差分確認する際の参照として使ってください。
