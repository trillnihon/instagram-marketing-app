import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const ErrorPanel: React.FC = () => {
  const { errors, resolveError, clearErrors, getErrorStats } = useAppStore();
  const [is404Error, setIs404Error] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>({});

  // 404エラーの検出
  useEffect(() => {
    const check404Error = () => {
      const pathname = window.location.pathname;
      const search = window.location.search;
      
      // Instagram認証コールバックの404エラーを検出
      if (pathname === '/auth/instagram/callback') {
        const urlParams = new URLSearchParams(search);
        const error = urlParams.get('error');
        const error_reason = urlParams.get('error_reason');
        const error_description = urlParams.get('error_description');
        
        if (error || error_reason || error_description) {
          setIs404Error(true);
          setErrorDetails({
            error,
            error_reason,
            error_description,
            pathname,
            search,
            timestamp: new Date().toISOString()
          });
          
          console.error('🚨 [404 ERROR] Instagram認証コールバックエラー:', {
            error,
            error_reason,
            error_description,
            pathname,
            search
          });
        }
      }
    };

    check404Error();
    
    // URL変更を監視
    const handleUrlChange = () => {
      check404Error();
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // 404エラー専用の表示
  if (is404Error) {
    return (
      <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md z-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-red-800">
            🚨 Instagram認証エラー
          </h3>
          <button
            onClick={() => setIs404Error(false)}
            className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            閉じる
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="bg-white border border-red-200 rounded p-3">
            <p className="text-sm font-medium text-red-800">
              認証プロセスでエラーが発生しました
            </p>
            <p className="text-xs text-red-600 mt-1">
              エラー: {errorDetails.error || '不明なエラー'}
            </p>
            {errorDetails.error_reason && (
              <p className="text-xs text-red-600">
                理由: {errorDetails.error_reason}
              </p>
            )}
            {errorDetails.error_description && (
              <p className="text-xs text-red-600">
                詳細: {errorDetails.error_description}
              </p>
            )}
            <details className="mt-2">
              <summary className="text-xs text-gray-600 cursor-pointer">
                デバッグ情報
              </summary>
              <pre className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.href = '/login'}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ログイン画面へ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // undefinedチェック
  if (!errors || !resolveError || !clearErrors || !getErrorStats) {
    return null;
  }

  const stats = getErrorStats();
  const unresolvedErrors = errors.filter(e => !e.resolved);
  const debugInfos = errors
    .filter(e => e.details?.debug)
    .map(e => (typeof e.details === 'object' && e.details?.debug ? e.details.debug : null))
    .filter(Boolean);

  const handleResolveError = (errorId: string) => {
    resolveError(errorId);
  };

  const handleClearAllErrors = () => {
    clearErrors();
  };

  const handleCopyDebugInfo = () => {
    const debugText = debugInfos.map(info => JSON.stringify(info, null, 2)).join('\n\n');
    navigator.clipboard.writeText(debugText);
    alert('デバッグ情報をクリップボードにコピーしました');
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-red-800">
          ⚠️ エラー ({unresolvedErrors.length})
        </h3>
        <div className="flex space-x-2">
          {debugInfos.length > 0 && (
            <button
              onClick={handleCopyDebugInfo}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              デバッグ情報
            </button>
          )}
          <button
            onClick={handleClearAllErrors}
            className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {unresolvedErrors.map((error) => (
          <div key={error.id} className="bg-white border border-red-200 rounded p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  {error.type}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {error.message}
                </p>
                {error.details?.debug && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer">
                      デバッグ情報
                    </summary>
                    <pre className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(error.details.debug, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <button
                onClick={() => handleResolveError(error.id)}
                className="ml-2 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                解決
              </button>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="mt-3 pt-3 border-t border-red-200 text-xs text-red-600">
          <div>総エラー数: {stats.total}</div>
          <div>未解決: {stats.unresolved}</div>
          <div>解決済み: {stats.resolved}</div>
        </div>
      )}
    </div>
  );
};

export default ErrorPanel; 