import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface SimilarAccount {
  username: string;
  followers: number;
  similarityScore: number;
  commonHashtags: string[];
  contentTone: string;
  averageEngagement: number;
  topPost: string;
  reason: string;
}

interface SimilarAccountsProps {
  competitorUrl: string;
}

const SimilarAccounts: React.FC<SimilarAccountsProps> = ({ competitorUrl }) => {
  const [similarAccounts, setSimilarAccounts] = useState<SimilarAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  const { currentUser } = useAppStore();

  const findSimilarAccounts = async () => {
    if (!competitorUrl.trim()) {
      setError('競合アカウントURLを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/threads/similar-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitorUrl,
          userId: currentUser?.id || 'demo_user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSimilarAccounts(data.similarAccounts);
      } else {
        setError(data.error || '類似競合アカウントの取得に失敗しました');
      }
    } catch (err) {
      console.error('Similar accounts error:', err);
      setError('類似競合アカウントツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔍 類似競合アカウント提案</h3>
        <button
          onClick={findSimilarAccounts}
          disabled={loading || !competitorUrl.trim()}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            loading || !competitorUrl.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {loading ? '検索中...' : '類似アカウントを検索'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {similarAccounts.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            📊 {similarAccounts.length}件の類似アカウントが見つかりました
          </div>
          
          {similarAccounts.map((account, index) => (
            <div key={account.username} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">@{account.username}</h4>
                    <p className="text-sm text-gray-600">{account.followers.toLocaleString()}フォロワー</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getSimilarityColor(account.similarityScore)}`}>
                    {(account.similarityScore * 100).toFixed(0)}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getSimilarityBadge(account.similarityScore)}`}>
                    類似度
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">🏷️ 共通ハッシュタグ</h5>
                  <div className="flex flex-wrap gap-1">
                    {account.commonHashtags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">📝 コンテンツトーン</h5>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded">
                    <span className="text-sm text-gray-800">{account.contentTone}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-2">📊 エンゲージメント</h5>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-purple-600">{account.averageEngagement.toFixed(1)}%</span>
                  <span className="text-sm text-gray-600">平均エンゲージメント</span>
                </div>
              </div>

              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-2">💡 類似理由</h5>
                <p className="text-sm text-gray-700">{account.reason}</p>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={() => setShowDetails(showDetails === account.username ? null : account.username)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  {showDetails === account.username ? '詳細を隠す' : '人気投稿を見る'}
                </button>
                
                {showDetails === account.username && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h6 className="font-medium text-gray-700 mb-2">🔥 人気投稿</h6>
                    <p className="text-sm text-gray-800">{account.topPost}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {similarAccounts.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">類似競合アカウントを検索してください</p>
          <p className="text-sm text-gray-400 mt-2">
            競合アカウントの投稿傾向に基づいて類似アカウントを提案します
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">類似アカウントを検索中...</p>
        </div>
      )}
    </div>
  );
};

export default SimilarAccounts; 