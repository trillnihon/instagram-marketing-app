#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { config } from 'dotenv';

// 環境変数の読み込み
config({ path: '../server/.env' });

// 環境変数の取得
const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN;

console.log('=== 基本権限Graph APIテスト ===');
console.log('トークン:', FB_USER_OR_LL_TOKEN ? '設定済み' : '未設定');

if (!FB_USER_OR_LL_TOKEN) {
  console.error('❌ トークンが設定されていません');
  process.exit(1);
}

// 段階的な権限テスト
async function testBasicPermissions() {
  try {
    console.log('\n🔍 段階的な権限テスト開始...');
    
    // 1. 最も基本的な権限テスト（public_profileのみ）
    console.log('\n📋 テスト1: public_profile権限のみ');
    const basicUrl = `https://graph.facebook.com/v19.0/me?access_token=${FB_USER_OR_LL_TOKEN}&fields=id,name`;
    
    const basicResponse = await fetch(basicUrl);
    console.log('📡 レスポンスステータス:', basicResponse.status);
    
    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log('✅ 基本権限テスト成功:', basicData);
      
      // 2. 次の権限テスト（email）
      console.log('\n📋 テスト2: email権限');
      const emailUrl = `https://graph.facebook.com/v19.0/me?access_token=${FB_USER_OR_LL_TOKEN}&fields=id,name,email`;
      
      const emailResponse = await fetch(emailUrl);
      console.log('📡 レスポンスステータス:', emailResponse.status);
      
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        console.log('✅ email権限テスト成功:', emailData);
      } else {
        const errorText = await emailResponse.text();
        console.log('⚠️ email権限なし:', errorText);
      }
      
      // 3. ページリスト権限テスト
      console.log('\n📋 テスト3: pages_show_list権限');
      const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${FB_USER_OR_LL_TOKEN}&fields=id,name`;
      
      const pagesResponse = await fetch(pagesUrl);
      console.log('📡 レスポンスステータス:', pagesResponse.status);
      
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        console.log('✅ pages_show_list権限テスト成功:', pagesData);
        
        if (pagesData.data && pagesData.data.length > 0) {
          console.log('\n📋 アクセス可能なページ:');
          pagesData.data.forEach((page: any, index: number) => {
            console.log(`  ${index + 1}. ${page.name} (${page.id})`);
          });
        }
      } else {
        const errorText = await pagesResponse.text();
        console.log('⚠️ pages_show_list権限なし:', errorText);
      }
      
    } else {
      const errorText = await basicResponse.text();
      console.error('❌ 基本権限テスト失敗:', errorText);
      
      // エラーの詳細分析
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          console.log('\n🔍 エラー詳細:');
          console.log('  コード:', errorData.error.code);
          console.log('  タイプ:', errorData.error.type);
          console.log('  メッセージ:', errorData.error.message);
          
          if (errorData.error.code === 190) {
            console.log('\n💡 解決方法:');
            console.log('  1. Facebook Graph API Explorerで新しいトークンを生成');
            console.log('  2. public_profile権限を必ず追加');
            console.log('  3. トークン生成後に権限を承認');
          }
        }
      } catch (parseError) {
        console.log('エラーレスポンスの解析に失敗');
      }
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// 実行
testBasicPermissions();
