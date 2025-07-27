import React from 'react';
import { useAppStore } from '../store/useAppStore';

const DebugPanel: React.FC = () => {
  const { isAuthenticated, currentUser, accountAnalytics, posts, analysis, logout } = useAppStore();

  // 開発環境でのみ表示
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔧 デバッグ情報</h3>
      <div className="space-y-1">
        <div>認証状態: {isAuthenticated ? '✅' : '❌'}</div>
        <div>ユーザー: {currentUser?.username || 'なし'}</div>
        <div>ユーザーID: {currentUser?.userId || currentUser?.id || 'なし'}</div>
        <div>アクセストークン: {currentUser?.accessToken ? '***' : 'なし'}</div>
        <div>投稿数: {posts?.length || 0}</div>
        <div>分析数: {analysis?.length || 0}</div>
        <div>アカウント分析: {accountAnalytics ? 'あり' : 'なし'}</div>
      </div>
      <button
        onClick={logout}
        className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
      >
        ログアウト
      </button>
    </div>
  );
};

export default DebugPanel; 