# Instagram Marketing App - 開発・テストガイド

## 🚀 開発環境セットアップ

### 1. 環境確認
```bash
# プロジェクトディレクトリに移動
cd ebay_projects/instagram-marketing-app

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### 2. 環境変数確認
- **開発サーバー**: http://localhost:3001
- **Facebook App ID**: 1003724798254754
- **コールバックURL**: http://localhost:3001/auth/facebook/callback

## 📋 テスト手順

### Phase 1: 基本動作テスト

#### 1. 開発サーバー起動テスト
```bash
# サーバー起動
npm run dev

# ポート確認
netstat -ano | findstr :3001
```

**期待結果**: ポート3001でLISTENING状態

#### 2. ブラウザアクセステスト
1. ブラウザで `http://localhost:3001` にアクセス
2. ログインページが表示されることを確認
3. ページの読み込みエラーがないことを確認

#### 3. ログインページ表示テスト
- [ ] ページタイトルが正しく表示される
- [ ] Facebook Login for Businessボタンが表示される
- [ ] デモモードボタンが表示される
- [ ] エラーメッセージが表示されない

### Phase 2: 認証フローテスト

#### 1. Facebook Login for Business認証テスト
1. 「📸 Facebook Login for Business」ボタンをクリック
2. Facebook認証ページにリダイレクトされることを確認
3. ブラウザのコンソールでログを確認

**期待されるログ**:
```
📸 [DEBUG] Facebook Login for Business認証開始
🔗 [DEBUG] Facebook Login for Business URL: {詳細情報}
```

#### 2. 認証コールバックテスト
1. Facebookで認証を完了
2. アプリケーションにリダイレクトされる
3. トークン取得処理が実行される

**期待されるログ**:
```
✅ [DEBUG] Facebook Login for Business認証成功: {トークン情報}
📄 取得したPages: {ページ数}
📸 Instagram Business Accounts: {アカウント数}
```

#### 3. エラーハンドリングテスト
1. 認証をキャンセルした場合の処理
2. ネットワークエラー時の処理
3. フォールバック処理の確認

### Phase 3: デモモードテスト

#### 1. デモモード動作テスト
1. 「🎮 デモモードで開始」ボタンをクリック
2. デモユーザーが作成されることを確認
3. ダッシュボードにリダイレクトされることを確認

**期待されるログ**:
```
🎮 [DEBUG] デモモード開始
✅ [DEBUG] デモモード認証完了: {ユーザー情報}
```

#### 2. ダッシュボード表示テスト
1. ダッシュボードが正しく表示される
2. デモユーザー情報が表示される
3. 各機能タブが表示される

#### 3. 機能利用テスト
1. アナリティクスタブの表示
2. 投稿分析機能の表示
3. AI提案機能の表示
4. スケジューラー機能の表示

## 🔧 デバッグ手順

### 1. ブラウザ開発者ツール
1. F12キーで開発者ツールを開く
2. Consoleタブでログを確認
3. NetworkタブでAPI通信を確認
4. Applicationタブでローカルストレージを確認

### 2. ログ確認ポイント
```javascript
// 認証開始
📸 [DEBUG] Facebook Login for Business認証開始

// 認証成功
✅ [DEBUG] Facebook Login for Business認証成功

// エラー
❌ [DEBUG] 認証エラー検出

// デモモード
🎮 [DEBUG] デモモード開始
```

### 3. ローカルストレージ確認
```javascript
// 認証情報
localStorage.getItem('instagram_auth')

// アプリ状態
localStorage.getItem('instagram-marketing-app-storage')
```

## 🐛 トラブルシューティング

### 1. 開発サーバーが起動しない
```bash
# ポートが使用中の場合
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# 依存関係の問題
rm -rf node_modules
npm install
```

### 2. 認証エラー
- Meta Developer Consoleの設定を確認
- コールバックURLが正しく設定されているか確認
- 環境変数が正しく設定されているか確認

### 3. デモモードが動作しない
- ブラウザのコンソールでエラーを確認
- ローカルストレージの状態を確認
- アプリケーションの状態をリセット

## 📊 テスト結果記録

### テスト実行日: 2025年1月21日

#### 基本動作テスト
- [x] 開発サーバー起動
- [x] ブラウザアクセス
- [ ] ログインページ表示
- [ ] Facebook Login for Business認証
- [ ] 認証コールバック処理
- [ ] デモモード動作

#### 機能テスト
- [ ] ダッシュボード表示
- [ ] アナリティクス機能
- [ ] 投稿分析機能
- [ ] AI提案機能
- [ ] スケジューラー機能

#### エラーハンドリング
- [ ] 認証エラー処理
- [ ] ネットワークエラー処理
- [ ] フォールバック処理

## 🎯 次のステップ

1. **基本動作テスト完了** - 今日中
2. **認証フロー完全動作確認** - 今日中
3. **App Review準備開始** - 明日
4. **Webhooks実装開始** - 来週

## 📞 サポート

問題が発生した場合：
1. ブラウザのコンソールログを確認
2. ネットワークタブでAPI通信を確認
3. ローカルストレージの状態を確認
4. 開発者ツールでエラーを確認 