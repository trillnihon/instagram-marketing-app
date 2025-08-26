# 🚀 Instagram Marketing App 自動化スクリプト

このディレクトリには、Instagram Marketing Appの開発・デプロイ・引き継ぎを自動化するスクリプトが含まれています。

## 📋 スクリプト一覧

### 1. `auto-handover.js` - 引き継ぎ書自動作成
- 修正完了ごとに自動で引き継ぎ書を生成
- Git変更履歴とコミット履歴を自動取得
- 絶対に変更禁止の箇所を明記

### 2. `auto-deploy.js` - 自動デプロイ
- 変更を自動コミット・プッシュ
- Vercel（フロントエンド）とRender（バックエンド）の自動デプロイ
- デプロイ状況の自動確認

### 3. `auto-verification.js` - 動作確認ログ自動生成
- フロントエンドページの動作確認
- バックエンドAPIの動作確認
- パフォーマンステストとセキュリティチェック

### 4. `complete-workflow.js` - 統合ワークフロー
- 上記3つのスクリプトを順次実行
- 修正 → 引き継ぎ書生成 → デプロイ → 動作確認の完全自動化

### 5. `run-workflow.ps1` - PowerShell実行スクリプト
- Windows環境での簡単実行
- メニュー形式でのタスク選択

## 🚀 使用方法

### 基本的な使用方法

```bash
# 引き継ぎ書の自動作成のみ
npm run handover

# 自動デプロイのみ
npm run deploy

# 動作確認ログの生成のみ
npm run verify:deploy

# 完全自動ワークフロー（推奨）
npm run workflow
```

### PowerShellでの実行

```powershell
# 完全自動ワークフロー
.\scripts\run-workflow.ps1 -FullWorkflow

# 引き継ぎ書のみ
.\scripts\run-workflow.ps1 -HandoverOnly

# 自動デプロイのみ
.\scripts\run-workflow.ps1 -DeployOnly

# 動作確認のみ
.\scripts\run-workflow.ps1 -VerifyOnly
```

### 直接実行

```bash
# Node.jsで直接実行
node scripts/auto-handover.js
node scripts/auto-deploy.js
node scripts/auto-verification.js
node scripts/complete-workflow.js
```

## 📁 出力ファイル

### 引き継ぎ書
- 保存場所: `docs/handoff/引継ぎ書_YYYY-MM-DD.md`
- 内容:
  - ✅ 完了した修正内容
  - 🚨 絶対に変更禁止の箇所
  - 📝 次のステップ
  - 📊 完了率
  - 🚀 デプロイ実行結果
  - 🧪 動作確認ログ

## ⚠️ 重要な注意事項

### 絶対に変更禁止の箇所
- **環境変数キー**: `VITE_API_BASE_URL`
- **本番URL**: `https://instagram-marketing-backend-v2.onrender.com/api`
- **Instagram Graph API 認証フロー**
- **ProtectedRoute の認証チェック処理**

### 設定ファイル
- `server/config/database.js` - データベース接続設定
- `server/middleware/auth.js` - 認証ミドルウェア
- `src/components/ProtectedRoute.tsx` - 認証チェック処理

## 🔧 カスタマイズ

### 設定の変更
`config.json` ファイルで以下の設定を変更できます：

- デプロイ待機時間
- パフォーマンス閾値
- 保護対象ファイル
- 確認対象URL

### スクリプトの拡張
各スクリプトはクラスベースで設計されており、必要に応じて機能を追加できます。

## 📊 ワークフローの流れ

```
修正完了
    ↓
1. 引き継ぎ書自動作成
    ↓
2. 変更の自動コミット
    ↓
3. mainブランチへの自動プッシュ
    ↓
4. Vercel/Renderでの自動デプロイ
    ↓
5. デプロイ完了待機
    ↓
6. 動作確認ログの自動生成
    ↓
7. 最終レポートの生成
    ↓
完了！
```

## 🐛 トラブルシューティング

### よくある問題

1. **Node.jsが見つからない**
   - Node.jsをインストールしてください
   - バージョン20.18.1以上が必要

2. **Gitが見つからない**
   - Gitをインストールしてください

3. **実行ポリシーエラー（PowerShell）**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **権限エラー**
   - 管理者権限で実行してください

### ログの確認
- 各スクリプトの実行ログはコンソールに表示されます
- エラーが発生した場合は、手動で確認してください

## 📞 サポート

問題が発生した場合：

1. エラーメッセージを確認
2. 手動で該当箇所を確認
3. 必要に応じて手動で修正
4. 再度スクリプトを実行

## 🎯 推奨ワークフロー

1. **開発完了後**: `npm run workflow` で完全自動化
2. **引き継ぎ書のみ**: `npm run handover`
3. **デプロイのみ**: `npm run deploy`
4. **動作確認のみ**: `npm run verify:deploy`

---

**注意**: このスクリプトは開発・テスト環境での使用を想定しています。本番環境での使用前に十分なテストを行ってください。
