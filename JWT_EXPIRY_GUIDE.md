# JWT有効期限制御設定ガイド

## 概要

JWTの有効期限を環境ごとに切り替えられるように実装しました。

## 環境変数設定

### 1. JWT_EXPIRES_IN（オプション）
JWTの有効期限を直接指定できます。

```bash
# 例: 30分
JWT_EXPIRES_IN=30m

# 例: 2時間
JWT_EXPIRES_IN=2h

# 例: 1日
JWT_EXPIRES_IN=1d
```

### 2. NODE_ENV（必須）
環境を指定します。JWT_EXPIRES_INが未設定の場合のデフォルト値に影響します。

```bash
# 本番環境
NODE_ENV=production

# 開発環境
NODE_ENV=development

# テスト環境
NODE_ENV=test
```

## デフォルト設定

| 環境 | NODE_ENV | JWT_EXPIRES_IN未設定時 | 用途 |
|------|----------|----------------------|------|
| 本番 | production | 7日間 ("7d") | 本番運用 |
| 開発/テスト | development/test | 60秒 ("60s") | テスト・デバッグ |

## 設定例

### 本番環境（Render）
```bash
NODE_ENV=production
JWT_SECRET=your-strong-secret-key
# JWT_EXPIRES_IN=7d  # デフォルト値を使用
```

### 開発環境
```bash
NODE_ENV=development
JWT_SECRET=dev-secret-key
# JWT_EXPIRES_IN=60s  # デフォルト値を使用
```

### テスト環境
```bash
NODE_ENV=test
JWT_SECRET=test-secret-key
# JWT_EXPIRES_IN=60s  # デフォルト値を使用
```

### カスタム設定
```bash
NODE_ENV=development
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=5m  # 5分に設定
```

## テスト方法

### 1. テスト環境での動作確認

```bash
# テスト環境でサーバーを起動
NODE_ENV=test npm start

# 別のターミナルでJWTテストスクリプトを実行
node test-jwt-expiry.js
```

### 2. 認証フローでの確認

1. テスト環境でInstagram認証を実行
2. localStorageにJWTが保存されることを確認
3. 60秒待機
4. APIリクエストを実行
5. 認証エラー（401）が発生することを確認

### 3. 本番環境での確認

1. 本番環境でInstagram認証を実行
2. localStorageにJWTが保存されることを確認
3. 7日間ログイン状態が維持されることを確認

## 実装詳細

### バックエンド（server/routes/auth.js）

```javascript
// JWT有効期限を環境ごとに設定
const expiresIn = process.env.JWT_EXPIRES_IN 
    || (process.env.NODE_ENV === "production" ? "7d" : "60s");

console.log(`🔍 [AUTH] JWT有効期限設定:`, {
  NODE_ENV: process.env.NODE_ENV,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  finalExpiresIn: expiresIn
});

const token = jwt.sign(jwtPayload, secret, { expiresIn });
```

### ログ出力例

```
🔍 [AUTH] JWT有効期限設定: {
  NODE_ENV: 'test',
  JWT_EXPIRES_IN: undefined,
  finalExpiresIn: '60s'
}
```

## 注意事項

1. **セキュリティ**: 本番環境では強度のあるJWT_SECRETを設定してください
2. **テスト**: テスト環境では短い有効期限で期限切れ動作を確認できます
3. **デバッグ**: 開発環境でも短い有効期限でデバッグが容易になります
4. **互換性**: 既存の認証フローに影響はありません

## トラブルシューティング

### JWTが期限切れにならない
- NODE_ENVが正しく設定されているか確認
- JWT_EXPIRES_INが期待通りの値になっているか確認
- サーバーのログでJWT有効期限設定を確認

### 認証エラーが発生しない
- フロントエンドのJWT検証ロジックを確認
- localStorageのJWTが正しく更新されているか確認
- ブラウザの開発者ツールでネットワークリクエストを確認
