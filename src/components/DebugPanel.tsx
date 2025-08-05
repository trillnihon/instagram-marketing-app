import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

const DebugPanel: React.FC = () => {
  const { isAuthenticated, currentUser, accountAnalytics, posts, analysis, logout } = useAppStore();
  const [debugInfo, setDebugInfo] = useState<any>({});

  // デバッグ情報を収集
  useEffect(() => {
    const info = {
      pathname: window.location.pathname,
      search: window.location.search,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      href: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      isInstagramCallback: window.location.pathname === '/auth/instagram/callback',
      hasCode: window.location.search.includes('code='),
      hasError: window.location.search.includes('error=')
    };
    setDebugInfo(info);
  }, []);

  // 常に表示（本番環境でも）
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔧 デバッグ情報</h3>
      <div className="space-y-1">
        <div>認証状態: {isAuthenticated ? '✅' : '❌'}</div>
        <div>ユーザー: {currentUser?.username || 'なし'}</div>
        <div>パス: {debugInfo.pathname}</div>
        <div>クエリ: {debugInfo.search || 'なし'}</div>
        <div>Instagramコールバック: {debugInfo.isInstagramCallback ? '✅' : '❌'}</div>
        <div>認証コード: {debugInfo.hasCode ? '✅' : '❌'}</div>
        <div>エラー: {debugInfo.hasError ? '⚠️' : '❌'}</div>
        <div>ホスト: {debugInfo.hostname}</div>
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