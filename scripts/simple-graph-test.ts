#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { config } from 'dotenv';

// 環境変数の読み込み
config({ path: '../server/.env' });

// 環境変数の取得
const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

console.log('=== 最小限Graph APIテスト ===');
console.log('FB_USER_OR_LL_TOKEN:', FB_USER_OR_LL_TOKEN ? '設定済み' : '未設定');
console.log('FB_PAGE_ID:', FB_PAGE_ID);

if (!FB_USER_OR_LL_TOKEN) {
  console.error('❌ FB_USER_OR_LL_TOKEN が未設定です');
  process.exit(1);
}

// 簡単なGraph APIテスト
async function testGraphAPI() {
  try {
    const url = `https://graph.facebook.com/v19.0/me?access_token=${FB_USER_OR_LL_TOKEN}&fields=id,name`;
    console.log('🔍 Graph API呼び出し中...');
    
    const response = await fetch(url);
    console.log('📡 レスポンスステータス:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Graph APIエラー:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Graph API成功:', data);
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// テスト実行
testGraphAPI();
