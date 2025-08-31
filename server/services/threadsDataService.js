import { Post, HashtagStats, FollowerGrowth, AnalysisResult } from '../models/ThreadsData.js';

// Graph API呼び出し用のヘルパー関数
const callGraphAPI = async (endpoint, params = {}) => {
  try {
    const accessToken = process.env.FB_USER_OR_LL_TOKEN;
    if (!accessToken) {
      throw new Error('FB_USER_OR_LL_TOKEN not configured');
    }

    // パラメータにアクセストークンを必ず付与
    const queryParams = new URLSearchParams({
      ...params,
      access_token: accessToken
    });

    const url = `https://graph.facebook.com/v19.0/${endpoint}?${queryParams}`;
    
    console.log('🌐 [THREADS SERVICE] Graph API呼び出し:', {
      endpoint,
      hasAccessToken: !!accessToken,
      url: url.replace(accessToken, '[TOKEN_HIDDEN]')
    });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Graph API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('❌ [THREADS SERVICE] Graph API呼び出しエラー:', error);
    throw error;
  }
};

// スクレイピング用のヘルパー関数（実際のAPIがないため、シミュレーション）
const simulateThreadsScraping = async (userId, days = 30) => {
  try {
    const posts = [];
    const hashtagStats = [];
    const followerGrowth = [];
    
    const categories = ['日常系', '教育系', '時事系', 'ビジネス系', 'ライフスタイル系', 'モチベーション系'];
    const hashtags = [
      '#朝活', '#自己啓発', '#プロジェクト', '#読書', '#コーヒー', '#スキルアップ',
      '#モチベーション', '#学習', '#成長', '#リフレッシュ', '#ビジネス', '#成功',
      '#日常', '#健康', '#趣味', '#ニュース', '#時事', '#社会'
    ];

    // 過去30日分の投稿データを生成
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const postCount = Math.floor(Math.random() * 3) + 1; // 1-3件の投稿
      
      for (let j = 0; j < postCount; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const postHashtags = hashtags.slice(0, Math.floor(Math.random() * 5) + 2);
        
        const likes = Math.floor(Math.random() * 3000) + 100;
        const reposts = Math.floor(Math.random() * 200) + 10;
        const replies = Math.floor(Math.random() * 100) + 5;
        const views = likes * (Math.floor(Math.random() * 10) + 5);
        const engagementRate = ((likes + reposts + replies) / views * 100).toFixed(1);
        
        posts.push({
          postId: `post_${userId}_${date.getTime()}_${j}`,
          content: `${category}に関する投稿内容 ${j + 1}`,
          hashtags: postHashtags,
          likes,
          reposts,
          replies,
          views,
          engagementRate: parseFloat(engagementRate),
          category,
          postedAt: date
        });
      }
    }

    // ハッシュタグ統計を生成
    hashtags.forEach(tag => {
      const usageCount = Math.floor(Math.random() * 100) + 10;
      const previousCount = Math.floor(usageCount * (0.7 + Math.random() * 0.6));
      const growthRate = ((usageCount - previousCount) / previousCount * 100).toFixed(1);
      
      hashtagStats.push({
        tag,
        usageCount,
        previousCount,
        growthRate: parseFloat(growthRate),
        category: categories[Math.floor(Math.random() * categories.length)]
      });
    });

    // 週別フォロワー成長データを生成
    for (let week = 1; week <= 8; week++) {
      const postCount = Math.floor(Math.random() * 5) + 2;
      const followerGrowth = Math.floor(Math.random() * 200) + 50;
      const correlation = followerGrowth > 100 ? 'positive' : 'negative';
      
      followerGrowth.push({
        week: `2024年${Math.ceil(week/4)}月第${((week-1) % 4) + 1}週`,
        postCount,
        followerGrowth,
        correlation,
        comment: correlation === 'positive' ? '投稿頻度とフォロワー増加が良好' : '投稿頻度の低下によりフォロワー増加も減少'
      });
    }

    return { posts, hashtagStats, followerGrowth };
  } catch (error) {
    console.error('❌ [THREADS SERVICE] スクレイピングシミュレーションエラー:', error);
    throw error;
  }
};

