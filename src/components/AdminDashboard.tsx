import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CurrencyYenIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAppStore } from '../store/useAppStore';

interface RevenueData {
  date: string;
  revenue: number;
  subscriptions: number;
  cancellations: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  premiumUsers: number;
  enterpriseUsers: number;
  newUsersThisMonth: number;
}

interface UsageStats {
  totalCaptionsGenerated: number;
  averageCaptionsPerUser: number;
  topUsers: Array<{
    userId: string;
    username: string;
    captionCount: number;
    plan: string;
  }>;
}

interface AdminDashboardProps {
  isAdmin?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isAdmin = false }) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const aiProvider = useAppStore(state => state.aiProvider);
  const setAiProvider = useAppStore(state => state.setAiProvider);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, selectedPeriod]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 実際のAPIエンドポイントに合わせて調整
      const [revenueRes, usersRes, usageRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/revenue?period=${selectedPeriod}`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/usage`)
      ]);

      setRevenueData(revenueRes.data.data);
      setUserStats(usersRes.data.data);
      setUsageStats(usageRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'データの取得に失敗しました');
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const getRevenueGrowth = () => {
    if (revenueData.length < 2) return 0;
    const current = revenueData[revenueData.length - 1].revenue;
    const previous = revenueData[revenueData.length - 2].revenue;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const getPlanDistribution = () => {
    if (!userStats) return [];
    return [
      { name: '無料', value: userStats.freeUsers, color: '#6B7280' },
      { name: 'プレミアム', value: userStats.premiumUsers, color: '#3B82F6' },
      { name: 'エンタープライズ', value: userStats.enterpriseUsers, color: '#10B981' }
    ];
  };

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">
              管理者権限が必要です
            </h3>
            <p className="text-yellow-700">
              このページにアクセスするには管理者権限が必要です。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchAdminData}
          className="mt-2 text-red-500 hover:text-red-700 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  const revenueGrowth = getRevenueGrowth();
  const planDistribution = getPlanDistribution();

  return (
    <div className="space-y-6">
      {/* AIプロバイダー切替UI */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm font-medium text-gray-700">AIプロバイダー:</label>
        <select
          value={aiProvider || 'openai'}
          onChange={e => setAiProvider?.(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="gpt-3.5">GPT-3.5</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gemini-pro">Gemini Pro</option>
        </select>
        <span className="text-xs text-gray-500">現在: {aiProvider}</span>
      </div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === '7d' ? '7日' : period === '30d' ? '30日' : '90日'}
            </button>
          ))}
        </div>
      </div>

      {/* 主要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 総収益 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CurrencyYenIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総収益</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
              </p>
              <div className="flex items-center mt-1">
                {revenueGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 総ユーザー数 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats ? formatNumber(userStats.totalUsers) : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                今月 +{userStats ? formatNumber(userStats.newUsersThisMonth) : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* アクティブユーザー */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats ? formatNumber(userStats.activeUsers) : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {userStats ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0}% の利用率
              </p>
            </div>
          </div>
        </div>

        {/* キャプション生成数 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">キャプション生成</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageStats ? formatNumber(usageStats.totalCaptionsGenerated) : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                平均 {usageStats ? Math.round(usageStats.averageCaptionsPerUser) : 0} 回/ユーザー
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 収益推移 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">収益推移</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="収益"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* プラン分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">プラン分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* トップユーザー */}
      {usageStats && usageStats.topUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">トップユーザー</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プラン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    生成数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageStats.topUsers.map((user, index) => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                        user.plan === 'enterprise' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.plan === 'premium' ? 'プレミアム' :
                         user.plan === 'enterprise' ? 'エンタープライズ' : '無料'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(user.captionCount)} 回
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 