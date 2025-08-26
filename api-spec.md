# Instagram Marketing App API仕様書

## 📋 概要

このドキュメントは、Instagram Marketing AppのAPIエンドポイントの仕様を定義します。

## 🔗 ベースURL

- **開発環境**: `http://localhost:4000/api`
- **本番環境**: `https://instagram-marketing-backend-v2.onrender.com/api`

## 📊 認証関連エンドポイント

### POST /api/auth/login
ユーザーログイン
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/register
ユーザー登録
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "ユーザー名"
}
```

### GET /api/auth/me
現在のユーザー情報取得

### POST /api/auth/facebook/callback
Facebook認証コールバック

## 📸 Instagram関連エンドポイント

### GET /api/instagram/media/:igUserId
Instagram投稿取得
```
Query Parameters:
- access_token: Facebookアクセストークン
- instagram_business_account_id: Instagram Business Account ID
```

### GET /api/instagram/insights/:mediaId
Instagram投稿インサイト取得
```
Query Parameters:
- access_token: Facebookアクセストークン
```

### GET /api/instagram/history/demo
デモ用投稿履歴取得

## 🤖 AI分析関連エンドポイント

### POST /api/analyze
投稿分析
```json
{
  "caption": "投稿内容",
  "imageUrl": "画像URL",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "targetAudience": "ターゲット層",
  "aiProvider": "openai" | "google"
}
```

### POST /api/analytics/dashboard
アナリティクスダッシュボードデータ取得

### GET /api/analysis-history/stats
分析履歴統計取得

### GET /api/analysis-history/history
分析履歴取得

### GET /api/threads/analysis-history/:id
特定の分析履歴詳細取得

## 📅 スケジューラー関連エンドポイント

### GET /api/scheduler/posts
スケジュール済み投稿取得

### POST /api/scheduler/posts
投稿スケジュール作成

## 🔍 その他のエンドポイント

### GET /api/health
ヘルスチェック

### GET /api/hashtags/analysis
ハッシュタグ分析データ取得

### POST /api/analyze-url
URL分析
```json
{
  "url": "Instagram投稿URL",
  "template": "分析テンプレート",
  "userId": "ユーザーID"
}
```

## 📝 レスポンス形式

### 成功レスポンス
```json
{
  "success": true,
  "data": {},
  "message": "処理が完了しました"
}
```

### エラーレスポンス
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "details": "詳細情報"
}
```

## 🔒 認証

- JWTトークンを使用した認証
- `Authorization: Bearer <token>` ヘッダーで送信

## 📊 ステータスコード

- `200`: 成功
- `201`: 作成成功
- `400`: リクエストエラー
- `401`: 認証エラー
- `403`: 権限エラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

## 🚀 使用例

### フロントエンドでのAPI呼び出し

```typescript
// 環境変数からベースURLを取得
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 投稿分析の実行
const response = await fetch(`${API_BASE_URL}/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    caption: '投稿内容',
    aiProvider: 'openai'
  })
});

const result = await response.json();
```

## ⚠️ 注意事項

1. **API二重パス禁止**: `/api/api/...` のような二重パスは使用しない
2. **環境変数管理**: APIキーは必ず環境変数で管理する
3. **CORS設定**: 本番環境では適切なCORS設定が必要
4. **エラーハンドリング**: 適切なエラーハンドリングを実装する
