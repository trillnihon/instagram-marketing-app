# 🚀 次のチャット用クイックスタートガイド

## 📋 5分で状況把握

### 🎯 現在の状況
Instagram マーケティングアプリは基本的に動作しているが、**バックエンドAPIの404エラー**が主要な問題。

### ✅ 動作しているもの
- Instagram Graph API 認証
- ユーザー認証・ページ遷移
- 投稿データの取得・表示

### ❌ 問題の箇所
1. **`/instagram/history/:userId`** → 404エラー
2. **`/scheduler/posts`** → 404エラー
3. **Mock API 残存** → `via.placeholder.com` の503エラー

## 🔍 即座に確認すべきファイル

### 1. 引き継ぎ書
```
HANDOVER_REPORT_2025-08-25.md
```
**必ず最初に読むこと！** 詳細な状況と修正履歴が記載されています。

### 2. 主要な修正ファイル
```
src/services/mockApi.ts          # API呼び出しロジック
src/components/PostHistory.tsx    # 投稿履歴表示
src/components/PostScheduler.tsx  # 投稿スケジューラー
src/components/PostAnalytics.tsx  # 投稿分析
```

### 3. バックエンド確認
```
server/server.js                  # メインサーバー
api-spec.md                       # API仕様書
```

## 🚨 絶対に変更してはいけない箇所

### 環境変数
```typescript
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api
```

### 認証フロー
- `ProtectedRoute` の `isAuthenticated`, `currentUser` チェック
- Instagram Graph API の accessToken 取得処理

## 🔧 次のステップ（優先順位順）

### 1. バックエンドAPI動作確認
```bash
# テスト用エンドポイント
curl https://instagram-marketing-backend-v2.onrender.com/api/instagram/history/demo_user
curl -X POST https://instagram-marketing-backend-v2.onrender.com/api/scheduler/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_user","month":8,"year":2025}'
```

### 2. フロントエンドのAPI呼び出し確認
ブラウザの開発者ツールで以下を確認：
- Network タブで404エラーの詳細
- Console タブでデバッグログ

### 3. Mock API の完全切り替え
本番APIが正常動作する場合、`mockApi.ts` の呼び出しを停止

## 📊 デバッグ情報

### 現在のログ出力
- `[DEBUG]` - 一般的なデバッグ情報
- `[API FALLBACK]` - API呼び出し失敗時のフォールバック
- `[MOCK API]` - Mock API の使用

### エラーパターン
```
GET https://instagram-marketing-backend-v2.onrender.com/instagram/history/demo 404
POST https://instagram-marketing-backend-v2.onrender.com/scheduler/posts 404
GET https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Demo+Post+1 503
```

## 🎯 成功の定義

- バックエンドAPIが正常応答（200）
- Mock API が呼ばれない
- `via.placeholder.com` の503エラーが発生しない
- ユーザーが正常に投稿履歴とスケジュールを表示できる

## 📞 困ったときは

1. **引き継ぎ書を再読**: `HANDOVER_REPORT_2025-08-25.md`
2. **README確認**: `README.md` の引き継ぎ情報
3. **デバッグログ確認**: ブラウザコンソールの詳細ログ

---

**作成日**: 2025-08-25  
**目的**: 次のチャットが5分で状況を把握し、適切な対応を行えるようにする
