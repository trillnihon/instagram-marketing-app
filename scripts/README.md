# 本番モード切替・一括実行スクリプト

## 概要

このスクリプトは、Instagram Marketing Appを本番モードに切替え、以下の処理を一括で実行します：

1. `env.development`を元に`env.production`を更新
2. `FB_USER_OR_LL_TOKEN`を新しいトークンで更新
3. `scripts/refreshAndVerify.js`を使ってサーバー起動
4. `/health`確認
5. `verify:graph`実行
6. ブラウザ自動起動

## ファイル構成

- `production-deploy.js` - メインのNode.jsスクリプト
- `production-deploy.bat` - Windows環境用バッチファイル
- `production-deploy.ps1` - PowerShell環境用スクリプト

## 使用方法

### Node.jsスクリプト（推奨）

```bash
# プロジェクトルートディレクトリで実行
node scripts/production-deploy.js "EAAxxxx..."
```

### Windowsバッチファイル

```cmd
# プロジェクトルートディレクトリで実行
scripts\production-deploy.bat "EAAxxxx..."
```

### PowerShellスクリプト

```powershell
# プロジェクトルートディレクトリで実行
.\scripts\production-deploy.ps1 -Token "EAAxxxx..."
```

## 前提条件

- Node.js がインストールされていること
- 必要な依存関係がインストールされていること（`npm install`済み）
- 有効なFacebookアクセストークン（EAAxxxx...形式）を所持していること

## 実行フロー

1. **環境設定ファイル更新**
   - `env.development`の内容を確認
   - `env.production`の`FB_USER_OR_LL_TOKEN`を更新

2. **refreshAndVerify.js実行**
   - 既存プロセスの終了
   - サーバー起動（ポート4000）
   - 環境変数の設定

3. **ヘルスチェック**
   - `/health`エンドポイントへの接続確認
   - 最大10回のリトライ

4. **Graph API検証**
   - `npm run verify:graph`の実行
   - 検証結果の表示

5. **ブラウザ起動**
   - 自動的にブラウザで`http://localhost:4000`を開く

## エラーハンドリング

- 各ステップでエラーが発生した場合、適切なエラーメッセージを表示
- ヘルスチェック失敗時は以降の処理をスキップ
- タイムアウト処理（refreshAndVerify.js: 2分、Graph API検証: 60秒）

## ログ出力

- 色付きのログで各ステップの進行状況を表示
- 成功/失敗/警告をアイコン付きで表示
- 詳細なエラー情報とサマリーを提供

## 注意事項

- 本番環境用の設定ファイルを更新するため、実行前に内容を確認してください
- アクセストークンは機密情報のため、適切に管理してください
- サーバー起動時は既存のプロセスが自動的に終了されます
- ブラウザの自動起動が失敗した場合は、手動で`http://localhost:4000`にアクセスしてください

## トラブルシューティング

### よくある問題

1. **ポート4000が使用中**
   - スクリプトが自動的に既存プロセスを終了します
   - 手動で確認する場合は`netstat -ano | findstr :4000`（Windows）または`lsof -ti:4000`（Unix）

2. **アクセストークンが無効**
   - Facebook Developer Consoleでトークンの有効性を確認
   - 必要に応じて新しいトークンを生成

3. **依存関係の問題**
   - `npm install`を実行して依存関係を更新
   - Node.jsのバージョンを確認

### ログの確認

スクリプト実行時の詳細なログは、各ステップで色付きで表示されます。エラーが発生した場合は、表示されるメッセージを確認してください。
