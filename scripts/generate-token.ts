#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { config } from 'dotenv';

// 環境変数の読み込み
config({ path: '../server/.env' });

// 環境変数の取得
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

console.log('=== Facebook アクセストークン生成スクリプト ===');
console.log('Facebook App ID:', FACEBOOK_APP_ID);
console.log('Facebook App Secret:', FACEBOOK_APP_SECRET ? '設定済み' : '未設定');

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
  console.error('❌ Facebook App ID または App Secret が未設定です');
  process.exit(1);
}

console.log('\n📋 以下の手順でアクセストークンを取得してください:');
console.log('\n1. Facebook Graph API Explorer にアクセス:');
console.log('   https://developers.facebook.com/tools/explorer/');
console.log('\n2. アプリを選択:');
console.log(`   ${FACEBOOK_APP_ID}`);
console.log('\n3. 必要な権限を追加:');
console.log('   - instagram_basic');
console.log('   - instagram_content_publish');
console.log('   - instagram_manage_insights');
console.log('   - pages_show_list');
console.log('   - pages_read_engagement');
console.log('   - public_profile');
console.log('   - email');
console.log('\n4. 「Generate Access Token」をクリック');
console.log('\n5. 生成されたトークンをコピー');
console.log('\n6. 以下のコマンドでトークンを設定:');
console.log('   $env:FB_USER_OR_LL_TOKEN="your_generated_token_here"');
console.log('\n7. または .env ファイルを直接編集');
console.log('\n⚠️  注意: 生成されたトークンは一時的なものです');
console.log('   本番環境では長期有効トークンを使用してください');