// トレンド投稿取得（改善版）
export const getTrendPosts = async (userId, days = 30) => {
  try {
    console.log('📈 [THREADS SERVICE] トレンド投稿取得開始:', { userId, days });

    // まずGraph APIから取得を試行
    try {
      const graphData = await callGraphAPI('me/posts', {
        fields: 'id,message,created_time,reactions.summary(true),comments.summary(true),shares',
        limit: 50
      });

      if (graphData.data && graphData.data.length > 0) {
        console.log('✅ [THREADS SERVICE] Graph APIから投稿データ取得成功:', {
          count: graphData.data.length
        });
        
        // Graph APIデータを変換
        const posts = graphData.data.map(post => ({
          postId: post.id,
          content: post.message || '',
          hashtags: extractHashtags(post.message || ''),
          likes: post.reactions?.summary?.total_count || 0,
          reposts: post.shares?.count || 0,
          replies: post.comments?.summary?.total_count || 0,
          views: (post.reactions?.summary?.total_count || 0) * 5, // 推定値
          engagementRate: calculateEngagementRate(post),
          category: categorizePost(post.message || ''),
          postedAt: new Date(post.created_time)
        }));

        return posts.sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5);
      }
    } catch (graphError) {
      console.warn('⚠️ [THREADS SERVICE] Graph API取得失敗、データベースから取得:', graphError.message);
    }

    // データベースから取得を試行
    let posts = await Post.find({
      postedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ engagementRate: -1 }).limit(5);

    // データがない場合はスクレイピングをシミュレート
    if (posts.length === 0) {
      console.log('📭 [THREADS SERVICE] データベースにデータなし、シミュレーションデータを生成');
      const scrapedData = await simulateThreadsScraping(userId, days);
      
      // データベースに保存
      await Post.insertMany(scrapedData.posts);
      
      posts = await Post.find({
        postedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      }).sort({ engagementRate: -1 }).limit(5);
    }

    console.log('✅ [THREADS SERVICE] トレンド投稿取得成功:', {
      count: posts.length
    });

    return posts;
  } catch (error) {
    console.error('❌ [THREADS SERVICE] トレンド投稿取得エラー:', error);
    throw error;
  }
};

// ハッシュタグランキング取得（改善版）
export const getHashtagRanking = async (userId) => {
  try {
    console.log('🏷️ [THREADS SERVICE] ハッシュタグランキング取得開始:', { userId });

    // まずGraph APIから取得を試行
    try {
      const graphData = await callGraphAPI('me/posts', {
        fields: 'message',
        limit: 100
      });

      if (graphData.data && graphData.data.length > 0) {
        console.log('✅ [THREADS SERVICE] Graph APIからハッシュタグデータ取得成功:', {
          count: graphData.data.length
        });
        
        // 投稿からハッシュタグを抽出してカウント
        const hashtagCounts = {};
        graphData.data.forEach(post => {
          const hashtags = extractHashtags(post.message || '');
          hashtags.forEach(tag => {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          });
        });

        // ハッシュタグ統計を生成
        const hashtagStats = Object.entries(hashtagCounts).map(([tag, usageCount]) => ({
          tag,
          usageCount,
          previousCount: Math.floor(usageCount * 0.8), // 推定値
          growthRate: Math.random() * 50 - 25, // ランダムな成長率
          category: categorizeHashtag(tag)
        }));

        return hashtagStats.sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
      }
    } catch (graphError) {
      console.warn('⚠️ [THREADS SERVICE] Graph API取得失敗、データベースから取得:', graphError.message);
    }

    let hashtagStats = await HashtagStats.find().sort({ growthRate: -1 }).limit(10);

    if (hashtagStats.length === 0) {
      console.log('📭 [THREADS SERVICE] データベースにハッシュタグデータなし、シミュレーションデータを生成');
      const scrapedData = await simulateThreadsScraping(userId);
      
      await HashtagStats.insertMany(scrapedData.hashtagStats);
      
      hashtagStats = await HashtagStats.find().sort({ growthRate: -1 }).limit(10);
    }

    console.log('✅ [THREADS SERVICE] ハッシュタグランキング取得成功:', {
      count: hashtagStats.length
    });

    return hashtagStats;
  } catch (error) {
    console.error('❌ [THREADS SERVICE] ハッシュタグランキング取得エラー:', error);
    throw error;
  }
};

