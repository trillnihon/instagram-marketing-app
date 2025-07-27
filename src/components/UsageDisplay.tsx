import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface Usage {
  current: number;
  limit: number;
  remaining: number;
  plan: {
    id: string;
    name: string;
    price: number;
    captionLimit: number;
    features: string[];
  };
}

interface UsageDisplayProps {
  userId: string;
  onUpgrade?: () => void;
}

const UsageDisplay: React.FC<UsageDisplayProps> = ({ userId, onUpgrade }) => {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, [userId]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/usage/${userId}`);
      setUsage(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '使用量の取得に失敗しました');
      console.error('Usage fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!usage) return 0;
    return Math.min((usage.current / usage.limit) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageIcon = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return ExclamationTriangleIcon;
    if (percentage >= 75) return ChartBarIcon;
    return CheckCircleIcon;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchUsage}
          className="mt-2 text-red-500 hover:text-red-700 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const UsageIcon = getUsageIcon();
  const isNearLimit = getUsagePercentage() >= 75;
  const isAtLimit = getUsagePercentage() >= 90;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <UsageIcon className={`h-5 w-5 mr-2 ${getUsageTextColor()}`} />
          <h3 className="text-lg font-medium text-gray-900">
            使用量
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {usage.plan.name}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>キャプション生成</span>
          <span>{usage.current} / {usage.limit}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor()}`}
            style={{ width: `${getUsagePercentage()}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>残り {usage.remaining} 回</span>
          <span>{Math.round(getUsagePercentage())}%</span>
        </div>
      </div>

      {isNearLimit && (
        <div className={`p-3 rounded-lg mb-4 ${
          isAtLimit 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-start">
            <ExclamationTriangleIcon className={`h-5 w-5 mr-2 mt-0.5 ${
              isAtLimit ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isAtLimit ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {isAtLimit ? '使用制限に達しました' : '使用制限に近づいています'}
              </p>
              <p className={`text-sm ${
                isAtLimit ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {isAtLimit 
                  ? 'プランをアップグレードして、より多くの機能をご利用ください。'
                  : '残り使用回数が少なくなっています。'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {usage.plan.id === 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            プレミアム機能を体験
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            プレミアムプランにアップグレードすると、より多くのキャプション生成と高度な機能をご利用いただけます。
          </p>
          <div className="flex space-x-2">
            <Link
              to="/pricing"
              className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-center"
            >
              プランを確認
            </Link>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="flex-1 bg-white text-blue-600 text-sm font-medium py-2 px-4 rounded-md border border-blue-600 hover:bg-blue-50"
              >
                今すぐアップグレード
              </button>
            )}
          </div>
        </div>
      )}

      {usage.plan.id !== 'free' && (
        <div className="text-center">
          <Link
            to="/pricing"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            プラン管理
          </Link>
        </div>
      )}
    </div>
  );
};

export default UsageDisplay; 