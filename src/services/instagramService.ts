import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://instagram-marketing-backend-v2.onrender.com/api'
  : 'http://localhost:3001/api';

export interface InstagramUser {
  id: string;
  name: string;
  username?: string;
  account_type?: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  media_type?: string;
}

export interface InstagramInsights {
  impressions?: number;
  reach?: number;
  engagement?: number;
  saved?: number;
  video_views?: number;
  profile_views?: number;
}

export interface InstagramAccount {
  id: string;
  name: string;
  username: string;
  account_type: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export interface InstagramPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

export interface InstagramHashtag {
  id: string;
  name: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

export interface InstagramLike {
  id: string;
  username: string;
}

export interface InstagramCreateMedia {
  id: string;
  status: string;
}

class InstagramService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * ユーザー情報を取得
   */
  async getUserInfo(): Promise<InstagramUser> {
    try {
      const token = localStorage.getItem("IG_JWT");
      const response = await axios.get(`${this.baseURL}/instagram/user-info`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'ユーザー情報の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram user info error:', error);
      throw new Error(error.response?.data?.error || error.message || 'ユーザー情報の取得に失敗しました');
    }
  }

  /**
   * Facebookページ一覧を取得
   */
  async getPages(): Promise<InstagramPage[]> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/pages`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'ページ一覧の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram pages error:', error);
      throw new Error(error.response?.data?.error || error.message || 'ページ一覧の取得に失敗しました');
    }
  }

  /**
   * Instagram Business Account情報を取得
   */
  async getInstagramAccount(accountId: string): Promise<InstagramAccount> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/instagram-account/${accountId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Instagramアカウント情報の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram account error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Instagramアカウント情報の取得に失敗しました');
    }
  }

  /**
   * 投稿一覧を取得
   */
  async getMedia(accountId: string, limit: number = 25): Promise<InstagramMedia[]> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/media/${accountId}`, {
        params: { limit }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '投稿一覧の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram media error:', error);
      throw new Error(error.response?.data?.error || error.message || '投稿一覧の取得に失敗しました');
    }
  }

  /**
   * 特定投稿のインサイトを取得
   */
  async getInsights(mediaId: string): Promise<InstagramInsights> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/media/${mediaId}/insights`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'インサイトの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram insights error:', error);
      throw new Error(error.response?.data?.error || error.message || 'インサイトの取得に失敗しました');
    }
  }

  /**
   * アカウントインサイトを取得
   */
  async getAccountInsights(accountId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/account/${accountId}/insights`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'アカウントインサイトの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram account insights error:', error);
      throw new Error(error.response?.data?.error || error.message || 'アカウントインサイトの取得に失敗しました');
    }
  }

  /**
   * 投稿時間分析を取得
   */
  async getPostingTimeAnalysis(accountId: string, days: number = 30): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/posting-time-analysis`, {
        accountId,
        days
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '投稿時間分析の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram posting time analysis error:', error);
      throw new Error(error.response?.data?.error || error.message || '投稿時間分析の取得に失敗しました');
    }
  }

  /**
   * AI投稿生成
   */
  async generateAIPost(params: {
    accountId: string;
    contentType?: string;
    tone?: string;
    targetAudience?: string;
    industry?: string;
    postLength?: string;
    includeHashtags?: boolean;
    language?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/ai/generate-post`, params);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'AI投稿生成に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram AI post generation error:', error);
      throw new Error(error.response?.data?.error || error.message || 'AI投稿生成に失敗しました');
    }
  }

  /**
   * パフォーマンス分析を取得
   */
  async getPerformanceAnalysis(accountId: string, period: string = '30d', metric: string = 'engagement'): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/performance-analysis/${accountId}`, {
        params: { period, metric }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'パフォーマンス分析の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram performance analysis error:', error);
      throw new Error(error.response?.data?.error || error.message || 'パフォーマンス分析の取得に失敗しました');
    }
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.baseURL}/health`;
      console.log('Health check URL:', url);
      const response = await axios.get(url);
      console.log('Health check response:', response.data);
      return response.data.connection_status === 'success';
    } catch (error: any) {
      console.error('Instagram service health check failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }

  /**
   * ハッシュタグ検索
   */
  async searchHashtags(query: string): Promise<InstagramHashtag[]> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/hashtag-search`, {
        params: { q: query }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'ハッシュタグ検索に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram hashtag search error:', error);
      throw new Error(error.response?.data?.error || error.message || 'ハッシュタグ検索に失敗しました');
    }
  }

  /**
   * ハッシュタグの人気投稿を取得
   */
  async getHashtagTopMedia(hashtagId: string): Promise<InstagramMedia[]> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/hashtag/${hashtagId}/top-media`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'ハッシュタグの人気投稿取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram hashtag top media error:', error);
      throw new Error(error.response?.data?.error || error.message || 'ハッシュタグの人気投稿取得に失敗しました');
    }
  }

  /**
   * 投稿のコメントを取得
   */
  async getMediaComments(mediaId: string): Promise<InstagramComment[]> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/media/${mediaId}/comments`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'コメント取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram media comments error:', error);
      throw new Error(error.response?.data?.error || error.message || 'コメント取得に失敗しました');
    }
  }

  /**
   * 投稿のいいねを取得
   */
  async getMediaLikes(mediaId: string): Promise<InstagramLike[]> {
    try {
      const response = await axios.get(`${this.baseURL}/instagram/media/${mediaId}/likes`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'いいね取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram media likes error:', error);
      throw new Error(error.response?.data?.error || error.message || 'いいね取得に失敗しました');
    }
  }

  /**
   * メディアを作成（投稿準備）
   */
  async createMedia(imageUrl: string, caption: string, accountId: string): Promise<InstagramCreateMedia> {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/account/${accountId}/media`, {
        imageUrl,
        caption
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'メディア作成に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram create media error:', error);
      throw new Error(error.response?.data?.error || error.message || 'メディア作成に失敗しました');
    }
  }

  /**
   * メディアを公開（投稿実行）
   */
  async publishMedia(mediaId: string, accountId: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/account/${accountId}/media_publish`, {
        mediaId
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'メディア公開に失敗しました');
      }
    } catch (error: any) {
      console.error('Instagram publish media error:', error);
      throw new Error(error.response?.data?.error || error.message || 'メディア公開に失敗しました');
    }
  }
}

export default new InstagramService();
