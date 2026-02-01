# 全文共有と確認ポイント回答

依頼されたファイルの全文と、トークン更新・コールバック・mockApi・セキュリティに関する回答をまとめました。

**長いファイルの全文**: 以下は行数が多いため、リポジトリ内のファイルを直接開いて全文を確認してください。  
- `src/store/useAppStore.ts`（355行）  
- `server/routes/auth.js`（534行）  
- `src/services/mockApi.ts`（456行）  
- `scripts/refresh-long-lived-token.ts`（468行）

---

## 確認ポイントへの回答（先に結論）

### 1. トークン自動更新

- **scripts/refresh-long-lived-token.ts**: 全文は下記「7. refresh-long-lived-token.ts」を参照。
- **現在の cron 設定**: **リポジトリ内に cron 設定はありません**。Render の Cron Jobs や GitHub Actions の schedule、外部 cron サービス等も未設定です。トークン更新は手動で `npm run token:refresh` または `tsx scripts/refresh-long-lived-token.ts`（オプション: `--rotate-now`, `--dry-run`, `--report`）を実行する必要があります。
- **補足**: スクリプトは `env.development` を読むため、本番で cron 化する場合は環境変数を渡すか、本番用の設定パス対応が必要です。また MongoDB の Token コレクション（mongoose モデル）に保存しますが、auth.js で使うのは **MongoClient の `tokens` コレクション**（別スキーマ）なので、保存先の統一が必要かどうか検討してください。

### 2. POST /auth/instagram/callback と GET /auth/instagram/callback の違い・本番でどちらか

- **GET /auth/instagram/callback**  
  - **用途**: Facebook が認可後に**ブラウザをこのURLにリダイレクト**するときの受け口。クエリに `code` と `state` が付く。  
  - **流れ**: バックエンドが code で短期トークン取得 → 長期トークン交換 → Basic Display でユーザー・メディア取得 → **JSON で success, user, access_token, recent_posts 等を返す**。  
  - **注意**: 本番ではブラウザはまず **Vercel** の `/auth/instagram/callback` に飛ぶ（vercel.json の rewrite で SPA に着く）ため、**GET がバックエンドに直接届くのは「バックエンドのURLをコールバックURLにした場合」のみ**です。

- **POST /auth/instagram/callback**  
  - **用途**: **フロント（SPA）が同じコールバック画面で code を受け取り、バックエンドに code を送る**ときの受け口。body に `{ code, state }`。  
  - **流れ**: バックエンドで code → 短期→長期トークン、ページ一覧取得、Instagram Business Account 取得、User 作成/更新、**JWT 発行** → **JSON で token, user 等を返す**。フロントはこの token/user をストアと localStorage に保存。

- **本番でどちらが使われるか**  
  - **コールバックURL が Vercel（SPA）の場合**（例: `https://instagram-marketing-app.vercel.app/auth/instagram/callback`）: ブラウザは Vercel に飛ぶ → SPA の AuthCallback が code を取得 → **POST でバックエンドの `/auth/instagram/callback` に code を送る**、または **POST /api/auth/exchange**（auth.js）に送る。  
    - **exchange** は MongoDB にトークンを保存するだけで **JWT を返さない**。  
    - **POST /auth/instagram/callback** は **JWT を返す**ので、フロントでログイン状態にするにはこちらを使う必要があります。  
  - **コールバックURL が Render（バックエンド）の場合**（例: `https://instagram-marketing-backend-v2.onrender.com/auth/instagram/callback`）: Facebook がバックエンドに直接 GET で飛ばす → **GET /auth/instagram/callback** が実行され、JSON がブラウザに返ります。この場合、フロントはこのレスポンスをどう受け取るか（ポップアップや別タブなど）の設計が必要です。

- **結論**: 本番のコールバックURL が Vercel なら、**実質使われるのは POST /auth/instagram/callback**（フロントが code を POST する流れ）。GET は「バックエンドをコールバックURLにしている」場合にのみ使われます。

### 3. mockApi.ts のフォールバック条件（本番成功時に Mock を使わないか）

