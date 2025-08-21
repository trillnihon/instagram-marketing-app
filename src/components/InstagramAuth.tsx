import React, { useState, useEffect } from 'react';
import { 
  startInstagramAuth, 
  handleInstagramCallback, 
  saveInstagramAuth, 
  getInstagramAuth,
  clearInstagramAuth,
  isInstagramAuthenticated 
} from '../services/instagramApi';
import { InstagramBusinessAccount, InstagramMedia } from '../types';
import Navigation from './Navigation';
import { useAppStore } from '../store/useAppStore';
import { instagramAuth } from '../services/instagramAuth';

const InstagramAuth: React.FC = () => {
  const { currentUser, isAuthenticated, setCurrentUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{
    accessToken: string;
    instagramBusinessAccount: InstagramBusinessAccount;
    recentPosts: InstagramMedia[];
    savedAt?: string;
  } | null>(null);
  
  // アカウント情報の状態
  const [accountInfo, setAccountInfo] = useState<{
    id: string;
    username: string;
    media_count: number;
    followers_count: number;
    follows_count: number;
    biography: string;
    profile_picture_url: string;
  } | null>(null);
  
  // 投稿一覧の状態
  const [posts, setPosts] = useState<any[]>([]);

  // 安全なユーザー情報の取得
  const safeUsername = currentUser && currentUser.username ? currentUser.username : null;
  const safeEmail = currentUser && currentUser.email ? currentUser.email : null;
  const displayName = safeUsername || safeEmail || '不明';

  // 認証状態とユーザー情報の監視
  useEffect(() => {
    console.log('[DEBUG] InstagramAuth - useEffect実行:', { isAuthenticated, hasCurrentUser: !!currentUser });
    
    // URLパラメータから認証コードとstateを取得
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleAuthCallback(code, state);
    } else {
      // 既存の認証情報をチェック
      const existingAuth = getInstagramAuth();
      if (existingAuth) {
        setAuthData(existingAuth);
        // 既存の認証情報でcurrentUserを更新（無限ループ防止のため条件付き）
        if (!currentUser?.accessToken || currentUser?.accessToken !== existingAuth.accessToken) {
          updateCurrentUserWithInstagramAuth(existingAuth);
        }
        
        // 既存の認証情報からユーザー名とアカウントIDを取得してcurrentUserを更新
        if (currentUser && (existingAuth.username || existingAuth.instagramBusinessAccountId)) {
          const updatedUser = {
            ...currentUser,
            username: existingAuth.username || currentUser.username,
            instagramBusinessAccountId: existingAuth.instagramBusinessAccountId || currentUser.instagramBusinessAccountId
          };
          setCurrentUser(updatedUser);
          console.log('[DEBUG] InstagramAuth - 既存認証情報でcurrentUserを更新:', updatedUser);
        }
        
        // 既存の認証情報がある場合は、アカウント情報を取得
        if (existingAuth.accessToken) {
          fetchAccountInfo(existingAuth.accessToken);
        }
      }
    }
  }, [isAuthenticated]); // currentUserを依存配列から削除して無限ループを防止

  // 認証状態が変更されたときにアカウント情報を取得
  useEffect(() => {
    if (isAuthenticated && authData?.accessToken && !accountInfo) {
      console.log('[DEBUG] InstagramAuth - 認証済み、アカウント情報取得開始');
      fetchAccountInfo(authData.accessToken);
    }
  }, [isAuthenticated, authData?.accessToken, accountInfo]); // accountInfoを依存配列に追加

  // 認証データが変更されたときにアカウント情報を再取得
  useEffect(() => {
    if (authData?.accessToken && !accountInfo) {
      console.log('[DEBUG] InstagramAuth - 認証データ変更、アカウント情報取得開始');
      fetchAccountInfo(authData.accessToken);
    }
  }, [authData, accountInfo]);

  // Instagramアカウント情報を取得する関数
  const fetchAccountInfo = async (accessToken: string) => {
    try {
      console.log('[DEBUG] InstagramAuth - アカウント情報取得開始');
      setIsLoading(true);
      
      const accountData = await instagramAuth.getInstagramAccountInfo(accessToken);
      if (accountData) {
        setAccountInfo(accountData);
        console.log('[DEBUG] InstagramAuth - アカウント情報取得成功:', accountData);
      }
      
      // 投稿一覧も取得
      const postsData = await instagramAuth.getInstagramPosts(accessToken, 10);
      if (postsData) {
        setPosts(postsData);
        console.log('[DEBUG] InstagramAuth - 投稿一覧取得成功:', postsData);
      }
    } catch (error) {
      console.error('[ERROR] InstagramAuth - アカウント情報取得エラー:', error);
      setError('アカウント情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Instagram認証情報でcurrentUserを更新する関数
  const updateCurrentUserWithInstagramAuth = (authInfo: any) => {
    if (currentUser && authInfo.accessToken) {
      // 無限ループ防止のため、既存のトークンと異なる場合のみ更新
      if (currentUser.accessToken !== authInfo.accessToken) {
        const updatedUser = {
          ...currentUser,
          accessToken: authInfo.accessToken,
          username: authInfo.username || currentUser?.username,
          instagramBusinessAccountId: authInfo.instagramBusinessAccountId || authInfo.instagramBusinessAccount?.id
        };
        setCurrentUser(updatedUser);
        console.log('[DEBUG] InstagramAuth - currentUserを更新:', updatedUser);
      } else {
        console.log('[DEBUG] InstagramAuth - アクセストークンは既に最新です');
      }
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await handleInstagramCallback();
      
      if (response.success && response.data) {
        const authInfo = {
          accessToken: response.data.access_token,
          username: response.data.instagram_business_account?.username,
          instagramBusinessAccountId: response.data.instagram_business_account?.id,
          instagramBusinessAccount: response.data.instagram_business_account,
          recentPosts: response.data.recent_posts
        };

        console.log('[DEBUG] Instagram認証成功、認証情報:', authInfo);

        // ローカルストレージに保存
        saveInstagramAuth(authInfo);
        setAuthData(authInfo);

        // currentUserを更新（無限ループ防止のため条件付き）
        if (!currentUser?.accessToken || currentUser?.accessToken !== authInfo.accessToken) {
          updateCurrentUserWithInstagramAuth(authInfo);
        }

        // アカウント情報を取得（重要: 認証直後に実行）
        if (authInfo.accessToken) {
          console.log('[DEBUG] アカウント情報取得開始');
          try {
            // 少し待機してからAPI呼び出し（認証完了の確認）
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const accountData = await instagramAuth.getInstagramAccountInfo(authInfo.accessToken);
            if (accountData) {
              setAccountInfo(accountData);
              console.log('[DEBUG] アカウント情報取得成功:', accountData);
              
              // 認証情報を更新（アカウント情報を含む）
              const updatedAuthInfo = {
                ...authInfo,
                instagramBusinessAccount: {
                  ...authInfo.instagramBusinessAccount,
                  ...accountData
                }
              };
              setAuthData(updatedAuthInfo);
              saveInstagramAuth(updatedAuthInfo);
            } else {
              console.warn('[WARNING] アカウント情報が取得できませんでした');
              
              // 再試行（少し待機してから）
              console.log('[DEBUG] アカウント情報取得を再試行します');
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const retryAccountData = await instagramAuth.getInstagramAccountInfo(authInfo.accessToken);
              if (retryAccountData) {
                setAccountInfo(retryAccountData);
                console.log('[DEBUG] 再試行でアカウント情報取得成功:', retryAccountData);
                
                const updatedAuthInfo = {
                  ...authInfo,
                  instagramBusinessAccount: {
                    ...authInfo.instagramBusinessAccount,
                    ...retryAccountData
                  }
                };
                setAuthData(updatedAuthInfo);
                saveInstagramAuth(updatedAuthInfo);
              }
            }
            
            // 投稿一覧も取得
            const postsData = await instagramAuth.getInstagramPosts(authInfo.accessToken, 10);
            if (postsData) {
              setPosts(postsData);
              console.log('[DEBUG] 投稿一覧取得成功:', postsData);
            }
          } catch (fetchError) {
            console.error('[ERROR] アカウント情報取得エラー:', fetchError);
            // アカウント情報取得に失敗しても認証自体は成功している
          }
        }

        // URLからパラメータをクリア
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error(response.error || '認証に失敗しました');
      }
    } catch (err) {
      console.error('[ERROR] Instagram認証コールバック処理失敗:', err);
      setError(err instanceof Error ? err.message : '認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    console.log('[DEBUG] Instagram連携ボタンがクリックされました');
    setIsLoading(true);
    setError(null);
    startInstagramAuth();
  };

  const handleDemoMode = () => {
    setIsLoading(true);
    setError(null);
    
    // デモデータを生成
    const demoAuthData = {
      accessToken: 'demo_access_token_' + Math.random().toString(36).substr(2, 9),
      instagramBusinessAccount: {
        id: 'demo_instagram_id_123',
        username: 'demo_instagram_user',
        media_count: 25,
        page_id: 'demo_page_id_456',
        page_name: 'デモページ'
      },
      recentPosts: [
        {
          id: 'demo_post_1',
          caption: 'デモ投稿1: 美しい風景写真 #デモ #テスト',
          media_type: 'IMAGE' as const,
          media_url: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Demo+Post+1',
          thumbnail_url: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=Demo+1',
          permalink: 'https://instagram.com/p/demo1',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          like_count: 42,
          comments_count: 8
        },
        {
          id: 'demo_post_2',
          caption: 'デモ投稿2: おいしい料理 #フード #デモ',
          media_type: 'IMAGE' as const,
          media_url: 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Demo+Post+2',
          thumbnail_url: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=Demo+2',
          permalink: 'https://instagram.com/p/demo2',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          like_count: 67,
          comments_count: 12
        },
        {
          id: 'demo_post_3',
          caption: 'デモ投稿3: 動画コンテンツ #ビデオ #デモ',
          media_type: 'VIDEO' as const,
          media_url: 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Demo+Video',
          thumbnail_url: 'https://via.placeholder.com/150x150/45B7D1/FFFFFF?text=Demo+3',
          permalink: 'https://instagram.com/p/demo3',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          like_count: 89,
          comments_count: 15
        }
      ]
    };

    // ローカルストレージに保存
    saveInstagramAuth(demoAuthData);
    setAuthData(demoAuthData);
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    clearInstagramAuth();
    setAuthData(null);
    setError(null);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'IMAGE':
        return '📷';
      case 'VIDEO':
        return '🎥';
      case 'CAROUSEL_ALBUM':
        return '📚';
      default:
        return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab="instagram" onTabChange={() => {}} showAdminLink={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Instagram認証処理中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ユーザー情報が存在しない場合の処理
  if (!currentUser) {
    // ユーザー情報の初期化を待機
    console.log('[DEBUG] InstagramAuth - currentUserが存在しないため、初期化を待機中');
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab="instagram" onTabChange={() => {}} showAdminLink={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">ユーザー認証を確認中</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>ユーザー認証情報を読み込んでいます。しばらくお待ちください。</p>
                    <p className="mt-2 text-xs text-blue-600">
                      認証が完了していない場合は、ログイン画面に戻って再認証してください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab="instagram" onTabChange={() => {}} showAdminLink={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Instagram連携設定
            </h1>
            <p className="text-gray-600 mb-6">
              Meta公式のInstagram Graph APIを使って、実際のInstagramビジネスアカウントと接続し、
              投稿データやインサイトを取得できるようにします。
            </p>
            
            {/* 安全なデータアクセスのためのデバッグ情報 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">デバッグ情報</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>authData: {authData ? '存在' : 'null'}</p>
                    <p>instagramBusinessAccount: {authData?.instagramBusinessAccount ? '存在' : 'null'}</p>
                    <p>accessToken: {authData?.accessToken ? '存在' : 'null'}</p>
                    <p>recentPosts: {authData?.recentPosts ? `${authData.recentPosts.length}件` : 'null'}</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

                         {/* 認証状態の表示 */}
             <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                   </svg>
                 </div>
                 <div className="ml-3">
                   <h3 className="text-sm font-medium text-blue-800">認証状態</h3>
                   <div className="mt-2 text-sm text-blue-700">
                     <p>Facebook認証: {isAuthenticated ? '✅ 認証済み' : '❌ 未認証'}</p>
                     <p>ユーザー: {displayName}</p>
                     <p>Instagram連携: {authData ? '✅ 連携済み' : '❌ 未連携'}</p>
                     {!isAuthenticated && (
                       <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                         ⚠️ Facebook認証が必要です。ログイン画面で認証を完了してください。
                       </p>
                     )}
                   </div>
                 </div>
               </div>
             </div>

            {!authData ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Instagramアカウントと連携する
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ビジネスアカウントまたはクリエイターアカウントが必要です。
                    FacebookページとInstagramが正しくリンクされている必要があります。
                  </p>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Instagramと連携する
                  </button>
                  
                  <div className="text-center">
                    <span className="text-gray-500 text-sm">または</span>
                  </div>
                  
                  <button
                    onClick={handleDemoMode}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    デモモードで試す
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">連携完了</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Instagramビジネスアカウントとの連携が完了しました。</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">アカウント情報</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ユーザー名</dt>
                        <dd className="text-sm text-gray-900">
                          {accountInfo ? `@${accountInfo.username}` : 
                           (authData.instagramBusinessAccount && authData.instagramBusinessAccount.username ? 
                            `@${authData.instagramBusinessAccount.username}` : 
                            '取得中...')
                          }
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">アカウントID</dt>
                        <dd className="text-sm text-gray-900 font-mono">
                          {accountInfo ? accountInfo.id : 
                           (authData.instagramBusinessAccount?.id || '取得中...')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">投稿数</dt>
                        <dd className="text-sm text-gray-900">
                          {accountInfo ? `${accountInfo.media_count}件` : 
                           `${authData.instagramBusinessAccount?.media_count || 0}件`}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">フォロワー数</dt>
                        <dd className="text-sm text-gray-900">
                          {accountInfo ? `${accountInfo.followers_count}人` : '取得中...'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">フォロー数</dt>
                        <dd className="text-sm text-gray-900">
                          {accountInfo ? `${accountInfo.follows_count}人` : '取得中...'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">連携ページ</dt>
                        <dd className="text-sm text-gray-900">
                          {authData.instagramBusinessAccount?.page_name || '取得中...'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">アクセストークン</h3>
                    <div className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">トークン（一部表示）</dt>
                        <dd className="text-sm text-gray-900 font-mono">
                          {authData.accessToken ? authData.accessToken.substring(0, 20) + '...' : '取得中...'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">保存日時</dt>
                        <dd className="text-sm text-gray-900">
                          {authData.savedAt ? formatDate(authData.savedAt) : '不明'}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                {authData.recentPosts && authData.recentPosts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">最新投稿（{authData.recentPosts ? authData.recentPosts.length : 0}件）</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {authData.recentPosts && authData.recentPosts.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">{getMediaTypeIcon(post.media_type)}</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(post.timestamp)}
                            </span>
                          </div>
                          {post.media_url && (
                            <img 
                              src={post.media_url} 
                              alt={post.caption || 'Instagram投稿'} 
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                          {post.caption && (
                            <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 新しく取得した投稿一覧の表示 */}
                {posts && posts.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">最新投稿（{posts.length}件）</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{getMediaTypeIcon(post.media_type)}</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(post.timestamp)}
                            </span>
                          </div>
                          {post.media_url && (
                            <img 
                              src={post.media_url} 
                              alt={post.caption || 'Instagram投稿'} 
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                          {post.caption && (
                            <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                          )}
                          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                            <span>❤️ {post.like_count || 0}</span>
                            <span>💬 {post.comments_count || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={handleDisconnect}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    連携を解除する
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* デバッグ情報 */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">デバッグ情報</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>認証状態: {isInstagramAuthenticated() ? 'true' : 'false'}</p>
              <p>現在のURL: {window.location.href}</p>
              <p>最終更新: {new Date().toLocaleString('ja-JP')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramAuth; 