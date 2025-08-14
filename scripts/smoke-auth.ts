#!/usr/bin/env tsx

import dotenv from 'dotenv';
import axios from 'axios';

// 環境変数の読み込み
dotenv.config({ path: './env.development' });

const BASE_URL = 'http://localhost:4000';
const REDIRECT_URI = 'http://localhost:3001/auth/instagram/callback';

async function smokeAuth() {
  console.log('🚀 認証フロースモークテスト開始\n');

  try {
    // 1. /login エンドポイントの確認
    console.log('1. /login エンドポイント確認...');
    const loginResponse = await axios.get(`${BASE_URL}/auth/instagram/login`, {
      maxRedirects: 0,
      validateStatus: (status) => status < 400
    });
    
    if (loginResponse.status === 302) {
      const redirectUrl = loginResponse.headers.location;
      console.log(`✅ /login 成功: 302 → ${redirectUrl}`);
      
      // 2. リダイレクト先の確認
      console.log('\n2. リダイレクト先確認...');
      const redirectResponse = await axios.get(redirectUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });
      
      if (redirectResponse.status === 302) {
        const finalUrl = redirectResponse.headers.location;
        console.log(`✅ リダイレクト成功: 302 → ${finalUrl}`);
        
        if (finalUrl.includes('facebook.com') && finalUrl.includes('oauth')) {
          console.log('✅ Facebook OAuthページに到達');
        } else {
          console.log('⚠️ 予期しないリダイレクト先:', finalUrl);
        }
      } else {
        console.log(`⚠️ リダイレクト応答: ${redirectResponse.status}`);
      }
    } else {
      console.log(`⚠️ /login 応答: ${loginResponse.status}`);
    }

    console.log('\n🎉 認証フロースモークテスト完了');
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 302) {
        const redirectUrl = error.response.headers.location;
        console.log(`✅ リダイレクト検出: ${redirectUrl}`);
        return true;
      }
      console.log(`❌ HTTP エラー: ${error.response?.status}`);
    } else {
      console.log(`❌ エラー: ${error instanceof Error ? error.message : error}`);
    }
    return false;
  }
}

smokeAuth().then(success => {
  process.exit(success ? 0 : 1);
});
