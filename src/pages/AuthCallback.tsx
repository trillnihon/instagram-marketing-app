import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { handleInstagramCallback } from '../services/instagramApi';

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
      // [STEP 2] コールバック処理開始
      logStep(2, 'コールバック処理開始');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const error_reason = urlParams.get('error_reason');
      const error_description = urlParams.get('error_description');

      // [STEP 3] URLパラメータ取得完了
      logStep(3, 'URLパラメータ取得完了', { code: !!code, state: !!state, error, error_reason, error_description });

      if (error) {
        // [STEP 4] エラー発生
        logStep(4, 'エラー発生', { error, error_reason, error_description });
        setErrorDetails(`認証エラー: ${error} - ${error_description || error_reason || '不明なエラー'}`);
        setStatus('error');
        setLoading?.(false);
        return;
      }

      if (!code) {
        // [STEP 5] コード未取得
        logStep(5, 'コード未取得');
        setErrorDetails('認証コードが取得できませんでした。');
        setStatus('error');
        setLoading?.(false);
        return;
      }

      // [STEP 6] Instagram API呼び出し開始
      logStep(6, 'Instagram API呼び出し開始', { code: code.substring(0, 10) + '...' });

      const response = await handleInstagramCallback();
      
      // [STEP 7] Instagram API呼び出し完了
      logStep(7, 'Instagram API呼び出し完了', { success: !!response });

      if (response.success) {
        // [STEP 8] 認証成功
        logStep(8, '認証成功');
        setAuthenticated?.(true);
        setStatus('success');
        setLoading?.(false);
        
        // [STEP 9] ダッシュボードへリダイレクト
        logStep(9, 'ダッシュボードへリダイレクト');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // [STEP 10] 認証失敗
        logStep(10, '認証失敗', { error: response.error });
        setErrorDetails(response.error || '認証に失敗しました。');
        setStatus('error');
        setLoading?.(false);
      }
    } catch (error) {
      // [STEP 11] 例外発生
      logStep(11, '例外発生', { error: error instanceof Error ? error.message : '不明なエラー' });
      console.error('AuthCallback error:', error);
      setErrorDetails(error instanceof Error ? error.message : '予期しないエラーが発生しました。');
      setStatus('error');
      setLoading?.(false);
    }
  };

  useEffect(() => {
    // [STEP 1] AuthCallback マウント完了
    logStep(1, 'AuthCallback マウント完了');
    console.log('🎯 [STEP 1] AuthCallback マウント完了');
    console.log('📍 [STEP 1] 現在のURL:', window.location.href);
    console.log('🔍 [STEP 1] パス名:', window.location.pathname);
    console.log('📝 [STEP 1] クエリ文字列:', window.location.search);
    
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