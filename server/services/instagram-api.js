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
      if (!instagramBusinessAccountId) {
        throw new Error('Instagram Business Account IDが必要です');
      }

      const media = await this.makeRequest(`/${instagramBusinessAccountId}/media`, {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        limit: limit
      });
      
      // データの安全性チェック
      if (!media || !media.data) {
        console.log(`📊 メディアデータなし: ${instagramBusinessAccountId}`);
        return [];
      }
      
      // データが配列でない場合は配列に変換
      const mediaArray = Array.isArray(media.data) ? media.data : [media.data];
      
      console.log(`✅ Instagram投稿取得成功: ${mediaArray.length}件`);
      return mediaArray;
    } catch (error) {
      console.error('❌ Instagram投稿取得失敗:', error.message);
      // エラーの場合は空配列を返す（アプリケーションのクラッシュを防ぐ）
      return [];
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
   * 投稿時間分析を実行
   * @param {string} accountId - Instagram Business Account ID
   * @param {number} days - 分析対象日数（デフォルト: 30日）
   * @returns {Promise<object>} 投稿時間分析結果
   */
  async analyzePostingTimes(accountId, days = 30) {
    try {
      console.log(`📊 投稿時間分析開始: ${accountId} (${days}日間)`);
      
      // 投稿データを取得
      console.log(`📊 メディアデータ取得開始: ${accountId}`);
      const media = await this.getMedia(accountId, 100); // 最大100件取得
      console.log(`📊 メディアデータ取得結果: ${media?.length || 0}件`);
      
      // データの安全性チェックを強化
      if (!media || !Array.isArray(media) || media.length === 0) {
        console.log(`📊 投稿データなしまたは無効なデータ - 空の分析結果を返します`);
        return {
          accountId,
          analysisPeriod: days,
          totalPosts: 0,
          postingTimes: [],
          hourlyDistribution: new Array(24).fill(0),
          dailyDistribution: new Array(7).fill(0),
          bestPostingTimes: {
            hours: [],
            days: []
          },
          recommendations: ['投稿データが不足しています。Instagramアカウントに投稿があるか確認してください。'],
          timestamp: new Date().toISOString()
        };
      }

      // 投稿時間を分析（データの安全性チェック付き）
      const postingTimes = media
        .filter(post => post && post.timestamp) // 無効な投稿を除外
        .map(post => {
          try {
            const timestamp = new Date(post.timestamp);
            if (isNaN(timestamp.getTime())) {
              console.warn(`⚠️ 無効なタイムスタンプ: ${post.timestamp}`);
              return null;
            }
            return {
              hour: timestamp.getHours(),
              dayOfWeek: timestamp.getDay(),
              timestamp: timestamp.toISOString(),
              engagement: post.like_count || 0
            };
          } catch (error) {
            console.warn(`⚠️ 投稿データ処理エラー:`, error.message);
            return null;
          }
        })
        .filter(time => time !== null); // nullを除外

      // 時間帯別投稿数（安全性チェック付き）
      const hourlyStats = new Array(24).fill(0);
      const dailyStats = new Array(7).fill(0);
      
      if (postingTimes.length > 0) {
        postingTimes.forEach(time => {
          if (time && typeof time.hour === 'number' && time.hour >= 0 && time.hour < 24) {
            hourlyStats[time.hour]++;
          }
          if (time && typeof time.dayOfWeek === 'number' && time.dayOfWeek >= 0 && time.dayOfWeek < 7) {
            dailyStats[time.dayOfWeek]++;
          }
        });
      }

      // 最適な投稿時間を特定（安全性チェック付き）
      const bestHours = hourlyStats
        .map((count, hour) => ({ hour, count }))
        .filter(item => item.count > 0) // 投稿数が0の時間帯を除外
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.hour);

      const bestDays = dailyStats
        .map((count, day) => ({ day, count }))
        .filter(item => item.count > 0) // 投稿数が0の曜日を除外
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.day);

      // 推奨事項を生成（安全性チェック付き）
      const recommendations = [];
      
      if (bestHours.length > 0) {
        recommendations.push(`最も投稿が多い時間帯: ${bestHours.map(h => `${h}時`).join(', ')}`);
      } else {
        recommendations.push('投稿データが不足しているため、最適な投稿時間を特定できません');
      }
      
      if (bestDays.length > 0) {
        recommendations.push(`最も投稿が多い曜日: ${bestDays.map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join(', ')}`);
      } else {
        recommendations.push('投稿データが不足しているため、最適な投稿曜日を特定できません');
      }
      
      if (postingTimes.length > 0) {
        recommendations.push(`平均投稿頻度: ${(postingTimes.length / days).toFixed(1)}件/日`);
      } else {
        recommendations.push('投稿データが不足しているため、投稿頻度を計算できません');
      }

      const analysis = {
        accountId,
        analysisPeriod: days,
        totalPosts: postingTimes.length, // 有効な投稿数のみ
        postingTimes: postingTimes.slice(0, 20), // 最新20件のみ
        hourlyDistribution: hourlyStats,
        dailyDistribution: dailyStats,
        bestPostingTimes: {
          hours: bestHours,
          days: bestDays
        },
        recommendations,
        timestamp: new Date().toISOString()
      };

      console.log('✅ 投稿時間分析完了');
      return analysis;

    } catch (error) {
      console.error('❌ 投稿時間分析失敗:', error.message);
      throw error;
    }
  }

  /**
   * AI投稿を生成
   * @param {object} options - 生成オプション
   * @returns {Promise<object>} 生成された投稿
   */
  async generateAIPost(options) {
    try {
      const {
        accountId,
        contentType = 'post',
        tone = 'professional',
        targetAudience = 'general',
        industry = 'general',
        postLength = 'medium',
        includeHashtags = true,
        language = 'ja'
      } = options;

      console.log(`🤖 AI投稿生成開始: ${accountId}`);

      // アカウント情報を取得してコンテキストを生成
      let accountContext = '';
      try {
        const accountInfo = await this.getInstagramAccount(accountId);
        accountContext = `アカウント名: ${accountInfo.username || 'N/A'}, フォロワー数: ${accountInfo.followers_count || 'N/A'}`;
      } catch (error) {
        console.warn('⚠️ アカウント情報取得失敗、デフォルトコンテキストを使用');
        accountContext = 'Instagram Business Account';
      }

      // 投稿テンプレートを生成
      const templates = {
        professional: {
          general: {
            short: '📱 今日のインスピレーション\n\n{content}\n\n#インスタグラム #ビジネス #成長',
            medium: '📱 今日のインスピレーション\n\n{content}\n\n私たちは常に{industry}の最前線で、お客様に最高の価値を提供することを目指しています。\n\n#インスタグラム #ビジネス #成長 #プロフェッショナル',
            long: '📱 今日のインスピレーション\n\n{content}\n\n私たちは常に{industry}の最前線で、お客様に最高の価値を提供することを目指しています。\n\n毎日の小さな積み重ねが、大きな成果につながります。一緒に成長していきましょう。\n\n#インスタグラム #ビジネス #成長 #プロフェッショナル #成功'
          }
        },
        casual: {
          general: {
            short: '✨ 今日の気分\n\n{content}\n\n#インスタグラム #日常 #楽しい',
            medium: '✨ 今日の気分\n\n{content}\n\nみんなで一緒に楽しもう！\n\n#インスタグラム #日常 #楽しい #仲間',
            long: '✨ 今日の気分\n\n{content}\n\nみんなで一緒に楽しもう！\n\n人生は短いから、毎日を大切に過ごしたいよね。小さな幸せを見つけることが、豊かな人生の秘訣だと思う。\n\n#インスタグラム #日常 #楽しい #仲間 #幸せ'
          }
        }
      };

      // コンテンツを生成
      const contentIdeas = {
        general: [
          '新しい発見がありました！',
          '今日も頑張りましょう！',
          '素敵な一日になりますように',
          '小さな進歩も大切です',
          '感謝の気持ちを忘れずに'
        ],
        business: [
          'ビジネスの新しいアイデア',
          'お客様からのフィードバック',
          'チームの成長を実感',
          '新しいプロジェクトの開始',
          '目標達成への道のり'
        ]
      };

      // ランダムなコンテンツを選択
      const contentCategory = industry === 'business' ? 'business' : 'general';
      const randomContent = contentIdeas[contentCategory][Math.floor(Math.random() * contentIdeas[contentCategory].length)];

      // テンプレートを選択
      const selectedTemplate = templates[tone]?.[targetAudience]?.[postLength] || templates.professional.general.medium;

      // 投稿を生成
      const generatedPost = selectedTemplate
        .replace('{content}', randomContent)
        .replace('{industry}', industry === 'business' ? 'ビジネス' : '業界');

      // ハッシュタグを追加
      let hashtags = '';
      if (includeHashtags) {
        const baseHashtags = ['#インスタグラム', '#SNS', '#マーケティング'];
        const industryHashtags = industry === 'business' ? ['#ビジネス', '#起業', '#成功'] : ['#ライフスタイル', '#日常', '#楽しい'];
        const toneHashtags = tone === 'professional' ? ['#プロフェッショナル', '#成長'] : ['#カジュアル', '#楽しい'];
        
        hashtags = '\n\n' + [...baseHashtags, ...industryHashtags, ...toneHashtags].join(' ');
      }

      const result = {
        accountId,
        contentType,
        tone,
        targetAudience,
        industry,
        postLength,
        content: generatedPost + hashtags,
        characterCount: (generatedPost + hashtags).length,
        hashtags: includeHashtags ? hashtags.trim().split(' ').filter(tag => tag.startsWith('#')) : [],
        recommendations: [
          '投稿時間は午前9-11時、午後7-9時がおすすめ',
          '画像や動画と組み合わせると効果的',
          '定期的な投稿でフォロワーとの関係を構築',
          'エンゲージメントを高めるために質問を投げかける'
        ],
        timestamp: new Date().toISOString()
      };

      console.log('✅ AI投稿生成完了');
      return result;

    } catch (error) {
      console.error('❌ AI投稿生成失敗:', error.message);
      throw error;
    }
  }

  /**
   * パフォーマンス分析を実行
   * @param {string} accountId - Instagram Business Account ID
   * @param {string} period - 分析期間 (7d, 30d, 90d)
   * @param {string} metric - 分析指標 (engagement, reach, impressions)
   * @returns {Promise<object>} パフォーマンス分析結果
   */
  async analyzePerformance(accountId, period = '30d', metric = 'engagement') {
    try {
      console.log(`📈 パフォーマンス分析開始: ${accountId} (${period}, ${metric})`);

      // アカウントインサイトを取得
      const accountInsights = await this.getAccountInsights(accountId);
      
      // 投稿データを取得
      const media = await this.getMedia(accountId, 50);
      
      if (!media || media.length === 0) {
        return {
          accountId,
          period,
          metric,
          totalPosts: 0,
          averageEngagement: 0,
          totalReach: 0,
          totalImpressions: 0,
          topPosts: [],
          recommendations: ['投稿データが不足しています']
        };
      }

      // 投稿ごとのパフォーマンスを計算（安全性チェック付き）
      const postPerformance = media
        .filter(post => post && post.id) // 無効な投稿を除外
        .map(post => {
          try {
            const engagement = (post.like_count || 0) + (post.comments_count || 0);
            const reach = post.insights?.reach || 0;
            const impressions = post.insights?.impressions || 0;
            
            return {
              id: post.id,
              timestamp: post.timestamp || new Date().toISOString(),
              engagement,
              reach,
              impressions,
              engagementRate: post.followers_count ? (engagement / post.followers_count * 100) : 0
            };
          } catch (error) {
            console.warn(`⚠️ 投稿パフォーマンス計算エラー:`, error.message);
            return null;
          }
        })
        .filter(post => post !== null); // nullを除外

      // 統計を計算（安全性チェック付き）
      const totalPosts = postPerformance.length; // 有効な投稿数のみ
      const totalEngagement = postPerformance.reduce((sum, post) => sum + (post.engagement || 0), 0);
      const totalReach = postPerformance.reduce((sum, post) => sum + (post.reach || 0), 0);
      const totalImpressions = postPerformance.reduce((sum, post) => sum + (post.impressions || 0), 0);
      
      const averageEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;
      const averageEngagementRate = totalPosts > 0 ? 
        postPerformance.reduce((sum, post) => sum + (post.engagementRate || 0), 0) / totalPosts : 0;

      // トップ投稿を特定
      const topPosts = postPerformance
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5);

      // 推奨事項を生成
      const recommendations = [];
      
      if (averageEngagementRate < 1) {
        recommendations.push('エンゲージメント率を向上させるために、より魅力的なコンテンツの作成を検討してください');
      }
      
      if (totalPosts < 10) {
        recommendations.push('投稿頻度を増やして、フォロワーとの関係を構築してください');
      }
      
      if (topPosts.length > 0) {
        recommendations.push(`最も人気のある投稿の要素を分析し、同様のアプローチを試してください`);
      }

      const analysis = {
        accountId,
        period,
        metric,
        totalPosts,
        averageEngagement: Math.round(averageEngagement * 100) / 100,
        averageEngagementRate: Math.round(averageEngagementRate * 100) / 100,
        totalReach,
        totalImpressions,
        topPosts,
        performanceTrend: 'stable', // 将来的には時系列分析を追加
        recommendations,
        timestamp: new Date().toISOString()
      };

      console.log('✅ パフォーマンス分析完了');
      return analysis;

    } catch (error) {
      console.error('❌ パフォーマンス分析失敗:', error.message);
      throw error;
    }
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