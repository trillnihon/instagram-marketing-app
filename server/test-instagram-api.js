#!/usr/bin/env node

/**
 * Instagram Graph API接続テストスクリプト
 * 
 * 使用方法:
 * node test-instagram-api.js <access_token>
 * 
 * 例:
 * node test-instagram-api.js EAAxxx...
 */

import InstagramAPI from './services/instagram-api.js';
import dotenv from 'dotenv';

dotenv.config();

class InstagramAPITester {
  constructor() {
    this.results = {
      success: false,
      tests: [],
      errors: []
    };
  }

  async runTest(accessToken) {
    console.log('🔍 Instagram Graph API 接続テスト開始');
    console.log('='.repeat(60));
    console.log('');

    if (!accessToken) {
      console.error('❌ アクセストークンが必要です');
      console.log('使用方法: node test-instagram-api.js <access_token>');
      return;
    }

    const instagramAPI = new InstagramAPI(accessToken);

    try {
      // テスト1: ユーザー情報取得
      console.log('1️⃣ ユーザー情報取得テスト');
      try {
        const userInfo = await instagramAPI.getUserInfo();
        console.log('✅ ユーザー情報取得成功:', userInfo.name);
        this.results.tests.push({
          name: 'ユーザー情報取得',
          status: 'success',
          data: userInfo
        });
      } catch (error) {
        console.log('❌ ユーザー情報取得失敗:', error.message);
        this.results.tests.push({
          name: 'ユーザー情報取得',
          status: 'error',
          error: error.message
        });
      }

      // テスト2: Facebookページ取得
      console.log('\n2️⃣ Facebookページ取得テスト');
      try {
        const pages = await instagramAPI.getPages();
        console.log(`✅ Facebookページ取得成功: ${pages.length}件`);
        this.results.tests.push({
          name: 'Facebookページ取得',
          status: 'success',
          data: pages
        });

        // テスト3: Instagram Business Account取得
        if (pages.length > 0) {
          console.log('\n3️⃣ Instagram Business Account取得テスト');
          for (const page of pages) {
            if (page.instagram_business_account) {
              try {
                const instagramAccount = await instagramAPI.getInstagramAccount(page.instagram_business_account.id);
                console.log(`✅ Instagram Business Account取得成功: ${instagramAccount.username}`);
                this.results.tests.push({
                  name: 'Instagram Business Account取得',
                  status: 'success',
                  data: instagramAccount
                });

                // テスト4: 最新投稿取得
                console.log('\n4️⃣ 最新投稿取得テスト');
                try {
                  const media = await instagramAPI.getMedia(instagramAccount.id, 5);
                  console.log(`✅ 最新投稿取得成功: ${media.length}件`);
                  this.results.tests.push({
                    name: '最新投稿取得',
                    status: 'success',
                    data: media
                  });
                } catch (error) {
                  console.log('❌ 最新投稿取得失敗:', error.message);
                  this.results.tests.push({
                    name: '最新投稿取得',
                    status: 'error',
                    error: error.message
                  });
                }

                break; // 最初のInstagram Accountのみテスト
              } catch (error) {
                console.log(`❌ Instagram Business Account取得失敗 (${page.name}):`, error.message);
                this.results.tests.push({
                  name: 'Instagram Business Account取得',
                  status: 'error',
                  error: error.message
                });
              }
            } else {
              console.log(`⚠️ ページ "${page.name}" にInstagram Business Accountが紐付いていません`);
            }
          }
        } else {
          console.log('⚠️ Facebookページが見つかりません');
        }
      } catch (error) {
        console.log('❌ Facebookページ取得失敗:', error.message);
        this.results.tests.push({
          name: 'Facebookページ取得',
          status: 'error',
          error: error.message
        });
      }

      // 結果表示
      this.displayResults();

    } catch (error) {
      console.error('\n❌ テスト実行中にエラーが発生しました:', error.message);
      this.results.errors.push(error.message);
    }
  }

  displayResults() {
    console.log('\n📊 テスト結果サマリー');
    console.log('='.repeat(60));
    
    const successCount = this.results.tests.filter(test => test.status === 'success').length;
    const errorCount = this.results.tests.filter(test => test.status === 'error').length;
    
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${errorCount}件`);
    console.log(`📈 成功率: ${((successCount / this.results.tests.length) * 100).toFixed(1)}%`);
    
    if (errorCount > 0) {
      console.log('\n🔍 エラー詳細:');
      this.results.tests
        .filter(test => test.status === 'error')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }

    if (this.results.errors.length > 0) {
      console.log('\n🚨 システムエラー:');
      this.results.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    console.log('\n💡 次のステップ:');
    if (successCount === this.results.tests.length) {
      console.log('   🎉 全てのテストが成功しました！Instagram Graph API接続は正常です。');
    } else if (successCount > 0) {
      console.log('   ⚠️ 一部のテストが失敗しました。設定を確認してください。');
    } else {
      console.log('   ❌ 全てのテストが失敗しました。アクセストークンと権限を確認してください。');
    }
  }
}

// メイン実行
async function main() {
  const accessToken = process.argv[2];
  
  if (!accessToken) {
    console.error('❌ アクセストークンが必要です');
    console.log('');
    console.log('使用方法:');
    console.log('  node test-instagram-api.js <access_token>');
    console.log('');
    console.log('例:');
    console.log('  node test-instagram-api.js EAAxxx...');
    console.log('');
    console.log('アクセストークンの取得方法:');
    console.log('  1. https://developers.facebook.com/tools/explorer/ にアクセス');
    console.log('  2. アプリを選択');
    console.log('  3. 必要な権限を追加（instagram_basic, instagram_manage_insights等）');
    console.log('  4. "Generate Access Token"をクリック');
    console.log('  5. 生成されたトークンをコピー');
    process.exit(1);
  }

  const tester = new InstagramAPITester();
  await tester.runTest(accessToken);
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ テスト実行エラー:', error.message);
    process.exit(1);
  });
}

export default InstagramAPITester; 