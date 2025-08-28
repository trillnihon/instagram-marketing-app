import React, { useState, useEffect } from 'react';
import { apiWithFallback } from '../services/mockApi';

interface ApiStatusMonitorProps {
  onStatusChange?: (status: any) => void;
}

const ApiStatusMonitor: React.FC<ApiStatusMonitorProps> = ({ onStatusChange }) => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    setIsLoading(true);
    try {
      const status = await apiWithFallback.checkProductionApiStatus();
      setApiStatus(status);
      setLastChecked(new Date());
      onStatusChange?.(status);
    } catch (error) {
      console.error('API状態確認エラー:', error);
      setApiStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
    // 5分ごとに自動チェック
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!apiStatus) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">API状態監視</h3>
        <p className="text-gray-600">API状態を確認中...</p>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 400 && status < 500) return '⚠️';
    if (status >= 500) return '❌';
    return '❓';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">本番API状態監視</h3>
        <button
          onClick={checkApiStatus}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '確認中...' : '再確認'}
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          API ベースURL: <code className="bg-gray-100 px-2 py-1 rounded">{apiStatus.apiBaseUrl}</code>
        </p>
        <p className="text-sm text-gray-600">
          最終確認: {lastChecked?.toLocaleString('ja-JP')}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            成功: {apiStatus.summary.successful}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            失敗: {apiStatus.summary.failed}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            エラー: {apiStatus.summary.errors}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(apiStatus.endpoints).map(([endpoint, result]: [string, any]) => (
          <div key={endpoint} className="border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {result.error ? '❌' : getStatusIcon(result.status)}
                </span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {endpoint}
                </code>
              </div>
              <div className="text-right">
                {result.error ? (
                  <span className="text-red-600 text-sm">接続エラー</span>
                ) : (
                  <div className="text-sm">
                    <span className={getStatusColor(result.status)}>
                      {result.status} {result.statusText}
                    </span>
                    <br />
                    <span className="text-gray-500">{result.responseTime}</span>
                  </div>
                )}
              </div>
            </div>
            {result.error && (
              <p className="text-red-600 text-sm mt-2">{result.error}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-900 mb-2">推奨アクション</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {apiStatus.summary.errors > 0 && (
            <li>• ネットワーク接続を確認してください</li>
          )}
          {apiStatus.summary.failed > 0 && (
            <li>• バックエンドAPIの実装状況を確認してください</li>
          )}
          {apiStatus.summary.successful === apiStatus.summary.total && (
            <li>• すべてのAPIが正常に動作しています</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ApiStatusMonitor;
