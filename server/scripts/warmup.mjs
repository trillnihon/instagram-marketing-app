#!/usr/bin/env node

/**
 * バックエンドウォームアップスクリプト
 * Renderの無料プランのスピンダウン対策
 */

const TARGET_URLS = [
  {
    url: 'https://instagram-marketing-backend-v2.onrender.com/health',
    method: 'GET',
    body: null
  },
  {
    url: 'https://instagram-marketing-backend-v2.onrender.com/api/analytics/dashboard',
    method: 'POST',
    body: JSON.stringify({ userId: 'demo_user', period: '7d' })
  }
];

const MAX_RETRIES = 12;
const RETRY_INTERVAL = 5000; // 5秒

async function warmupEndpoint(endpoint, maxRetries = MAX_RETRIES) {
  const { url, method, body } = endpoint;
  console.log(`🔥 ウォームアップ開始: ${method} ${url}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    
    try {
      const fetchOptions = {
        method: method,
        headers: {
          'User-Agent': 'Instagram-Marketing-App-Warmup/1.0',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(30000) // 30秒タイムアウト
      };
      
      if (body) {
        fetchOptions.body = body;
      }
      
      const response = await fetch(url, fetchOptions);
      
      const elapsed = (Date.now() - startTime) / 1000;
      
      if (response.ok) {
        console.log(`✅ 成功 (${attempt}/${maxRetries}): ${response.status} - ${elapsed.toFixed(1)}秒`);
        return true;
      } else {
        console.log(`⚠️ 失敗 (${attempt}/${maxRetries}): ${response.status} - ${elapsed.toFixed(1)}秒`);
      }
    } catch (error) {
      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`❌ エラー (${attempt}/${maxRetries}): ${error.message} - ${elapsed.toFixed(1)}秒`);
    }
    
    if (attempt < maxRetries) {
      console.log(`⏳ ${RETRY_INTERVAL / 1000}秒後にリトライ...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
  
  console.log(`💀 最大リトライ回数に達しました: ${url}`);
  return false;
}

async function main() {
  console.log('🚀 Instagram Marketing App バックエンドウォームアップ開始');
  console.log(`⏰ 開始時刻: ${new Date().toISOString()}`);
  console.log(`🎯 対象URL数: ${TARGET_URLS.length}`);
  console.log(`🔄 最大リトライ: ${MAX_RETRIES}回`);
  console.log(`⏱️ リトライ間隔: ${RETRY_INTERVAL / 1000}秒`);
  console.log('─'.repeat(60));
  
  const results = [];
  
  for (const endpoint of TARGET_URLS) {
    const success = await warmupEndpoint(endpoint);
    results.push({ url: endpoint.url, success });
    console.log('─'.repeat(60));
  }
  
  console.log('📊 ウォームアップ結果サマリー:');
  results.forEach(({ url, success }) => {
    const status = success ? '✅ 成功' : '❌ 失敗';
    console.log(`${status}: ${url}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 成功率: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 すべてのエンドポイントが正常に応答しました！');
    process.exit(0);
  } else {
    console.log('⚠️ 一部のエンドポイントで問題が発生しています');
    process.exit(1);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未処理のPromise拒否:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 未処理の例外:', error);
  process.exit(1);
});

// スクリプト実行
main().catch(error => {
  console.error('💥 メイン処理でエラー:', error);
  process.exit(1);
});
