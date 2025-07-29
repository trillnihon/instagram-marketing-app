# Instagram Business連携 完全セットアップガイド（2025年7月29日）

## 🎯 目標
Instagram Businessアカウントとの完全連携を実現し、本番運用を開始する

## 📋 現在の状況

### ✅ 完了済み
- **Instagramアカウント**: @1100_ai_ko（ビジネスアカウント）
- **Facebookページ**: 「インスタ支援テスト」
- **Meta Business**: 「トリル管理」
- **アプリ設定**: Facebook開発者コンソール設定完了

### ❌ 未完了
- **API連携**: FacebookページがAPIで検出されない
- **アクセストークン**: 長期トークン未取得
- **本番運用**: デモデータでの動作のみ

---

## 🚀 完全セットアップ手順

### Step 1: Meta Business Managerでの設定確認

#### 1.1 Meta Business Managerにアクセス
```
https://business.facebook.com
```

#### 1.2 ビジネスアセットの確認
1. **「アセット」** → **「Facebookページ」**をクリック
2. **「インスタ支援テスト」**ページが表示されているか確認
3. 表示されていない場合は新規作成

#### 1.3 Instagramアカウントの連携確認
1. **「アセット」** → **「Instagramアカウント」**をクリック
2. **@1100_ai_ko**が表示されているか確認
3. **「Facebookページに接続」**が完了しているか確認

### Step 2: Facebookページの再設定

#### 2.1 ページの権限確認
1. **「インスタ支援テスト」**ページにアクセス
2. **「設定」** → **「ページロール」**を確認
3. **trill.0310.0321@gmail.com**が管理者として登録されているか確認

#### 2.2 ページの公開設定
1. **「設定」** → **「一般」**をクリック
2. **「ページの公開」**が有効になっているか確認
3. **「ページの検索」**が有効になっているか確認

### Step 3: Instagramビジネスアカウントの確認

#### 3.1 Instagramアプリでの設定
1. **Instagramアプリ**で@1100_ai_koにログイン
2. **「設定」** → **「アカウント」** → **「アカウントタイプ」**を確認
3. **「ビジネス」**になっているか確認

#### 3.2 Facebookページとの連携確認
1. **「設定」** → **「アカウント」** → **「リンクされたアカウント」**
2. **「Facebook」**が接続されているか確認
3. **「インスタ支援テスト」**ページが表示されているか確認

### Step 4: Facebook開発者コンソールでの設定

#### 4.1 アプリ設定の確認
```
https://developers.facebook.com/apps/1193533602546658
```

#### 4.2 必要な権限の追加
以下の権限が付与されているか確認：
- ✅ `email`
- ✅ `instagram_basic`
- ✅ `instagram_manage_insights`
- ✅ `public_profile`
- ❌ `pages_show_list` ← **追加必要**
- ❌ `pages_read_engagement` ← **追加必要**

#### 4.3 権限の追加手順
1. **「アプリレビュー」** → **「権限と機能」**をクリック
2. **「pages_show_list」**を検索して追加
3. **「pages_read_engagement」**を検索して追加
4. **「変更を保存」**をクリック

### Step 5: 認証フローの実行

#### 5.1 新しい認証URLの生成
```
https://www.facebook.com/v18.0/dialog/oauth?
client_id=1193533602546658&
redirect_uri=https://instagram-marketing-f14poopuq-trillnihons-projects.vercel.app/auth/callback&
scope=email,instagram_basic,instagram_manage_insights,public_profile,pages_show_list,pages_read_engagement&
state=random_state_string
```

#### 5.2 認証の実行
1. 上記URLにアクセス
2. **Facebookログイン**を実行
3. **権限の許可**を確認
4. **ページの選択**で「インスタ支援テスト」を選択
5. **Instagramアカウント**の選択で@1100_ai_koを選択

### Step 6: 長期アクセストークンの取得

#### 6.1 短期トークンから長期トークンへの変換
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=1193533602546658" \
  -d "client_secret=5f337d6e7ad05fd7a74cd78f13d7d5c1" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

#### 6.2 ページアクセストークンの取得
```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?" \
  -d "access_token=LONG_LIVED_TOKEN"
```

