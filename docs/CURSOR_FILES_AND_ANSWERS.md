# 追加ファイル全文参照と確認ポイント回答

Cursor 向けに、依頼されたファイルの**所在**と**確認ポイントへの回答**をまとめました。  
実際の全文は各ファイルを開いて確認してください。

---

## 1. 依頼ファイルの所在と全文の場所

| 依頼ファイル | 実際のパス | 備考 |
|--------------|------------|------|
| server/middleware/security.js | `server/middleware/security.js` | 174行。CORS・rateLimit・helmet・securityHeaders・requireHTTPS・validateJWTSecret・requestSizeLimit・fileUploadLimit |
| server/middleware/auth.js | `server/middleware/auth.js` | 101行。generateToken・verifyToken・authenticateToken・requireAdmin・optionalAuth |
| server/routes/auth.js | `server/routes/auth.js` | 534行。register・login・me・env-check・instagram・exchange・save-token・tokens |
| server/routes/instagram-api.js | `server/routes/instagram-api.js` | 677行。health・diagnostic・user-info・pages・media・insights・exchange-token・status 等 |
| server/services/instagramService.js | **なし** | 代わりに `server/services/instagram-api.js` と `server/services/instagramGraphService.js` を使用 |
| src/store/useAppStore.ts | `src/store/useAppStore.ts` | 355行。Zustand + persist、認証・OAuth・hydrateFromStorage |
| src/lib/apiClient.ts | `src/lib/apiClient.ts` | 161行。BASE_URL・リトライ付き fetch |
| src/services/mockApi.ts | `src/services/mockApi.ts` | 456行。mockApi と apiWithFallback（本番APIのみ） |
| config/database.js | **server/config/database.js** | `server/config/database.js`。mongoose 接続のみ |
| render.yaml | `render.yaml` | 50行。本ドキュメント作成時に **healthCheckPath を /api/health に修正済み** |
| vercel.json | `vercel.json` | 34行 |
| package.json（ルート） | `package.json` | 87行 |
| server/server.js（抜粋） | `server/server.js` | 下記「メインサーバー抜粋」参照 |

---

## 2. server/server.js 抜粋

### 2.1 import / require（先頭〜95行付近）

```javascript
// exit-watchdogを最初にimport（副作用ロード）
import { patchHttpServer } from './utils/exit-watchdog.js';
import 'express-async-errors';

import express from 'express';
import session from 'express-session';
import axios from 'axios';
import cors from 'cors';
import OpenAI from 'openai';
import https from 'https';
import fs from 'fs';
import fetch from 'node-fetch';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { fileURLToPath } from 'url';
import detect from 'detect-port';
import { analyzePost } from './aiProviderRouter.js';

import {
  corsOptions, rateLimiter, authRateLimiter, helmetConfig,
  securityHeaders, requestSizeLimit, requireHTTPS, validateJWTSecret
} from './middleware/security.js';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js';
import logger, { requestLogger } from './utils/logger.js';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import { User } from './models/User.js';
import { authenticateToken } from './middleware/auth.js';
import instagramApiRouter from './routes/instagram-api.js';
import schedulerRoutes from './routes/scheduler.js';
import analysisHistoryRoutes from './routes/analysisHistory.js';
// ... 他ルーター
```

### 2.2 /api/health エンドポイント（249〜262行付近）

```javascript
app.get('/api/health', (_req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  import('mongoose').then(mongoose => {
    const state = mongoose.default.connection.readyState;
    const connected = state === 1;
    res.json({
      status: connected ? 'ok' : 'degraded',
      mongodb: connected ? 'connected' : 'disconnected',
      connection_status: connected ? 'success' : 'failed',
    });
  });
});
```

### 2.3 ミドルウェア設定（179〜206行付近）

```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(helmetConfig);
  app.use(securityHeaders);
  app.use(requireHTTPS);
  app.use(cors(corsOptions));
  app.use(rateLimiter);
  app.use(requestLogger);
} else {
  app.use(cors(corsOptions));
}
app.use(express.json(requestSizeLimit));
app.use(express.urlencoded(requestSizeLimit));
app.use(session({ secret: process.env.SESSION_SECRET || '...', ... }));
```

