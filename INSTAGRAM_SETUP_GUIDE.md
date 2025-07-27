# Instagram×Facebook連携 セットアップガイド

## 📋 現在の状況（2025年1月時点）

### ✅ 完了済み項目
- **Instagramアカウント**: @1100_ai_ko（ビジネスアカウント）
- **Facebookページ**: 「インスタ支援テスト」（作成済み）
- **Meta Business**: 「トリル管理」（ビジネスサポートフォリオ）
- **Metaアカウント管理者**: とりる（trill.0310.0321@gmail.com）
- **アセットリンク**: FacebookページとInstagramの連携完了
- **ユーザー権限**: 管理者に全権限付与済み
- **API権限**: 必要な権限がすべて付与済み

### ⚠️ 現在の問題点（診断結果）
- **Facebookページ一覧が空**（`"data": []`）- **主要問題**
- 認証コードの重複使用エラー
- InstagramビジネスアカウントIDが取得できない

### 🔍 診断結果詳細（2025年1月実行）

#### ユーザー情報
- **ID**: 122097305486919546
- **名前**: と りる
- **メール**: trill.0310.0321@gmail.com
- **認証状態**: ✅ 正常

#### 権限状況
- ✅ `email`: granted
- ✅ `instagram_basic`: granted
- ✅ `instagram_manage_insights`: granted
- ✅ `public_profile`: granted
- ❌ `pages_show_list`: 未付与
- ❌ `pages_read_engagement`: 未付与

#### ページ・アカウント状況
- **Facebookページ数**: 0（APIで検出されない）
- **Instagram連携ページ数**: 0
- **ビジネスアカウント数**: 0
- **ビジネスアセット数**: 0

## 🔧 トラブルシューティング

### 1. 診断ツールの実行

```bash
cd ebay_projects/instagram-marketing-app/server
node instagram_connection_test.js <your_access_token>
```

### 2. 主要問題と解決策

#### 問題1: FacebookページがAPIで検出されない
**症状**: `/me/accounts` で `"data": []` が返される

**原因**:
- ページがビジネスアセットに追加されていない
- ページがクラシックページ（旧タイプ）である
- 認証時にページ選択でチェックが入っていない
- ページの権限設定が不十分

**解決策**:
1. [Meta Business Manager](https://business.facebook.com) にアクセス
2. 「アセット」→「Facebookページ」を確認
3. 「インスタ支援テスト」ページが表示されているか確認
4. ページが表示されていない場合は新規作成
5. ページをビジネスアセットに追加
6. ページの権限設定を確認

#### 問題2: 必要な権限が不足
**症状**: `pages_show_list`、`pages_read_engagement` が未付与

**解決策**:
1. Facebook App設定で権限を追加
2. アプリの審査を申請（開発中はテストユーザーで対応）
3. 再度認証を実行

#### 問題3: 認証コードの重複使用エラー
**症状**: `"This authorization code has been used"`

**原因**:
- 同じ認証コードを複数回使用しようとしている
- ブラウザの戻るボタンで再送信

**解決策**:
1. ブラウザを完全にリフレッシュ
2. 新しい認証フローを開始
3. デモモードを使用してテスト

## 🚀 次のステップ

### 即座に実行可能
1. **デモモードでの機能テスト**
   - フロントエンドで「デモモード」を有効化
   - 全機能（投稿作成、分析、ダッシュボード）をテスト

2. **Facebookページの再確認**
   - Meta Business Managerでページ設定を確認
   - 必要に応じてページを再作成

### 中期的な対応
1. **Instagram連携の再設定**
   - Instagramビジネスアカウント設定の確認
   - Facebookページとの連携を再実行

2. **長期アクセストークンの取得**
   - 60日有効な長期トークンを取得
   - 自動更新機能の実装

## 📊 申し送り書の更新

### 追加確認項目
- [x] 診断ツールでの詳細分析完了
- [ ] Facebookページのビジネスアセット登録確認
- [ ] Instagramビジネスアカウント設定の最終確認
- [ ] 長期アクセストークンの取得
- [ ] API連携テストの完了

### 技術的な注意点
- **Graph API v18.0** を使用
- **HTTPS必須**（localhost:4000）
- **CORS設定**でフロントエンド（localhost:3001）を許可
- **セッション管理**でstate検証を実装
- **権限不足**: `pages_show_list`、`pages_read_engagement` が必要

## 🆘 サポート情報

### ログの確認方法
```bash
# サーバーログの確認
tail -f logs/server-debug-*.log

# エラーハイストリーの確認
curl https://localhost:4000/debug
```

### デバッグ情報
- サーバー起動: `https://localhost:4000`
- フロントエンド: `https://localhost:3001`
- ヘルスチェック: `https://localhost:4000/health`

### 参考リンク
- [Instagram Graph API ドキュメント](https://developers.facebook.com/docs/instagram-api)
- [Meta Business Manager](https://business.facebook.com)
- [Facebook for Developers](https://developers.facebook.com)

## 🎯 優先対応事項

### 最優先（即座に対応）
1. **Facebookページのビジネスアセット登録確認**
2. **デモモードでの全機能テスト**

### 高優先（1-2日以内）
1. **Instagramビジネスアカウント設定の最終確認**
2. **API権限の追加申請**

### 中優先（1週間以内）
1. **長期アクセストークンの取得**
2. **API連携テストの実行**

---

**最終更新**: 2025年1月
**担当者**: とりる（trill.0310.0321@gmail.com）
**ステータス**: 設定完了、API連携テスト中
**診断実行日**: 2025年1月 