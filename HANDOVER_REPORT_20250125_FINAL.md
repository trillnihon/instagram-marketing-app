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

4. **React Routerのルーティング設定不足** (2025年7月31日追加)
   - `/auth/instagram/callback` ルートが `App.tsx` で定義されていない
   - Vercelは正常に `index.html` を配信しているが、React Routerがルートを認識できない

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
    { "source": "/auth/instagram/callback", "destination": "/" },
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

#### 5. React Routerのルーティング確認 (2025年7月31日追加)
```bash
# App.tsx でルートが正しく定義されているか確認
grep -r "auth/instagram/callback" src/App.tsx

# 期待される設定
<Route path="/auth/instagram/callback" element={<AuthCallback />} />
```

### 解決方法

#### 1. SPAルーティング修正
```json
// vercel.json
{
  "rewrites": [
    { "source": "/auth/instagram/callback", "destination": "/" },
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

#### 5. React Routerルーティング修正 (2025年7月31日追加)
```typescript
// src/App.tsx
<Route path="/auth/instagram/callback" element={<AuthCallback />} />
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
- [ ] React Routerのルーティングが正しく定義されているか

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
5. React Routerのルーティング設定を確認

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

#### 5. Instagram認証コールバックで404エラーが発生した場合 (2025年7月31日追加)
1. Network タブでリクエストのステータスコードを確認
2. Vercelが `index.html` を正常に配信しているか確認
3. React Routerのルーティング設定を確認
4. `App.tsx` で `/auth/instagram/callback` ルートが定義されているか確認

### 重要な発見と改善点 (2025年7月31日追加)

#### 1. 問題の段階的解決
- **第1段階**: SPAルーティング設定の修正
- **第2段階**: バックエンドURLの修正
- **第3段階**: CORS設定の修正
- **第4段階**: React Routerルーティングの修正

#### 2. デバッグの重要性
- **Network タブ**: リクエストの詳細な分析が重要
- **ステータスコード**: 200 OKでも404エラーが発生する場合がある
- **レスポンスヘッダー**: `content-disposition` で配信内容を確認

#### 3. 根本原因の特定方法
```bash
# 1. Vercelの動作確認
# ステータスコード: 200 OK
# レスポンス: index.html が配信されている

# 2. React Routerの動作確認
# App.tsx でルートが定義されているか
# AuthCallback コンポーネントが存在するか

# 3. コンポーネントの動作確認
# AuthCallback コンポーネントが正常に動作するか
```

#### 4. 今後の改善点
- **ルーティング設定の一元化**: すべてのルートを一箇所で管理
- **デバッグログの強化**: より詳細なログ出力
- **エラーハンドリングの改善**: 404エラーの早期検出
- **テスト環境の整備**: 本番デプロイ前のテスト実行

### 参考資料
- [Vercel SPA Routing Documentation](https://vercel.com/docs/projects/project-configuration#rewrites)
- [Express Rate Limit Documentation](https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/)
- [Render Deployment Documentation](https://render.com/docs/web-services)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [React Router Documentation](https://reactrouter.com/en/main)

### 重要なURL
- **フロントエンド**: https://instagram-marketing-app-v1.vercel.app
- **バックエンド**: https://instagram-marketing-backend-v2.onrender.com
- **GitHub**: https://github.com/trillnihon/instagram-marketing-app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com

---

**📝 備考**: 本申し送り書は2025年7月31日の作業完了時点での状況を記録しています。React Routerのルーティング修正により、Instagram認証コールバックの404エラーが解決される見込みです。

**🎯 次のステップ**: デプロイ完了後、Instagram認証機能の動作確認を行い、必要に応じて追加の修正を実施してください。
