import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setLoading, setError } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [errorDetails, setErrorDetails] = useState<string>('');

  // 即座にデバッグログを出力
  console.log('🎯 [DEBUG] AuthCallbackコンポーネントが実行されました！');
  console.log('📍 [DEBUG] AuthCallback - 現在のURL:', window.location.href);
  console.log('🔍 [DEBUG] AuthCallback - パス名:', window.location.pathname);
  console.log('📝 [DEBUG] AuthCallback - クエリ文字列:', window.location.search);
  console.log('🌐 [DEBUG] AuthCallback - ホスト名:', window.location.hostname);
  console.log('🔗 [DEBUG] AuthCallback - プロトコル:', window.location.protocol);

  const handleAuthCallback = async () => {
    try {
      console.log('🔄 [DEBUG] AuthCallback - 処理開始');
      console.log('📍 [DEBUG] AuthCallback - 現在のURL:', window.location.href);
      
      setLoading?.(true);
      setError?.(null);

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const error_reason = urlParams.get('error_reason');
      const error_description = urlParams.get('error_description');

      console.log('🔍 [DEBUG] AuthCallback - 詳細URLパラメータ:', {
        code: code ? `${code.substring(0, 10)}...` : null,
        state,
        error,
        error_reason,
        error_description,
        hasCode: !!code,
        hasState: !!state,
        codeLength: code?.length || 0,
        stateLength: state?.length || 0,
        timestamp: new Date().toISOString()
      });

      // デバッグ情報を更新
      setDebugInfo({
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        code: code ? `${code.substring(0, 10)}...` : null,
        state,
        error,
        error_reason,
        error_description,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Facebookからのエラーレスポンスをチェック
      if (error) {
        const errorMessage = `Facebook認証エラー: ${error} - ${error_description || error_reason || '不明なエラー'}`;
        console.error('❌ [DEBUG] AuthCallback - Facebook認証エラー:', {
          error,
          error_reason,
          error_description,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
        setErrorDetails(errorMessage);
        setStatus('error');
        setError?.(errorMessage);
        return;
      }

      if (!code) {
        console.warn('⚠️ [DEBUG] AuthCallback - 認証コードが見つかりません');
        console.log('🔍 [DEBUG] AuthCallback - 詳細調査:', {
          searchParams: window.location.search,
          urlParams: Array.from(urlParams.entries()),
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        });
        
        // 認証コードがない場合でも、デモモードで処理を継続
        setAuthenticated?.(true);
        setStatus('success');
        setErrorDetails('認証コードが見つかりませんでしたが、デモモードでアプリケーションを使用できます。');
        setTimeout(() => {
          alert('認証コードが見つかりませんでしたが、デモモードでアプリケーションを使用できます。');
          navigate('/dashboard');
        }, 3000);
        return;
      }

      console.log('✅ [DEBUG] 認証コード取得成功:', {
        code: code.substring(0, 10) + '...',
        fullLength: code.length,
        timestamp: new Date().toISOString()
      });

      // バックエンドサーバーへのリクエストを試行
      try {
        // 環境に応じてAPI_BASE_URLを切り替え
        const API_BASE_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:4000' 
          : 'https://instagram-marketing-backend-v2.onrender.com';
        
        console.log('🌐 [DEBUG] AuthCallback - API_BASE_URL:', API_BASE_URL);
        
        const requestUrl = `${API_BASE_URL}/auth/instagram/callback`;
        const requestBody = JSON.stringify({ code, state });
        
        console.log('📤 [DEBUG] AuthCallback - リクエスト送信:', {
          url: requestUrl,
          method: 'POST',
          bodyLength: requestBody.length,
          headers: {
            'Content-Type': 'application/json'
          },
          timestamp: new Date().toISOString()
        });
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        console.log('📥 [DEBUG] AuthCallback - レスポンス受信:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [DEBUG] AuthCallback - バックエンドエラー:', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            url: requestUrl,
            timestamp: new Date().toISOString()
          });
          throw new Error(`バックエンドエラー: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [DEBUG] AuthCallback - 認証成功:', {
          hasToken: !!data.token,
          hasUser: !!data.user,
          timestamp: new Date().toISOString()
        });

        // トークンを保存
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          console.log('💾 [DEBUG] AuthCallback - トークン保存完了');
        }

        setAuthenticated?.(true);
        setStatus('success');
        setErrorDetails('Instagram認証が完了しました！');
        
        // ダッシュボードにリダイレクト
        setTimeout(() => {
          console.log('🔄 [DEBUG] AuthCallback - ダッシュボードにリダイレクト');
          navigate('/dashboard');
        }, 2000);

      } catch (fetchError) {
        console.error('❌ [DEBUG] AuthCallback - フェッチエラー:', {
          error: fetchError,
          message: fetchError instanceof Error ? fetchError.message : '不明なエラー',
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'バックエンドとの通信に失敗しました';
        setErrorDetails(errorMessage);
        setStatus('error');
        setError?.(errorMessage);
        
        // エラーが発生してもデモモードで継続
        setTimeout(() => {
          console.log('🔄 [DEBUG] AuthCallback - エラー後デモモードで継続');
          setAuthenticated?.(true);
          navigate('/dashboard');
        }, 5000);
      }

    } catch (error) {
      console.error('❌ [DEBUG] AuthCallback - 予期しないエラー:', {
        error,
        message: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました';
      setErrorDetails(errorMessage);
      setStatus('error');
      setError?.(errorMessage);
      
      // エラーが発生してもデモモードで継続
      setTimeout(() => {
        console.log('🔄 [DEBUG] AuthCallback - 予期しないエラー後デモモードで継続');
        setAuthenticated?.(true);
        navigate('/dashboard');
      }, 5000);
    } finally {
      setLoading?.(false);
    }
  };

  useEffect(() => {
    console.log('🔄 [DEBUG] AuthCallback - useEffect実行');
    handleAuthCallback();
  }, []);

  // デバッグ情報表示
  const renderDebugInfo = () => {
    // 開発環境判定（process.env.NODE_ENVの代わりにwindow.location.hostnameを使用）
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    
    if (isDevelopment) {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🔍 デバッグ情報</h3>
          <div className="text-sm">
            <p><strong>ステータス:</strong> {status}</p>
            <p><strong>エラー詳細:</strong> {errorDetails || 'なし'}</p>
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">詳細情報</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Instagram認証処理中...</h2>
              <p className="text-gray-600">認証情報を処理しています。しばらくお待ちください。</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-500 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">認証完了！</h2>
              <p className="text-gray-600">{errorDetails || 'Instagram認証が正常に完了しました。'}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">認証エラー</h2>
              <p className="text-gray-600">{errorDetails}</p>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  デモモードで続行
                </button>
              </div>
            </>
          )}
        </div>
        
        {renderDebugInfo()}
      </div>
    </div>
  );
};

export default AuthCallback; 