# Vercelクリーンアップガイド

## 📋 現在の状況

### 確認済み
- **プロジェクト**: `instagram-marketing-app` (1つのみ)
- **URL**: `https://instagram-marketing-app.vercel.app`
- **状況**: 正常に動作中

### 削除対象
- **古いデプロイメント**: 多数の古いデプロイメントが残存
- **推奨**: 最新のデプロイメント以外を削除

## 🧹 クリーンアップ手順

### 1. Vercel Webダッシュボードでの削除（推奨）

#### 手順
1. **Vercelダッシュボードにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - `instagram-marketing-app` をクリック

3. **Deploymentsタブに移動**
   - 左サイドバーの「Deployments」をクリック

4. **古いデプロイメントを削除**
   - 最新のデプロイメント以外を選択
   - 「...」メニューから「Delete」を選択
   - 確認して削除

### 2. CLIでの削除

#### 特定のデプロイメントを削除
```bash
# デプロイメントIDを指定して削除
vercel remove dpl_xxxxxxxxxxxxx --yes
```

#### プロジェクト全体の古いデプロイメントを削除
```bash
# プロジェクト名を指定して削除
vercel remove instagram-marketing-app --yes
```

### 3. 自動クリーンアップ設定

#### Vercel設定で自動削除を有効化
```json
// vercel.json
{
  "functions": {
    "maxDuration": 10
  },
  "regions": ["hnd1"],
  "cleanUrls": true,
  "trailingSlash": false
}
```

## ✅ クリーンアップ後の確認

### 1. プロジェクト一覧確認
```bash
vercel projects ls
```

### 2. デプロイメント一覧確認
```bash
vercel ls
```

### 3. 本番環境の動作確認
```bash
curl -I https://instagram-marketing-app.vercel.app
```

## 🎯 メリット

1. **ストレージ節約**: 不要なデプロイメントの削除
2. **管理効率向上**: デプロイメント一覧の整理
3. **パフォーマンス向上**: キャッシュの最適化
4. **コスト削減**: ストレージ使用量の削減

## ⚠️ 注意事項

1. **最新デプロイメントは保持**: 本番環境の動作に影響
2. **バックアップ**: 重要なデプロイメントは事前にバックアップ
3. **段階的削除**: 一度に大量削除せず、段階的に実行 