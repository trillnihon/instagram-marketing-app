import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Facebook API設定
const FACEBOOK_APP_ID = '1003724798254754';
const FACEBOOK_APP_SECRET = 'fd6a61c31a9f1f5798b4d48a927d8f0c';

async function getLongLivedToken(shortLivedToken) {
  console.log('🔄 長期アクセストークンを取得中...\n');
  
  try {
    // 短期トークンを長期トークンに変換
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    });
    
    const longLivedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    console.log('✅ 長期アクセストークン取得成功！');
    console.log('='.repeat(50));
    console.log(`🔑 長期アクセストークン: ${longLivedToken}`);
    console.log(`⏰ 有効期限: ${expiresIn}秒 (約${Math.floor(expiresIn / 86400)}日)`);
    console.log(`📅 期限日時: ${expiresAt.toLocaleString('ja-JP')}`);
    console.log('='.repeat(50));
    
    // トークンの詳細情報を取得
    console.log('\n🔍 トークン詳細情報を取得中...');
    const tokenInfo = await axios.get('https://graph.facebook.com/debug_token', {
      params: {
        input_token: longLivedToken,
        access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
      }
    });
    
    const info = tokenInfo.data.data;
    console.log('📊 トークン情報:');
    console.log(`   アプリID: ${info.app_id}`);
    console.log(`   ユーザーID: ${info.user_id}`);
    console.log(`   有効: ${info.is_valid ? '✅ YES' : '❌ NO'}`);
    console.log(`   スコープ: ${info.scopes.join(', ')}`);
    console.log(`   タイプ: ${info.type}`);
    
    // ファイルに保存
    const fs = await import('fs');
    const tokenData = {
      access_token: longLivedToken,
      expires_in: expiresIn,
      expires_at: expiresAt.toISOString(),
      user_id: info.user_id,
      app_id: info.app_id,
      scopes: info.scopes,
      created_at: new Date().toISOString()
    };
    
    fs.writeFileSync('long_lived_token.json', JSON.stringify(tokenData, null, 2));
    console.log('\n💾 トークン情報を long_lived_token.json に保存しました');
    
    return {
      success: true,
      token: longLivedToken,
      expiresAt: expiresAt,
      info: info
    };
    
  } catch (error) {
    console.error('❌ 長期アクセストークン取得エラー:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

async function refreshLongLivedToken(currentToken) {
  console.log('🔄 長期アクセストークンを更新中...\n');
  
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: currentToken
      }
    });
    
    const newToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    console.log('✅ トークン更新成功！');
    console.log(`🔑 新しいトークン: ${newToken}`);
    console.log(`⏰ 有効期限: ${expiresIn}秒 (約${Math.floor(expiresIn / 86400)}日)`);
    console.log(`📅 期限日時: ${expiresAt.toLocaleString('ja-JP')}`);
    
    return {
      success: true,
      token: newToken,
      expiresAt: expiresAt
    };
    
  } catch (error) {
    console.error('❌ トークン更新エラー:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// 使用方法
console.log('長期アクセストークン取得ツール');
console.log('使用方法:');
console.log('  1. 新しい長期トークンを取得: node get_long_lived_token.js <short_lived_token>');
console.log('  2. 既存トークンを更新: node get_long_lived_token.js --refresh <current_token>');
console.log('');

if (process.argv.length < 3) {
  console.log('短期アクセストークンを指定してください');
  console.log('例: node get_long_lived_token.js EAAOQ4eQNXqIBP...');
  process.exit(1);
}

const token = process.argv[2];
const isRefresh = process.argv.includes('--refresh');

if (isRefresh) {
  refreshLongLivedToken(token);
} else {
  getLongLivedToken(token);
} 