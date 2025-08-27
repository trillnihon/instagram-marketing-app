# GitHub Actions 自動化ガイド

## 🚀 概要

このプロジェクトでは、GitHub Actionsを使用して以下の自動化ワークフローを実装しています：

1. **自動テスト・ビルド**
2. **引継ぎ書生成**
3. **フロントエンド（Vercel）デプロイ**
4. **バックエンド（Render）デプロイ**
5. **自動デプロイ実行**
6. **動作確認・検証**
7. **ワークフロー完了処理**

## 📋 ワークフロー詳細

### 1. テスト・ビルド（test）
- **実行条件**: mainブランチへのpush/PR
- **処理内容**: 
  - 依存関係インストール
  - テスト実行
  - フロントエンドビルド

### 2. 引継ぎ書生成（auto-handover）
- **実行条件**: mainブランチへのpush
- **依存関係**: test完了後
- **処理内容**: `scripts/auto-handover.js`を実行
- **出力**: `docs/handoff/引継ぎ書_YYYY-MM-DD.md`

### 3. フロントエンドデプロイ（deploy-frontend）
- **実行条件**: mainブランチへのpush
- **依存関係**: test + auto-handover完了後
- **処理内容**: Vercelへの自動デプロイ
- **環境変数**: 
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### 4. バックエンドデプロイ（deploy-backend）
- **実行条件**: mainブランチへのpush
- **依存関係**: test + auto-handover完了後
- **処理内容**: Renderへの自動デプロイ
- **環境変数**:
  - `RENDER_TOKEN`
  - `RENDER_SERVICE_ID`

### 5. 自動デプロイ実行（auto-deploy）
- **実行条件**: mainブランチへのpush
- **依存関係**: フロントエンド・バックエンドデプロイ完了後
- **処理内容**: `scripts/auto-deploy.js`を実行
- **機能**: ヘルスチェック・引き継ぎ書更新

### 6. 動作確認・検証（auto-verification）
- **実行条件**: mainブランチへのpush
- **依存関係**: auto-deploy完了後
- **処理内容**: `scripts/auto-verification.js`を実行
- **機能**: デプロイ後の動作確認・ログ生成

### 7. ワークフロー完了（complete-workflow）
- **実行条件**: mainブランチへのpush
- **依存関係**: auto-verification完了後
- **処理内容**: `scripts/complete-workflow.js`を実行
- **機能**: 最終レポート生成・完了通知

## 🔧 必要な環境変数

### GitHub Secrets設定

以下のシークレットをGitHubリポジトリに設定してください：

```bash
# Vercel設定
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Render設定
RENDER_TOKEN=your_render_token
RENDER_SERVICE_ID=your_render_service_id
```

### 環境変数の取得方法

#### Vercel
1. Vercelダッシュボードにログイン
2. Settings → Tokens
3. 新しいトークンを作成
4. プロジェクトIDとオーガニゼーションIDを確認

#### Render
1. Renderダッシュボードにログイン
2. Account → API Keys
3. 新しいAPIキーを作成
4. サービスIDを確認

## 📊 ヘルスチェック機能

### バックエンド（Render）
- **/api/health**: 200 OK確認
- **/api/scheduler/posts**: 200 OK確認

### フロントエンド（Vercel）
- **/history**: 200 OK確認
- **/scheduler**: 200 OK確認
- **/posting-time-analysis**: 200 OK確認

### ヘルスチェックの詳細

`scripts/auto-deploy.js`の`performHealthChecks()`関数で以下の処理を実行：

```javascript
// バックエンドヘルスチェック
const healthResponse = await axios.get('https://instagram-marketing-backend-v2.onrender.com/api/health');
const schedulerResponse = await axios.get('https://instagram-marketing-backend-v2.onrender.com/api/scheduler/posts?userId=demo_user');

// フロントエンドヘルスチェック
const historyResponse = await axios.get('https://instagram-marketing-app.vercel.app/history');
const schedulerResponse = await axios.get('https://instagram-marketing-app.vercel.app/scheduler');
const analysisResponse = await axios.get('https://instagram-marketing-app.vercel.app/posting-time-analysis');
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. デプロイが失敗する
- **原因**: 環境変数が正しく設定されていない
- **解決方法**: GitHub Secretsの設定を確認

#### 2. ヘルスチェックが失敗する
- **原因**: サービスが起動していない、またはURLが間違っている
- **解決方法**: 
  - サービスの起動状況を確認
  - URLの設定を確認
  - ネットワーク接続を確認

#### 3. スクリプトが実行されない
- **原因**: Node.jsのバージョンが合わない
- **解決方法**: package.jsonのengines設定を確認

### ログの確認方法

1. GitHubリポジトリのActionsタブを開く
2. 実行中のワークフローをクリック
3. 各ジョブのログを確認
4. エラーメッセージを確認

## 📈 パフォーマンス最適化

### 並列実行の活用

現在の設定では、以下のジョブが並列実行されます：

- `deploy-frontend` と `deploy-backend`（auto-handover完了後）
- 各スクリプトの実行（依存関係を考慮）

### キャッシュの活用

- npm依存関係のキャッシュ
- ビルド成果物のキャッシュ

## 🔄 手動実行

### 特定のワークフローを手動実行

1. GitHubリポジトリのActionsタブを開く
2. 実行したいワークフローを選択
3. "Run workflow"ボタンをクリック
4. ブランチを選択して実行

### ローカルでのテスト

```bash
# 引継ぎ書生成
npm run handover

# 自動デプロイ
npm run deploy

# 動作確認
npm run verify:deploy

# ワークフロー一括実行
npm run workflow
```

## 📚 参考資料

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Render API Documentation](https://render.com/docs/api)
- [Axios Documentation](https://axios-http.com/)

## 🎯 今後の改善点

1. **通知機能の追加**: Slack/Discordへの通知
2. **ロールバック機能**: デプロイ失敗時の自動ロールバック
3. **パフォーマンス監視**: デプロイ後のパフォーマンス測定
4. **セキュリティスキャン**: 依存関係の脆弱性チェック
5. **カスタムアクション**: 再利用可能なアクションの作成

---

**最終更新**: 2025-08-27
**更新者**: Auto Deploy System
**バージョン**: 1.0.0
