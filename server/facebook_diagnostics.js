import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Facebook API設定
const FACEBOOK_APP_ID = '1003724798254754';
const FACEBOOK_APP_SECRET = 'fd6a61c31a9f1f5798b4d48a927d8f0c';
const REDIRECT_URI = 'https://localhost:3000/auth/callback';

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
    console.log('🔍 Facebook Graph API 診断ツール');
    console.log('='.repeat(60));
    console.log('');

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
      
      // 6. 結果表示
      this.displayResults();
      
      // 7. 解決策提案
      this.suggestSolutions();
      
    } catch (error) {
      console.error('❌ 診断中にエラーが発生しました:', error.message);
      this.results.errors.push(error.message);
    }
  }

  async checkTokenValidity() {
    console.log('1️⃣ アクセストークンの有効性を確認中...');
    
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
      
      if (tokenInfo.is_valid) {
        console.log('✅ アクセストークンは有効です');
        console.log(`   ユーザーID: ${tokenInfo.user_id}`);
        console.log(`   アプリID: ${tokenInfo.app_id}`);
        console.log(`   スコープ数: ${this.results.scopes.length}`);
      } else {
        console.log('❌ アクセストークンが無効です');
        console.log(`   エラー: ${tokenInfo.error?.message || '不明なエラー'}`);
      }
      
    } catch (error) {
      console.log('❌ トークン検証エラー:', error.response?.data?.error?.message || error.message);
      this.results.errors.push('トークン検証失敗');
    }
  }

  async checkScopes() {
    console.log('\n2️⃣ スコープ権限を確認中...');
    
    if (!this.results.tokenValid) {
      console.log('⚠️ トークンが無効なためスコープチェックをスキップします');
      return;
    }
    
    // 不足しているスコープを特定
    this.results.missingScopes = REQUIRED_SCOPES.filter(scope => 
      !this.results.scopes.includes(scope)
    );
    
    console.log('📋 現在のスコープ:');
    REQUIRED_SCOPES.forEach(scope => {
      const hasScope = this.results.scopes.includes(scope);
      const status = hasScope ? '✅' : '❌';
      console.log(`   ${status} ${scope}`);
    });
    
    if (this.results.missingScopes.length > 0) {
      console.log('\n⚠️ 不足しているスコープ:');
      this.results.missingScopes.forEach(scope => {
        console.log(`   ❌ ${scope}`);
      });
    } else {
      console.log('\n✅ 必要なスコープはすべて付与されています');
    }
  }

  async getUserInfo() {
    console.log('\n3️⃣ ユーザー情報を取得中...');
    
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,email'
        }
      });
      
      this.results.userInfo = response.data;
      console.log('✅ ユーザー情報取得成功');
      console.log(`   名前: ${response.data.name}`);
      console.log(`   メール: ${response.data.email || 'N/A'}`);
      
    } catch (error) {
      console.log('❌ ユーザー情報取得エラー:', error.response?.data?.error?.message || error.message);
      this.results.errors.push('ユーザー情報取得失敗');
    }
  }

  async getAppInfo() {
    console.log('\n4️⃣ アプリ情報を確認中...');
    
    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${FACEBOOK_APP_ID}`, {
        params: {
          access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`,
          fields: 'name,app_type,is_app_in_development_mode'
        }
      });
      
      const appInfo = response.data;
      this.results.appMode = appInfo.is_app_in_development_mode ? 'development' : 'production';
      
      console.log('✅ アプリ情報取得成功');
      console.log(`   アプリ名: ${appInfo.name}`);
      console.log(`   アプリタイプ: ${appInfo.app_type}`);
      console.log(`   開発モード: ${appInfo.is_app_in_development_mode ? '✅ YES' : '❌ NO'}`);
      
      // 開発モードの場合、テスター情報を確認
      if (appInfo.is_app_in_development_mode) {
        await this.checkTesterStatus();
      }
      
    } catch (error) {
      console.log('❌ アプリ情報取得エラー:', error.response?.data?.error?.message || error.message);
      this.results.errors.push('アプリ情報取得失敗');
    }
  }

  async checkTesterStatus() {
    console.log('\n5️⃣ テスター権限を確認中...');
    
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
        console.log('✅ ユーザーはテスターとして登録されています');
        console.log(`   権限: ${userRole.role}`);
      } else {
        this.results.isTester = false;
        console.log('❌ ユーザーはテスターとして登録されていません');
      }
      
    } catch (error) {
      console.log('⚠️ テスター情報取得エラー:', error.response?.data?.error?.message || error.message);
    }
  }

  async checkPagesAccess() {
    console.log('\n6️⃣ Facebookページアクセスを確認中...');
    
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,category,fan_count,verification_status,instagram_business_account{id,username,media_count}'
        }
      });
      
      this.results.pages = response.data.data || [];
      this.results.pagesAccessible = true;
      
      console.log('✅ Facebookページ取得成功');
      console.log(`   ページ数: ${this.results.pages.length}`);
      
      if (this.results.pages.length > 0) {
        this.results.pages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.name} (ID: ${page.id})`);
          if (page.instagram_business_account) {
            console.log(`      📱 Instagram: @${page.instagram_business_account.username}`);
          }
        });
      } else {
        console.log('⚠️ Facebookページが見つかりません');
        await this.diagnosePagesIssue();
      }
      
    } catch (error) {
      console.log('❌ Facebookページ取得エラー:', error.response?.data?.error?.message || error.message);
      this.results.errors.push('Facebookページ取得失敗');
    }
  }

  async diagnosePagesIssue() {
    console.log('\n🔍 Facebookページが見つからない原因を診断中...');
    
    // 1. スコープ不足の可能性
    if (this.results.missingScopes.includes('pages_show_list')) {
      console.log('❌ 原因: pages_show_list スコープが不足しています');
      return;
    }
    
    // 2. 開発モードでのテスター権限不足
    if (this.results.appMode === 'development' && !this.results.isTester) {
      console.log('❌ 原因: 開発モードでテスター権限が不足しています');
      return;
    }
    
    // 3. ページが存在しない可能性
    console.log('❌ 原因: Facebookページが存在しないか、権限がありません');
    console.log('💡 解決策:');
    console.log('   1. Facebookページを作成してください');
    console.log('   2. ページをビジネスアセットに追加してください');
    console.log('   3. ページの公開設定を確認してください');
  }

  displayResults() {
    console.log('\n📊 診断結果サマリー');
    console.log('='.repeat(60));
    
    const results = [
      ['項目', '状態', '詳細'],
      ['アクセストークン', this.results.tokenValid ? '✅ 有効' : '❌ 無効', this.results.userInfo?.name || 'N/A'],
      ['スコープ権限', this.results.missingScopes.length === 0 ? '✅ 完了' : '❌ 不足', `${this.results.missingScopes.length}個不足`],
      ['Facebookページ', this.results.pagesAccessible ? '✅ 取得可' : '❌ 取得不可', `${this.results.pages.length}ページ`],
      ['アプリモード', this.results.appMode === 'development' ? '🔧 開発' : '🚀 本番', this.results.appMode],
      ['テスター権限', this.results.isTester ? '✅ あり' : '❌ なし', this.results.appMode === 'development' ? '要確認' : 'N/A']
    ];
    
    // 表形式で表示
    const maxCol1 = Math.max(...results.map(r => r[0].length));
    const maxCol2 = Math.max(...results.map(r => r[1].length));
    
    results.forEach((row, index) => {
      if (index === 0) {
        console.log('─'.repeat(60));
      }
      console.log(`${row[0].padEnd(maxCol1)} │ ${row[1].padEnd(maxCol2)} │ ${row[2]}`);
      if (index === 0) {
        console.log('─'.repeat(60));
      }
    });
    console.log('─'.repeat(60));
  }

  suggestSolutions() {
    console.log('\n🚀 解決策の提案');
    console.log('='.repeat(60));
    
    let hasIssues = false;
    
    // 1. スコープ不足の解決
    if (this.results.missingScopes.length > 0) {
      hasIssues = true;
      console.log('\n🔧 スコープ不足の解決:');
      console.log('   再認証URLを生成します...');
      
      const missingScopes = this.results.missingScopes.join(',');
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${missingScopes}&response_type=code&state=diagnostics`;
      
      console.log(`   🔗 再認証URL: ${authUrl}`);
      console.log('   📝 手順:');
      console.log('      1. 上記URLにアクセス');
      console.log('      2. 必要な権限を許可');
      console.log('      3. 新しいアクセストークンを取得');
      console.log('      4. このツールを再実行');
    }
    
    // 2. 開発モードでのテスター権限不足
    if (this.results.appMode === 'development' && !this.results.isTester) {
      hasIssues = true;
      console.log('\n🔧 テスター権限の追加:');
      console.log('   1. Facebook for Developers にアクセス');
      console.log('   2. アプリ設定 → ロール → テスター');
      console.log('   3. ユーザーをテスターとして追加');
      console.log(`   4. ユーザーID: ${this.results.userInfo?.id}`);
    }
    
    // 3. Facebookページの問題
    if (!this.results.pagesAccessible || this.results.pages.length === 0) {
      hasIssues = true;
      console.log('\n🔧 Facebookページの設定:');
      console.log('   1. Facebookページを作成');
      console.log('   2. Meta Business Managerでページを追加');
      console.log('   3. ページの公開設定を確認');
      console.log('   4. Instagramビジネスアカウントと連携');
    }
    
    if (!hasIssues) {
      console.log('\n✅ すべて正常です！API連携が可能です。');
    }
    
    console.log('\n📚 参考リンク:');
    console.log('   • Meta Business Manager: https://business.facebook.com');
    console.log('   • Facebook for Developers: https://developers.facebook.com');
    console.log('   • Graph API Explorer: https://developers.facebook.com/tools/explorer/');
  }
}

