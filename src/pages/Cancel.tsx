import React from 'react';
import { Link } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

const Cancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              決済がキャンセルされました
            </h2>
            <p className="text-gray-600 mb-6">
              決済処理がキャンセルされました。
              無料プランのまま引き続きご利用いただけます。
            </p>
            
            <div className="space-y-4">
              <Link
                to="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ダッシュボードに戻る
              </Link>
              
              <Link
                to="/pricing"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                プランをもう一度確認する
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                決済に関するご質問がございましたら、サポートまでお気軽にお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cancel; 