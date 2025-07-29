#!/usr/bin/env node

/**
 * Instagram Business連携診断ツール
 * 
 * 使用方法:
 * node instagram_connection_test.js <access_token>
 * 
 * 例:
 * node instagram_connection_test.js EAAxxx...
 */

const https = require('https');

class InstagramConnectionTester {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  // HTTPリクエストを実行
  async makeRequest(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      // パラメータを追加
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      // アクセストークンを追加
      url.searchParams.append('access_token', this.accessToken);

      console.log(`🔍 リクエスト: ${url.toString()}`);

      https.get(url.toString(), (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`JSON解析エラー: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`HTTPリクエストエラー: ${error.message}`));
      });
    });
  }

  // ユーザー情報を取得
  async getUserInfo() {
    console.log('\n📋 1. ユーザー情報の取得');
    console.log('=' .repeat(50));
    
    try {
      const userInfo = await this.makeRequest('/me', {
        fields: 'id,name,email'
      });
      
      console.log('✅ ユーザー情報取得成功:');
      console.log(`   ID: ${userInfo.id}`);
      console.log(`   名前: ${userInfo.name}`);
      console.log(`   メール: ${userInfo.email || 'N/A'}`);
      
      return userInfo;
    } catch (error) {
      console.log('❌ ユーザー情報取得失敗:');
      console.log(`   エラー: ${error.message}`);
      return null;
    }
  }

  // 権限情報を取得
  async getPermissions() {
    console.log('\n🔐 2. 権限情報の取得');
    console.log('=' .repeat(50));
    
    try {
      const permissions = await this.makeRequest('/me/permissions');
      
      console.log('✅ 権限情報取得成功:');
      
      const requiredPermissions = [
        'email',
        'instagram_basic',
        'instagram_manage_insights',
        'public_profile',
        'pages_show_list',
        'pages_read_engagement'
      ];
      
      requiredPermissions.forEach(permission => {
        const perm = permissions.data.find(p => p.permission === permission);
        const status = perm ? (perm.status === 'granted' ? '✅' : '⚠️') : '❌';
        console.log(`   ${status} ${permission}: ${perm ? perm.status : 'not found'}`);
      });
      
      return permissions;
    } catch (error) {
      console.log('❌ 権限情報取得失敗:');
      console.log(`   エラー: ${error.message}`);
      return null;
    }
  }

  // Facebookページ一覧を取得
  async getPages() {
    console.log('\n📄 3. Facebookページ一覧の取得');
    console.log('=' .repeat(50));
    
    try {
      const pages = await this.makeRequest('/me/accounts', {
        fields: 'id,name,access_token,instagram_business_account'
      });
      
      if (pages.data && pages.data.length > 0) {
        console.log('✅ Facebookページ取得成功:');
        pages.data.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.name} (ID: ${page.id})`);
          console.log(`      Instagram連携: ${page.instagram_business_account ? '✅' : '❌'}`);
          if (page.instagram_business_account) {
            console.log(`      Instagram ID: ${page.instagram_business_account.id}`);
          }
        });
      } else {
        console.log('❌ Facebookページが見つかりません:');
        console.log('   考えられる原因:');
        console.log('   - ページがビジネスアセットに追加されていない');
        console.log('   - ページの権限設定が不十分');
        console.log('   - 認証時にページ選択でチェックが入っていない');
      }
      
      return pages;
    } catch (error) {
      console.log('❌ Facebookページ取得失敗:');
      console.log(`   エラー: ${error.message}`);
      return null;
    }
  }

  // Instagramビジネスアカウント情報を取得
  async getInstagramAccount(instagramBusinessAccountId) {
    if (!instagramBusinessAccountId) {
      console.log('\n📸 4. Instagramビジネスアカウント情報の取得');
      console.log('=' .repeat(50));
      console.log('❌ InstagramビジネスアカウントIDがありません');
      return null;
    }

    console.log('\n📸 4. Instagramビジネスアカウント情報の取得');
    console.log('=' .repeat(50));
    
    try {
      const instagramInfo = await this.makeRequest(`/${instagramBusinessAccountId}`, {
        fields: 'id,username,media_count,followers_count,account_type'
      });
      
      console.log('✅ Instagramアカウント情報取得成功:');
      console.log(`   ID: ${instagramInfo.id}`);
      console.log(`   ユーザー名: @${instagramInfo.username}`);
      console.log(`   投稿数: ${instagramInfo.media_count}`);
      console.log(`   フォロワー数: ${instagramInfo.followers_count}`);
      console.log(`   アカウントタイプ: ${instagramInfo.account_type}`);
      
      return instagramInfo;
    } catch (error) {
      console.log('❌ Instagramアカウント情報取得失敗:');
      console.log(`   エラー: ${error.message}`);
      return null;
    }
  }

  // 投稿一覧を取得
  async getMedia(instagramBusinessAccountId) {
    if (!instagramBusinessAccountId) {
      console.log('\n📱 5. 投稿一覧の取得');
      console.log('=' .repeat(50));
      console.log('❌ InstagramビジネスアカウントIDがありません');
      return null;
    }

    console.log('\n📱 5. 投稿一覧の取得');
    console.log('=' .repeat(50));
    
    try {
      const media = await this.makeRequest(`/${instagramBusinessAccountId}/media`, {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
        limit: 5
      });
      
      if (media.data && media.data.length > 0) {
        console.log('✅ 投稿一覧取得成功:');
        media.data.forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.media_type} (ID: ${post.id})`);
          console.log(`      投稿日時: ${post.timestamp}`);
          console.log(`      いいね数: ${post.like_count || 0}`);
          console.log(`      コメント数: ${post.comments_count || 0}`);
          if (post.caption) {
            console.log(`      キャプション: ${post.caption.substring(0, 50)}...`);
          }
        });
      } else {
        console.log('❌ 投稿が見つかりません');
      }
      
      return media;
    } catch (error) {
      console.log('❌ 投稿一覧取得失敗:');
      console.log(`   エラー: ${error.message}`);
      return null;
    }
  }

  // インサイト情報を取得
  async getInsights(instagramBusinessAccountId) {
    if (!instagramBusinessAccountId) {
      console.log('\n📊 6. インサイト情報の取得');
      console.log('=' .repeat(50));
      console.log('❌ InstagramビジネスアカウントIDがありません');
      return null;
    }

    console.log('\n📊 6. インサイト情報の取得');
    console.log('=' .repeat(50));
    
    try {
      const insights = await this.makeRequest(`/${instagramBusinessAccountId}/insights`, {
        metric: 'impressions,reach,profile_views,follower_count',
        period: 'day'
      });
      
      if (insights.data && insights.data.length > 0) {
        console.log('✅ インサイト情報取得成功:');
        insights.data.forEach(insight => {
          console.log(`   ${insight.name}: ${insight.values[0].value}`);
        });
      } else {
        console.log('❌ インサイト情報が取得できません');
      }
      
      return insights;
    } catch (error) {
      console.log('❌ インサイト情報取得失敗:');
      console.log(`   エラー: ${error.message}`);
      return null;
    }
  }

  // 総合診断を実行
  async runFullDiagnostic() {
    console.log('🔍 Instagram Business連携診断を開始します...');
    console.log('=' .repeat(60));
    
    // 1. ユーザー情報
    const userInfo = await this.getUserInfo();
    
    // 2. 権限情報
    const permissions = await this.getPermissions();
    
    // 3. Facebookページ一覧
    const pages = await this.getPages();
    
    // 4. Instagramアカウント情報（最初のページから）
    let instagramAccount = null;
    if (pages && pages.data && pages.data.length > 0) {
      const firstPage = pages.data[0];
      if (firstPage.instagram_business_account) {
        instagramAccount = await this.getInstagramAccount(firstPage.instagram_business_account.id);
      }
    }
    
    // 5. 投稿一覧
    if (instagramAccount) {
      await this.getMedia(instagramAccount.id);
    }
    
    // 6. インサイト情報
    if (instagramAccount) {
      await this.getInsights(instagramAccount.id);
    }
    
    // 診断結果の要約
    console.log('\n📋 診断結果サマリー');
    console.log('=' .repeat(60));
    
    const results = {
      userInfo: !!userInfo,
      permissions: !!permissions,
      pages: pages && pages.data && pages.data.length > 0,
      instagramAccount: !!instagramAccount
    };
    
    Object.keys(results).forEach(key => {
      const status = results[key] ? '✅' : '❌';
      console.log(`${status} ${key}: ${results[key] ? '成功' : '失敗'}`);
    });
    
    // 推奨アクション
    console.log('\n💡 推奨アクション');
    console.log('=' .repeat(60));
    
    if (!results.userInfo) {
      console.log('❌ アクセストークンが無効です。新しいトークンを取得してください。');
    }
    
    if (!results.pages) {
      console.log('❌ Facebookページが見つかりません。以下を確認してください:');
      console.log('   - Meta Business Managerでページをビジネスアセットに追加');
      console.log('   - ページの権限設定を確認');
      console.log('   - 認証時にページ選択でチェックを入れる');
    }
    
    if (!results.instagramAccount) {
      console.log('❌ Instagramビジネスアカウントが連携されていません。以下を確認してください:');
      console.log('   - Instagramアプリでビジネスアカウント設定を確認');
      console.log('   - Facebookページとの連携を再実行');
      console.log('   - Meta Business Managerでアセットリンクを確認');
    }
    
    if (results.userInfo && results.pages && results.instagramAccount) {
      console.log('✅ すべての項目が正常です！本番運用を開始できます。');
    }
  }
}

// メイン実行部分
async function main() {
  const accessToken = process.argv[2];
  
  if (!accessToken) {
    console.log('❌ 使用方法: node instagram_connection_test.js <access_token>');
    console.log('例: node instagram_connection_test.js EAAxxx...');
    process.exit(1);
  }
  
  const tester = new InstagramConnectionTester(accessToken);
  
  try {
    await tester.runFullDiagnostic();
  } catch (error) {
    console.log('❌ 診断実行中にエラーが発生しました:');
    console.log(error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = InstagramConnectionTester; 