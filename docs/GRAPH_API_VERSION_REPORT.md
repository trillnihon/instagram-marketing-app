# Graph API バージョン使用状況レポート

**作成日**: 2026-02-01

---

## サマリー

| バージョン | 用途 | ファイル数 | 備考 |
|------------|------|-----------|------|
| **v23.0** | OAuth ダイアログ（Facebook Login for Business） | 1 | フロントのみ |
| **v19.0** | OAuth ダイアログ・Graph API 呼び出し | 多数 | サーバー・フロントの大半 |
| **v18.0** | OAuth ダイアログ（診断用）・Instagram Graph | 4 | 診断スクリプト・Instagram API |

**混在状況**: 本番の「Facebook Login for Business」ボタンは **v23.0**、それ以外の OAuth / Graph は **v19.0** が中心。Instagram 用に **v18.0** も一部使用。

---

## バージョン別一覧

### v23.0（1箇所）

| ファイル | 行 | 内容 |
|----------|-----|------|
| **src/pages/Login.tsx** | 64 | `https://www.facebook.com/v23.0/dialog/oauth?...`（本番の「Facebook Login for Business」ボタンで使用） |

---

### v19.0（多数）

#### フロントエンド

| ファイル | 行 | 内容 |
|----------|-----|------|
| src/store/useAppStore.ts | 395 | `https://www.facebook.com/v19.0/dialog/oauth?...` |
| src/services/instagramAuth.ts | 5 | `FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v19.0'` |
| src/services/instagramAuth.ts | 63 | `.../v19.0/dialog/oauth?...`（上記定数から構築） |

#### サーバー（server.js）

| 行 | 内容 |
|-----|------|
| 412, 426 | `facebook.com/v19.0/dialog/oauth` |
| 471, 618, 772 | `graph.facebook.com/v19.0/oauth/access_token` |
| 486, 530, 633, 792, 810 | me/accounts, me, oauth/access_token 等 |
| 889, 977, 1023, 1771, 1781, 1799, 1808, 1857 | Instagram media / insights / publish |
| 4097, 4111, 4127, 4151, 4165 | me, me/accounts, media 等 |

#### サーバー（その他）

| ファイル | 行 | 内容 |
|----------|-----|------|
| server/routes/auth.js | 317, 390, 401, 421, 447, 614 | dialog/oauth, oauth/access_token, me |
| server/routes/instagram-api.js | 627 | oauth/access_token |
| server/routes/diagnostics.js | 143, 159, 180, 202, 216, 234, 265 | me, app, roles, accounts, instagram |
| server/services/instagram-api.js | 18 | baseURL = 'https://graph.facebook.com/v19.0' |
| server/services/instagramGraphService.js | 268 | oauth/access_token |
| server/services/threadsDataService.js | 17 | v19.0/${endpoint} |
| server/services/tokenService.js | 60 | me |
| server/https-server.js | 63 | me |
| server/facebook_diagnostics.js | 135, 157, 187, 214 | me, app, roles, accounts |

#### スクリプト

| ファイル | 行 | 内容 |
|----------|-----|------|
| scripts/basic-permission-test.ts | 27, 38, 53 | me |
| scripts/debug-token.ts | 27, 76, 99 | me, permissions, accounts |
| scripts/simple-graph-test.ts | 25 | me |
| scripts/healthcheck.ts | 26 | GRAPH_API_URL |

---

### v18.0（4箇所）

| ファイル | 行 | 内容 |
|----------|-----|------|
| server/server.js | 1661 | `https://graph.instagram.com/v18.0/me?...` |
| server/server.js | 1710 | `https://graph.instagram.com/v18.0/me/media?...` |
| server/facebook_diagnostics.js | 310 | `https://www.facebook.com/v18.0/dialog/oauth?...`（診断用） |
| server/enhanced-server.js | 180 | `https://graph.instagram.com/v18.0/me?...` |

---

## 結論と推奨

- **OAuth ダイアログ**: 本番ログインは **Login.tsx の v23.0**、サーバー・その他フロントは **v19.0**。同一フロー内で v23 と v19 が混在している可能性あり。
- **Graph API**: ほとんどが **v19.0**。Instagram 用に **graph.instagram.com v18.0** を一部使用。
- **統一する場合**: プロジェクト方針に合わせて、Login.tsx の v23.0 を v19.0 に合わせるか、または他を v23.0 に合わせるかを検討。Meta のサポート状況（v19.0 / v23.0 の提供期間）の確認を推奨。

※ 本レポートは「確認」のみ。OAuth フロー・認証ロジックの変更は行っていません。
