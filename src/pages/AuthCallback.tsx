import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 [AUTH] Instagram認証コールバック処理開始');
        
        // URLからcodeを抽出
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        console.log('🔍 [AUTH] URLパラメータ:', {
          code: code ? code.substring(0, 10) + '...' : 'なし',
          error,
          errorDescription,
          fullUrl: window.location.href
        });

        // エラーチェック
        if (error) {
          console.error('❌ [AUTH] Facebook認証エラー:', error, errorDescription);
          setErrorDetails(`認証エラー: ${errorDescription || error}`);
          setStatus('error');
          return;
        }

        // codeがない場合
        if (!code) {
          console.error('❌ [AUTH] 認証コードが取得できませんでした');
          setErrorDetails('認証コードが取得できませんでした。認証フローを再実行してください。');
          setStatus('error');
          return;
        }

        // バックエンドにcodeを送信
        console.log('🔍 [AUTH] バックエンドに認証コードを送信中...');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
        
        const response = await fetch(`${apiBaseUrl}/auth/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [AUTH] バックエンド認証失敗:', response.status, errorText);
          setErrorDetails(`認証処理に失敗しました: ${errorText}`);
          setStatus('error');
          return;
        }

        const data = await response.json();
        console.log('✅ [AUTH] 認証成功:', data);

        if (data.success) {
          setUserInfo(data.data);
          setStatus('success');
          
          // 3秒後にダッシュボードにリダイレクト
          setTimeout(() => {
            console.log('🚀 [AUTH] ダッシュボードにリダイレクト');
            navigate('/dashboard');
          }, 3000);
        } else {
          console.error('❌ [AUTH] 認証レスポンスが失敗:', data.error);
          setErrorDetails(data.error || '認証処理に失敗しました');
          setStatus('error');
        }

      } catch (error) {
        console.error('💥 [AUTH] 認証処理中にエラー:', error);
        setErrorDetails('認証処理中にエラーが発生しました。ネットワーク接続を確認してください。');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  // エラー表示
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Instagram認証エラー
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {errorDetails}
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                ログイン画面へ
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 成功表示
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              認証成功しました！
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              長期トークンをMongoDBに保存しました
            </p>
            {userInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-2">認証情報</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>ユーザーID: {userInfo.userId}</div>
                  <div>ユーザー名: {userInfo.userName}</div>
                  <div>有効期限: {Math.floor(userInfo.expiresIn / 86400)}日</div>
                  <div>取得日時: {new Date(userInfo.obtainedAt).toLocaleString('ja-JP')}</div>
                </div>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-500">
              ダッシュボードにリダイレクトしています...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ローディング表示
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Instagram認証中...
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            認証コードを処理中です。しばらくお待ちください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

  // エラー表示
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Instagram認証エラー
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {errorDetails}
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                ログイン画面へ
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 成功表示
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              認証成功！
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              ダッシュボードにリダイレクトしています...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ローディング表示
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Instagram認証中...
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            認証処理を実行中です。しばらくお待ちください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 