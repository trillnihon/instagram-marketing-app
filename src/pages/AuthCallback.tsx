import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { instagramAuth } from '../services/instagramAuth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setError, setLoading } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const isProcessing = useRef(false);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setLoading?.(true);
      setError?.(null);

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code) {
        throw new Error('認証コードが取得できませんでした');
      }

      const response = await fetch('/api/auth/instagram/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });

      const authData = await response.json();

      if (authData.success) {
        setAuthenticated?.(true);
        navigate('/dashboard');
      } else {
        throw new Error(authData.error || '認証に失敗しました');
      }
    } catch (error) {
      console.error('認証コールバックエラー:', error);
      setError?.(error instanceof Error ? error.message : '認証に失敗しました');
    } finally {
      setLoading?.(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Instagram認証中...
          </h2>
          <p className="text-gray-600">
            認証情報を処理しています。しばらくお待ちください。
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            認証成功！
          </h2>
          <p className="text-gray-600 mb-4">
            Instagramアカウントの認証が完了しました。
          </p>
          <p className="text-sm text-gray-500">
            ダッシュボードにリダイレクトしています...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          認証エラー
        </h2>
        <p className="text-gray-600 mb-4">
          認証に失敗しました。もう一度お試しください。
        </p>
        <p className="text-sm text-gray-500">
          ログインページにリダイレクトしています...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback; 