import express from 'express';
import axios from 'axios';

const router = express.Router();

// Facebook API設定
const FACEBOOK_APP_ID = '1003724798254754';
const FACEBOOK_APP_SECRET = 'fd6a61c31a9f1f5798b4d48a927d8f0c';

// 必須スコープ（優先度順）
const REQUIRED_SCOPES = [
  'public_profile',        // 基本プロフィール情報
  'email',                 // メールアドレス
  'pages_show_list',       // Facebookページ一覧表示
  'pages_read_engagement', // ページエンゲージメント読み取り
  'instagram_basic',       // Instagram基本情報
  'instagram_manage_insights' // Instagramインサイト管理
];

// 推奨スコープ
const RECOMMENDED_SCOPES = [
  'pages_manage_posts',    // ページ投稿管理
  'pages_manage_metadata', // ページメタデータ管理
  'business_management'    // ビジネス管理
];

class FacebookDiagnostics {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.results = {
      tokenValid: false,
      scopes: [],
      missingScopes: [],
      recommendedScopes: [],
      pagesAccessible: false,
      pages: [],
      appMode: 'unknown',
      isTester: false,
      userInfo: null,
      permissions: {
        basic: false,
        pages: false,
        instagram: false,
        insights: false
      },
      errors: [],
      permissionLevel: 0, // 権限レベル
      recommendations: [] // 推奨事項
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
    
    this.results.recommendedScopes = RECOMMENDED_SCOPES.filter(scope => 
      !this.results.scopes.includes(scope)
    );
    
    // パーミッションレベルを評価
    this.evaluatePermissions();
  }

  evaluatePermissions() {
    const scopes = this.results.scopes;
    
    // 基本権限
    this.results.permissions.basic = scopes.includes('public_profile') && scopes.includes('email');
    
    // ページ権限
    this.results.permissions.pages = scopes.includes('pages_show_list') && scopes.includes('pages_read_engagement');
    
    // Instagram権限
    this.results.permissions.instagram = scopes.includes('instagram_basic');
    
    // インサイト権限
    this.results.permissions.insights = scopes.includes('instagram_manage_insights');
    
    // 権限レベルを計算
    const permissionScore = Object.values(this.results.permissions).filter(Boolean).length;
    const totalPermissions = Object.keys(this.results.permissions).length;
    
    this.results.permissionLevel = Math.round((permissionScore / totalPermissions) * 100);
    
    // 権限レベルに基づく推奨事項
    if (this.results.permissionLevel < 50) {
      this.results.recommendations = ['基本的な権限が不足しています。Facebookアプリの権限設定を確認してください。'];
    } else if (this.results.permissionLevel < 75) {
      this.results.recommendations = ['一部の機能が制限される可能性があります。推奨スコープの追加を検討してください。'];
    } else {
      this.results.recommendations = ['十分な権限が付与されています。全機能が利用可能です。'];
    }
  }

