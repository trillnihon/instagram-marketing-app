# Instagram Marketing App 申し送り書

## 📋 プロジェクト概要
- **プロジェクト名**: Instagram Marketing App
- **技術スタック**: React + TypeScript + Vite (フロントエンド), Node.js + Express (バックエンド)
- **デプロイ環境**: Vercel (フロントエンド), Render (バックエンド)
- **最終更新**: 2025年7月31日
- **現在の状況**: CORS設定修正完了、デプロイ中

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

3. **CORS設定の問題** (2025年7月31日追加)
   - フロントエンドとバックエンド間のCORS設定が不適切
   - エラー: `No 'Access-Control-Allow-Origin' header is present`

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

#### 4. CORS設定修正 (2025年7月31日追加)
```javascript
// server/middleware/security.js
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const origins = [
      'https://instagram-marketing-app-v1.vercel.app',
      'https://instagram-marketing-app-v1-j28ssqoui-trillnihons-projects.vercel.app'
    ];
    
    // 環境変数で追加のオリジンを指定可能
    if (process.env.CORS_ORIGIN) {
      origins.push(process.env.CORS_ORIGIN);
    }
    
    return origins;
  } else {
    return [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3001',
      'http://localhost:3002',
      'https://localhost:3002'
    ];
  }
};
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
- [ ] CORS設定が正しく設定されているか

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

#### 4. CORSエラーが発生した場合 (2025年7月31日追加)
1. バックエンドのCORS設定を確認
2. フロントエンドのURLが許可リストに含まれているか確認
3. 環境変数 `CORS_ORIGIN` の設定を確認
4. ブラウザの開発者ツールでCORSエラーの詳細を確認

## ⚠️ 絶対に変更してはいけない箇所

### 1. バックエンドサービス名
- **現在のサービス名**: `instagram-marketing-backend-v2`
- **理由**: Renderで作成済みのサービス名を変更すると、URLが変わり、フロントエンドとの連携が壊れる
- **影響**: フロントエンドのAPI_BASE_URLを変更する必要がある

### 2. デモユーザーの認証情報
- **メールアドレス**: `trill.0310.0321@gmail.com`
- **パスワード**: `password123`
- **理由**: サーバー側のハードコードされた認証情報と一致させる必要がある
- **場所**: `server/server.js` の `/api/auth/login` エンドポイント

### 3. APIエンドポイントのパス
- **ログイン**: `/api/auth/login`
- **新規登録**: `/api/auth/signup`
- **理由**: フロントエンドとバックエンドで一致させる必要がある
- **影響**: パスを変更すると、フロントエンドのAPI呼び出しも変更する必要がある

### 4. 環境変数の名前
- **CORS_ORIGIN**: CORS設定で使用
- **NODE_ENV**: 環境判定で使用
- **理由**: コード内で参照されているため、変更すると動作しなくなる

### 5. vercel.jsonの基本構造
- **rewrites設定**: SPAルーティングに必要
- **buildCommand**: Vercelのビルド設定
- **outputDirectory**: ビルド出力先
- **理由**: Vercelのデプロイ設定として必須

## 🔍 絶対に見なければいけない箇所

### 1. デプロイ時のログ
- **Vercel**: デプロイログでエラーがないか確認
- **Render**: ログでサーバー起動エラーがないか確認
- **確認ポイント**: 
  - サーバー起動成功メッセージ
  - CORS設定の適用
  - 環境変数の読み込み

### 2. ブラウザの開発者ツール
- **Console**: エラーメッセージの確認
- **Network**: APIリクエストの成功/失敗確認
- **確認ポイント**:
  - CORSエラー
  - 404エラー
  - APIレスポンスの内容

### 3. 環境変数の設定
- **Vercel**: フロントエンドの環境変数
- **Render**: バックエンドの環境変数
- **確認ポイント**:
  - API_BASE_URLの正確性
  - CORS_ORIGINの設定
  - 認証関連の設定

### 4. サービスURLの確認
- **フロントエンド**: `https://instagram-marketing-app-v1.vercel.app`
- **バックエンド**: `https://instagram-marketing-backend-v2.onrender.com`
- **確認ポイント**: URLが正しく設定されているか

## 🚀 今後の開発に関する注意書き

### 1. デプロイ前の確認事項
```bash
# 必ず確認すること
1. フロントエンドとバックエンドのURLが一致しているか
2. APIエンドポイントのパスが正しいか
3. CORS設定が適切か
4. 環境変数が正しく設定されているか
5. デモユーザーの認証情報が変更されていないか
```

### 2. 新機能追加時の注意
- **APIエンドポイント追加時**: フロントエンドのAPI呼び出しも同時に更新
- **環境変数追加時**: VercelとRenderの両方に設定
- **CORS設定変更時**: フロントエンドのURLを許可リストに追加

### 3. デバッグ時の手順
```bash
# 1. ブラウザの開発者ツールでエラーを確認
# 2. サーバーログでエラーを確認
# 3. 環境変数の設定を確認
# 4. APIエンドポイントの動作を確認
# 5. CORS設定を確認
```

### 4. 緊急時の対応
- **サービス停止時**: Renderダッシュボードでサービスを再起動
- **デプロイ失敗時**: ログを確認して原因を特定
- **認証エラー時**: デモユーザーの認証情報を確認

### 5. セキュリティに関する注意
- **機密情報**: `.env` ファイルはGitにコミットしない
- **APIキー**: 環境変数で管理し、コードにハードコードしない
- **CORS設定**: 必要最小限のドメインのみ許可

## 📊 現在の動作状況 (2025年7月31日時点)

### ✅ 正常動作している機能
- フロントエンドの表示
- SPAルーティング
- バックエンドサーバーの起動
- 基本的なAPIエンドポイント

### 🔧 修正完了した問題
- 404エラー（SPAルーティング）
- バックエンドURLの不一致
- CORS設定の問題

### ⏳ 現在の状況
- CORS設定修正完了
- デプロイ中（Vercel・Render）
- ログイン機能の動作確認待ち

### 📋 次の確認事項
1. デプロイ完了の確認
2. ログイン機能の動作確認
3. Instagram認証機能の動作確認

## 📞 緊急時連絡先・参考資料

### 参考資料
- [Vercel SPA Routing Documentation](https://vercel.com/docs/projects/project-configuration#rewrites)
- [Express Rate Limit Documentation](https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/)
- [Render Deployment Documentation](https://render.com/docs/web-services)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### 重要なURL
- **フロントエンド**: https://instagram-marketing-app-v1.vercel.app
- **バックエンド**: https://instagram-marketing-backend-v2.onrender.com
- **GitHub**: https://github.com/trillnihon/instagram-marketing-app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com

---

**📝 備考**: 本申し送り書は2025年7月31日の作業完了時点での状況を記録しています。CORS設定の修正により、ログイン機能が正常に動作する見込みです。

**🎯 次のステップ**: デプロイ完了後、ログイン機能の動作確認を行い、必要に応じて追加の修正を実施してください。
