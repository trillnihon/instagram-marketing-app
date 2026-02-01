# Instagram Marketing App｜現状報告（2026年現在）

## 1️⃣ プロジェクト概要

| 項目 | 内容 |
|------|------|
| **プロジェクト名** | Instagram Marketing App |
| **フロントエンド** | React + Vite → Vercel |
| **バックエンド** | Node.js + Express → Render |
| **API** | Instagram Graph API v19.0 完全対応 |
| **目的** | Instagram投稿管理・分析のSaaS化（商用予定） |

## 2️⃣ 現在の到達状況（結論）

- ✅ 設計・実装は安定フェーズ
- ✅ Graph API v19.0 統一完了
- ✅ Render / Vercel 自動デプロイ運用
- ❌ 未完了なのは Meta側の権限・トークン最終確認のみ  

**👉 致命的なバグや構成ミスは現時点で存在しない**

## 3️⃣ 絶対に変更してはいけない項目（最重要）

以下は理由があって固定されています。**変更禁止。**

| 項目 | 内容 |
|------|------|
| 環境変数キー | `VITE_API_BASE_URL` |
| 本番バックエンドURL | `https://instagram-marketing-backend-v2.onrender.com/api` |
| 認証フロー | Instagram Graph API 認証フロー |
| 認証チェック | ProtectedRoute の認証チェック処理 |

詳細は [immutable-config.md](./immutable-config.md) を参照すること。

## 4️⃣ 過去に発生した重大トラブルと解決内容（再発防止）

### ❌ Render デプロイ失敗（Exited with status 1）

| 原因 | 対応 |
|------|------|
| mongoose v8 非互換オプション（`useNewUrlParser`, `useUnifiedTopology`） | mongoose 非推奨オプション削除 |
| dotenv のパス不整合（Render では `.env.production` が存在しない） | dotenv をやめて `process.env` 直参照（メイン server.js） |

- `/api/health` を `mongoose.connection.readyState` ベースに修正済み。
- **この修正後、Renderデプロイ成功＆MongoDB接続OK。**

## 5️⃣ フロントエンド側の重要修正履歴

- `currentUser?.userId` → `currentUser?.id` に統一
- 404 / 500 エラーを明確に出し分け
- 本番API成功時は Mock API にフォールバックしないよう修正

## 6️⃣ バックエンドAPIの状態

| エンドポイント | 仕様 |
|----------------|------|
| `GET /api/health` | `mongodb`: connected / disconnected、`status`: ok / degraded |
| `GET /api/scheduler/posts` | 実装済み |
| demo_mode への誤フォールバック | 排除済み |

## 7️⃣ 現在の進捗感

- **全体進捗**: 80〜85%
- **実装**: 完了
- **残タスク**:
  - Meta（Facebook / Instagram）側の権限承認
  - 実トークンでの本番スモークテスト
  - 運用・監視（ログ・エラー監視）

## 8️⃣ 開発方針・前提（重要）

- **localhost 前提の修正は禁止** → Render / Vercel のURL前提で検証すること
- **Mock API** は本番API失敗時のみ使用（本番成功時はフォールバックしない）
- **手動運用ではなく自動運用前提**

---

## 9️⃣ 2026年レビューで実施した安全な修正

再発防止・仕様整合のため、**禁止項目には一切触れず**以下のみ実施。

| 修正内容 | ファイル | 理由 |
|----------|----------|------|
| ウォームアップURL修正 | `server/scripts/warmup.mjs` | `/health` → `/api/health`。本番は `/api/health` のみ公開のため 404 防止。 |
| ユーザーID参照統一 | `src/utils/errorHandler.ts` | `currentUser?.userId` → `currentUser?.id`。ストア仕様に合わせてエラー報告時のユーザーIDが正しく取れるようにするため。 |
| APIパス二重 `/api` 解消 | `src/services/mockApi.ts` | `apiBaseUrl` が既に `.../api` のため、パスを `/health`, `/instagram/history/...` 等に変更。本番API呼び出しが正しいURLになるようにするため。 |
| ヘルスレスポンスに `status` 追加 | `server/server.js` | 仕様「connected / not_configured → status: ok」に合わせ、`status: 'ok'` / `'degraded'` を追加。Render・クライアントの判定用。 |

**変更していないもの**: 環境変数キー、本番URL、認証フロー、ProtectedRoute のロジック。

---

## 参照

- [immutable-config.md](./immutable-config.md) — 変更禁止設定一覧
- [docs/handoff/](./docs/handoff/) — 過去の引継ぎ書
