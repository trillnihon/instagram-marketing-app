# Instagram Marketing App 申し送り書 - 最終版
**作成日**: 2025年7月29日  
**最終更新**: 2025年7月29日 15:50  
**バージョン**: 2.0 (本番環境テスト完了版)

## 📋 プロジェクト概要

### アプリケーション名
Instagram Marketing Dashboard (Instagram マーケティング ダッシュボード)

### 技術スタック
- **フロントエンド**: React + TypeScript + Vite (Vercelデプロイ)
- **バックエンド**: Node.js + Express (Renderデプロイ)
- **データベース**: MongoDB Atlas
- **認証**: JWT + Facebook OAuth
- **API**: Meta Graph API (Instagram Business)

### デプロイ状況
- **フロントエンド**: ✅ Vercel - 正常動作
  - URL: `https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app`
- **バックエンド**: ✅ Render - 正常動作
  - URL: `https://instagram-marketing-backend-v2.onrender.com`
- **データベース**: ✅ MongoDB Atlas - 接続済み

---

## 🚨 絶対に変更してはいけない設定

### 1. 統一URL設定 (最重要)
**すべての設定で以下のURLを使用すること**

#### フロントエンドURL
```
https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

#### バックエンドURL
```
https://instagram-marketing-backend-v2.onrender.com
```

### 2. Facebook開発者コンソール設定
**変更禁止箇所**
- **有効なOAuthリダイレクトURI**: `https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback`
- **アプリドメイン**: `instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app`
- **サイトURL**: `https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app`

### 3. 環境変数設定 (変更禁止)
#### フロントエンド (`env.production`)
```env
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api
NEXT_PUBLIC_API_URL=https://instagram-marketing-backend-v2.onrender.com
VITE_INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
CORS_ORIGIN=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

#### バックエンド (`server/env.production`)
```env
INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
CORS_ORIGIN=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

### 4. コード内の直接設定 (変更禁止)
#### `src/services/authService.ts` (10行目)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://instagram-marketing-backend-v2.onrender.com');
```

#### `src/services/instagramApi.ts` (10行目)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://instagram-marketing-backend-v2.onrender.com');
```

---

## ✅ 完了したタスク

### 1. 本番環境デプロイ
- [x] Vercelフロントエンドデプロイ完了
- [x] Renderバックエンドデプロイ完了
- [x] MongoDB Atlas接続設定完了

### 2. 環境変数設定
- [x] 統一URL設定の適用
- [x] Facebook/Instagram API設定
- [x] CORS設定
- [x] JWT/Session設定

### 3. エラー修正
- [x] MongoDB接続エラーの解決 (デモモード対応)
- [x] 405 Method Not Allowedエラーの修正
- [x] API Base URL設定の修正

### 4. 本番環境テスト
- [x] フロントエンドアクセス確認
- [x] ログイン機能確認
- [x] Instagram連携ページ表示確認
- [x] バックエンド起動確認

---

## 🔄 現在の状況

### 動作確認済み
1. **フロントエンド**: ✅ 正常動作
   - アプリケーション表示
   - デモユーザーログイン
   - Instagram連携ページ表示

2. **バックエンド**: ✅ 正常動作
   - Renderデプロイ完了
   - 起動プロセス完了
   - API エンドポイント応答

3. **データベース**: ✅ 接続済み
   - MongoDB Atlas接続
   - 本番環境データ保存可能

### テストアカウント
- **メール**: `test@example.com`
- **パスワード**: `testpassword123`

---

## 🚧 今後の課題

### 1. 緊急対応が必要な課題

#### A. Instagram連携の完全動作確認
**現状**: フロントエンドは表示されるが、Instagram連携の完全動作未確認
**課題**: 
- Instagram OAuth認証フローの動作確認
- アクセストークンの取得・保存確認
- Instagram Graph API呼び出し確認

**対応方法**:
1. Instagram連携ボタンをクリックしてOAuth認証テスト
2. アクセストークン取得の確認
3. Instagram投稿データ取得テスト

#### B. アクセストークン管理の改善
**現状**: フロントエンドで「アクセストークンがありません」エラーが表示
**課題**:
- アクセストークンの永続化
- トークン有効期限管理
- 再認証フローの実装

**対応方法**:
1. ローカルストレージでのトークン保存確認
2. トークン有効期限チェック機能追加
3. 自動再認証機能の実装

### 2. 中期的な改善課題

#### A. エラーハンドリングの強化
**課題**:
- ネットワークエラーの適切な処理
- ユーザーフレンドリーなエラーメッセージ
- リトライ機能の実装

#### B. パフォーマンス最適化
**課題**:
- Renderのコールドスタート対策
- フロントエンドの読み込み速度改善
- API応答時間の最適化

#### C. セキュリティ強化
**課題**:
- 環境変数の暗号化
- API レート制限の実装
- セッション管理の改善

### 3. 長期的な拡張課題

#### A. 機能拡張
**課題**:
- 投稿スケジューリング機能
- ハッシュタグ分析機能
- 競合分析機能

#### B. ユーザビリティ改善
**課題**:
- モバイル対応の強化
- ダッシュボードのカスタマイズ
- 多言語対応

---

## 📝 運用時の注意事項

### 1. URL変更時のチェックリスト
URLを変更する場合は、以下の全箇所を同時に更新すること：
- [ ] Facebook開発者コンソールのOAuthリダイレクトURI
- [ ] Facebook開発者コンソールのアプリドメイン
- [ ] Facebook開発者コンソールのサイトURL
- [ ] バックエンドのserver.js
- [ ] フロントエンドのinstagramApi.ts
- [ ] 環境変数ファイル
- [ ] デプロイ後の動作確認

### 2. デプロイ時の確認事項
- [ ] GitHubへのプッシュ確認
- [ ] Vercel自動デプロイの確認
- [ ] Render自動デプロイの確認
- [ ] 本番環境での動作確認

### 3. 緊急時の対応
- **設定変更禁止**: 上記の統一URL設定は絶対に変更しない
- **ロールバック**: 問題発生時は前回の正常動作バージョンに戻す
- **ログ確認**: ブラウザの開発者ツールでエラーログを確認

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. 503 Service Unavailable エラー
**原因**: Renderバックエンドのコールドスタート
**解決方法**: 数分待ってから再試行

#### 2. 405 Method Not Allowed エラー
**原因**: API Base URL設定の不整合
**解決方法**: 環境変数の確認と修正

#### 3. アクセストークンエラー
**原因**: トークンの未保存または期限切れ
**解決方法**: 再ログインまたはInstagram連携の再実行

---

## 📞 連絡先・リソース

### 重要なURL
- **フロントエンド**: https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
- **バックエンド**: https://instagram-marketing-backend-v2.onrender.com
- **Vercelダッシュボード**: https://vercel.com/dashboard
- **Renderダッシュボード**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com

### ドキュメント
- **README.md**: プロジェクト概要とセットアップ手順
- **この申し送り書**: 運用時の注意事項とトラブルシューティング

---

## 🎯 次のアクション

### 即座に実行すべきタスク
1. **Instagram連携の完全動作確認**
2. **アクセストークン管理の改善**
3. **エラーハンドリングの強化**

### 今後の優先順位
1. **高**: Instagram連携の完全動作
2. **中**: パフォーマンス最適化
3. **低**: 機能拡張

---

**注意**: この申し送り書は、プロジェクトの継続的な運用と発展のために作成されました。新しい課題や改善点が発見された場合は、このドキュメントを更新してください。 