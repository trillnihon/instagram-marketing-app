import fetch from 'node-fetch';

/**
 * Instagram Graph API サービス
 * Meta Graph APIを使用してInstagram投稿データを取得
 */
export class InstagramGraphService {
  constructor() {
    this.accessToken = process.env.FB_USER_OR_LL_TOKEN;
    this.apiVersion = process.env.INSTAGRAM_GRAPH_API_VERSION || 'v19.0';
    this.pageId = process.env.FB_PAGE_ID;
    this.baseUrl = 'https://graph.facebook.com';
  }

  /**
   * アクセストークンの有効性をチェック
   */
  async validateAccessToken() {
    if (!this.accessToken) {
      throw new Error('FB_USER_OR_LL_TOKENが設定されていません');
    }

    try {
      const url = `${this.baseUrl}/${this.apiVersion}/me?access_token=${this.accessToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`アクセストークンの検証に失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [GRAPH API] アクセストークン検証成功: ${data.name || 'Unknown'}`);
      return data;
    } catch (error) {
      console.error(`❌ [GRAPH API] アクセストークン検証失敗:`, error);
      throw error;
    }
  }

  /**
   * InstagramビジネスアカウントIDを取得
   */
  async getInstagramBusinessAccountId() {
    if (!this.pageId) {
      throw new Error('FB_PAGE_IDが設定されていません');
    }

    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.pageId}?fields=instagram_business_account&access_token=${this.accessToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ページ情報の取得に失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const instagramAccountId = data.instagram_business_account?.id;
      
      if (!instagramAccountId) {
        throw new Error('Instagramビジネスアカウントが見つかりません');
      }

      console.log(`✅ [GRAPH API] InstagramビジネスアカウントID取得: ${instagramAccountId}`);
      return instagramAccountId;
    } catch (error) {
      console.error(`❌ [GRAPH API] InstagramビジネスアカウントID取得失敗:`, error);
      throw error;
    }
  }

  /**
   * Instagram投稿データを取得
   */
  async getInstagramPosts(instagramAccountId, limit = 25) {
    try {
      const fields = [
        'id',
        'caption',
        'media_type',
        'media_url',
        'thumbnail_url',
        'permalink',
        'timestamp',
        'like_count',
        'comments_count'
      ].join(',');

      const url = `${this.baseUrl}/${this.apiVersion}/${instagramAccountId}/media?fields=${fields}&limit=${limit}&access_token=${this.accessToken}`;
      console.log(`🔍 [GRAPH API] Instagram投稿取得開始: ${instagramAccountId}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Instagram投稿の取得に失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [GRAPH API] Instagram投稿取得成功: ${data.data?.length || 0}件`);

      // 投稿データを整形
      const posts = data.data.map(post => ({
        id: post.id,
        caption: post.caption || '',
        media_type: post.media_type || 'IMAGE',
        media_url: post.media_url || '',
        thumbnail_url: post.thumbnail_url || post.media_url || '',
        permalink: post.permalink || '',
        timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString(),
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
        engagement_rate: this.calculateEngagementRate(post.like_count || 0, post.comments_count || 0)
      }));

      return posts;
    } catch (error) {
      console.error(`❌ [GRAPH API] Instagram投稿取得失敗:`, error);
      throw error;
    }
  }

  /**
   * 投稿のインサイト（詳細統計）を取得
   */
  async getPostInsights(mediaId, instagramAccountId) {
    try {
      const fields = [
        'reach',
        'impressions',
        'saved'
      ].join(',');

      const url = `${this.baseUrl}/${this.apiVersion}/${mediaId}/insights?fields=${fields}&access_token=${this.accessToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`⚠️ [GRAPH API] インサイト取得失敗 (${mediaId}): ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn(`⚠️ [GRAPH API] インサイト取得エラー (${mediaId}):`, error.message);
      return null;
    }
  }

  /**
   * エンゲージメント率を計算
   */
  calculateEngagementRate(likes, comments) {
    // 仮のフォロワー数（実際の実装では別途取得が必要）
    const estimatedFollowers = 1000;
    const totalEngagement = likes + comments;
    return estimatedFollowers > 0 ? (totalEngagement / estimatedFollowers) * 100 : 0;
  }

  /**
   * ユーザーのInstagram投稿履歴を完全取得
   */
  async fetchUserInstagramHistory(userId) {
    try {
      console.log(`🚀 [GRAPH API] ユーザー ${userId} のInstagram履歴取得開始`);

      // 1. アクセストークンを検証
      await this.validateAccessToken();

      // 2. InstagramビジネスアカウントIDを取得
      const instagramAccountId = await this.getInstagramBusinessAccountId();

      // 3. 投稿データを取得
      const posts = await this.getInstagramPosts(instagramAccountId, 50);

      // 4. 各投稿のインサイトを取得（オプション）
      const postsWithInsights = await Promise.all(
        posts.map(async (post) => {
          try {
            const insights = await this.getPostInsights(post.id, instagramAccountId);
            if (insights) {
              post.insights = {
                reach: insights.find(i => i.name === 'reach')?.values?.[0]?.value || 0,
                impressions: insights.find(i => i.name === 'impressions')?.values?.[0]?.value || 0,
                saved: insights.find(i => i.name === 'saved')?.values?.[0]?.value || 0
              };
            }
          } catch (error) {
            console.warn(`⚠️ [GRAPH API] インサイト取得スキップ (${post.id}):`, error.message);
          }
          return post;
        })
      );

      console.log(`✅ [GRAPH API] ユーザー ${userId} のInstagram履歴取得完了: ${postsWithInsights.length}件`);
      
      return {
        success: true,
        userId,
        posts: postsWithInsights,
        total: postsWithInsights.length,
        fetchedAt: new Date().toISOString(),
        source: 'Instagram Graph API'
      };

    } catch (error) {
      console.error(`❌ [GRAPH API] ユーザー ${userId} のInstagram履歴取得失敗:`, error);
      throw error;
    }
  }

  /**
   * サービス設定の確認
   */
  getServiceStatus() {
    return {
      accessToken: this.accessToken ? '設定済み' : '未設定',
      apiVersion: this.apiVersion,
      pageId: this.pageId ? '設定済み' : '未設定',
      baseUrl: this.baseUrl
    };
  }
}

// シングルトンインスタンス
export const instagramGraphService = new InstagramGraphService();
