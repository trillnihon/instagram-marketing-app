import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ページが見つかりません
          </h1>
          <p className="text-gray-600 mb-8">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            🏠 ホームに戻る
          </Link>
          
          <Link
            to="/dashboard"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            📊 ダッシュボード
          </Link>

          <Link
            to="/contact"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            📞 お問い合わせ
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🔍 よく利用されるページ
          </h3>
          <div className="space-y-2 text-sm">
            <Link
              to="/analyze"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • URL分析
            </Link>
            <Link
              to="/create-post"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • 投稿作成
            </Link>
            <Link
              to="/threads-analysis"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • Threads分析
            </Link>
            <Link
              to="/history"
              className="block text-blue-600 hover:text-blue-800 hover:underline"
            >
              • 分析履歴
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>
            問題が解決しない場合は、
            <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline">
              お問い合わせ
            </Link>
            までご連絡ください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 