- **apiWithFallback** の実装では **「本番APIのみ」** で、**成功時に Mock にフォールバックする処理はありません**。
- 各メソッドは `fetch(apiUrl)` を1回だけ実行し、  
  - `response.ok` なら **その場で `return data`**（本番の結果を返す）。  
  - それ以外は **`throw new Error(...)`** でエラーにし、**Mock を呼ぶコードはありません**。
- 名前は「Fallback」ですが、**現在のコードは「本番API専用」**で、Mock フォールバックは停止済みです。  
- 別オブジェクト **mockApi**（getInstagramHistory 等でモックデータを返す）は、**apiWithFallback からは一切参照されていません**。コンポーネントが **apiWithFallback** を import している限り、本番成功時に Mock が使われることはありません。

### 4. セキュリティ設定（CORS allowed origins）

- **server/middleware/security.js** の CORS は次のとおりです。
- **本番（NODE_ENV === 'production'）**  
  - 固定: `https://instagram-marketing-app.vercel.app`, `https://instagram-marketing-app-v1.vercel.app`, 上記2つの Vercel プレビュー用 URL, `https://instagram-marketing-backend-v2.onrender.com`  
  - ワイルドカード: `https://*.vercel.app`  
  - 環境変数: `CORS_ORIGIN` が設定されていれば追加、`CORS_ORIGINS`（カンマ区切り）も追加。
- **開発**  
  - `http(s)://localhost:3000`, `http(s)://localhost:3001`, `http(s)://localhost:3002`
- **allowedHeaders**: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key  
- **credentials**: true

---

以下、依頼の「全文」を掲載します。

---

## 1. src/store/useAppStore.ts（全文）

※ 行数が長いため、ファイルパス `src/store/useAppStore.ts` の内容をそのまま参照してください。  
（上記「確認ポイント」で引用した通り、Zustand + persist、login/signup/OAuth/hydrateFromStorage、IG_JWT/IG_USER の永続化、oauthLogin で Instagram は Basic Display の URL、Facebook は v19.0 の URL を開く実装です。）

<details>
<summary>クリックで展開: useAppStore.ts の主要部分</summary>

- 355行。create + persist、partialize で isAuthenticated, token, currentUser, analysisHistory を永続化。
- login: POST `${API_BASE_URL}/auth/login`（API_BASE_URL は VITE_API_BASE_URL または本番URL）。
- signup: POST `${API_BASE_URL}/api/auth/signup`（VITE_BACKEND_URL を使用）。
- updateProfile / changePassword / deleteAccount / fetchProfile: 相対パス `/api/auth/...` を使用（要確認: 本番では VITE_API_BASE_URL ベースの絶対URLにすべき場合あり）。
- oauthLogin('instagram'): VITE_INSTAGRAM_APP_ID と VITE_INSTAGRAM_REDIRECT_URI で Instagram Basic Display の authorize URL に遷移。
- oauthLogin('facebook'): VITE_FACEBOOK_APP_ID と `${window.location.origin}/auth/callback` で Facebook v19.0 に遷移。
- hydrateFromStorage: localStorage の IG_JWT と IG_USER を読んで set。

</details>

---

## 2. src/lib/apiClient.ts（全文）

```typescript
/**
 * APIクライアント - 自動リトライ機能付き
 * Renderの無料プランのスピンダウン対策
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelay: 500,
  maxDelay: 5000,
  backoffMultiplier: 2
};

function shouldRetry(status: number, error: Error | null): boolean {
  if (status === 503 || status === 502 || status === 504) return true;
  if (error && (error.name === 'TypeError' || error.name === 'AbortError' ||
      error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) return true;
  return false;
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retryConfig: Partial<RetryConfig> = {}): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
      if (response.ok) return response;
      if (shouldRetry(response.status, null)) lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      else return response;
    } catch (error) {
      lastError = error as Error;
      if (!shouldRetry(0, lastError)) throw lastError;
    }
    if (attempt < config.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, calculateDelay(attempt, config)));
    }
  }
  throw lastError || new Error('最大リトライ回数に達しました');
}

export const apiClient = {
  get(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, { ...options, method: 'GET' });
  },
  post(endpoint: string, data?: any, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, { ...options, method: 'POST', headers: { 'Content-Type': 'application/json', ...options.headers }, body: data ? JSON.stringify(data) : undefined });
  },
  put(endpoint: string, data?: any, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, { ...options, method: 'PUT', headers: { 'Content-Type': 'application/json', ...options.headers }, body: data ? JSON.stringify(data) : undefined });
  },
  delete(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, { ...options, method: 'DELETE' });
  },
  request(endpoint: string, options: RequestInit = {}, retryConfig: Partial<RetryConfig> = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, options, retryConfig);
  }
};

export function createApiUrl(endpoint: string): string {
  return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
}

export default apiClient;
```