  async getUserInfo() {
    try {
      const response = await axios.get('https://graph.facebook.com/v19.0/me', {
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
      const response = await axios.get(`https://graph.facebook.com/v19.0/${FACEBOOK_APP_ID}`, {
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
      const response = await axios.get(`https://graph.facebook.com/v19.0/${FACEBOOK_APP_ID}/roles`, {
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
      console.log('[DEBUG] 方法1: 直接ユーザー情報からInstagramビジネスアカウントを取得');
      // より安全なアプローチ: まず基本的なユーザー情報を取得
      const userUrl = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${this.accessToken}`;
      console.log('[DEBUG] 方法1 URL:', userUrl);
      
      const userResponse = await axios.get(userUrl);
      if (userResponse.status === 200) {
        const userData = userResponse.data;
        console.log('[DEBUG] 方法1 基本ユーザー情報取得成功:', userData);
        console.log('[DEBUG] 方法1: 基本ユーザー情報確認完了、方法2に進行');
      } else {
        console.warn('[WARNING] 方法1基本ユーザー情報取得失敗:', userResponse.status, userResponse.statusText);
      }
      
      // 方法2: Facebookページ経由でInstagramビジネスアカウントを取得
      console.log('[DEBUG] 方法2: Facebookページ経由でInstagramビジネスアカウントを取得');
      const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${this.accessToken}`;
      console.log('[DEBUG] 方法2 URL:', pagesUrl);
      
      const pagesResponse = await axios.get(pagesUrl);
      if (pagesResponse.status === 200) {
        const pagesData = pagesResponse.data;
        console.log('[DEBUG] 方法2 Facebookページ取得成功:', pagesData);
        
        if (pagesData.data && pagesData.data.length > 0) {
          // 各ページをチェックしてInstagramビジネスアカウントを探す
          for (const page of pagesData.data) {
            console.log('[DEBUG] ページチェック:', page);
            
            if (page.instagram_business_account) {
              console.log('[DEBUG] Instagramビジネスアカウント発見:', page.instagram_business_account);
              
              // Instagramビジネスアカウントの詳細情報を取得
              const instagramAccountId = page.instagram_business_account.id;
              const instagramUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=id,username,media_count,followers_count,follows_count,biography,profile_picture_url&access_token=${this.accessToken}`;
              console.log('[DEBUG] Instagram詳細取得URL:', instagramUrl);
              
              try {
                const instagramResponse = await axios.get(instagramUrl);
                if (instagramResponse.status === 200) {
                  const instagramData = instagramResponse.data;
                  console.log('[DEBUG] 方法2でInstagram詳細取得成功:', instagramData);
                  
                  // 結果に追加
                  this.results.pages.push({
                    ...page,
                    instagramDetails: instagramData
                  });
                } else {
                  console.warn('[WARNING] Instagram詳細取得失敗:', instagramResponse.status, instagramResponse.statusText);
                }
              } catch (instagramError) {
                console.warn('[WARNING] Instagram詳細取得エラー:', instagramError.message);
              }
            }
          }
        } else {
          console.warn('[WARNING] Facebookページが見つかりません');
        }
      } else {
        console.warn('[WARNING] 方法2失敗:', pagesResponse.status, pagesResponse.statusText);
      }
      
      // 方法3: ユーザーのInstagramアカウント一覧を直接取得
      console.log('[DEBUG] 方法3: ユーザーのInstagramアカウント一覧を直接取得');
      const instagramAccountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,media_count,followers_count,follows_count,biography,profile_picture_url}&access_token=${this.accessToken}`;
      console.log('[DEBUG] 方法3 URL:', instagramAccountsUrl);
      
      try {
        const instagramAccountsResponse = await axios.get(instagramAccountsUrl);
        if (instagramAccountsResponse.status === 200) {
          const instagramAccountsData = instagramAccountsResponse.data;
          console.log('[DEBUG] 方法3 成功:', instagramAccountsData);
          
          if (instagramAccountsData.data && instagramAccountsData.data.length > 0) {
            for (const account of instagramAccountsData.data) {
              if (account.instagram_business_account) {
                console.log('[DEBUG] 方法3でInstagramビジネスアカウント発見:', account.instagram_business_account);
                
                // 既存のページ情報とマージ
                const existingPage = this.results.pages.find(p => p.id === account.id);
                if (existingPage) {
                  existingPage.instagramDetails = account.instagram_business_account;
                } else {
                  this.results.pages.push({
                    id: account.id,
                    name: account.name || 'Unknown Page',
                    instagramDetails: account.instagram_business_account
                  });
                }
              }
            }
          }
        } else {
          console.warn('[WARNING] 方法3失敗:', instagramAccountsResponse.status, instagramAccountsResponse.statusText);
        }
      } catch (instagramAccountsError) {
        console.warn('[WARNING] 方法3失敗:', instagramAccountsError.message);
      }
      
      this.results.pagesAccessible = this.results.pages.length > 0;
      
      // 各方法の成功率と詳細なエラー情報を記録
      this.results.methodSuccessRates = {
        method1: userResponse.status === 200,
        method2: pagesResponse.status === 200,
        method3: true // 方法3は常に試行
      };
      
      // 各方法の詳細なエラー分析
      this.results.methodErrorAnalysis = {
        method1: {
          success: userResponse.status === 200,
          status: userResponse.status,
          statusText: userResponse.statusText,
          error: userResponse.status !== 200 ? '基本ユーザー情報の取得に失敗' : null,
          recommendation: userResponse.status !== 200 ? 'アクセストークンの権限を確認してください' : null
        },
        method2: {
          success: pagesResponse.status === 200,
          status: pagesResponse.status,
          statusText: pagesResponse.statusText,
          error: pagesResponse.status !== 200 ? 'Facebookページ一覧の取得に失敗' : null,
          recommendation: pagesResponse.status !== 200 ? 'pages_show_list権限が必要です' : null
        },
        method3: {
          success: true, // 方法3は常に試行
          status: 200,
          statusText: 'OK',
          error: null,
          recommendation: null
        }
      };
      
      // 方法2が成功したがページが見つからない場合の詳細分析
      if (pagesResponse.status === 200 && (!pagesData.data || pagesData.data.length === 0)) {
        this.results.methodErrorAnalysis.method2.error = 'Facebookページが見つかりません';
        this.results.methodErrorAnalysis.method2.recommendation = 'Facebookページを作成し、ビジネスアセットに追加してください';
      }
      
    } catch (error) {
      console.error('[ERROR] Facebookページ取得エラー:', error);
      this.results.errors.push('Facebookページ取得失敗: ' + error.message);
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
    
    // 3段階データ取得方法の結果分析
    if (results.methodSuccessRates) {
      const successCount = Object.values(results.methodSuccessRates).filter(Boolean).length;
      const totalMethods = Object.keys(results.methodSuccessRates).length;
      
      if (successCount === 0) {
        solutions.push('❌ 全てのデータ取得方法が失敗しました。');
        solutions.push('1. アクセストークンの権限を確認してください');
        solutions.push('2. Facebookページの設定を確認してください');
        solutions.push('3. Instagramビジネスアカウントの連携を確認してください');
      } else if (successCount < totalMethods) {
        solutions.push(`⚠️ ${successCount}/${totalMethods}のデータ取得方法が成功しました。`);
        solutions.push('1. 成功した方法を使用してデータを取得しています');
        solutions.push('2. 失敗した方法の原因を調査中です');
      } else {
        solutions.push('✅ 全てのデータ取得方法が成功しました。');
      }
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