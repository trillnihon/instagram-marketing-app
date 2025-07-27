import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Facebook API設定
const FACEBOOK_APP_ID = '1003724798254754';
const FACEBOOK_APP_SECRET = 'fd6a61c31a9f1f5798b4d48a927d8f0c';

async function testInstagramConnection(accessToken) {
  console.log('🔍 Instagram連携診断を開始します...\n');
  
  const results = {
    user: null,
    pages: [],
    permissions: [],
    businessAccounts: [],
    assets: [],
    errors: []
  };
  
  try {
    // 1. ユーザー情報の確認
    console.log('1️⃣ ユーザー情報を確認中...');
    try {
      const userRes = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        }
      });
      results.user = userRes.data;
      console.log('✅ ユーザー情報:', userRes.data);
    } catch (error) {
      results.errors.push({ step: 'user_info', error: error.response?.data || error.message });
      console.log('❌ ユーザー情報取得エラー:', error.response?.data || error.message);
    }
    
    // 2. Facebookページ一覧の詳細確認
    console.log('\n2️⃣ Facebookページ一覧を確認中...');
    try {
      const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name,category,fan_count,verification_status,instagram_business_account{id,username,media_count}'
        }
      });
      results.pages = pagesRes.data.data || [];
      console.log('📄 ページ一覧:', JSON.stringify(pagesRes.data, null, 2));
    } catch (error) {
      results.errors.push({ step: 'pages', error: error.response?.data || error.message });
      console.log('❌ ページ一覧取得エラー:', error.response?.data || error.message);
    }
    
    // 3. 権限の確認
    console.log('\n3️⃣ アプリ権限を確認中...');
    try {
      const permissionsRes = await axios.get('https://graph.facebook.com/v18.0/me/permissions', {
        params: {
          access_token: accessToken
        }
      });
      results.permissions = permissionsRes.data.data || [];
      console.log('🔐 権限一覧:', JSON.stringify(permissionsRes.data, null, 2));
    } catch (error) {
      results.errors.push({ step: 'permissions', error: error.response?.data || error.message });
      console.log('❌ 権限取得エラー:', error.response?.data || error.message);
    }
    
    // 4. ビジネスアカウントの確認（権限がある場合のみ）
    console.log('\n4️⃣ ビジネスアカウント情報を確認中...');
    try {
      const businessRes = await axios.get('https://graph.facebook.com/v18.0/me/businesses', {
        params: {
          access_token: accessToken,
          fields: 'id,name,verification_status'
        }
      });
      results.businessAccounts = businessRes.data.data || [];
      console.log('🏢 ビジネスアカウント:', JSON.stringify(businessRes.data, null, 2));
    } catch (error) {
      if (error.response?.data?.error?.code === 100) {
        console.log('⚠️ ビジネスアカウント権限がありません（通常です）');
      } else {
        results.errors.push({ step: 'business', error: error.response?.data || error.message });
        console.log('❌ ビジネスアカウント取得エラー:', error.response?.data || error.message);
      }
    }
    
    // 5. アセットの確認（ビジネスアカウントがある場合のみ）
    if (results.businessAccounts.length > 0) {
      console.log('\n5️⃣ ビジネスアセットを確認中...');
      try {
        const businessId = results.businessAccounts[0].id;
        const assetsRes = await axios.get(`https://graph.facebook.com/v18.0/${businessId}/owned_pages`, {
          params: {
            access_token: accessToken,
            fields: 'id,name,instagram_business_account{id,username,media_count}'
          }
        });
        results.assets = assetsRes.data.data || [];
        console.log('📦 ビジネスアセット:', JSON.stringify(assetsRes.data, null, 2));
      } catch (error) {
        results.errors.push({ step: 'assets', error: error.response?.data || error.message });
        console.log('❌ アセット取得エラー:', error.response?.data || error.message);
      }
    }
    
    // 6. 診断結果のまとめ
    console.log('\n📊 診断結果まとめ:');
    console.log('='.repeat(50));
    
    const pages = results.pages;
    const hasPages = pages.length > 0;
    const hasInstagramAccount = pages.some(page => page.instagram_business_account);
    const hasBusinessAccount = results.businessAccounts.length > 0;
    const hasAssets = results.assets.length > 0;
    
    console.log(`👤 ユーザー: ${results.user?.name || '取得失敗'} (${results.user?.email || 'N/A'})`);
    console.log(`📄 Facebookページ数: ${pages.length}`);
    console.log(`📱 Instagram連携ページ数: ${pages.filter(p => p.instagram_business_account).length}`);
    console.log(`🏢 ビジネスアカウント数: ${results.businessAccounts.length}`);
    console.log(`📦 ビジネスアセット数: ${results.assets.length}`);
    console.log(`🔐 権限数: ${results.permissions.length}`);
    
    console.log('\n✅ 状態チェック:');
    console.log(`  ページ存在: ${hasPages ? '✅ YES' : '❌ NO'}`);
    console.log(`  Instagram連携: ${hasInstagramAccount ? '✅ YES' : '❌ NO'}`);
    console.log(`  ビジネスアカウント: ${hasBusinessAccount ? '✅ YES' : '⚠️ NO'}`);
    console.log(`  ビジネスアセット: ${hasAssets ? '✅ YES' : '⚠️ NO'}`);
    
    // 権限の詳細確認
    console.log('\n🔐 権限詳細:');
    const requiredPermissions = ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_manage_insights'];
    results.permissions.forEach(perm => {
      const status = perm.status === 'granted' ? '✅' : '❌';
      console.log(`  ${status} ${perm.permission}: ${perm.status}`);
    });
    
    // 問題の特定と解決策
    console.log('\n🔍 問題分析:');
    if (!hasPages) {
      console.log('\n❌ 問題1: Facebookページが見つかりません');
      console.log('💡 解決策:');
      console.log('   1. Facebookページを作成してください');
      console.log('   2. ページをビジネスアセットに追加してください');
      console.log('   3. 再度認証を試してください');
    } else if (!hasInstagramAccount) {
      console.log('\n❌ 問題2: Instagramビジネスアカウントが連携されていません');
      console.log('💡 解決策:');
      console.log('   1. Instagramアカウントをビジネスアカウントに変更してください');
      console.log('   2. FacebookページとInstagramを連携してください');
      console.log('   3. Meta Business Managerでアセットリンクを確認してください');
    } else {
      console.log('\n✅ すべて正常です！API連携が可能です。');
      const instagramAccount = pages.find(p => p.instagram_business_account)?.instagram_business_account;
      console.log(`📱 Instagram Business ID: ${instagramAccount.id}`);
      console.log(`👤 Instagram Username: ${instagramAccount.username}`);
    }
    
    // エラーの詳細
    if (results.errors.length > 0) {
      console.log('\n⚠️ 発生したエラー:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.step}: ${JSON.stringify(error.error)}`);
      });
    }
    
    // 次のステップの提案
    console.log('\n🚀 次のステップ:');
    if (!hasPages) {
      console.log('   1. Facebookページを作成');
      console.log('   2. ページをビジネスアセットに追加');
      console.log('   3. 再度認証を実行');
    } else if (!hasInstagramAccount) {
      console.log('   1. Instagramビジネスアカウント設定を確認');
      console.log('   2. Facebookページとの連携を再設定');
      console.log('   3. Meta Business Managerでアセットリンクを確認');
    } else {
      console.log('   1. 長期アクセストークンを取得');
      console.log('   2. API連携テストを実行');
      console.log('   3. 本格運用開始');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 診断中にエラーが発生しました:', error.response?.data || error.message);
    results.errors.push({ step: 'general', error: error.response?.data || error.message });
    return results;
  }
}

// 使用方法
console.log('Instagram連携診断ツール');
console.log('使用方法: node instagram_connection_test.js <access_token>');
console.log('');

if (process.argv.length < 3) {
  console.log('アクセストークンを指定してください');
  console.log('例: node instagram_connection_test.js EAAOQ4eQNXqIBP...');
  process.exit(1);
}

const accessToken = process.argv[2];
testInstagramConnection(accessToken); 