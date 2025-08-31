import axios from 'axios';

// テスト用のアクセストークン（実際のトークンに置き換えてください）
const TEST_ACCESS_TOKEN = 'YOUR_TEST_ACCESS_TOKEN';

// バックエンドのベースURL
const API_BASE_URL = 'https://instagram-marketing-backend-v2.onrender.com';

async function testUserInfoAPI() {
  try {
    console.log('🧪 /api/instagram/user-info API テスト開始');
    
    // APIエンドポイントをテスト
    const url = `${API_BASE_URL}/api/instagram/user-info?accessToken=${TEST_ACCESS_TOKEN}`;
    console.log('📡 リクエストURL:', url.replace(TEST_ACCESS_TOKEN, '***'));
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Instagram-Marketing-App-Test/1.0'
      }
    });
    
    console.log('✅ レスポンス成功:', response.status);
    console.log('📊 レスポンスデータ:', JSON.stringify(response.data, null, 2));
    
    // レスポンス形式の検証
    if (response.data.success && response.data.data) {
      console.log('✅ レスポンス形式: 正常');
      console.log('👤 ユーザーID:', response.data.data.id);
      console.log('📝 ユーザー名:', response.data.data.name);
    } else {
      console.log('❌ レスポンス形式: 異常');
    }
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    
    if (error.response) {
      console.error('📊 エラーレスポンス:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
  }
}

// テスト実行
testUserInfoAPI();
