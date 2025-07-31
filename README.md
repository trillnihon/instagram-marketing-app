# Instagram Marketing App

## 📋 プロジェクト概要

Instagram/Threads分析アプリケーションです。OAuth認証、投稿分析、インサイト取得機能を提供します。

## 🚀 主要機能

- **Instagram OAuth連携**: Facebook/Instagram認証による安全なログイン
- **投稿分析**: Instagram投稿の詳細分析と統計
- **インサイト取得**: 投稿のパフォーマンス指標
- **PWA対応**: プログレッシブウェブアプリとして動作
- **レスポンシブデザイン**: モバイル・デスクトップ対応

## 🔧 技術スタック

- **フロントエンド**: React, TypeScript, Vite
- **バックエンド**: Node.js, Express
- **データベース**: MongoDB
- **認証**: OAuth 2.0 (Facebook/Instagram)
- **デプロイ**: Vercel (フロントエンド), Render (バックエンド)

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 🌐 環境変数

### フロントエンド (.env)
```env
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com
VITE_DEBUG=true
```

### バックエンド (env.production)
```env
INSTAGRAM_REDIRECT_URI=https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app/auth/instagram/callback
```

## 🔍 トラブルシューティング

### Instagram OAuth 404エラー解決
- **vercel.json APIルーティング修正完了**
- **Reactルーティング修正完了**: 全ルーティングをReactに委ねる設定
- **デバッグログ強化**: [STEP X]ログで問題特定が容易

### デバッグ方法
1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブで`[STEP X]`ログを確認
3. NetworkタブでAPIリクエストを確認

## 📱 本番環境

- **URL**: https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app
- **デモアカウント**: trill.0310.0321@gmail.com / password123

## 🔄 開発ガイド

### コード規約
- TypeScriptを使用
- ESLint/Prettierでコード整形
- コンポーネントは関数型で記述

### デプロイ
```bash
# 変更をコミット
git add .
git commit -m "更新内容"
git push origin main

# Vercelで自動デプロイ
```

## 📄 ライセンス

MIT License