// メイン実行関数
async function main() {
  console.log('Facebook Graph API 診断ツール');
  console.log('使用方法: node facebook_diagnostics.js <access_token>');
  console.log('');
  
  let accessToken;
  
  // コマンドライン引数から取得
  if (process.argv.length >= 3) {
    accessToken = process.argv[2];
  } else {
    // 環境変数から取得
    accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  }
  
  if (!accessToken) {
    console.log('❌ アクセストークンが指定されていません');
    console.log('使用方法:');
    console.log('  1. コマンドライン引数: node facebook_diagnostics.js <access_token>');
    console.log('  2. 環境変数: FACEBOOK_ACCESS_TOKEN=<token> node facebook_diagnostics.js');
    console.log('');
    console.log('💡 現在のアクセストークン（ログから取得）:');
    console.log('EAAOQ4eQNXqIBPP7zK9i6hBmyoqkEiJwhtjMqr5DtweT887QnIfAHzen04zB8OY0FXkNRgZBUmF8zJ6cmEQTLEvjNANPZCZCU8Y1jiruRcCpZCX96YZC35ixQShjNYWOTCOVy0dZAhyi5vAIEZAarZBTUJOmCWuFukzstFBlqtHAUuZALuc7ZAt7A5rWZBkFTKV7XZAgh5ZCgy5zxNMXlvgomW75UIQpidx2ZAyH13enyff2FnzZCkzs0fXLnsli0B6z');
    process.exit(1);
  }
  
  const diagnostics = new FacebookDiagnostics(accessToken);
  await diagnostics.runDiagnostics();
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 