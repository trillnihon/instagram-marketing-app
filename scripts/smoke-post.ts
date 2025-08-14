#!/usr/bin/env tsx

import dotenv from 'dotenv';
import axios from 'axios';

// 環境変数の読み込み
dotenv.config({ path: './env.development' });

const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

async function smokePost() {
  console.log('🚀 投稿作成スモークテスト開始\n');

  if (!FB_USER_OR_LL_TOKEN) {
    console.log('❌ FB_USER_OR_LL_TOKEN が未設定');
    return false;
  }

  try {
    // 1. ページアクセストークンの取得
    console.log('1. ページアクセストークン取得...');
    const accountsResponse = await axios.get(`${GRAPH_API_BASE}/${FB_PAGE_ID}`, {
      params: {
        fields: 'access_token',
        access_token: FB_USER_OR_LL_TOKEN
      }
    });

    const pageAccessToken = accountsResponse.data.access_token;
    console.log('✅ ページアクセストークン取得成功');

    // 2. Instagram Business Account IDの取得
    console.log('\n2. Instagram Business Account ID取得...');
    const pageResponse = await axios.get(`${GRAPH_API_BASE}/${FB_PAGE_ID}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: pageAccessToken
      }
    });

    const igBusinessId = pageResponse.data.instagram_business_account?.id;
    if (!igBusinessId) {
      console.log('❌ Instagram Business Account IDが取得できません');
      return false;
    }
    console.log(`✅ Instagram Business Account ID: ${igBusinessId}`);

    // 3. 投稿作成
    console.log('\n3. 投稿作成...');
    const postData = {
      caption: '[SMOKE TEST] Instagram Marketing App テスト投稿',
      image_url: 'https://via.placeholder.com/1080x1080.png?text=SMOKE+TEST',
      access_token: pageAccessToken
    };

    const postResponse = await axios.post(`${GRAPH_API_BASE}/${igBusinessId}/media`, postData);
    const mediaId = postResponse.data.id;
    console.log(`✅ メディア作成成功: ${mediaId}`);

    // 4. 投稿公開
    console.log('\n4. 投稿公開...');
    const publishData = {
      creation_id: mediaId,
      access_token: pageAccessToken
    };

    const publishResponse = await axios.post(`${GRAPH_API_BASE}/${igBusinessId}/media_publish`, publishData);
    const postId = publishResponse.data.id;
    const timestamp = new Date().toISOString();

    console.log('✅ 投稿公開成功');
    console.log('\n📊 投稿結果:');
    console.log(`  ID: ${postId}`);
    console.log(`  Timestamp: ${timestamp}`);

    console.log('\n🎉 投稿作成スモークテスト完了');
    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(`❌ API エラー: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    } else {
      console.log(`❌ エラー: ${error instanceof Error ? error.message : error}`);
    }
    return false;
  }
}

smokePost().then(success => {
  process.exit(success ? 0 : 1);
});
