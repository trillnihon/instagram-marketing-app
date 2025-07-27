# Facebook開発者アプリ設定ガイド

## 1. Facebook開発者コンソールでの設定

### アプリ基本設定
1. [Facebook開発者コンソール](https://developers.facebook.com/)にアクセス
2. アプリ「Instagram Marketing App」を選択
3. 「設定」→「基本設定」で以下を確認：
   - アプリID: `1003724798254754`
   - アプリシークレット: `fd6a61c31a9f1f5798b4d48a927d8f0c`

### プラットフォーム設定
1. 「設定」→「基本設定」→「プラットフォームを追加」
2. 「ウェブサイト」を選択
3. サイトURL: `https://localhost:5173`

### OAuth設定
1. 「Facebookログイン」→「設定」
2. 有効なOAuthリダイレクトURIに以下を追加：
   ```
   https://localhost:5173/auth/callback
   ```
3. クライアントOAuth設定：
   - クライアントOAuthログイン: 有効
   - Web OAuthログイン: 有効
   - 強制HTTPS: 無効（開発環境）

### アプリレビュー
1. 「アプリレビュー」→「権限と機能」
2. 以下の権限を追加：
   - `public_profile` (デフォルトで利用可能)
   - `email` (デフォルトで利用可能)
   - `instagram_basic` (レビュー不要)
   - `instagram_manage_insights` (レビュー不要)

## 2. 環境変数設定

### フロントエンド（.env）
```env
VITE_FACEBOOK_APP_ID=1003724798254754
VITE_FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
VITE_INSTAGRAM_REDIRECT_URI=https://localhost:5173/auth/callback
VITE_API_BASE_URL=https://localhost:4000
```

### サーバー側（server/.env）
```env
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
REDIRECT_URI=https://localhost:5173/auth/callback
PORT=4000
```

## 3. トラブルシューティング

### よくあるエラー

#### 1. "Invalid redirect_uri" エラー
- Facebook開発者コンソールのOAuth設定でリダイレクトURIが正しく設定されているか確認
- プロトコル（https/http）が一致しているか確認

#### 2. "App not configured for this domain" エラー
- アプリドメインに `localhost` が追加されているか確認
- プラットフォーム設定でウェブサイトが追加されているか確認

#### 3. "Permissions error" エラー
- 必要な権限がアプリレビューで承認されているか確認
- 開発者アカウントでテストしているか確認

### 開発環境での注意点
- HTTPS証明書が正しく生成されているか確認
- ブラウザで証明書の警告を許可しているか確認
- CORS設定が正しく行われているか確認

## 4. テスト手順

1. サーバーを起動：
   ```bash
   cd server
   npm start
   ```

2. フロントエンドを起動：
   ```bash
   npm run dev
   ```

3. ブラウザで `https://localhost:5173` にアクセス

4. 「Instagramでログイン」ボタンをクリック

5. Facebook認証画面が表示され、認証が成功することを確認

## 5. 本番環境での設定

本番環境にデプロイする際は以下を変更：

1. リダイレクトURIを本番ドメインに変更
2. アプリドメインを本番ドメインに変更
3. 強制HTTPSを有効にする
4. 適切なSSL証明書を設定 