#### 6.3 Instagramアクセストークンの取得
```bash
curl -X GET "https://graph.facebook.com/v18.0/PAGE_ID?" \
  -d "fields=instagram_business_account" \
  -d "access_token=PAGE_ACCESS_TOKEN"
```

### Step 7: アプリケーションでの設定

#### 7.1 環境変数の更新
```env
# フロントエンド (.env)
VITE_INSTAGRAM_ACCESS_TOKEN=YOUR_INSTAGRAM_ACCESS_TOKEN
VITE_FACEBOOK_PAGE_ID=YOUR_PAGE_ID
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID

# バックエンド (.env)
INSTAGRAM_ACCESS_TOKEN=YOUR_INSTAGRAM_ACCESS_TOKEN
FACEBOOK_PAGE_ID=YOUR_PAGE_ID
INSTAGRAM_BUSINESS_ACCOUNT_ID=YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID
```

#### 7.2 アプリケーションの再デプロイ
```bash
# フロントエンド
vercel --prod

# バックエンド
# Renderダッシュボードで環境変数を更新
```

### Step 8: 連携テストの実行

#### 8.1 API接続テスト
```bash
# Instagramアカウント情報の取得
curl -X GET "https://graph.facebook.com/v18.0/INSTAGRAM_BUSINESS_ACCOUNT_ID?" \
  -d "fields=id,username,media_count,followers_count" \
  -d "access_token=INSTAGRAM_ACCESS_TOKEN"

# 投稿一覧の取得
curl -X GET "https://graph.facebook.com/v18.0/INSTAGRAM_BUSINESS_ACCOUNT_ID/media?" \
  -d "access_token=INSTAGRAM_ACCESS_TOKEN"
```

#### 8.2 アプリケーションでのテスト
1. **ログイン**してダッシュボードにアクセス
2. **「Instagram連携」**をクリック
3. **アカウント情報**が表示されるか確認
4. **「アナリティクス」**で実際のデータが表示されるか確認

---

## 🔧 トラブルシューティング

### 問題1: FacebookページがAPIで検出されない
**症状**: `/me/accounts` で `"data": []` が返される

**解決策**:
1. Meta Business Managerでページをビジネスアセットに追加
2. ページの権限設定を確認
3. 認証時にページ選択でチェックを入れる

### 問題2: 権限不足エラー
**症状**: `"permission denied"` エラー

**解決策**:
1. Facebook開発者コンソールで権限を追加
2. アプリの審査を申請（開発中はテストユーザーで対応）
3. 再度認証を実行

### 問題3: Instagramアカウントが連携されない
**症状**: InstagramビジネスアカウントIDが取得できない

**解決策**:
1. Instagramアプリでビジネスアカウント設定を確認
2. Facebookページとの連携を再実行
3. Meta Business Managerでアセットリンクを確認

---

## ✅ 完了確認チェックリスト

### Meta Business Manager
- [ ] Facebookページがビジネスアセットに追加されている
- [ ] Instagramアカウントがビジネスアセットに追加されている
- [ ] ページとInstagramアカウントが連携されている

### Facebook開発者コンソール
- [ ] 必要な権限がすべて付与されている
- [ ] アプリの設定が正しく行われている
- [ ] リダイレクトURIが正しく設定されている

### 認証・トークン
- [ ] 長期アクセストークンを取得している
- [ ] ページアクセストークンを取得している
- [ ] Instagramアクセストークンを取得している

### アプリケーション
- [ ] 環境変数が正しく設定されている
- [ ] アプリケーションが再デプロイされている
- [ ] API接続テストが成功している

### 機能テスト
- [ ] ログインが正常に動作する
- [ ] Instagram連携が正常に動作する
- [ ] アナリティクスで実際のデータが表示される
- [ ] 投稿作成機能が正常に動作する

---

## 🎯 本番運用開始

### 運用開始の条件
- ✅ すべてのチェックリスト項目が完了
- ✅ API接続テストが成功
- ✅ 実際のデータでの動作確認完了

### 運用開始後の監視
- **API制限**: 1日あたりのAPI呼び出し回数を監視
- **トークン有効期限**: 60日ごとのトークン更新
- **エラーログ**: 定期的なエラーログの確認
- **パフォーマンス**: レスポンス時間の監視

---

**作成日**: 2025年7月29日  
**最終更新**: 2025年7月29日  
**ステータス**: セットアップ中 