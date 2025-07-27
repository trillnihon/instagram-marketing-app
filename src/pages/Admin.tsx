import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

const Admin: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      // 管理者権限チェック（実際の実装では適切な認証を実装）
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminToken) {
        // トークンが存在する場合は管理者として扱う
        setIsAdmin(true);
      } else {
        // 開発環境では管理者として扱う（本番では削除）
        if (import.meta.env.VITE_ENVIRONMENT === 'development') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (err: any) {
      setError('管理者権限の確認に失敗しました');
      console.error('Admin check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // 管理者ログイン処理（実際の実装では適切な認証を実装）
    const adminToken = prompt('管理者トークンを入力してください:');
    
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
      setIsAdmin(true);
      setError(null);
    } else {
      setError('管理者トークンが必要です');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              管理者ログイン
            </h2>
            <p className="text-gray-600 mb-6">
              管理者ダッシュボードにアクセスするには認証が必要です。
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              管理者としてログイン
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  管理者ダッシュボード
                </h1>
                <p className="text-sm text-gray-500">
                  収益と運用の可視化
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                管理者
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default Admin; 