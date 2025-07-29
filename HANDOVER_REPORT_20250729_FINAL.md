# Instagram Marketing App - 最終申し送り書
**作成日**: 2025年7月29日  
**バージョン**: 1.0.0  
**ステータス**: Instagram Business連携完了、本番運用準備完了

## 📋 プロジェクト概要

### アプリケーション名
Instagram Marketing Dashboard

### 主要機能
- Instagram Business連携（Meta Graph API）
- 投稿分析・インサイト取得
- ハッシュタグ分析
- 投稿スケジューリング
- アナリティクスダッシュボード

### 技術スタック
- **フロントエンド**: React + Vite + TypeScript
- **バックエンド**: Node.js + Express
- **デプロイ**: Vercel（フロントエンド）+ Render（バックエンド）
- **データベース**: MongoDB Atlas（本番）/ デモモード（開発）

---

## 🚨 絶対に変更してはいけない設定

### ⚠️ 統一URL設定（最重要）
**すべての設定で以下のURLを統一して使用すること**

```
https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
```

#### 変更禁止箇所一覧

##### 1. Facebook開発者コンソール
- **有効なOAuthリダイレクトURI**: 
  ```
  https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
  ```
- **アプリドメイン**: 
  ```
  instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
  ```
- **サイトURL**: 
  ```
  https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/
  ```

##### 2. バックエンド設定
- **server/server.js** (258行目):
  ```javascript
  const redirectUri = process.env.NODE_ENV === 'production' 
    ? 'https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback'
    : 'https://localhost:4000/auth/instagram/callback';
  ```

##### 3. フロントエンド設定
- **src/services/instagramApi.ts** (10行目):
  ```javascript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://instagram-marketing-backend.onrender.com');
  ```

##### 4. 環境変数
- **env.production**:
  ```
  VITE_API_BASE_URL=https://instagram-marketing-backend.onrender.com/api
  ```

### 🔒 統一ルール（全チャット共通認識）
1. **すべての設定で同じURLを使用**
2. **新しいURL変更時は全箇所を同時に更新**
3. **テスト前に設定の整合性を確認**

---

## ✅ 完了した作業

### 1. Service Worker問題の完全解決
- **問題**: Service WorkerがPOSTリクエストをキャッシュしてエラーを発生
- **解決**: Service Workerを完全に削除・無効化
- **ファイル**: `public/sw.js` 削除済み

### 2. Facebookアプリ設定の最適化
- **アプリID**: `1003724798254754`
- **アプリモード**: 開発モード（本番運用時はライブモードに変更）
- **権限設定**: 
  - `public_profile`
  - `email`
  - `instagram_basic`
  - `instagram_manage_insights`
  - `pages_show_list`
  - `pages_read_engagement`

### 3. 認証システムの改善
- **バックエンド障害時の対応**: デモモードでの動作
- **エラーハンドリング**: グローバルエラーハンドリング実装
- **認証フロー**: OAuth認証の完全実装

### 4. デプロイ環境の最適化
- **フロントエンド**: Vercel自動デプロイ設定
- **バックエンド**: Render自動デプロイ設定
- **ルーティング**: Vercel設定ファイル（`vercel.json`）追加

### 5. Instagram Business連携の実装
- **認証フロー**: Facebook OAuth → Instagram Graph API
- **コールバック処理**: 認証コードの処理とアクセストークン取得
- **エラーハンドリング**: 認証失敗時の適切な処理

---

## 🔧 現在の設定状況

### フロントエンド（Vercel）
- **URL**: `https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app`
- **ステータス**: 正常動作
- **設定ファイル**: `vercel.json` 追加済み

### バックエンド（Render）
- **URL**: `https://instagram-marketing-backend.onrender.com`
- **ステータス**: 正常動作
- **データベース**: MongoDB Atlas（本番）/ デモモード（開発）

### Facebook開発者コンソール
- **アプリ名**: Caption AI Tool
- **アプリID**: `1003724798254754`
- **ステータス**: 開発モード
- **権限**: 必要な権限すべて設定済み

---

## 📝 本番運用開始手順

### 1. Facebookアプリのライブモード化
1. Facebook開発者コンソールにアクセス
2. アプリモードを「開発」から「ライブ」に変更
3. 必要な権限の承認を完了

### 2. 最終テスト
1. Instagram連携の動作確認
2. 投稿データの取得確認
3. インサイト機能の動作確認

### 3. ユーザーアカウント情報
- **テスト用アカウント**: `trill.0310.0321@gmail.com`
- **パスワード**: `password123`

---

## 🚨 重要な注意事項

### URL変更時のチェックリスト
- [ ] Facebook開発者コンソールのOAuthリダイレクトURI
- [ ] Facebook開発者コンソールのアプリドメイン
- [ ] Facebook開発者コンソールのサイトURL
- [ ] バックエンドのserver.js
- [ ] フロントエンドのinstagramApi.ts
- [ ] 環境変数ファイル
- [ ] デプロイ後の動作確認

### トラブルシューティング
- **OAuth認証エラー**: リダイレクトURIの整合性確認
- **404エラー**: ルーティング設定の確認
- **接続エラー**: API_BASE_URLの確認

---

## 📞 サポート情報

### 開発者情報
- **プロジェクト**: Instagram Marketing App
- **リポジトリ**: `https://github.com/trillnihon/instagram-marketing-app`
- **最終更新**: 2025年7月29日

### 緊急時の対応
1. **設定変更禁止**: 上記の統一URL設定は絶対に変更しない
2. **ロールバック**: 問題発生時は前回の正常動作バージョンに戻す
3. **ログ確認**: ブラウザの開発者ツールでエラーログを確認

---

**この申し送り書は、Instagram Business連携の完了と本番運用開始のための最終的なガイドラインです。** 