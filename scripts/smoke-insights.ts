#!/usr/bin/env tsx

import dotenv from 'dotenv';
import axios from 'axios';

// 環境変数の読み込み
dotenv.config({ path: './env.development' });

const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

async function smokeInsights() {
  console.log('🚀 インサイト取得スモークテスト開始\n');

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

    // 3. 直近メディアの取得
    console.log('\n3. 直近メディア取得...');
    const mediaResponse = await axios.get(`${GRAPH_API_BASE}/${igBusinessId}/media`, {
      params: {
        fields: 'id,media_type,media_url,timestamp,like_count,comments_count',
        limit: 1,
        access_token: pageAccessToken
      }
    });

    const media = mediaResponse.data.data;
    if (!media || media.length === 0) {
      console.log('❌ メディアが存在しません');
      return false;
    }

    const latestMedia = media[0];
    console.log(`✅ 直近メディア取得成功: ${latestMedia.id}`);

    // 4. インサイト取得
    console.log('\n4. インサイト取得...');
    const insightsResponse = await axios.get(`${GRAPH_API_BASE}/${latestMedia.id}/insights`, {
      params: {
        metric: 'reach,impressions,likes,saved,shares,comments',
        access_token: pageAccessToken
      }
    });

    const insights = insightsResponse.data.data;
    console.log('✅ インサイト取得成功');

    // 5. 結果表示
    console.log('\n📊 インサイト結果:');
    console.log(JSON.stringify({
      media_id: latestMedia.id,
      media_type: latestMedia.media_type,
      timestamp: latestMedia.timestamp,
      insights: insights
    }, null, 2));

    console.log('\n🎉 インサイト取得スモークテスト完了');
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

smokeInsights().then(success => {
  process.exit(success ? 0 : 1);
});