// ハッシュタグ抽出ヘルパー関数
const extractHashtags = (text) => {
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return text.match(hashtagRegex) || [];
};

// エンゲージメント率計算ヘルパー関数
const calculateEngagementRate = (post) => {
  const likes = post.reactions?.summary?.total_count || 0;
  const comments = post.comments?.summary?.total_count || 0;
  const shares = post.shares?.count || 0;
  const views = likes * 5; // 推定値
  
  if (views === 0) return 0;
  return ((likes + comments + shares) / views * 100).toFixed(1);
};

// 投稿カテゴリ分類ヘルパー関数
const categorizePost = (content) => {
  const categories = {
    '日常系': ['日常', '生活', '今日', '朝', '夜'],
    '教育系': ['学習', '勉強', '知識', '学び', '教育'],
    '時事系': ['ニュース', '時事', '社会', '政治', '経済'],
    'ビジネス系': ['ビジネス', '仕事', 'キャリア', '成功', '起業'],
    'ライフスタイル系': ['ライフスタイル', '趣味', '旅行', '料理', 'ファッション'],
    'モチベーション系': ['モチベーション', '目標', '夢', '挑戦', '成長']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return category;
    }
  }
  return 'その他';
};

// ハッシュタグカテゴリ分類ヘルパー関数
const categorizeHashtag = (hashtag) => {
  const categories = {
    '日常系': ['#日常', '#生活', '#今日'],
    '教育系': ['#学習', '#勉強', '#知識'],
    '時事系': ['#ニュース', '#時事', '#社会'],
    'ビジネス系': ['#ビジネス', '#仕事', '#キャリア'],
    'ライフスタイル系': ['#ライフスタイル', '#趣味', '#旅行'],
    'モチベーション系': ['#モチベーション', '#目標', '#夢']
  };

  for (const [category, tags] of Object.entries(categories)) {
    if (tags.some(tag => hashtag.includes(tag.replace('#', '')))) {
      return category;
    }
  }
  return 'その他';
};

// コンテンツテーマ分析取得
export const getContentThemes = async (userId, days = 30) => {
  try {
    const posts = await Post.find({
      postedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });

    if (posts.length === 0) {
      const scrapedData = await simulateThreadsScraping(userId, days);
      await Post.insertMany(scrapedData.posts);
      return getContentThemes(userId, days);
    }

    // カテゴリ別統計を計算
    const categoryStats = {};
    posts.forEach(post => {
      if (!categoryStats[post.category]) {
        categoryStats[post.category] = {
          totalEngagement: 0,
          postCount: 0,
          hashtags: new Set()
        };
      }
      categoryStats[post.category].totalEngagement += post.engagementRate;
      categoryStats[post.category].postCount += 1;
      post.hashtags.forEach(tag => categoryStats[post.category].hashtags.add(tag));
    });

    const themes = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      averageEngagement: (stats.totalEngagement / stats.postCount).toFixed(1),
      postCount: stats.postCount,
      topHashtags: Array.from(stats.hashtags).slice(0, 3),
      description: `${category}に関する投稿`,
      trend: Math.random() > 0.5 ? 'up' : 'stable'
    }));

    return themes;
  } catch (error) {
    console.error('Error getting content themes:', error);
    throw error;
  }
};