### 2.4 エラーハンドラー設定（3061〜3065行付近）

```javascript
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## 3. 確認ポイントへの回答

### 3.1 render.yaml の healthCheckPath を /api/health にすべきか

**結論: はい。修正済みです。**

- サーバーが公開しているのは **GET /api/health** のみで、**GET /health** は存在しません。
- `healthCheckPath: /health` のままでは Render のヘルスチェックが 404 になり、デプロイ判定が誤る可能性があります。
- **対応**: `render.yaml` の `healthCheckPath` を **/api/health** に変更しました。

```yaml
healthCheckPath: /api/health
```

### 3.2 GET /auth/instagram/callback 内の未定義変数（該当箇所と修正内容）

**問題**: 成功レスポンスで `instagramBusinessAccount` と `pages` を参照していましたが、この GET ハンドラ内では**どちらも定義されていません**（POST 版や /auth/callback では pages 等を取得しているが、GET の流れでは取得していない）。

**該当箇所**（修正前）:

- **server/server.js** の **GET `/auth/instagram/callback`** 内、670〜688行付近
- `user: { id: instagramBusinessAccount.id, ... }` および `debug: { pages, instagramBusinessAccount }` で未定義の `instagramBusinessAccount` と `pages` を参照 → 実行時 ReferenceError の可能性

**修正内容**:

- このハンドラでは **instagramUser**（userRes.data から組み立てたオブジェクト）のみが定義されているため、
  - `user` には **instagramUser** の id / username / account_type を使用
  - `debug` からは **pages** と **instagramBusinessAccount** を削除し、**accessToken** のプレビューと **instagramUser** のみ返すように変更しました。

これにより GET コールバックが正常に JSON を返せるようになっています。

### 3.3 トークン更新ロジック（60日長期トークンの自動更新）

**結論: アプリ内に「切れる前に自動更新」する仕組みはありません。**

- **長期トークン**: 約 60 日有効。MongoDB の `tokens` コレクション（auth.js で使用）や、Token モデル（server/models/Token.js）で保存。
- **手動・スクリプト**:  
  - `scripts/refresh-long-lived-token.ts` が存在し、`npm run token:refresh` や `npm run token:rotate-now` で実行可能。  
  - 短期トークン→長期トークン交換や有効期限チェック・レポートを実施。  
  - **cron 等での定期実行**は現状のコードベースには含まれておらず、Render の cron や外部スケジューラで同じスクリプトを定期実行する必要があります。
- **推奨**: 60 日を切る前に（例: 残り 7 日など）cron で `token:refresh` を実行する運用を検討してください。

### 3.4 MongoDB のスキーマ定義（server/models/ と User）

**server/models/ 配下**:

| ファイル | 用途 |
|----------|------|
| User.js | ユーザー（email・password・OAuth・instagramUserId 等） |
| Token.js | アプリ内トークン（type・token・expireAt）。ig_long_lived 等 |
| InstagramHistory.js | Instagram 履歴 |
| AnalysisHistory.js | 分析履歴 |
| ThreadsData.js | Threads 関連データ |

**User モデル（server/models/User.js）要約**:

- **スキーマ**: username, email, password（OAuth 時は不要）, oauthProvider, oauthId, instagramAccessToken, instagramUserId, profile（displayName, bio, avatar）, isActive, isAdmin, lastLogin, loginCount, preferences（theme, language, notifications）, timestamps
- **メソッド**: comparePassword, getPublicProfile
- **スタティック**: findOrCreateOAuthUser（provider, oauthId, email, username, accessToken, instagramUserId で検索または作成）

**auth.js で使う MongoDB**: `tokens` コレクションを **MongoClient** で直接利用（mongoose の Token モデルとは別）。ドキュメントは userId, accessToken, expiresIn, obtainedAt, provider, userName, userEmail 等。

---

## 4. 今回の修正まとめ

| 項目 | 内容 |
|------|------|
| render.yaml | `healthCheckPath` を `/health` → **/api/health** に変更 |
| server.js GET /auth/instagram/callback | 未定義の `instagramBusinessAccount` と `pages` をやめ、**instagramUser** と **debug** の内容を修正 |

認証フローやその他設定は **docs/CURSOR_STATUS_OVERVIEW.md** を参照してください。
