import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Instagram Graph API連携サービス
 * 
 * このクラスはInstagram Graph APIを使用して以下の機能を提供します：
 * - Instagram Business Account情報の取得
 * - 投稿データの取得
 * - インサイトデータの取得
 * - メディア情報の取得
 */
class InstagramAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://graph.facebook.com/v19.0';
    this.results = {
      success: false,
      data: null,
      errors: []
    };
  }

  /**
   * HTTPリクエストを実行する汎用メソッド
   * @param {string} endpoint - APIエンドポイント
   * @param {object} params - クエリパラメータ
   * @returns {Promise<object>} APIレスポンス
   */
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      // パラメータを追加
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      // アクセストークンを追加
      url.searchParams.append('access_token', this.accessToken);

      console.log(`🔍 Instagram API リクエスト: ${endpoint}`);

      const response = await axios.get(url.toString(), {
        timeout: 10000, // 10秒タイムアウト
        headers: {
          'User-Agent': 'Instagram-Analytics-App/1.0'
        }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error(`❌ Instagram API エラー (${endpoint}):`, errorMessage);
      
      this.results.errors.push({
        endpoint,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(`Instagram API エラー: ${errorMessage}`);
    }
  }

  /**
   * ユーザー情報を取得
   * @returns {Promise<object>} ユーザー情報
   */
  async getUserInfo() {
    try {
      const userInfo = await this.makeRequest('/me', {
        fields: 'id,name,email'
      });
      
      console.log('✅ ユーザー情報取得成功:', userInfo.id);
      return userInfo;
    } catch (error) {
      console.error('❌ ユーザー情報取得失敗:', error.message);
      throw error;
    }
  }

  /**
   * Facebookページ一覧を取得
   * @returns {Promise<Array>} ページ一覧
   */
  async getPages() {
    try {
      const pages = await this.makeRequest('/me/accounts', {
        fields: 'id,name,access_token,instagram_business_account'
      });
      
      console.log(`✅ Facebookページ取得成功: ${pages.data?.length || 0}件`);
      return pages.data || [];
    } catch (error) {
      console.error('❌ Facebookページ取得失敗:', error.message);
      throw error;
    }
  }

  /**
   * Instagram Business Account情報を取得
   * @param {string} instagramBusinessAccountId - Instagram Business Account ID
   * @returns {Promise<object>} Instagram Business Account情報
   */
  async getInstagramAccount(instagramBusinessAccountId) {
    try {
      const accountInfo = await this.makeRequest(`/${instagramBusinessAccountId}`, {
        fields: 'id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count'
      });
      
      console.log('✅ Instagram Business Account取得成功:', accountInfo.username);
      return accountInfo;
    } catch (error) {
      console.error('❌ Instagram Business Account取得失敗:', error.message);
      throw error;
    }
  }

  /**
   * Instagram投稿一覧を取得
   * @param {string} instagramBusinessAccountId - Instagram Business Account ID
   * @param {number} limit - 取得件数（デフォルト: 25）
   * @returns {Promise<Array>} 投稿一覧
   */
  async getMedia(instagramBusinessAccountId, limit = 25) {
    try {
      const media = await this.makeRequest(`/${instagramBusinessAccountId}/media`, {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        limit: limit
      });
      
      console.log(`✅ Instagram投稿取得成功: ${media.data?.length || 0}件`);
      return media.data || [];
    } catch (error) {
      console.error('❌ Instagram投稿取得失敗:', error.message);
      throw error;
    }
  }

  /**
   * Instagram投稿のインサイトデータを取得
   * @param {string} mediaId - メディアID
   * @returns {Promise<object>} インサイトデータ
   */
  async getMediaInsights(mediaId) {
    try {
      const insights = await this.makeRequest(`/${mediaId}/insights`, {
        metric: 'engagement,impressions,reach,saved'
      });
      
      console.log('✅ メディアインサイト取得成功:', mediaId);
      return insights.data || [];
    } catch (error) {
      console.error('❌ メディアインサイト取得失敗:', error.message);
      throw error;
    }
  }

  /**
   * Instagram Business Accountのインサイトデータを取得
   * @param {string} instagramBusinessAccountId - Instagram Business Account ID
   * @returns {Promise<object>} アカウントインサイトデータ
   */
  async getAccountInsights(instagramBusinessAccountId) {
    try {
      const insights = await this.makeRequest(`/${instagramBusinessAccountId}/insights`, {
        metric: 'follower_count,impressions,reach,profile_views',
        period: 'day'
      });
      
      console.log('✅ アカウントインサイト取得成功');
      return insights.data || [];
    } catch (error) {
      console.error('❌ アカウントインサイト取得失敗:', error.message);
      throw error;
    }
  }

  /**
   * 完全な診断を実行
   * @returns {Promise<object>} 診断結果
   */
  async runFullDiagnostic() {
    console.log('\n🔍 Instagram Graph API 完全診断開始');
    console.log('='.repeat(60));
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      userInfo: null,
      pages: [],
      instagramAccounts: [],
      errors: []
    };

    try {
      // 1. ユーザー情報取得
      console.log('\n1️⃣ ユーザー情報を取得中...');
      diagnostic.userInfo = await this.getUserInfo();
      
      // 2. Facebookページ取得
      console.log('\n2️⃣ Facebookページを取得中...');
      diagnostic.pages = await this.getPages();
      
      // 3. Instagram Business Account取得
      console.log('\n3️⃣ Instagram Business Accountを取得中...');
      for (const page of diagnostic.pages) {
        if (page.instagram_business_account) {
          try {
            const instagramAccount = await this.getInstagramAccount(page.instagram_business_account.id);
            diagnostic.instagramAccounts.push({
              pageId: page.id,
              pageName: page.name,
              instagramAccount
            });
          } catch (error) {
            diagnostic.errors.push(`Instagram Account取得エラー (${page.name}): ${error.message}`);
          }
        }
      }
      
      // 4. 最新投稿取得（最初のInstagram Accountのみ）
      if (diagnostic.instagramAccounts.length > 0) {
        console.log('\n4️⃣ 最新投稿を取得中...');
        const firstAccount = diagnostic.instagramAccounts[0];
        try {
          const media = await this.getMedia(firstAccount.instagramAccount.id, 5);
          diagnostic.recentMedia = media;
        } catch (error) {
          diagnostic.errors.push(`最新投稿取得エラー: ${error.message}`);
        }
      }
      
      console.log('\n✅ 診断完了');
      console.log(`   ユーザー: ${diagnostic.userInfo?.name || 'N/A'}`);
      console.log(`   Facebookページ: ${diagnostic.pages.length}件`);
      console.log(`   Instagram Account: ${diagnostic.instagramAccounts.length}件`);
      console.log(`   エラー: ${diagnostic.errors.length}件`);
      
      return diagnostic;
      
    } catch (error) {
      console.error('\n❌ 診断中にエラーが発生しました:', error.message);
      diagnostic.errors.push(error.message);
      return diagnostic;
    }
  }

  /**
   * エラーログを取得
   * @returns {Array} エラーログ
   */
  getErrors() {
    return this.results.errors;
  }

  /**
   * 結果をクリア
   */
  clearResults() {
    this.results = {
      success: false,
      data: null,
      errors: []
    };
  }
}

export default InstagramAPI; 