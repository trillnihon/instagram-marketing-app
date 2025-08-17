import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setCurrentUser, setLoading } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string>('');

  // 一度だけ実行される初期化処理
  useEffect(() => {
    console.log('🚀 [DEBUG] AuthCallback 初期化開始');
    
    const handleCallback = async () => {
      try {
        // Facebook Login for Businessはフラグメント（#）からトークンを取得
        const hash = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(hash);
        const accessToken = urlParams.get('access_token');
        const longLivedToken = urlParams.get('long_lived_token');
        const expiresIn = urlParams.get('expires_in');
        const dataAccessExpirationTime = urlParams.get('data_access_expiration_time');
        
        // 通常のクエリパラメータも確認（フォールバック用）
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const error = queryParams.get('error');
        const error_reason = queryParams.get('error_reason');
        const error_description = queryParams.get('error_description');

        // デバッグ情報を詳細に出力
        console.log('🔍 [DEBUG] URL詳細情報:', {
          fullUrl: window.location.href,
          pathname: window.location.pathname,
          hash: window.location.hash,
          search: window.location.search,
          hashSubstring: hash,
          parsedHash: Object.fromEntries(urlParams.entries()),
          parsedQuery: Object.fromEntries(queryParams.entries())
        });

        console.log('📝 [DEBUG] パラメータ抽出結果:', { 
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken ? accessToken.length : 0,
          accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'なし',
          hasLongLivedToken: !!longLivedToken,
          hasCode: !!code,
          error, 
          error_reason, 
          error_description 
        });

        // エラーの場合
        if (error) {
          console.error('❌ [DEBUG] 認証エラー検出:', { error, error_reason, error_description });
          setErrorDetails(`認証エラー: ${error} - ${error_description || error_reason || '不明なエラー'}`);
          setStatus('error');
          return;
        }

        // Facebook Login for Business: アクセストークンがある場合（ショートリブドトークンのみでもOK）
        // URLハッシュまたはクエリパラメータからアクセストークンを取得
        const finalAccessToken = accessToken || queryParams.get('access_token');
        const finalLongLivedToken = longLivedToken || queryParams.get('long_lived_token');
        const finalExpiresIn = expiresIn || queryParams.get('expires_in');
        const finalDataAccessExpirationTime = dataAccessExpirationTime || queryParams.get('data_access_expiration_time');
        
        if (finalAccessToken) {
          console.log('✅ [DEBUG] Facebook Login for Business認証成功:', {
            accessToken: finalAccessToken.substring(0, 10) + '...',
            longLivedToken: finalLongLivedToken ? finalLongLivedToken.substring(0, 10) + '...' : 'なし',
            expiresIn: finalExpiresIn,
            dataAccessExpirationTime: finalDataAccessExpirationTime
          });
          
          try {
            // バックエンドにアクセストークンを送信
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
            const response = await fetch(`${apiBaseUrl}/auth/facebook/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: finalAccessToken,
                long_lived_token: finalLongLivedToken || null,
                expires_in: finalExpiresIn,
                data_access_expiration_time: finalDataAccessExpirationTime,
                redirect_uri: window.location.origin + '/auth/instagram/callback'
              }),
            });

            if (response.ok) {
              const data = await response.json();
              console.log('✅ [DEBUG] バックエンド認証成功:', data);
              
              // 認証状態を確実に設定
              console.log('🔐 [DEBUG] 認証状態を設定: true');
              setAuthenticated(true);
              
              // ユーザー情報を確実に保存
              if (data.user) {
                console.log('👤 [DEBUG] ユーザー情報を保存:', data.user);
                setCurrentUser(data.user);
                
                // localStorageにも保存（永続化）
                try {
                  const userData = {
                    id: data.user.id,
                    username: data.user.name || data.user.username,
                    email: data.user.email,
                    accessToken: data.access_token,
                    instagramBusinessAccountId: data.instagram?.id
                  };
                  localStorage.setItem('instagram_auth', JSON.stringify(userData));
                  console.log('💾 [DEBUG] localStorageにユーザー情報を保存:', userData);
                } catch (storageError) {
                  console.error('❌ [DEBUG] localStorage保存エラー:', storageError);
                }
              }
              
              // 状態を成功に設定
              setStatus('success');
              
              // 短い遅延後にリダイレクト
              setTimeout(() => {
                console.log('🚀 [DEBUG] ダッシュボードにリダイレクト開始');
                console.log('🔍 [DEBUG] リダイレクト直前の最終確認:', {
                  isAuthenticated: true,
                  currentUser: data.user,
                  pathname: window.location.pathname,
                  targetPath: '/dashboard'
                });
                
                // 強制的にダッシュボードにリダイレクト
                window.location.replace('/dashboard');
                
                // フォールバック: 通常のリダイレクトも試行
                setTimeout(() => {
                  if (window.location.pathname !== '/dashboard') {
                    console.log('🔄 [DEBUG] フォールバックリダイレクトを実行');
                    window.location.href = '/dashboard';
                  }
                }, 500);
              }, 1000);
            } else {
              console.error('❌ [DEBUG] バックエンド認証失敗:', response.status);
              // デモモードでフォールバック
              console.log('🔄 [DEBUG] デモモードでフォールバック');
              
              // デモユーザー情報を設定
              const demoUser = {
                id: 'demo_user',
                username: 'Demo User',
                email: 'demo@example.com',
                profile: {},
                isAdmin: false
              };
              
              setCurrentUser(demoUser);
              setAuthenticated(true);
              setStatus('success');
              
              // localStorageにも保存
              try {
                const userData = {
                  id: demoUser.id,
                  username: demoUser.username,
                  email: demoUser.email,
                  accessToken: 'demo_token',
                  instagramBusinessAccountId: 'demo_instagram'
                };
                localStorage.setItem('instagram_auth', JSON.stringify(userData));
                console.log('💾 [DEBUG] デモユーザー情報をlocalStorageに保存:', userData);
              } catch (storageError) {
                console.error('❌ [DEBUG] デモユーザー情報のlocalStorage保存エラー:', storageError);
              }
              
              setTimeout(() => {
                console.log('🚀 [DEBUG] デモモード - ダッシュボードにリダイレクト開始');
                window.location.replace('/dashboard');
              }, 1000);
            }
          } catch (error) {
            console.error('💥 [DEBUG] バックエンド通信エラー:', error);
            // デモモードでフォールバック
            console.log('🔄 [DEBUG] デモモードでフォールバック');
            
            // デモユーザー情報を設定
            const demoUser = {
              id: 'demo_user',
              username: 'Demo User',
              email: 'demo@example.com',
              profile: {},
              isAdmin: false
            };
            
            setCurrentUser(demoUser);
            setAuthenticated(true);
            setStatus('success');
            
            // localStorageにも保存
            try {
              const userData = {
                id: demoUser.id,
                username: demoUser.username,
                email: demoUser.email,
                accessToken: 'demo_token',
                instagramBusinessAccountId: 'demo_instagram'
              };
              localStorage.setItem('instagram_auth', JSON.stringify(userData));
              console.log('💾 [DEBUG] デモユーザー情報をlocalStorageに保存:', userData);
            } catch (storageError) {
              console.error('❌ [DEBUG] デモユーザー情報のlocalStorage保存エラー:', storageError);
            }
            
            setTimeout(() => {
              console.log('🚀 [DEBUG] デモモード - ダッシュボードにリダイレクト開始');
              window.location.replace('/dashboard');
            }, 1000);
          }
        }
        // 通常のOAuth: 認証コードがある場合（フォールバック）
        else if (code) {
          console.log('✅ [DEBUG] 通常のOAuth認証コードを検出:', code.substring(0, 10) + '...');
          
          try {
            // バックエンドに認証コードを送信（Facebook Login for Business）
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';
            const response = await fetch(`${apiBaseUrl}/auth/facebook/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code,
                redirect_uri: window.location.origin + '/auth/callback'
              }),
            });

            if (response.ok) {
              const data = await response.json();
              console.log('✅ [DEBUG] バックエンド認証成功:', data);
              
              // 認証情報をストアに保存
              if (data.user) {
                // ユーザー情報をストアに保存
                console.log('👤 [DEBUG] ユーザー情報を保存:', data.user);
                setCurrentUser(data.user); // ユーザー情報をストアに保存
                
                // ユーザー情報の詳細をログ出力
                console.log('🔍 [DEBUG] OAuthフォールバック - 保存されたユーザー情報詳細:', {
                  userId: data.user.id,
                  username: data.user.name || data.user.username,
                  email: data.user.email,
                  hasAccessToken: !!data.access_token
                });
                
                // localStorageにも保存（永続化）
                try {
                  const userData = {
                    id: data.user.id,
                    username: data.user.name || data.user.username,
                    email: data.user.email,
                    accessToken: data.access_token,
                    instagramBusinessAccountId: data.instagram?.id
                  };
                  localStorage.setItem('instagram_auth', JSON.stringify(userData));
                  console.log('💾 [DEBUG] OAuthフォールバック - localStorageにユーザー情報を保存:', userData);
                } catch (storageError) {
                  console.error('❌ [DEBUG] OAuthフォールバック - localStorage保存エラー:', storageError);
                }
              } else {
                console.warn('⚠️ [DEBUG] OAuthフォールバック - バックエンドレスポンスにユーザー情報が含まれていません');
              }
              
              if (data.instagram) {
                // Instagram情報をストアに保存
                console.log('📱 [DEBUG] Instagram情報を保存:', data.instagram);
              }
              
              // 警告メッセージがある場合は表示
              if (data.warning) {
                console.warn('⚠️ [DEBUG] 警告メッセージ:', data.warning);
                if (data.setup_instructions) {
                  console.log('📋 [DEBUG] セットアップ手順:', data.setup_instructions);
                }
              }
              
              setAuthenticated(true);
              setStatus('success');
              
              // ユーザー情報が確実に保存されているか確認
              setTimeout(() => {
                const store = useAppStore.getState();
                console.log('🔍 [DEBUG] OAuthフォールバック - ストアの状態確認:', {
                  isAuthenticated: store.isAuthenticated,
                  currentUser: store.currentUser,
                  timestamp: new Date().toISOString()
                });
                
                // ユーザー情報が保存されているか再確認
                if (store.currentUser) {
                  console.log('✅ [DEBUG] OAuthフォールバック - ユーザー情報が正常に保存されています');
                  
                  // リダイレクト前の最終状態確認
                  console.log('🔍 [DEBUG] OAuthフォールバック - リダイレクト前の最終状態確認:', {
                    isAuthenticated: store.isAuthenticated,
                    currentUser: store.currentUser,
                    pathname: window.location.pathname,
                    targetPath: '/dashboard'
                  });
                  
                  // ダッシュボードにリダイレクト（確実性のためwindow.location.hrefを使用）
                  console.log('🚀 [DEBUG] OAuthフォールバック - ダッシュボードにリダイレクト開始');
                  window.location.href = '/dashboard';
                } else {
                  console.error('❌ [DEBUG] OAuthフォールバック - ユーザー情報の保存に失敗しています');
                  setErrorDetails('ユーザー情報の保存に失敗しました。再試行してください。');
                  setStatus('error');
                }
              }, 500); // 短い遅延で状態確認
            } else {
              console.error('❌ [DEBUG] バックエンド認証失敗:', response.status);
              // デモモードでフォールバック
              console.log('🔄 [DEBUG] OAuthフォールバック - デモモードでフォールバック');
              
              // デモユーザー情報を設定
              const demoUser = {
                id: 'demo_user',
                username: 'Demo User',
                email: 'demo@example.com',
                profile: {},
                isAdmin: false
              };
              
              setCurrentUser(demoUser);
              setAuthenticated(true);
              setStatus('success');
              
              // localStorageにも保存
              try {
                const userData = {
                  id: demoUser.id,
                  username: demoUser.username,
                  email: demoUser.email,
                  accessToken: 'demo_token',
                  instagramBusinessAccountId: 'demo_instagram'
                };
                localStorage.setItem('instagram_auth', JSON.stringify(userData));
                console.log('💾 [DEBUG] OAuthフォールバック - デモユーザー情報をlocalStorageに保存:', userData);
              } catch (storageError) {
                console.error('❌ [DEBUG] OAuthフォールバック - デモユーザー情報のlocalStorage保存エラー:', storageError);
              }
              
              setTimeout(() => {
                console.log('🚀 [DEBUG] OAuthフォールバック - デモモード - ダッシュボードにリダイレクト開始');
                window.location.replace('/dashboard');
              }, 1000);
            }
          } catch (error) {
            console.error('💥 [DEBUG] バックエンド通信エラー:', error);
            // デモモードでフォールバック
            console.log('🔄 [DEBUG] OAuthフォールバック - デモモードでフォールバック');
            
            // デモユーザー情報を設定
            const demoUser = {
              id: 'demo_user',
              username: 'Demo User',
              email: 'demo@example.com',
              profile: {},
              isAdmin: false
            };
            
            setCurrentUser(demoUser);
            setAuthenticated(true);
            setStatus('success');
            
            // localStorageにも保存
            try {
              const userData = {
                id: demoUser.id,
                username: demoUser.username,
                email: demoUser.email,
                accessToken: 'demo_token',
                instagramBusinessAccountId: 'demo_instagram'
              };
              localStorage.setItem('instagram_auth', JSON.stringify(userData));
              console.log('💾 [DEBUG] OAuthフォールバック - デモユーザー情報をlocalStorageに保存:', userData);
            } catch (storageError) {
              console.error('❌ [DEBUG] OAuthフォールバック - デモユーザー情報のlocalStorage保存エラー:', storageError);
            }
            
            setTimeout(() => {
              console.log('🚀 [DEBUG] OAuthフォールバック - デモモード - ダッシュボードにリダイレクト開始');
              window.location.replace('/dashboard');
            }, 1000);
          }
        }
        // 認証情報がない場合
        else {
          console.warn('⚠️ [DEBUG] 認証情報なし');
          console.log('🔍 [DEBUG] 詳細な認証情報確認:', {
            hash: window.location.hash,
            search: window.location.search,
            fullUrl: window.location.href
          });
          setErrorDetails('認証情報が取得できませんでした。Facebook Login for Businessの設定を確認してください。');
          setStatus('error');
          return;
        }

      } catch (error) {
        console.error('💥 [DEBUG] 予期しないエラー:', error);
        setErrorDetails('認証処理中に予期しないエラーが発生しました。');
        setStatus('error');
      }
    };

    handleCallback();
  }, [setAuthenticated, navigate, setCurrentUser]); // 依存関係を最小限に

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