// フォロワー成長相関分析取得
export const getFollowerGrowthCorrelation = async (userId) => {
  try {
    let followerGrowth = await FollowerGrowth.find().sort({ createdAt: -1 }).limit(8);

    if (followerGrowth.length === 0) {
      const scrapedData = await simulateThreadsScraping(userId);
      
      await FollowerGrowth.insertMany(scrapedData.followerGrowth);
      
      followerGrowth = await FollowerGrowth.find().sort({ createdAt: -1 }).limit(8);
    }

    return followerGrowth;
  } catch (error) {
    console.error('Error getting follower growth correlation:', error);
    throw error;
  }
};

// ベスト投稿時間帯分析取得
export const getBestPostingTimes = async (userId, days = 30) => {
  try {
    const posts = await Post.find({
      postedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });

    if (posts.length === 0) {
      const scrapedData = await simulateThreadsScraping(userId, days);
      await Post.insertMany(scrapedData.posts);
      return getBestPostingTimes(userId, days);
    }

    // 曜日×時間のヒートマップデータを生成
    const heatmapData = {};
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // 初期化
    weekdays.forEach(day => {
      heatmapData[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        heatmapData[day][hour] = {
          engagementRate: 0,
          postCount: 0,
          totalEngagement: 0
        };
      }
    });

    // 投稿データを分析
    posts.forEach(post => {
      const postDate = new Date(post.postedAt);
      const day = weekdays[postDate.getDay()];
      const hour = postDate.getHours();
      
      heatmapData[day][hour].postCount += 1;
      heatmapData[day][hour].totalEngagement += post.engagementRate;
    });

    // 平均エンゲージメント率を計算
    weekdays.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        if (heatmapData[day][hour].postCount > 0) {
          heatmapData[day][hour].engagementRate = 
            heatmapData[day][hour].totalEngagement / heatmapData[day][hour].postCount;
        }
      }
    });

    // ベスト時間帯を特定
    let bestTime = { day: '月', hour: 9, engagementRate: 0 };
    weekdays.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        if (heatmapData[day][hour].engagementRate > bestTime.engagementRate) {
          bestTime = { day, hour, engagementRate: heatmapData[day][hour].engagementRate };
        }
      }
    });

    return {
      heatmapData,
      bestTime,
      summary: {
        bestDay: bestTime.day,
        bestHour: bestTime.hour,
        bestEngagementRate: bestTime.engagementRate.toFixed(1),
        totalPosts: posts.length,
        averageEngagement: (posts.reduce((sum, post) => sum + post.engagementRate, 0) / posts.length).toFixed(1)
      }
    };
  } catch (error) {
    console.error('Error getting best posting times:', error);
    throw error;
  }
};

// 会話が生まれているテーマ分析
export const getConversationThemes = async (userId, days = 30) => {
  try {
    const posts = await Post.find({
      postedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ replies: -1 }).limit(10);

    if (posts.length === 0) {
      const scrapedData = await simulateThreadsScraping(userId, days);
      await Post.insertMany(scrapedData.posts);
      return getConversationThemes(userId, days);
    }

    const conversationThemes = posts.map(post => ({
      postId: post.postId,
      content: post.content,
      replies: post.replies,
      likes: post.likes,
      reposts: post.reposts,
      category: post.category,
      hashtags: post.hashtags,
      engagementRate: post.engagementRate,
      conversationScore: (post.replies * 2 + post.likes + post.reposts) / 100,
      postedAt: post.postedAt
    }));

    return {
      themes: conversationThemes,
      summary: {
        totalConversations: conversationThemes.length,
        averageReplies: (conversationThemes.reduce((sum, theme) => sum + theme.replies, 0) / conversationThemes.length).toFixed(1),
        topCategory: conversationThemes[0]?.category || '不明',
        mostEngagingHashtag: conversationThemes[0]?.hashtags[0] || 'なし'
      }
    };
  } catch (error) {
    console.error('Error getting conversation themes:', error);
    throw error;
  }
};

// 分析結果を保存
export const saveAnalysisResult = async (userId, analysisType, data) => {
  try {
    const analysisResult = new AnalysisResult({
      userId,
      analysisType,
      data,
      period: '30days'
    });
    
    await analysisResult.save();
    return analysisResult;
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw error;
  }
}; 