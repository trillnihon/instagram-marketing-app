# Instagram Marketing App 申し送り書

## 📋 プロジェクト概要
- **プロジェクト名**: Instagram Marketing App
- **技術スタック**: React + TypeScript + Vite (フロントエンド), Node.js + Express (バックエンド)
- **デプロイ環境**: Vercel (フロントエンド), Render (バックエンド)
- **最終更新**: 2025年1月25日

## 🚨 重要: 404エラー問題の原因と解決方法 (2025年7月31日追加)

### 問題の概要
- **発生時期**: 2025年7月31日
- **症状**: `/auth/instagram/callback` にアクセスするとVercelの404ページが表示される
- **影響範囲**: ログイン機能、Instagram認証機能

### 根本原因
1. **SPAルーティング設定の問題**
   - `vercel.json` の rewrites 設定が不十分
   - React Router のルーティングが正しく動作しない

2. **バックエンドURLの不一致**
   - フロントエンドが参照するバックエンドURL: `instagram-marketing-backend.onrender.com`
   - 実際のバックエンドURL: `instagram-marketing-backend-v2.onrender.com`
   - サービス名の不一致によりAPI呼び出しが失敗

### 調査方法と手順

#### 1. フロントエンドの問題調査
```bash
# 1. ブラウザの開発者ツールでコンソールログを確認
# 2. Network タブでAPIリクエストの失敗を確認
# 3. 404エラーの詳細を確認
```

#### 2. Vercel設定の確認
```bash
# vercel.json の内容を確認
cat vercel.json

# 期待される設定
{
  "rewrites": [
    { "source": "/auth/(.*)", "destination": "/" },
    { "source": "/(.*)", "destination": "/" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### 3. バックエンドの状態確認
```bash
# Renderダッシュボードで以下を確認
# 1. サービス名: instagram-marketing-backend-v2
# 2. デプロイステータス: "Live" になっているか
# 3. ログでエラーがないか
# 4. 環境変数が正しく設定されているか
```

#### 4. APIエンドポイントの確認
```bash
# サーバー側のエンドポイント
grep -r "app.post.*login" server/
grep -r "app.post.*signup" server/

# フロントエンド側のAPI呼び出し
grep -r "fetch.*auth" src/
```

### 解決方法

#### 1. SPAルーティング修正
```json
// vercel.json
{
  "rewrites": [
    { "source": "/auth/(.*)", "destination": "/" },
    { "source": "/(.*)", "destination": "/" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### 2. バックエンドURL修正
```typescript
// src/store/useAppStore.ts
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000' 
  : 'https://instagram-marketing-backend-v2.onrender.com'; // 正しいサービス名
```

#### 3. APIエンドポイント修正
```typescript
// ログイン
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  // ...
});

// 新規登録
const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
  // ...
});
```

### 予防策

#### 1. 環境変数の統一管理
```bash
# .env.production
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com
VITE_INSTAGRAM_APP_ID=your_app_id
VITE_INSTAGRAM_REDIRECT_URI=https://your-domain.vercel.app/auth/instagram/callback
```

#### 2. デプロイ前チェックリスト
- [ ] フロントエンドとバックエンドのURLが一致しているか
- [ ] APIエンドポイントが正しく設定されているか
- [ ] 環境変数が正しく設定されているか
- [ ] SPAルーティングが正しく動作するか

#### 3. ログ監視
```bash
# フロントエンドログ
console.log('[DEBUG] API_BASE_URL:', API_BASE_URL);
console.log('[DEBUG] レスポンスステータス:', response.status);

# バックエンドログ
console.log('[DEBUG] ログインリクエスト受信:', req.body);
console.log('[DEBUG] 認証チェック開始:', { email });
```

### トラブルシューティング手順

#### 1. 404エラーが発生した場合
1. ブラウザの開発者ツールでコンソールログを確認
2. Network タブでAPIリクエストの詳細を確認
3. Vercelダッシュボードでデプロイ状況を確認
4. Renderダッシュボードでバックエンドの状態を確認

#### 2. ログインができない場合
1. フロントエンドのAPI_BASE_URLを確認
2. バックエンドのサービス名を確認
3. APIエンドポイントのパスを確認
4. 環境変数の設定を確認

#### 3. SPAルーティングが効かない場合
1. `vercel.json` の rewrites 設定を確認
2. `vite.config.ts` の base 設定を確認
3. React Router の設定を確認

### 参考資料
- [Vercel SPA Routing Documentation](https://vercel.com/docs/projects/project-configuration#rewrites)
- [Express Rate Limit Documentation](https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/)
- [Render Deployment Documentation](https://render.com/docs/web-services)

---

## 既存の内容