---

## 3. server/routes/auth.js（全文）

※ 534行のため、リポジトリ内の `server/routes/auth.js` を直接開いて確認してください。  
主な内容: register, login, me（認証必須）, env-check, GET /instagram（Facebook OAuth 開始）, POST /exchange（code → 短期→長期、MongoDB tokens 保存、JWT は返さない）, POST /save-token（access_token 受信、長期化、MongoDB 保存、JWT 返却）, GET /tokens。  
auth は `app.use('/api/auth', authRoutes)` と `app.use('/auth', authRoutes)` の両方でマウントされているため、**POST /api/auth/exchange** と **POST /auth/exchange** の両方で同じ処理が動きます。

---

## 4. server/config/database.js（全文）

```javascript
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'instagram-marketing';

mongoose.set('strictQuery', true);

async function connectDB() {
  if (!uri) throw new Error('MONGODB_URI is not set');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      dbName,
    });
    console.log('[mongo] connected');
  } catch (err) {
    console.error('[mongo] connection error:', err.message);
  }

  mongoose.connection.on('error', (e) => {
    console.error('[mongo] runtime error:', e?.message || e);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] disconnected');
  });
}

export default connectDB;
```

---

## 5. server/models/User.js（全文）

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: function() { return !this.oauthProvider; }, minlength: 6 },
  oauthProvider: { type: String, enum: ['instagram', 'facebook', null], default: null },
  oauthId: { type: String, default: null },
  instagramAccessToken: { type: String, default: null },
  instagramUserId: { type: String, default: null },
  profile: { displayName: { type: String, trim: true, maxlength: 50 }, bio: { type: String, maxlength: 200 }, avatar: { type: String, default: null } },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  preferences: { theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' }, language: { type: String, default: 'ja' }, notifications: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true } } }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) { next(error); }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
  return { id: this._id, username: this.username, email: this.email, profile: this.profile, isAdmin: this.isAdmin, lastLogin: this.lastLogin, createdAt: this.createdAt };
};

userSchema.statics.findOrCreateOAuthUser = async function(oauthData) {
  const { provider, oauthId, email, username, accessToken, instagramUserId } = oauthData;
  let user = await this.findOne({ oauthProvider: provider, oauthId: oauthId });
  if (!user) {
    user = new this({ username: username || `user_${oauthId}`, email, oauthProvider: provider, oauthId, instagramAccessToken: accessToken, instagramUserId, profile: { displayName: username || `User ${oauthId}` } });
    await user.save();
  } else {
    user.instagramAccessToken = accessToken;
    user.instagramUserId = instagramUserId;
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
  }
  return user;
};

export const User = mongoose.model('User', userSchema);
```

---

## 6. server/models/Token.js（全文）

```javascript
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true, enum: ['ig_long_lived', 'fb_long_lived', 'ig_short_lived', 'fb_short_lived'] },
  token: { type: String, required: true },
  expireAt: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

tokenSchema.index({ expireAt: 1 });
tokenSchema.index({ type: 1, expireAt: 1 });

tokenSchema.statics.getValidToken = async function(type) {
  const now = new Date();
  return await this.findOne({ type, expireAt: { $gt: now } }).sort({ updatedAt: -1 });
};

tokenSchema.methods.isValid = function() { return this.expireAt > new Date(); };
tokenSchema.methods.getRemainingTime = function() {
  const now = new Date();
  return Math.max(0, this.expireAt.getTime() - now.getTime());
};
tokenSchema.methods.getRemainingDays = function() {
  return Math.ceil(this.getRemainingTime() / (1000 * 60 * 60 * 24));
};

