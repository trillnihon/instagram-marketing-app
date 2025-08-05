# Meta Developer Console 設定ガイド

## 🚨 現在の問題
**エラー**: `PLATFORM_INVALID_APP_ID` - アプリIDが無効

## 🔧 解決手順

### 1. Meta Developer Console アクセス
1. https://developers.facebook.com/ にアクセス
2. アカウントでログイン
3. 「マイアプリ」から該当アプリを選択

### 2. アプリ設定確認

#### A. 基本設定
- **アプリID**: `1003724798254754`
- **アプリ名**: Instagram Marketing App
- **アプリドメイン**: `localhost` (開発環境)

#### B. Facebook Login for Business設定
1. **製品追加**:
   - 「製品を追加」→「Facebook Login for Business」
   - 設定を完了

2. **Valid OAuth redirect URIs**:
   ```
   開発環境: http://localhost:3001/auth/facebook/callback
   本番環境: https://instagram-marketing-n9m14dv5w-trillnihons-projects.vercel.app/auth/facebook/callback
   ```

3. **必要な権限**:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`

### 3. アプリの状態確認

#### A. 開発モード
- **開発中**: 開発者とテスターのみアクセス可能
- **本番**: 一般ユーザーがアクセス可能

#### B. アプリレビュー状態
- **未申請**: 基本権限のみ利用可能
- **申請中**: レビュー待ち
- **承認済み**: 全権限利用可能

### 4. トラブルシューティング

#### A. App ID無効エラーの原因
1. **アプリが存在しない**
   - Meta Developer Consoleでアプリが作成されているか確認
   - アプリIDが正しいか確認

2. **アプリが無効化されている**
   - アプリの状態を確認
   - 開発モードになっているか確認

3. **コールバックURLが設定されていない**
   - Valid OAuth redirect URIsに正しいURLが設定されているか確認

4. **Facebook Login for Businessが追加されていない**
   - 製品一覧にFacebook Login for Businessが表示されているか確認

#### B. 設定確認チェックリスト
- [ ] アプリが存在する
- [ ] アプリが有効になっている
- [ ] Facebook Login for Businessが追加されている
- [ ] Valid OAuth redirect URIsが設定されている
- [ ] 必要な権限が追加されている
- [ ] アプリの状態が適切（開発中/本番）

### 5. 開発環境でのテスト

#### A. 開発者アカウント
- Meta Developer Consoleにログインしているアカウントが開発者として追加されているか確認

#### B. テスターアカウント
- テスト用のFacebookアカウントがテスターとして追加されているか確認

### 6. 代替案：デモモード使用

バックエンドAPIが未実装のため、デモモードを使用してテストを続行：

1. **デモモードボタンをクリック**
2. **ダッシュボードにアクセス**
3. **基本機能をテスト**

## 📞 緊急時の対応

### 1. 即座にできること
- デモモードでテストを続行
- ブラウザのコンソールでエラー詳細を確認
- ローカルストレージの状態を確認

### 2. 後日対応
- Meta Developer Consoleの設定を完了
- アプリレビュー申請
- 本格的なFacebook Login for Business実装

## 🔍 デバッグ情報

### ブラウザコンソールで確認
```javascript
// 環境変数確認
console.log('App ID:', import.meta.env.VITE_INSTAGRAM_APP_ID);
console.log('Redirect URI:', import.meta.env.VITE_INSTAGRAM_REDIRECT_URI);

// ローカルストレージ確認
console.log('Auth Data:', localStorage.getItem('instagram_auth'));
```

### ネットワークタブで確認
- Facebook OAuth URLの詳細
- リクエストヘッダー
- レスポンス内容 