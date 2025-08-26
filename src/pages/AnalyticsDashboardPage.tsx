import React from 'react';
import Navigation from '../components/Navigation';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAppStore } from '../store/useAppStore';

const AnalyticsDashboardPage: React.FC = () => {
  const { currentUser } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Navigation activeTab="dashboard" onTabChange={() => {}} showAdminLink={true} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 アナリティクスダッシュボード
          </h1>
          <p className="text-gray-600">
            Instagramアカウントの詳細な分析とパフォーマンス指標を確認できます
          </p>
          {currentUser && (
            <p className="text-sm text-gray-500 mt-1">
              {currentUser.userId} としてログイン中
            </p>
          )}
        </div>

        <AnalyticsDashboard userId={currentUser?.id} />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage; 