#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { config } from 'dotenv';

// 環境変数の読み込み
config({ path: '../server/.env' });

// 環境変数の取得
const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN || process.argv[2];

console.log('=== Facebook トークンデバッグスクリプト ===');
console.log('トークン:', FB_USER_OR_LL_TOKEN ? '設定済み' : '未設定');

if (!FB_USER_OR_LL_TOKEN) {
  console.error('❌ トークンが設定されていません');
  console.log('使用方法: npx tsx debug-token.ts <your_token>');
  process.exit(1);
}

// トークンの詳細情報を取得
async function debugToken() {
  try {
    console.log('\n🔍 トークンの詳細情報を取得中...');
    
    // 1. /me エンドポイントでユーザー情報を取得
    const meUrl = `https://graph.facebook.com/v19.0/me?access_token=${FB_USER_OR_LL_TOKEN}&fields=id,name,email`;
    console.log('📡 /me エンドポイント呼び出し中...');
    
    const meResponse = await fetch(meUrl);
    console.log('📊 /me レスポンスステータス:', meResponse.status);
    
    if (!meResponse.ok) {
      const errorText = await meResponse.text();
      console.error('❌ /me エラー:', errorText);
      
      // エラーの詳細分析
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          console.log('\n🔍 エラー詳細分析:');
          console.log('  エラーコード:', errorData.error.code);
          console.log('  エラータイプ:', errorData.error.type);
          console.log('  エラーメッセージ:', errorData.error.message);
          
          // エラーコード別の対処法
          switch (errorData.error.code) {
            case 190:
              console.log('\n💡 エラーコード190の対処法:');
              console.log('  - トークンが無効または期限切れ');
              console.log('  - Facebook Graph API Explorerで新しいトークンを生成');
              console.log('  - 必要な権限が付与されているか確認');
              break;
            case 200:
              console.log('\n💡 エラーコード200の対処法:');
              console.log('  - アプリの権限が不足');
              console.log('  - アプリの審査が必要');
              break;
            default:
              console.log('\n💡 一般的な対処法:');
              console.log('  - トークンの権限を確認');
              console.log('  - アプリの設定を確認');
          }
        }
      } catch (parseError) {
        console.log('エラーレスポンスの解析に失敗:', parseError);
      }
      return;
    }
    
    const meData = await meResponse.json();
    console.log('✅ /me 成功:', meData);
    
    // 2. トークンの権限を確認
    console.log('\n🔍 トークンの権限を確認中...');
    const permissionsUrl = `https://graph.facebook.com/v19.0/me/permissions?access_token=${FB_USER_OR_LL_TOKEN}`;
    
    const permissionsResponse = await fetch(permissionsUrl);
    console.log('📊 権限確認レスポンスステータス:', permissionsResponse.status);
    
    if (!permissionsResponse.ok) {
      const errorText = await permissionsResponse.text();
      console.error('❌ 権限確認エラー:', errorText);
    } else {
      const permissionsData = await permissionsResponse.json();
      console.log('✅ 権限確認成功:', permissionsData);
      
      if (permissionsData.data) {
        console.log('\n📋 付与されている権限:');
        permissionsData.data.forEach((perm: any) => {
          const status = perm.status === 'granted' ? '✅' : '❌';
          console.log(`  ${status} ${perm.permission}: ${perm.status}`);
        });
      }
    }
    
    // 3. アプリ情報を確認
    console.log('\n🔍 アプリ情報を確認中...');
    const appUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${FB_USER_OR_LL_TOKEN}&fields=id,name,access_token,instagram_business_account`;
    
    const appResponse = await fetch(appUrl);
    console.log('📊 アプリ確認レスポンスステータス:', appResponse.status);
    
    if (!appResponse.ok) {
      const errorText = await appResponse.text();
      console.error('❌ アプリ確認エラー:', errorText);
    } else {
      const appData = await appResponse.json();
      console.log('✅ アプリ確認成功:', appData);
      
      if (appData.data && appData.data.length > 0) {
        console.log('\n📋 アクセス可能なページ:');
        appData.data.forEach((page: any, index: number) => {
          const hasInstagram = page.instagram_business_account ? '✅' : '❌';
          console.log(`  ${index + 1}. ${page.name} (${page.id}) ${hasInstagram} Instagram連携`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// 実行
debugToken();
