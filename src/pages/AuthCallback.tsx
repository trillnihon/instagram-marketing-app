import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setLoading, setError } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);

  // デバッグモード判定
  const isDebugMode = import.meta.env.VITE_DEBUG === 'true' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname.includes('127.0.0.1') ||
                      true; // 本番環境でもデバッグモードを有効化

  // ステップ別ログ関数
  const logStep = (step: number, message: string, data?: any) => {
    setCurrentStep(step);
    const timestamp = new Date().toISOString();
    
    // 常にログを出力（デバッグモードに関係なく）
    console.log(`🎯 [STEP ${step}] ${message}`, data ? data : '');
    console.log(`⏰ [STEP ${step}] タイムスタンプ: ${timestamp}`);
    
    // デバッグ情報を更新
    setDebugInfo((prev: any) => ({
      ...prev,
      currentStep: step,
      lastStepMessage: message,
      lastStepTimestamp: timestamp,
      stepHistory: [...(prev.stepHistory || []), { step, message, timestamp, data }],
      isDebugMode
    }));
  };

  // 即座にデバッグログを出力（常に実行）
  console.log('🚀 [FORCE DEBUG] AuthCallbackコンポーネントが実行されました');
  logStep(0, 'AuthCallbackコンポーネントが実行されました');
  console.log('📍 [FORCE DEBUG] AuthCallback - 現在のURL:', window.location.href);
  console.log('🔍 [FORCE DEBUG] AuthCallback - パス名:', window.location.pathname);
  console.log('📝 [FORCE DEBUG] AuthCallback - クエリ文字列:', window.location.search);
  console.log('🌐 [FORCE DEBUG] AuthCallback - ホスト名:', window.location.hostname);
  console.log('🔗 [FORCE DEBUG] AuthCallback - プロトコル:', window.location.protocol);

  const handleAuthCallback = async () => {
    try {
      logStep(1, '認証コールバック処理開始');
      setLoading?.(true);
      setError?.(null);

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const error_reason = urlParams.get('error_reason');
      const error_description = urlParams.get('error_description');

      logStep(2, 'URLパラメータ解析完了', {
        code: code ? `${code.substring(0, 10)}...` : null,
        state,
        error,
        error_reason,
        error_description,
        hasCode: !!code,
        hasState: !!state,
        codeLength: code?.length || 0,
        stateLength: state?.length || 0
      });

      // デバッグ情報を更新
      setDebugInfo((prev: any) => ({
        ...prev,
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
        userAgent: navigator.userAgent
      }));

      // Facebookからのエラーレスポンスをチェック
      if (error) {
        logStep(3, 'Facebook認証エラーを検出', { error, error_reason, error_description });
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
        logStep(4, '認証コードが見つからないためデモモードで継続');
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
          logStep(5, 'デモモードでダッシュボードにリダイレクト');
          alert('認証コードが見つかりませんでしたが、デモモードでアプリケーションを使用できます。');
          navigate('/dashboard');
        }, 3000);
        return;
      }

      logStep(6, '認証コード取得成功', {
        code: code.substring(0, 10) + '...',
        fullLength: code.length
      });

      // バックエンドサーバーへのリクエストを試行
      try {
        logStep(7, 'バックエンドAPI設定確認');
        // 環境に応じてAPI_BASE_URLを切り替え
        const API_BASE_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:4000' 
          : 'https://instagram-marketing-backend-v2.onrender.com';
        
        console.log('🌐 [DEBUG] AuthCallback - API_BASE_URL:', API_BASE_URL);
        
        const requestUrl = `${API_BASE_URL}/auth/instagram/callback`;
        const requestBody = JSON.stringify({ code, state });
        
        logStep(8, 'バックエンドへのリクエスト送信準備完了', {
          url: requestUrl,
          method: 'POST',
          bodyLength: requestBody.length,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        logStep(9, 'バックエンドからのレスポンス受信', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          const errorText = await response.text();
          logStep(10, 'バックエンドエラーを検出', {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
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
        logStep(11, '認証成功 - レスポンスデータ解析完了', {
          hasToken: !!data.token,
          hasUser: !!data.user,
          userInfo: data.user ? {
            id: data.user.id,
            username: data.user.username,
            media_count: data.user.media_count
          } : null
        });

        // トークンを保存
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          logStep(12, 'トークン保存完了');
        }

        setAuthenticated?.(true);
        setStatus('success');
        setErrorDetails('Instagram認証が完了しました！');
        
        // ダッシュボードにリダイレクト
        setTimeout(() => {
          logStep(13, 'ダッシュボードにリダイレクト');
          console.log('🔄 [DEBUG] AuthCallback - ダッシュボードにリダイレクト');
          navigate('/dashboard');
        }, 2000);

      } catch (fetchError) {
        logStep(14, 'フェッチエラー発生', {
          error: fetchError,
          message: fetchError instanceof Error ? fetchError.message : '不明なエラー',
          stack: fetchError instanceof Error ? fetchError.stack : undefined
        });
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
          logStep(15, 'エラー後デモモードで継続');
          console.log('🔄 [DEBUG] AuthCallback - エラー後デモモードで継続');
          setAuthenticated?.(true);
          navigate('/dashboard');
        }, 5000);
      }

    } catch (error) {
      logStep(16, '予期しないエラー発生', {
        error,
        message: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined
      });
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
        logStep(17, '予期しないエラー後デモモードで継続');
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
            <p><strong>現在のステップ:</strong> {currentStep}</p>
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