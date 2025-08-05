# Renderクリーンアップガイド

## 📋 現在の状況

### 確認済みサービス
1. **instagram-marketing-backend-v2** ✅
   - **ステータス**: Deployed (正常)
   - **URL**: `https://instagram-marketing-backend-v2.onrender.com`
   - **推奨**: 保持（本番環境で使用中）

2. **instagram-marketing-backend** ❌
   - **ステータス**: Failed deploy (失敗)
   - **URL**: `https://instagram-marketing-backend.onrender.com`
   - **推奨**: 削除（使用していない）

## 🧹 削除手順

### 1. Render Webダッシュボードでの削除（推奨）

#### 手順
1. **Renderダッシュボードにアクセス**
   ```
   https://dashboard.render.com
   ```

2. **サービス一覧を確認**
   - 「Ungrouped Services」セクションを確認
   - `instagram-marketing-backend` (Failed deploy) を特定

3. **失敗したサービスをクリック**
   - サービス名をクリックして詳細ページに移動

4. **Settingsタブに移動**
   - 左サイドバーの「Settings」をクリック

5. **サービスを削除**
   - ページ下部の「Delete Service」ボタンをクリック
   - サービス名 `instagram-marketing-backend` を入力
   - 「Delete」ボタンをクリックして確認

### 2. 削除前の確認事項

#### 重要な確認
- ✅ **本番環境のサービスは保持**: `instagram-marketing-backend-v2`
- ✅ **環境変数の整合性**: 正しいURLが設定済み
- ✅ **フロントエンドの設定**: 正しいバックエンドURLを参照

#### 削除対象の確認
- ❌ **失敗したサービス**: `instagram-marketing-backend`
- ❌ **使用していないサービス**: 古いバージョン
- ❌ **不要なリソース**: ストレージとコンピューティングリソース

## ✅ 削除後の確認

### 1. サービス一覧の確認
- ダッシュボードで `instagram-marketing-backend-v2` のみが表示されることを確認

### 2. 本番環境の動作確認
```bash
# バックエンドの動作確認
curl -I https://instagram-marketing-backend-v2.onrender.com

# フロントエンドからのAPI呼び出し確認
curl -I https://instagram-marketing-app.vercel.app
```

### 3. 環境変数の確認
- `env.production`: `VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api`
- `env.development`: `VITE_API_BASE_URL=http://localhost:4000/api`

## 🎯 メリット

1. **コスト削減**: 不要なサービスの削除
2. **管理効率向上**: サービス一覧の整理
3. **混乱の回避**: 重複サービスの削除
4. **リソース最適化**: コンピューティングリソースの節約

## ⚠️ 注意事項

1. **本番サービスは保持**: `instagram-marketing-backend-v2` は削除しない
2. **削除前の確認**: 正しいサービスを削除していることを確認
3. **バックアップ**: 重要なデータがある場合は事前にバックアップ
4. **段階的実行**: 一度に削除せず、慎重に実行

## 🔄 削除後の構成

### 最終的な構成
- **フロントエンド**: `https://instagram-marketing-app.vercel.app`
- **バックエンド**: `https://instagram-marketing-backend-v2.onrender.com`
- **データベース**: MongoDB Atlas (変更なし)

### 環境変数設定
```bash
# 本番環境
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api

# 開発環境
VITE_API_BASE_URL=http://localhost:4000/api
``` 