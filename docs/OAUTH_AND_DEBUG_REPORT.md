# デバッグパネル非表示対応 & 本番OAuth確認レポート

**作成日**: 2026-02-01

---

## 1. デバッグパネルの非表示対応

### コンポーネントの場所

| 項目 | 内容 |
|------|------|
| **コンポーネント** | `src/components/DebugPanel.tsx` |
| **使用箇所** | `src/App.tsx` 350行目: `<DebugPanel />` |

### 実施した対応

- **方法A（本番非表示）**: `import.meta.env.PROD === true` のときはパネルを描画しない（`return null`）。
- **方法B（オプション）**: 本番でも `?debug=true` が付いているときだけ表示するようにした。

**変更ファイル**: `src/components/DebugPanel.tsx`

```ts
// 本番環境では非表示（サブスク販売時にユーザーに見せない）
const isProd = import.meta.env.PROD;
const showDebug = !isProd || new URLSearchParams(window.location.search).get('debug') === 'true';
if (!showDebug) return null;
```

### 結果

- 本番ビルド（Vercel）では通常、デバッグパネルは表示されない。
- 本番で確認したいときは `https://instagram-marketing-app.vercel.app/?debug=true` で表示可能。

---

## 2. 本番Instagram OAuth認証テストの準備（確認事項）

### 2.1 Meta App の設定確認（手動で実施）

Meta Developers Console（https://developers.facebook.com/apps/）で次を確認してください。

- アプリのステータス（**Live** / Development）
- **有効な OAuth リダイレクトURI** に次が含まれていること:  
  `https://instagram-marketing-app.vercel.app/auth/instagram/callback`
- 必要な権限の承認状況:
  - `instagram_basic`
  - `instagram_content_publish`
  - `instagram_manage_insights`（または `instagram_manage_comments`）
  - `pages_show_list`
  - `pages_read_engagement`

### 2.2 OAuth URL の構築箇所

| ファイル | 行番号 | 内容 |
|----------|--------|------|
| **src/pages/Login.tsx** | 64 | 「Facebook Login for Business」ボタン用。`https://www.facebook.com/v23.0/dialog/oauth` を構築。本番ではここに遷移。 |
| **src/store/useAppStore.ts** | 384 | Instagram OAuth: `https://api.instagram.com/oauth/authorize?...` |
| **src/store/useAppStore.ts** | 395 | Facebook OAuth: `https://www.facebook.com/v19.0/dialog/oauth?...` |
| **src/services/instagramAuth.ts** | 63 | `FACEBOOK_AUTH_URL/v19.0/dialog/oauth?...`（client_id, redirect_uri, scope, state） |
| **server/server.js** | 412 | サーバー側: `https://www.facebook.com/v19.0/dialog/oauth?...` |
| **server/server.js** | 426 | サーバー側: 上記と同様の OAuth URL 構築 |

### 2.3 redirect_uri に設定されているURL

| 場所 | 変数・環境変数 | 設定値（本番） |
|------|----------------|----------------|
| **フロント（Login）** | `VITE_FACEBOOK_REDIRECT_URI` / フォールバック | `https://instagram-marketing-app.vercel.app/auth/instagram/callback` |
| **フロント（本番以外）** | `finalRedirectUri`（localhost） | `http://localhost:3001/auth/callback` |
| **フロント（instagramAuth）** | `VITE_INSTAGRAM_REDIRECT_URI` / フォールバック | `https://instagram-marketing-app.vercel.app/auth/instagram/callback`（または localhost） |
| **サーバー server.js** | `REDIRECT_URI`（本番） | `https://instagram-marketing-app.vercel.app/auth/instagram/callback` |
| **サーバー server.js** | `REDIRECT_URI`（開発） | `http://localhost:3000/auth/callback` |
| **サーバー routes/auth.js** | `FB_REDIRECT_URI` | 環境変数 `FB_REDIRECT_URI` を参照 |

※ Meta の「有効な OAuth リダイレクトURI」には、本番で実際に使う  
`https://instagram-marketing-app.vercel.app/auth/instagram/callback` を登録してください。

### 2.4 Meta App ID がコードに含まれている場所

| 場所 | 用途 |
|------|------|
| **フロント** | |
| `src/pages/Login.tsx` 45行目 | `VITE_FACEBOOK_APP_ID`、フォールバック `'1003724798254754'` |
| `src/pages/Login.tsx` 54行目 | 固定値 `finalFacebookAppId = '1003724798254754'`（本番で使用） |
| `src/store/useAppStore.ts` 380, 391行目 | `VITE_INSTAGRAM_APP_ID` / `VITE_FACEBOOK_APP_ID` |
| `src/services/instagramAuth.ts` 30行目 | `VITE_FACEBOOK_APP_ID`、フォールバック `'1003724798254754'` |
| **バックエンド** | |
| `server/server.js` 149行目 | `FACEBOOK_APP_ID`（環境変数 `FACEBOOK_APP_ID` or `FACEBOOK_CLIENT_ID`、フォールバック `'1003724798254754'`） |
| `server/routes/auth.js` 17行目 | `FB_APP_ID`（環境変数 `FB_APP_ID`） |
| `server/routes/diagnostics.js` 7行目 | 定数 `FACEBOOK_APP_ID` |
| `server/facebook_diagnostics.js` 7行目 | 定数 `FACEBOOK_APP_ID` |
| **環境変数・設定例** | |
| `.env`, `.env.production`, `.env.vercel` 等 | `VITE_FACEBOOK_APP_ID`, `FACEBOOK_APP_ID` など |

※ 本番の「Facebook Login for Business」では、Login.tsx の `finalFacebookAppId`（1003724798254754）が使われています。

### 2.5 バックエンドの認証エンドポイント

- **POST /api/auth/callback**: コールバックで受け取った `code` を短期トークン→長期トークンに交換するフローは、**server/server.js** および **server/routes/auth.js** に実装されています。
- 本番では Render の `https://instagram-marketing-backend-v2.onrender.com/api` に対して `POST /api/auth/callback` が正しく動くか、実際に OAuth フローを一度実行して確認することを推奨します。

### 2.6 フロントエンドの認証フロー

- 「Facebook Login for Business」クリック時は、**Login.tsx** で組み立てた  
  `https://www.facebook.com/v23.0/dialog/oauth?...` に遷移します。
- `redirect_uri` は本番では `https://instagram-marketing-app.vercel.app/auth/instagram/callback`（または環境変数で上書きした値）になります。

---

## 3. 禁止事項（変更していないもの）

- OAuth認証フロー自体のロジック
- `VITE_API_BASE_URL`
- ProtectedRoute
- CORS / セキュリティ設定

上記は一切変更していません。
