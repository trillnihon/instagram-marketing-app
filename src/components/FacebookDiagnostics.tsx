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
  methodSuccessRates?: {
    method1: boolean;
    method2: boolean;
    method3: boolean;
  };
  methodErrorAnalysis?: {
    method1: {
      success: boolean;
      status: number;
      statusText: string;
      error: string | null;
      recommendation: string | null;
    };
    method2: {
      success: boolean;
      status: number;
      statusText: string;
      error: string | null;
      recommendation: string | null;
    };
    method3: {
      success: boolean;
      status: number;
      statusText: string;
      error: string | null;
      recommendation: string | null;
    };
  };
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

            {/* 3段階データ取得方法の成功率 */}
            {results.results.methodSuccessRates && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔄 3段階データ取得方法の成功率</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>方法1: 基本ユーザー情報取得</span>
                    <span className={results.results.methodSuccessRates.method1 ? 'text-green-600' : 'text-red-600'}>
                      {getStatusIcon(results.results.methodSuccessRates.method1)} {results.results.methodSuccessRates.method1 ? '成功' : '失敗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>方法2: Facebookページ経由取得</span>
                    <span className={results.results.methodSuccessRates.method2 ? 'text-green-600' : 'text-red-600'}>
                      {getStatusIcon(results.results.methodSuccessRates.method2)} {results.results.methodSuccessRates.method2 ? '成功' : '失敗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>方法3: Instagramアカウント直接取得</span>
                    <span className={results.results.methodSuccessRates.method3 ? 'text-green-600' : 'text-red-600'}>
                      {getStatusIcon(results.results.methodSuccessRates.method3)} {results.results.methodSuccessRates.method3 ? '成功' : '失敗'}
                    </span>
                  </div>
                  
                  {/* 成功率サマリー */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between font-medium">
                      <span>総合成功率:</span>
                      <span className="text-blue-600">
                        {Object.values(results.results.methodSuccessRates).filter(Boolean).length}/
                        {Object.keys(results.results.methodSuccessRates).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 詳細なエラー分析 */}
            {results.results.methodErrorAnalysis && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔍 詳細なエラー分析</h4>
                <div className="space-y-3">
                  {Object.entries(results.results.methodErrorAnalysis).map(([methodKey, analysis]) => (
                    <div key={methodKey} className={`p-3 rounded-lg ${analysis.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="font-medium mb-2">
                        {methodKey === 'method1' && '方法1: 基本ユーザー情報取得'}
                        {methodKey === 'method2' && '方法2: Facebookページ経由取得'}
                        {methodKey === 'method3' && '方法3: Instagramアカウント直接取得'}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>ステータス:</span>
                          <span className={analysis.success ? 'text-green-600' : 'text-red-600'}>
                            {analysis.status} {analysis.statusText}
                          </span>
                        </div>
                        
                        {!analysis.success && analysis.error && (
                          <div className="text-red-600">
                            <strong>エラー:</strong> {analysis.error}
                          </div>
                        )}
                        
                        {!analysis.success && analysis.recommendation && (
                          <div className="text-blue-600">
                            <strong>推奨事項:</strong> {analysis.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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