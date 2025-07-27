import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import Navigation from './Navigation';
import { 
  HashtagAnalysis as HashtagAnalysisType, 
  RecommendedHashtag, 
  InstagramPost 
} from '../types';
import { 
  ArrowTrendingUpIcon, 
  FireIcon, 
  StarIcon, 
  ChartBarIcon,
  TagIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const HashtagAnalysis: React.FC = () => {
  const { currentUser } = useAppStore();
  const [hashtagAnalytics, setHashtagAnalytics] = useState<HashtagAnalysisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // おすすめハッシュタグの定義
  const recommendedHashtags: RecommendedHashtag[] = [
    // ライフスタイル
    { tag: '#ライフスタイル', category: 'ライフスタイル', description: '日常の素敵な瞬間を共有', estimatedEngagement: 8.5 },
    { tag: '#日常', category: 'ライフスタイル', description: '日々の小さな発見', estimatedEngagement: 7.2 },
    { tag: '#お気に入り', category: 'ライフスタイル', description: '愛用品やおすすめアイテム', estimatedEngagement: 9.1 },
    
    // グルメ・カフェ
    { tag: '#グルメ', category: 'グルメ', description: '美味しい食べ物の情報', estimatedEngagement: 8.8 },
    { tag: '#カフェ', category: 'グルメ', description: 'カフェ巡りやコーヒー', estimatedEngagement: 9.3 },
    { tag: '#おすすめ', category: 'グルメ', description: 'おすすめのお店やメニュー', estimatedEngagement: 8.7 },
    
    // 旅行
    { tag: '#旅行', category: '旅行', description: '旅行記録や観光地', estimatedEngagement: 9.5 },
    { tag: '#観光', category: '旅行', description: '観光スポットの紹介', estimatedEngagement: 8.9 },
    { tag: '#発見', category: '旅行', description: '新しい場所の発見', estimatedEngagement: 8.2 },
    
    // 美容・ファッション
    { tag: '#美容', category: '美容', description: '美容情報やスキンケア', estimatedEngagement: 8.6 },
    { tag: '#ファッション', category: 'ファッション', description: 'ファッションアイテム', estimatedEngagement: 8.4 },
    { tag: '#コスメ', category: '美容', description: 'コスメ情報', estimatedEngagement: 8.3 },
    
    // フィットネス・健康
    { tag: '#フィットネス', category: 'フィットネス', description: '運動やトレーニング', estimatedEngagement: 7.8 },
    { tag: '#健康', category: 'フィットネス', description: '健康に関する情報', estimatedEngagement: 7.5 },
    { tag: '#筋トレ', category: 'フィットネス', description: '筋力トレーニング', estimatedEngagement: 7.9 },
    
    // 子育て
    { tag: '#子育て', category: '子育て', description: '子育ての日常', estimatedEngagement: 8.1 },
    { tag: '#育児', category: '子育て', description: '育児の工夫やアイデア', estimatedEngagement: 7.7 },
    
    // その他
    { tag: '#癒し', category: 'その他', description: '心が癒される瞬間', estimatedEngagement: 8.0 },
    { tag: '#リラックス', category: 'その他', description: 'リラックスタイム', estimatedEngagement: 7.6 },
    { tag: '#幸せ', category: 'その他', description: '幸せな瞬間', estimatedEngagement: 8.3 }
  ];

  // ハッシュタグを分析する関数
  const analyzeHashtags = (posts: InstagramPost[]): HashtagAnalysisType[] => {
    const hashtagMap = new Map<string, {
      usageCount: number;
      totalEngagement: number;
      totalScore: number;
      posts: string[];
      lastUsed: string;
    }>();

    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
        const current = hashtagMap.get(cleanTag) || {
          usageCount: 0,
          totalEngagement: 0,
          totalScore: 0,
          posts: [],
          lastUsed: ''
        };

        current.usageCount += 1;
        current.totalEngagement += post.performance.engagementRate;
        current.totalScore += (post.performance.engagementRate * 40 + 
                              post.performance.saveRate * 25 + 
                              post.performance.shareRate * 20 + 
                              post.hashtags.length * 10 + 
                              (post.caption?.length || 0) / 20);
        current.posts.push(post.id);
        
        if (!current.lastUsed || post.timestamp > current.lastUsed) {
          current.lastUsed = post.timestamp;
        }

        hashtagMap.set(cleanTag, current);
      });
    });

    return Array.from(hashtagMap.entries()).map(([tag, data]) => ({
      tag,
      usageCount: data.usageCount,
      averageEngagement: data.totalEngagement / data.usageCount,
      averageScore: data.totalScore / data.usageCount,
      posts: data.posts,
      lastUsed: data.lastUsed
    })).sort((a, b) => b.averageScore - a.averageScore);
  };

  // データを読み込む
  useEffect(() => {
    const loadHashtagData = async () => {
      try {
        setLoading(true);
        
        // localStorageから投稿データを取得
        const storedPosts = localStorage.getItem('instagram_posts');
        let posts: InstagramPost[] = [];
        
        if (storedPosts) {
          posts = JSON.parse(storedPosts);
        } else {
          // デモデータを生成（既存のPostAnalytics.tsxと同じデータ）
          posts = [
            {
              id: 'post_1',
              mediaType: 'IMAGE',
              mediaUrl: 'https://placehold.jp/400x400.png',
              caption: '今日は素敵な一日でした！✨ 新しい発見があって、心が豊かになった気がします。みなさんも素敵な体験をシェアしてくださいね！',
              hashtags: ['#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び'],
              timestamp: '2025-07-15T10:00:00Z',
              engagement: {
                likes: 150,
                comments: 25,
                saves: 45,
                shares: 12,
                reach: 2000,
                impressions: 2500
              },
              performance: {
                engagementRate: 9.3,
                saveRate: 18.0,
                shareRate: 4.8,
                reachRate: 80.0
              }
            },
            {
              id: 'post_2',
              mediaType: 'IMAGE',
              mediaUrl: 'https://placehold.jp/400x400.png',
              caption: '朝の散歩で見つけた美しい花🌸 自然の美しさに感動しました。',
              hashtags: ['#朝散歩', '#花', '#自然'],
              timestamp: '2025-07-14T08:00:00Z',
              engagement: {
                likes: 80,
                comments: 8,
                saves: 15,
                shares: 3,
                reach: 1200,
                impressions: 1500
              },
              performance: {
                engagementRate: 7.1,
                saveRate: 10.0,
                shareRate: 2.0,
                reachRate: 80.0
              }
            },
            {
              id: 'post_3',
              mediaType: 'IMAGE',
              mediaUrl: 'https://placehold.jp/400x400.png',
              caption: '新しいカフェを発見！☕️ コーヒーが美味しくて、雰囲気も良かったです。',
              hashtags: ['#カフェ', '#コーヒー', '#発見', '#お気に入り', '#休憩', '#リラックス', '#美味しい', '#雰囲気', '#おすすめ', '#グルメ', '#カフェ巡り', '#コーヒー好き', '#癒し', '#時間', '#幸せ'],
              timestamp: '2025-07-13T15:00:00Z',
              engagement: {
                likes: 200,
                comments: 35,
                saves: 60,
                shares: 20,
                reach: 3000,
                impressions: 3500
              },
              performance: {
                engagementRate: 9.0,
                saveRate: 17.1,
                shareRate: 5.7,
                reachRate: 85.7
              }
            }
          ];
          
          // デモデータをlocalStorageに保存
          localStorage.setItem('instagram_posts', JSON.stringify(posts));
        }
        
        const analytics = analyzeHashtags(posts);
        setHashtagAnalytics(analytics);
      } catch (error) {
        console.error('ハッシュタグデータの読み込みエラー:', error);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadHashtagData();
  }, []);

  // 管理者権限の判定（デモユーザーまたは特定のユーザーID）
  const isAdmin = currentUser?.userId === 'demo_user' || currentUser?.userId === 'admin';

  // スコアに応じた色クラスを取得
  const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // エンゲージメント率に応じた色クラスを取得
  const getEngagementColorClass = (engagement: number): string => {
    if (engagement >= 8) return 'text-green-600';
    if (engagement >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation activeTab="hashtags" onTabChange={() => {}} showAdminLink={isAdmin} />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation activeTab="hashtags" onTabChange={() => {}} showAdminLink={isAdmin} />
        
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ハッシュタグ分析と提案</h1>
          <p className="text-gray-600">投稿で使用したハッシュタグのパフォーマンスを分析し、効果的なタグを提案します</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ハッシュタグ分析 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  ハッシュタグ分析
                </h2>
              </div>

              {hashtagAnalytics.length === 0 ? (
                <div className="p-8 text-center">
                  <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">分析データがありません</h3>
                  <p className="mt-1 text-sm text-gray-500">投稿を作成してハッシュタグ分析を開始しましょう。</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ハッシュタグ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用回数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          平均エンゲージメント
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          平均スコア
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hashtagAnalytics.map((hashtag, index) => (
                        <tr key={hashtag.tag} className={`hover:bg-gray-50 ${index < 5 ? 'bg-yellow-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {index < 5 && <FireIcon className="h-4 w-4 text-orange-500 mr-2" />}
                              <span className="text-sm font-medium text-gray-900">{hashtag.tag}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {hashtag.usageCount}回
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getEngagementColorClass(hashtag.averageEngagement)}`}>
                              {hashtag.averageEngagement.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColorClass(hashtag.averageScore)}`}>
                              {Math.round(hashtag.averageScore)}点
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* おすすめハッシュタグ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2" />
                  おすすめハッシュタグ
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendedHashtags.slice(0, 10).map((hashtag) => (
                    <div key={hashtag.tag} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{hashtag.tag}</h3>
                          <p className="text-xs text-gray-500 mt-1">{hashtag.description}</p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {hashtag.category}
                          </span>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="flex items-center text-xs text-gray-500">
                            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                            {hashtag.estimatedEngagement}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">💡 ハッシュタグ活用のコツ</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 15-30個のハッシュタグを使用</li>
                    <li>• 人気タグとニッチタグを組み合わせ</li>
                    <li>• 投稿内容に関連したタグを選択</li>
                    <li>• 定期的にパフォーマンスを分析</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        {hashtagAnalytics.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">総ハッシュタグ数</h3>
              <p className="text-3xl font-bold text-purple-600">
                {hashtagAnalytics.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">総使用回数</h3>
              <p className="text-3xl font-bold text-blue-600">
                {hashtagAnalytics.reduce((sum, tag) => sum + tag.usageCount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">平均エンゲージメント</h3>
              <p className="text-3xl font-bold text-green-600">
                {(hashtagAnalytics.reduce((sum, tag) => sum + tag.averageEngagement, 0) / hashtagAnalytics.length).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">最高スコア</h3>
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(Math.max(...hashtagAnalytics.map(tag => tag.averageScore)))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashtagAnalysis; 