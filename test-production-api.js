/**
 * 本番APIの状態確認テストスクリプト
 */

const API_BASE_URL = 'https://instagram-marketing-backend-v2.onrender.com/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 テスト中: ${description}`);
    console.log(`URL: ${API_BASE_URL}${endpoint}`);
    
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📊 レスポンス: ${response.status} ${response.statusText}`);
    console.log(`⏱️ レスポンス時間: ${responseTime}ms`);
    
    if (response.ok) {
      console.log(`✅ 成功: ${response.status} OK`);
      try {
        const data = await response.json();
        console.log(`📄 データ:`, JSON.stringify(data, null, 2));
      } catch (e) {
        console.log(`📄 データ: テキスト形式`);
        const text = await response.text();
        console.log(text.substring(0, 200) + '...');
      }
    } else {
      console.log(`❌ 失敗: ${response.status} ${response.statusText}`);
    }
    
    return {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      ok: response.ok
    };
  } catch (error) {
    console.log(`💥 エラー: ${error.message}`);
    return {
      endpoint,
      error: error.message,
      ok: false
    };
  }
}

async function runTests() {
  console.log('🚀 本番API状態確認テスト開始');
  console.log(`🌐 API ベースURL: ${API_BASE_URL}`);
  console.log('=' .repeat(60));
  
  const endpoints = [
    {
      path: '/health',
      description: 'ヘルスチェック'
    },
    {
      path: '/scheduler/posts?userId=demo_user',
      description: 'スケジュール投稿取得'
    },
    {
      path: '/instagram/history/demo_user',
      description: 'Instagram履歴取得'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.description);
    results.push(result);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 テスト結果サマリー');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  
  console.log(`✅ 成功: ${successful}`);
  console.log(`❌ 失敗: ${failed}`);
  console.log(`📊 成功率: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  results.forEach(result => {
    const icon = result.ok ? '✅' : '❌';
    const status = result.error ? `エラー: ${result.error}` : `${result.status} ${result.statusText}`;
    console.log(`${icon} ${result.endpoint}: ${status}`);
  });
  
  if (successful === results.length) {
    console.log('\n🎉 すべてのAPIが正常に動作しています！');
    console.log('Mock APIを停止して本番APIに完全切り替え可能です。');
  } else {
    console.log('\n⚠️ 一部のAPIで問題が発生しています。');
    console.log('Mock APIの停止は推奨されません。');
  }
}

// テスト実行
runTests().catch(console.error);
