import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface DiagnosticResults {
  tokenValid: boolean;
  scopes: string[];
  missingScopes: string[];
  pagesAccessible: boolean;
  pages: any[];
  appMode: string;
  isTester: boolean;
  userInfo: any;
  errors: string[];
}

interface DiagnosticResponse {
  success: boolean;
  results: DiagnosticResults;
  solutions: string[];
  error?: string;
}

const FacebookDiagnostics: React.FC = () => {
  const { currentUser } = useAppStore();
  const accessToken = currentUser?.accessToken;
  const [results, setResults] = useState<DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    if (!accessToken) {
      setError('アクセストークンがありません。まずInstagram連携を行ってください。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://localhost:4000/api/diagnostics/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      const data: DiagnosticResponse = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || '診断に失敗しました');
      }
    } catch (err) {
      setError('診断ツールへの接続に失敗しました');
      console.error('Diagnostics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? '✅' : '❌';
  };

  const getStatusText = (condition: boolean) => {
    return condition ? '正常' : '問題あり';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔍 Facebook Graph API 診断ツール
      </h2>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading || !accessToken}
          className={`px-6 py-3 rounded-lg font-semibold text-white ${
            loading || !accessToken
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '診断中...' : '診断を実行'}
        </button>

        {!accessToken && (
          <p className="mt-2 text-sm text-red-600">
            アクセストークンが必要です。Instagram連携を先に実行してください。
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* 診断結果サマリー */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📊 診断結果サマリー</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl">{getStatusIcon(results.results.tokenValid)}</div>
                <div className="text-sm font-medium">トークン有効性</div>
                <div className="text-xs text-gray-600">{getStatusText(results.results.tokenValid)}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{getStatusIcon(results.results.pages.length > 0)}</div>
                <div className="text-sm font-medium">Facebookページ</div>
                <div className="text-xs text-gray-600">{results.results.pages.length}ページ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{getStatusIcon(results.results.missingScopes.length === 0)}</div>
                <div className="text-sm font-medium">権限スコープ</div>
                <div className="text-xs text-gray-600">{results.results.missingScopes.length}個不足</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{getStatusIcon(results.results.errors.length === 0)}</div>
                <div className="text-sm font-medium">エラー</div>
                <div className="text-xs text-gray-600">{results.results.errors.length}個</div>
              </div>
            </div>
          </div>

          {/* 詳細結果 */}
          <div className="space-y-4">
            {/* トークン情報 */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🔑 アクセストークン情報</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>有効性:</span>
                  <span className={results.results.tokenValid ? 'text-green-600' : 'text-red-600'}>
                    {getStatusIcon(results.results.tokenValid)} {getStatusText(results.results.tokenValid)}
                  </span>
                </div>
                {results.results.userInfo && (
                  <>
                    <div className="flex justify-between">
                      <span>ユーザー名:</span>
                      <span>{results.results.userInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>メール:</span>
                      <span>{results.results.userInfo.email || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* スコープ情報 */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🔐 権限スコープ</h4>
              <div className="space-y-2">
                {['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_manage_insights', 'public_profile', 'email'].map(scope => {
                  const hasScope = results.results.scopes.includes(scope);
                  return (
                    <div key={scope} className="flex justify-between">
                      <span className="text-sm">{scope}:</span>
                      <span className={hasScope ? 'text-green-600' : 'text-red-600'}>
                        {getStatusIcon(hasScope)} {hasScope ? '付与済み' : '未付与'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Facebookページ情報 */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">📄 Facebookページ</h4>
              {results.results.pages.length > 0 ? (
                <div className="space-y-2">
                  {results.results.pages.map((page, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">{page.name}</div>
                      <div className="text-sm text-gray-600">ID: {page.id}</div>
                      <div className="text-sm text-gray-600">
                        Instagram連携: {page.instagram_business_account ? '✅ 連携済み' : '❌ 未連携'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-600">Facebookページが見つかりません</p>
              )}
            </div>

            {/* アプリ情報 */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">⚙️ アプリ情報</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>モード:</span>
                  <span>{results.results.appMode === 'development' ? '開発モード' : '本番モード'}</span>
                </div>
                <div className="flex justify-between">
                  <span>テスター権限:</span>
                  <span className={results.results.isTester ? 'text-green-600' : 'text-red-600'}>
                    {getStatusIcon(results.results.isTester)} {results.results.isTester ? 'あり' : 'なし'}
                  </span>
                </div>
              </div>
            </div>

            {/* エラー情報 */}
            {results.results.errors.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-semibold mb-2 text-red-800">❌ エラー情報</h4>
                <ul className="space-y-1">
                  {results.results.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 解決策 */}
            {results.solutions.length > 0 && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold mb-2 text-blue-800">💡 推奨解決策</h4>
                <ul className="space-y-2">
                  {results.solutions.map((solution, index) => (
                    <li key={index} className="text-sm text-blue-700">• {solution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookDiagnostics; 