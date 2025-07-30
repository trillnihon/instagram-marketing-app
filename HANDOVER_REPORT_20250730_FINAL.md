# 📋 Instagram Marketing App 申し送り書（2025年7月30日）

## 🎯 プロジェクト概要

**Instagram Marketing App** - AIがあなたのSNS投稿を分析・最適化するWebアプリケーション

### デプロイ状況
- **フロントエンド**: Vercel (https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app)
- **バックエンド**: Render (https://instagram-marketing-backend-v2.onrender.com)
- **データベース**: MongoDB Atlas

---

## 🚨 絶対に変更してはいけない設定

### 1. 統一URL設定（全チャット共通認識）

#### フロントエンド（Vercel）
```
https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

#### バックエンド（Render）
```
https://instagram-marketing-backend-v2.onrender.com
```

### 2. Facebook開発者コンソール設定

#### アプリ情報
- **アプリID**: 1003724798254754
- **アプリシークレット**: fd6a61c31a9f1f5798b4d48a927d8f0c

#### 必須設定項目
- **有効なOAuthリダイレクトURI**: https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
- **アプリドメイン**: instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
- **サイトURL**: https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app

### 3. Instagram API設定

#### アプリ情報
- **アプリID**: 25252287587694713
- **アプリシークレット**: 14ad79e7973687a6e3f803024caaf5b9

#### リダイレクトURI
```
https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
```

### 4. コード内の絶対変更禁止箇所

#### フロントエンド
- `src/services/authService.ts` (10行目): API_BASE_URL直接設定
- `src/services/instagramApi.ts` (10行目): API_BASE_URL直接設定
- `src/pages/AuthCallback.tsx` (40行目): API_BASE_URL直接設定

#### バックエンド
- `server/server.js` (269行目): リダイレクトURI設定
- `server/server.js` (272行目): OAuth認証URL設定

### 5. 環境変数設定

#### フロントエンド（env.production）
```env
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api
NEXT_PUBLIC_API_URL=https://instagram-marketing-backend-v2.onrender.com
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
CORS_ORIGIN=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

#### バックエンド（env.production）
```env
INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
CORS_ORIGIN=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

---

## 🔧 現在の状況（2025年7月30日）

### ✅ 完了済み
- MongoDB接続エラーの解決 - デモモード対応
- Vercelルーティング設定の修正 - vercel.jsonのrewrites順序調整
- API_BASE_URLの直接設定 - 環境変数依存を排除
- Instagram OAuthコールバックの404エラー解決
- Vercel設定の競合解決 - routesセクション削除

### 🚧 進行中
- ログイン機能のテスト - 最新修正（8f1fb92）のデプロイ待ち
- Instagram連携の動作確認

### 📊 最新コミット状況
- **最新コミット**: 8f1fb92 - Vercel設定の競合を解決
- **デプロイ状況**: Vercelで進行中
- **バックエンド**: Renderで稼働中

---

## 🛠️ トラブルシューティングガイド

### よくある問題と解決方法

#### 1. ログインエラー（401 Unauthorized）
**症状**: フロントエンドが自分のVercelドメインにAPIリクエスト
**原因**: 環境変数が正しく読み込まれていない
**解決**: src/services/authService.tsのAPI_BASE_URLを直接設定

#### 2. Instagram連携404エラー
**症状**: /auth/instagram/callbackで404
**原因**: Vercelルーティング設定の問題
**解決**: vercel.jsonのrewrites順序を調整

#### 3. Vercel設定エラー
**症状**: デプロイ時に設定エラー
**原因**: rewritesとroutesの同時使用
**解決**: routesセクションを削除、rewritesのみ使用

#### 4. MongoDB接続エラー
**症状**: ローカル開発時の接続拒否
**原因**: MongoDBが起動していない
**解決**: デモモードで動作継続

#### 5. Vercelデプロイが更新されない
**症状**: コード変更が反映されない
**解決**:
- ブラウザキャッシュクリア（Ctrl + Shift + R）
- Vercelダッシュボードでデプロイ状況確認
- 新しいコミットで強制デプロイ

### デバッグ手順

#### 1. ブラウザ開発者ツール
- F12キーで開発者ツールを開く
- Consoleタブでエラーログを確認
- NetworkタブでAPIリクエストを確認

#### 2. ネットワークタブ
- APIリクエストの送信先を確認
- ステータスコードとレスポンス内容を確認

#### 3. Renderログ確認
- Renderダッシュボードでログを確認
- エラーメッセージを特定

---

## 🔮 今後の課題（優先度順）

### 🔴 高優先度
- Instagram連携の完全動作確認
- OAuthフローのテスト
- 投稿分析機能のテスト
- エラーハンドリングの確認
- 本番環境での安定性確保

### 🟡 中優先度
- レート制限の調整
- エラーログの監視
- パフォーマンス最適化
- ユーザー体験の改善
- ローディング状態の改善
- エラーメッセージの日本語化
- レスポンシブデザインの調整

### 🟢 低優先度
- セキュリティ強化
- JWTトークンの有効期限調整
- CORS設定の最適化
- 入力値検証の強化
- 機能拡張
- 他のSNSプラットフォーム対応
- 分析機能の高度化
- ユーザー管理機能の追加

---

## 📞 連絡先・リソース

### 開発者情報
- **GitHub**: trillnihon/instagram-marketing-app
- **Vercel**: instagram-marketing-app-v1-j28ssqoui-trillnihons-projects
- **Render**: instagram-marketing-backend-v2

### 重要なURL
- **フロントエンド**: https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
- **バックエンド**: https://instagram-marketing-backend-v2.onrender.com
- **Facebook開発者コンソール**: https://developers.facebook.com/apps/1003724798254754

### テストアカウント
- **メール**: test@example.com
- **パスワード**: testpassword123

---

## ⚠️ 重要な注意事項

### URL変更時のチェックリスト
- [ ] Facebook開発者コンソールのOAuthリダイレクトURI
- [ ] Facebook開発者コンソールのアプリドメイン
- [ ] Facebook開発者コンソールのサイトURL
- [ ] バックエンドのserver.js
- [ ] フロントエンドのauthService.ts
- [ ] フロントエンドのinstagramApi.ts
- [ ] フロントエンドのAuthCallback.tsx
- [ ] 環境変数ファイル（フロントエンド・バックエンド）
- [ ] デプロイ後の動作確認

### 緊急時の対応
- **設定変更禁止**: 上記の統一URL設定は絶対に変更しない
- **ロールバック**: 問題発生時は前回の正常動作バージョンに戻す
- **ログ確認**: ブラウザの開発者ツールでエラーログを確認

### Vercel設定ルール
- **rewritesとroutesの同時使用禁止**: Vercelでは両方を同時に使用できない
- **rewritesのみ使用**: 現在はrewritesが推奨されている
- **設定の優先順位**: 具体的なルートを先に、汎用的なルートを後に配置

---

## 🎯 この申し送り書の目的

この申し送り書は、どのチャットが読んでも統一ルールを理解し、Instagram Business連携を正常に維持できるよう作成されています。

**重要な原則**:
1. 統一URL設定は絶対に変更しない
2. Vercel設定ルールを厳守する
3. 段階的な修正を行う
4. テストを重視する
5. 申し送り書を常に最新に保つ 