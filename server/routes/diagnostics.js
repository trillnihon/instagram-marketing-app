import express from 'express';
import axios from 'axios';

const router = express.Router();

// Facebook API設定
const FACEBOOK_APP_ID = '1003724798254754';
const FACEBOOK_APP_SECRET = 'fd6a61c31a9f1f5798b4d48a927d8f0c';

// 必須スコープ
const REQUIRED_SCOPES = [
  'pages_show_list',
  'pages_read_engagement', 
  'instagram_basic',
  'instagram_manage_insights',
  'public_profile',
  'email'
];

class FacebookDiagnostics {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.results = {
      tokenValid: false,
      scopes: [],
      missingScopes: [],
      pagesAccessible: false,
      pages: [],
      appMode: 'unknown',
      isTester: false,
      userInfo: null,
      errors: []
    };
  }

  async runDiagnostics() {
    try {
      // 1. トークンの有効性チェック
      await this.checkTokenValidity();
      
      // 2. スコープチェック
      await this.checkScopes();
      
      // 3. ユーザー情報取得
      await this.getUserInfo();
      
      // 4. アプリ情報取得
      await this.getAppInfo();
      
      // 5. Facebookページ取得テスト
      await this.checkPagesAccess();
      
      return this.results;
      
    } catch (error) {
      this.results.errors.push(error.message);
      return this.results;
    }
  }

  async checkTokenValidity() {
    try {
      const response = await axios.get('https://graph.facebook.com/debug_token', {
        params: {
          input_token: this.accessToken,
          access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
        }
      });
      
      const tokenInfo = response.data.data;
      this.results.tokenValid = tokenInfo.is_valid;
      this.results.scopes = tokenInfo.scopes || [];
      
    } catch (error) {
      this.results.errors.push('トークン検証失敗');
    }
  }

  async checkScopes() {
    if (!this.results.tokenValid) return;
    
    this.results.missingScopes = REQUIRED_SCOPES.filter(scope => 
      !this.results.scopes.includes(scope)
    );
  }

  async getUserInfo() {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,email'
        }
      });
      
      this.results.userInfo = response.data;
      
    } catch (error) {
      this.results.errors.push('ユーザー情報取得失敗');
    }
  }

  async getAppInfo() {
    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${FACEBOOK_APP_ID}`, {
        params: {
          access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
          fields: 'name,app_type,is_app_in_development_mode'
        }
      });
      
      const appInfo = response.data;
      this.results.appMode = appInfo.is_app_in_development_mode ? 'development' : 'production';
      
      if (appInfo.is_app_in_development_mode) {
        await this.checkTesterStatus();
      }
      
    } catch (error) {
      this.results.errors.push('アプリ情報取得失敗');
    }
  }

  async checkTesterStatus() {
    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${FACEBOOK_APP_ID}/roles`, {
        params: {
          access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
        }
      });
      
      const roles = response.data.data || [];
      const userRole = roles.find(role => role.user === this.results.userInfo?.id);
      
      if (userRole) {
        this.results.isTester = true;
      }
      
    } catch (error) {
      this.results.errors.push('テスター権限確認失敗');
    }
  }

  async checkPagesAccess() {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,access_token,instagram_business_account'
        }
      });
      
      this.results.pages = response.data.data || [];
      this.results.pagesAccessible = true;
      
    } catch (error) {
      this.results.errors.push('Facebookページ取得失敗');
    }
  }
}

// 診断エンドポイント
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'アクセストークンが必要です'
      });
    }

    const diagnostics = new FacebookDiagnostics(accessToken);
    const results = await diagnostics.runDiagnostics();

    // 解決策の提案
    const solutions = [];
    
    if (!results.tokenValid) {
      solutions.push('アクセストークンが無効です。新しい認証フローを開始してください。');
    }
    
    if (results.missingScopes.length > 0) {
      solutions.push(`不足しているスコープ: ${results.missingScopes.join(', ')}`);
      solutions.push('アプリの設定で必要な権限を追加してください。');
    }
    
    if (results.pages.length === 0) {
      solutions.push('Facebookページが存在しません。');
      solutions.push('1. Facebookページを作成してください');
      solutions.push('2. ビジネスアセットに追加してください');
      solutions.push('3. Instagramビジネスアカウントを連携してください');
    }
    
    if (results.appMode === 'development' && !results.isTester) {
      solutions.push('開発モードのアプリでテスター権限が必要です。');
    }

    res.json({
      success: true,
      results,
      solutions
    });

  } catch (error) {
    console.error('診断エラー:', error);
    res.status(500).json({
      success: false,
      error: '診断中にエラーが発生しました'
    });
  }
});

export default router; 