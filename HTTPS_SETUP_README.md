# Instagram Marketing App - HTTPS環境構築 & Graph API エラー修正ガイド

## 概要

このガイドでは、Instagram Marketing Appの以下の問題を解決します：

1. **Graph API 400エラーの修正**
2. **ローカルHTTPS環境の構築**
3. **PowerShellスクリプトの改善**

## 🚀 クイックスタート

### 1. HTTPS対応サーバーの起動

```bash
cd server
node https-server.js
```

### 2. 改善されたPowerShellスクリプトの実行

```powershell
.\start-https-production.ps1
```

### 3. Graph API エラーの修正

```bash
node scripts/fix-graph-api-errors.js
```

## 📋 前提条件

- Node.js 18以上
- PowerShell 7以上
- OpenSSL（証明書生成用）
- mkcert.exe（推奨、証明書生成用）

## 🔧 詳細なセットアップ手順

### ステップ1: HTTPS証明書の生成

#### 方法A: mkcertを使用（推奨）

1. プロジェクトルートの`mkcert.exe`を使用
2. 自動的に証明書が生成される
3. ブラウザで警告が表示されない

#### 方法B: OpenSSLを使用

1. OpenSSLがインストールされていることを確認
2. スクリプトが自動的に証明書を生成
3. 自己署名証明書のため、ブラウザで警告が表示される

### ステップ2: 環境変数の設定

`server/env.development`ファイルを編集：

```bash
# Facebook OAuth設定
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Graph API検証用設定
FB_USER_OR_LL_TOKEN=your_actual_facebook_token
FB_PAGE_ID=your_page_id
```

### ステップ3: サーバーの起動

#### HTTPSサーバー（推奨）

```bash
cd server
node https-server.js
```

#### 従来のHTTPサーバー

```bash
cd server
npm start
```

## 🔍 Graph API エラーの修正

### 問題の特定

Graph API 400エラーの主な原因：

1. **トークンの期限切れ**
2. **権限不足**
3. **アプリ設定の問題**
4. **トークンの形式エラー**

### 修正手順

#### 1. 自動診断スクリプトの実行

```bash
node scripts/fix-graph-api-errors.js
```

このスクリプトは以下を実行します：
- トークンの有効性確認
- 必要な権限の確認
- エラーの詳細分析
- 推奨事項の提示

#### 2. 新しいトークンの取得

1. [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)にアクセス
2. アプリを選択：Instagram Marketing App
3. 必要な権限を追加：
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`
   - `public_profile`
   - `email`
4. "Generate Access Token"をクリック
5. 生成されたトークンをコピー

#### 3. トークンの設定

```bash
# スクリプト経由で設定
node scripts/fix-graph-api-errors.js

# または手動で環境変数ファイルを編集
# server/env.development
FB_USER_OR_LL_TOKEN=your_new_token
```

## 🚀 改善されたPowerShellスクリプト

### 新機能

1. **HTTPS対応**: 自己署名証明書を使用したHTTPSサーバー起動
2. **柔軟な待機時間**: 設定可能なヘルスチェック待機時間
3. **詳細なエラー分析**: エラーの原因と対処法を詳細表示
4. **トークン入力機能**: 対話形式でのトークン設定
5. **設定可能なパラメータ**: スクリプト上部で設定を調整可能

### 設定パラメータ

```powershell
$Config = @{
    ServerDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app\server"
    RootDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app"
    Port = "4000"
    MaxHealthCheckAttempts = 15        # ヘルスチェック最大試行回数
    HealthCheckInterval = 3            # ヘルスチェック間隔（秒）
    MaxFrontendAttempts = 20           # フロントエンド確認最大試行回数
    FrontendCheckInterval = 2          # フロントエンド確認間隔（秒）
    UseHttps = $true                   # HTTPS使用フラグ
    EnableTokenInput = $true           # トークン入力機能フラグ
}
```

### 使用方法

```powershell
# 基本的な実行
.\start-https-production.ps1

# 設定を変更して実行
# スクリプト内の$Configを編集してから実行
```

## 📊 トラブルシューティング

### よくある問題と対処法

#### 1. SSL証明書エラー

**症状**: `SSL certificate error` または `certificate verification failed`

**対処法**:
```powershell
# PowerShellで証明書チェックをスキップ
Invoke-WebRequest -Uri "https://localhost:4000/health" -SkipCertificateCheck
```

#### 2. ポートが使用中

**症状**: `EADDRINUSE` エラー

**対処法**:
```bash
# ポートの使用状況を確認
netstat -ano | findstr :4000

# プロセスを終了
taskkill /PID <process_id> /F
```

#### 3. トークンが無効

**症状**: Graph API 400エラー

**対処法**:
```bash
# 診断スクリプトを実行
node scripts/fix-graph-api-errors.js

# 新しいトークンを取得して設定
```

#### 4. サーバーが起動しない

**症状**: ヘルスチェックが失敗

**対処法**:
1. サーバーログを確認
2. 環境変数の設定を確認
3. 依存関係のインストール確認

```bash
cd server
npm install
```

## 🔐 セキュリティに関する注意事項

1. **自己署名証明書**: 開発環境専用、本番環境では使用しない
2. **トークンの管理**: 環境変数ファイルに機密情報を保存しない
3. **HTTPS強制**: 本番環境ではHTTPSを強制する
4. **権限の最小化**: 必要最小限の権限のみを要求

## 📁 ファイル構成

```
instagram-marketing-app/
├── server/
│   ├── https-server.js          # HTTPS対応サーバー
│   ├── env.development          # 環境変数ファイル
│   └── certs/                   # 証明書ディレクトリ
├── scripts/
│   ├── fix-graph-api-errors.js  # Graph API エラー修正スクリプト
│   └── verify-graph.ts          # Graph API 検証スクリプト
├── start-https-production.ps1   # 改善されたPowerShellスクリプト
└── mkcert.exe                   # 証明書生成ツール
```

## 🧪 テスト

### 1. ヘルスチェック

```bash
# HTTPS
curl -k https://localhost:4000/health

# HTTP
curl http://localhost:4000/health
```

### 2. Graph API検証

```bash
# トークン検証
curl -k https://localhost:4000/api/verify-token

# npmスクリプト
npm run verify:graph
```

### 3. フロントエンド

```bash
# フロントエンド起動
npm run dev

# ブラウザで確認
http://localhost:3001
```

## 📝 ログとデバッグ

### ログファイルの場所

- サーバーログ: `server/logs/`
- Graph API検証レポート: `logs/verify-graph-*.json`

### デバッグモード

```bash
# 詳細ログ出力
npm run verify:graph -- --verbose

# レポート生成
npm run verify:graph -- --report

# ドライラン（API呼び出しなし）
npm run verify:graph -- --dry-run
```

## 🚀 次のステップ

1. **Graph API エラーの修正完了**
2. **ローカルHTTPS環境での動作確認**
3. **本番環境への展開準備**
4. **継続的な監視とメンテナンス**

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. ログファイルの内容
2. 環境変数の設定
3. ネットワーク接続状況
4. Facebookアプリの設定

詳細なエラーメッセージと共に、GitHubのIssuesに報告してください。