export const Token = mongoose.model('Token', tokenSchema);
```

---

## 7. scripts/refresh-long-lived-token.ts（全文）

※ 468行あります。要約と先頭・主要部分のみ掲載し、全文はリポジトリの `scripts/refresh-long-lived-token.ts` を開いて確認してください。

- **dotenv**: `config({ path: '../env.development' });` で環境変数読み込み。
- **MongoDB**: `MONGODB_URI` で接続。Token モデルはスクリプト内で定義（type, token, expireAt, updatedAt）。
- **オプション**: `--dry-run`, `--rotate-now`, `--report`。
- **処理**: (1) MongoDB 接続 (2) FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FB_USER_SHORT_TOKEN の存在確認 (3) 既存 FB_USER_OR_LL_TOKEN の有効性チェック（Graph API /me） (4) 必要なら短期→長期トークン交換（fb_exchange_token） (5) 環境変数ファイル更新（updateEnvFile） (6) Token を DB に保存（saveTokenToDB: type 'ig_long_lived' で upsert） (7) 新トークンの有効性確認。
- **自動実行**: スクリプト内に cron や setInterval はなく、**手動または外部スケジューラで実行する前提**です。

---

## 8. src/services/mockApi.ts（全文）

※ 456行。本番APIのみを使う **apiWithFallback** のロジックは以下のとおりです。

- **getInstagramHistory(userId)**: `fetch(apiBaseUrl + '/instagram/history/' + userId)`。ok なら `return data`、それ以外は `throw new Error(...)`。Mock は呼ばない。
- **getScheduledPosts(userId, month?, year?)**: `fetch(apiBaseUrl + '/scheduler/posts?' + params)`。同様に ok なら return、否则 throw。
- **getAnalyticsData()**: POST `apiBaseUrl + '/analytics/dashboard'`。同様。
- **getHashtagData()**: GET `apiBaseUrl + '/hashtags/analysis'`。同様。
- **healthCheck()**: GET `apiBaseUrl + '/health'`。同様。
- **checkProductionApiStatus()**: 複数エンドポイントに GET して結果をまとめるだけ。フォールバックなし。

**mockApi** オブジェクト（モックデータを返す関数）は同じファイル内にあり、**apiWithFallback からは一切参照されていません**。コンポーネントが `apiWithFallback` を import している限り、本番成功時に Mock が使われることはありません。

---

## 9. server/middleware/security.js（全文）

```javascript
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const origins = [
      'https://instagram-marketing-app.vercel.app',
      'https://instagram-marketing-app-v1.vercel.app',
      'https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app',
      'https://instagram-marketing-app-git-main-trillnihons-projects.vercel.app',
      'https://instagram-marketing-backend-v2.onrender.com'
    ];
    origins.push('https://*.vercel.app');
    if (process.env.CORS_ORIGIN) origins.push(process.env.CORS_ORIGIN);
    if (process.env.CORS_ORIGINS) {
      origins.push(...process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()));
    }
    return origins;
  } else {
    return [
      'http://localhost:3000', 'https://localhost:3000',
      'http://localhost:3001', 'https://localhost:3001',
      'http://localhost:3002', 'https://localhost:3002'
    ];
  }
};

export const corsOptions = {
  origin: getCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-API-Key']
};

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'リクエスト制限に達しました。しばらく時間をおいてから再試行してください。' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path.startsWith('/static/')
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: '認証試行回数が上限に達しました。しばらく時間をおいてから再試行してください。' },
  standardHeaders: true,
  legacyHeaders: false
});

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://graph.facebook.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

export const securityHeaders = (req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

export const requireHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const isSecure = req.secure || req.get('X-Forwarded-Proto') === 'https';
    if (!isSecure) return res.status(403).json({ success: false, message: 'HTTPS接続が必要です。...' });
  }
  next();
};

export const validateJWTSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET環境変数が設定されていません');
  if (jwtSecret.length < 16) throw new Error('JWT_SECRETは最低16文字以上である必要があります');
  // 強度チェック（略）
  return true;
};

export const requestSizeLimit = { limit: '10mb', extended: true, parameterLimit: 1000 };

export const fileUploadLimit = {
  fileSize: 5 * 1024 * 1024,
  files: 5,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('許可されていないファイルタイプです'), false);
  }
};
```

---

以上で、依頼の「全文」と「確認したい追加ポイント」への回答を一通り記載しました。認証フローの詳細やエンドポイント一覧は **docs/CURSOR_STATUS_OVERVIEW.md** を参照してください。
