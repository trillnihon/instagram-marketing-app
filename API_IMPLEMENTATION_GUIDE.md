# Facebook Login for Business API実装ガイド

## 📋 認証フロー実装手順

### **1. バックエンドAPI実装**

#### **A. Facebook Login for Business認証エンドポイント**
```javascript
// POST /auth/facebook/callback
app.post('/auth/facebook/callback', async (req, res) => {
  const { access_token, long_lived_token, expires_in, data_access_expiration_time, code, redirect_uri } = req.body;
  
  try {
    let userAccessToken;
    
    // Facebook Login for Business: アクセストークンが直接提供される場合
    if (access_token && long_lived_token) {
      console.log('✅ Facebook Login for Business認証フロー');
      userAccessToken = long_lived_token; // 長期間有効なトークンを使用
    }
    // 通常のOAuth: 認証コードからトークンを取得する場合
    else if (code) {
      console.log('✅ 通常のOAuth認証フロー');
      
      // 認証コードをアクセストークンに交換
      const tokenResponse = await fetch('https://graph.facebook.com/v23.0/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          code: code,
          redirect_uri: redirect_uri
        })
      });
      
      const tokenData = await tokenResponse.json();
      userAccessToken = tokenData.access_token;
    } else {
      throw new Error('認証情報が不足しています');
    }
    
    // 2. ユーザーのPagesを取得
    const pagesResponse = await fetch(`https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`);
    const pagesData = await pagesResponse.json();
    
    console.log('📄 取得したPages:', pagesData.data.length);
    
    // 3. 各PageのInstagram Business Accountを取得
    const instagramAccounts = [];
    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        instagramAccounts.push({
          pageId: page.id,
          pageName: page.name,
          igUserId: page.instagram_business_account.id,
          pageAccessToken: page.access_token
        });
      }
    }
    
    console.log('📸 Instagram Business Accounts:', instagramAccounts.length);
    
    // 4. 認証成功レスポンス
    res.json({
      success: true,
      userAccessToken,
      instagramAccounts,
      message: 'Facebook Login for Business認証が完了しました',
      tokenInfo: {
        expires_in,
        data_access_expiration_time
      }
    });
    
  } catch (error) {
    console.error('Facebook認証エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Facebook認証に失敗しました',
      details: error.message
    });
  }
});
```

#### **B. Instagram Media取得エンドポイント**
```javascript
// GET /instagram/media/:igUserId
app.get('/instagram/media/:igUserId', async (req, res) => {
  const { igUserId } = req.params;
  const { access_token } = req.query;
  
  try {
    // Instagram Business Accountのメディアを取得
    const mediaResponse = await fetch(`https://graph.facebook.com/v23.0/${igUserId}/media?access_token=${access_token}`);
    const mediaData = await mediaResponse.json();
    
    res.json({
      success: true,
      media: mediaData.data,
      paging: mediaData.paging
    });
    
  } catch (error) {
    console.error('Instagram Media取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Instagram Media取得に失敗しました'
    });
  }
});
```

### **2. フロントエンド実装**

#### **A. 認証状態管理の更新**
```typescript
// src/store/useAppStore.ts
interface InstagramAccount {
  pageId: string;
  pageName: string;
  igUserId: string;
  pageAccessToken: string;
}

interface AppState {
  // ... 既存の状態
  instagramAccounts: InstagramAccount[];
  currentInstagramAccount: InstagramAccount | null;
  setInstagramAccounts: (accounts: InstagramAccount[]) => void;
  setCurrentInstagramAccount: (account: InstagramAccount) => void;
}
```

#### **B. Instagram連携コンポーネント**
```typescript
// src/components/InstagramIntegration.tsx
const InstagramIntegration: React.FC = () => {
  const { instagramAccounts, setCurrentInstagramAccount } = useAppStore();
  
  const handleAccountSelect = (account: InstagramAccount) => {
    setCurrentInstagramAccount(account);
    // Instagram Media取得処理
    fetchInstagramMedia(account.igUserId, account.pageAccessToken);
  };
  
  return (
    <div>
      <h3>Instagram Business Account選択</h3>
      {instagramAccounts.map(account => (
        <button key={account.pageId} onClick={() => handleAccountSelect(account)}>
          {account.pageName} - {account.igUserId}
        </button>
      ))}
    </div>
  );
};
```

### **3. 環境変数設定**

#### **A. 開発環境 (.env.development)**
```env
# Facebook OAuth設定
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
VITE_FACEBOOK_APP_ID=1003724798254754

# API設定
VITE_API_BASE_URL=http://localhost:4000/api
```

#### **B. 本番環境 (.env.production)**
```env
# Facebook OAuth設定
FACEBOOK_APP_ID=1003724798254754
FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c
VITE_FACEBOOK_APP_ID=1003724798254754

# API設定
VITE_API_BASE_URL=https://instagram-marketing-backend-v2.onrender.com/api
```

### **4. テスト手順**

#### **A. 開発環境テスト**
1. **バックエンドサーバー起動**:
   ```bash
   cd backend
   npm start
   ```

2. **フロントエンド起動**:
   ```bash
   npm run dev
   ```

3. **認証フローテスト**:
   - `http://localhost:3001/login` にアクセス
   - 「📸 Facebook Login for Business」ボタンをクリック
   - Facebook認証を完了
   - Instagram Business Account選択画面を確認

#### **B. 本番環境テスト**
1. **Vercelデプロイ**:
   ```bash
   vercel --prod
   ```

2. **本番環境でテスト**:
   - `https://instagram-marketing-app.vercel.app/login` にアクセス
   - 同様の認証フローを実行

### **5. トラブルシューティング**

#### **A. よくある問題**
- **認証コード取得失敗**: Meta Developer ConsoleのOAuth設定を確認
- **Pages取得失敗**: Facebook PageとInstagram Business Accountの接続を確認
- **Media取得失敗**: アクセストークンの権限を確認

#### **B. デバッグ方法**
- ブラウザの開発者ツールでネットワークタブを確認
- コンソールログでデバッグ情報を確認
- Meta Developer Consoleでアプリの状態を確認

## 🎯 次のステップ

1. **バックエンドAPI実装**
2. **フロントエンド連携**
3. **Instagram Media取得機能**
4. **投稿分析・最適化機能**
5. **アプリレビュー申請** 