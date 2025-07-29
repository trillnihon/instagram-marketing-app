# Instagram Marketing Dashboard

Instagram Businessアカウントと連携し、投稿分析・インサイト取得・ハッシュタグ分析を行うマーケティングダッシュボードアプリケーションです。

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

## 🚀 主要機能

- **Instagram Business連携**: Meta Graph APIを使用した公式連携
- **投稿分析**: 投稿データの取得と分析
- **インサイト取得**: エンゲージメント率、リーチ数などの詳細分析
- **ハッシュタグ分析**: ハッシュタグの効果測定
- **投稿スケジューリング**: 投稿の予約機能
- **アナリティクスダッシュボード**: 総合的な分析レポート

## 🛠 技術スタック

### フロントエンド
- **React 18**: UIフレームワーク
- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **React Router**: ルーティング
- **Zustand**: 状態管理
- **Tailwind CSS**: スタイリング

### バックエンド
- **Node.js**: ランタイム
- **Express**: Webフレームワーク
- **MongoDB**: データベース
- **JWT**: 認証
- **Axios**: HTTP通信

### デプロイ
- **Vercel**: フロントエンドホスティング
- **Render**: バックエンドホスティング
- **MongoDB Atlas**: クラウドデータベース

---

## 📦 インストール・セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- MongoDB（開発環境）

### 1. リポジトリのクローン
```bash
git clone https://github.com/trillnihon/instagram-marketing-app.git
cd instagram-marketing-app
```

### 2. 依存関係のインストール
```bash
# フロントエンド
npm install

# バックエンド
cd server
npm install
```

### 3. 環境変数の設定
```bash
# フロントエンド
cp .env.example .env.local

# バックエンド
cd server
cp .env.example .env
```

### 4. 開発サーバーの起動
```bash
# フロントエンド（ターミナル1）
npm run dev

# バックエンド（ターミナル2）
cd server
npm start
```

---

## 🔧 設定

### Facebook開発者コンソール設定

1. **アプリの作成**
   - Facebook開発者コンソールでアプリを作成
   - アプリID: `1003724798254754`

2. **権限の設定**
   - `public_profile`
   - `email`
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`

3. **OAuth設定**
   - 有効なOAuthリダイレクトURI: 上記の統一URL設定を参照
   - アプリドメイン: 上記の統一URL設定を参照

### 環境変数

#### フロントエンド（.env.local）
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_FACEBOOK_APP_ID=1003724798254754
```

#### バックエンド（.env）
```env
MONGODB_URI=mongodb://localhost:27017/instagram-marketing
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=your_app_secret
SESSION_SECRET=your_session_secret
```

---

## 🚀 デプロイ

### フロントエンド（Vercel）
```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel --prod
```

### バックエンド（Render）
1. Renderダッシュボードで新しいWebサービスを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. 自動デプロイを有効化

---

## 📝 使用方法

### 1. ログイン
- テスト用アカウント: `trill.0310.0321@gmail.com`
- パスワード: `password123`

### 2. Instagram連携
1. 「Instagram連携」タブをクリック
2. 「Instagramと連携する」ボタンをクリック
3. Facebook認証を完了
4. Instagram Businessアカウントの選択

### 3. データ分析
- 投稿データの自動取得
- インサイトの表示
- ハッシュタグ分析の実行

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

## 📁 プロジェクト構造

```
instagram-marketing-app/
├── src/
│   ├── components/          # Reactコンポーネント
│   ├── pages/              # ページコンポーネント
│   ├── services/           # APIサービス
│   ├── store/              # 状態管理
│   ├── types/              # TypeScript型定義
│   └── utils/              # ユーティリティ
├── server/                 # バックエンド
│   ├── config/             # 設定ファイル
│   ├── routes/             # APIルート
│   ├── services/           # ビジネスロジック
│   └── utils/              # ユーティリティ
├── public/                 # 静的ファイル
└── docs/                   # ドキュメント
```

---

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## 📞 サポート

### 開発者情報
- **プロジェクト**: Instagram Marketing App
- **リポジトリ**: `https://github.com/trillnihon/instagram-marketing-app`
- **最終更新**: 2025年7月29日

### 緊急時の対応
1. **設定変更禁止**: 上記の統一URL設定は絶対に変更しない
2. **ロールバック**: 問題発生時は前回の正常動作バージョンに戻す
3. **ログ確認**: ブラウザの開発者ツールでエラーログを確認

---

**このREADMEは、Instagram Business連携の完了と本番運用開始のためのガイドラインです。**
