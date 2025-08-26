# 🔒 Immutable Configuration (絶対変更禁止設定)

## ⚠️ 重要警告
このファイルに記載されている設定は、**絶対に変更しないでください**。
変更すると、OAuth認証が完全に破綻し、アプリが使用不能になります。

## 🌐 本番環境URL
- **フロントエンド**: `https://instagram-marketing-app.vercel.app`
- **バックエンド**: `https://instagram-marketing-backend-v2.onrender.com/api`

## 🔑 認証設定
- **Facebook App ID**: `1003724798254754`
- **Instagram App ID**: `1003724798254754`
- **OAuthリダイレクトURI**: `https://instagram-marketing-app.vercel.app/auth/instagram/callback`

## 🛠️ サーバーエンドポイント
- **認証開始**: `/auth/start`
- **認証コールバック**: `/auth/callback`
- **Instagram認証コールバック**: `/auth/instagram/callback`

## 📁 環境変数ファイル
以下のファイル内の設定も変更禁止：
- `.env`
- `.env.production`
- `.env.local`
- `.env.production.vercel`

## 🚨 変更禁止の理由
1. **OAuth認証フローの破綻**: Meta Developer Consoleとの設定不一致
2. **既存ユーザーのログイン不可**: 認証後のコールバック処理失敗
3. **新規ユーザーの認証失敗**: アプリ完全停止
4. **本番環境での動作停止**: 運用不能

## 📋 参照方法
チャット内では以下のように参照してください：
```
参照: [immutable-config.md](./immutable-config.md)
```

## 🔄 更新履歴
- **作成日**: 2025-08-24
- **最終更新**: 2025-08-24
- **更新理由**: 初回作成
