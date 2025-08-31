import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../lib/apiClient';

const AccountAnalytics: React.FC = () => {
  const { currentUser, accountAnalytics } = useAppStore();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 安全なユーザー情報の取得
  const safeUsername = currentUser?.username || '不明';
  const safeUserId = currentUser?.id || '不明';
  
  // Instagram認証情報を正しく取得（文字列からパース）
  const getInstagramAuth = () => {
    try {
      const instagramAuthStr = localStorage.getItem('instagram_auth');
      if (instagramAuthStr) {
        const parsed = JSON.parse(instagramAuthStr);
        console.log('[DEBUG] AccountAnalytics - パースされたInstagram認証情報:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[ERROR] AccountAnalytics - Instagram認証情報のパースエラー:', error);
    }
    return null;
  };

  const instagramAuth = getInstagramAuth();
  const safeAccessToken = instagramAuth?.accessToken || currentUser?.accessToken;
  const safeInstagramBusinessAccountId = instagramAuth?.instagramBusinessAccountId || currentUser?.instagramBusinessAccountId;

  useEffect(() => {
    console.log('🔍 [DEBUG] AccountAnalytics - 現在のユーザー情報:', {
      userId: safeUserId,
      username: safeUsername,
      hasAccessToken: !!safeAccessToken,
      instagramBusinessAccountId: safeInstagramBusinessAccountId
    });

    // 詳細なデバッグ情報を追加
    console.log('🔍 [DEBUG] AccountAnalytics - 詳細なユーザー情報:', {
      currentUser: currentUser,
      instagramAuth: instagramAuth,
      accessToken: safeAccessToken,
      instagramBusinessAccountId: safeInstagramBusinessAccountId,
      localStorage: {
        instagram_auth: localStorage.getItem('instagram_auth'),
        app_storage: localStorage.getItem('app-storage')
      }
    });

    // デモユーザーの場合はアクセストークンチェックをスキップ
    if (safeUserId === 'demo_user' || safeUsername === 'Demo User') {
      console.log('🎭 [DEBUG] AccountAnalytics - デモユーザー、アクセストークンチェックをスキップ');
      setLoading(false);
      return;
    }

    // 本番ユーザーのみAPI通信
    const fetchAccount = async () => {
      if (!safeAccessToken) {
        console.error('[ERROR] AccountAnalytics - アクセストークンがありません');
        console.error('[DEBUG] AccountAnalytics - アクセストークン詳細:', {
          safeAccessToken,
          currentUserAccessToken: currentUser?.accessToken,
          instagramAuth: instagramAuth,
          rawInstagramAuth: localStorage.getItem('instagram_auth')
        });
        setError('アクセストークンがありません。Instagram連携を再実行してください。');
        return;
      }

      console.log('[DEBUG] AccountAnalytics - アカウント情報取得開始');
      setLoading(true);
      setError(null);

      try {
        // バックエンド経由でアカウント情報を取得
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const apiUrl = `${apiBaseUrl}/instagram/user-info?accessToken=${safeAccessToken}`;
        console.log('[DEBUG] AccountAnalytics - API URL:', apiUrl.replace(safeAccessToken, '***'));
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[ERROR] AccountAnalytics - API エラー:', errorData);
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const responseData = await response.json();
        console.log('[DEBUG] AccountAnalytics - 取得したデータ:', responseData);
        
        // バックエンドレスポンスの形式に合わせて処理
        if (!responseData.success) {
          throw new Error(responseData.error || 'アカウント情報の取得に失敗しました');
        }
        
        const data = responseData.data;
        
        // データの検証
        if (!data || !data.id) {
          throw new Error('アカウントIDが取得できませんでした');
        }
        
        setAccount(data);
        
      } catch (e: any) {
        console.error('[ERROR] AccountAnalytics - 例外:', e);
        setError(`アカウント情報の取得に失敗しました: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [currentUser, accountAnalytics, safeUserId, safeUsername, safeAccessToken, safeInstagramBusinessAccountId]);

  if (loading) return <div>アカウント情報を取得中...</div>;
  
  if (error) {
    return (
      <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}>
        <h3>エラー: アカウント情報の取得に失敗しました</h3>
        <p>{error}</p>
        <details style={{ marginTop: '0.5rem' }}>
          <summary>デバッグ情報</summary>
          <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {JSON.stringify({
              userId: safeUserId,
              username: safeUsername,
              hasAccessToken: !!safeAccessToken,
              instagramBusinessAccountId: safeInstagramBusinessAccountId
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (!account) {
    // Instagram連携が成功している場合の表示
    if (instagramAuth && safeAccessToken) {
      console.log('🎯 [DEBUG] AccountAnalytics - Instagram連携成功、基本情報表示');
      return (
        <div style={{ padding: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46' }}>
          <h2>✅ Instagram連携完了</h2>
          <p>Instagramビジネスアカウントとの連携が完了しました。</p>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '4px' }}>
            <h3>連携情報</h3>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li><b>ユーザー名:</b> {instagramAuth.username || '取得中...'}</li>
              <li><b>アカウントID:</b> {instagramAuth.instagramBusinessAccountId || '取得中...'}</li>
              <li><b>連携状態:</b> ✅ アクティブ</li>
              <li><b>アクセストークン:</b> {safeAccessToken ? '✅ 有効' : '❌ 無効'}</li>
            </ul>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#047857' }}>
            詳細なアカウント情報の取得中です。しばらくお待ちください。
          </p>
        </div>
      );
    }
    
    // デモユーザーの場合、フォールバックデータを表示
    if (safeUserId === 'demo_user' || safeUsername === 'Demo User') {
      console.log('🎭 [DEBUG] AccountAnalytics - フォールバックデモデータ表示');
      return (
        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', color: '#333' }}>
          <h2>Instagramアカウント情報（デモ）</h2>
          <ul>
            <li><b>ユーザー名:</b> {safeUsername}</li>
            <li><b>投稿数:</b> 1</li>
            <li><b>平均エンゲージメント:</b> 8.2</li>
            <li><b>ID:</b> {safeUserId}</li>
          </ul>
        </div>
      );
    }
    
    return (
      <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', color: '#92400e' }}>
        <h3>⚠️ Instagram連携が必要です</h3>
        <p>アカウント情報を表示するには、Instagram連携を完了してください。</p>
      </div>
    );
  }

  // デモユーザー用の表示
  if (safeUserId === 'demo_user' || safeUsername === 'Demo User') {
    return (
      <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', color: '#333' }}>
        <h2>Instagramアカウント情報（デモ）</h2>
        <ul>
          <li><b>ユーザー名:</b> {safeUsername}</li>
          <li><b>投稿数:</b> {account.totalPosts}</li>
          <li><b>平均エンゲージメント:</b> {account.averageEngagement}</li>
          <li><b>ID:</b> {account.accountId}</li>
        </ul>
      </div>
    );
  }

  // 本番ユーザー用の表示
  return (
    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', color: '#333' }}>
      <h2>Instagramアカウント情報</h2>
      <ul>
        <li><b>ユーザー名:</b> {account.username || 'N/A'}</li>
        <li><b>投稿数:</b> {account.media_count || 0}</li>
        <li><b>フォロワー数:</b> {account.followers_count || 0}</li>
        <li><b>フォロー数:</b> {account.follows_count || 0}</li>
        <li><b>ID:</b> {account.id}</li>
      </ul>
    </div>
  );
};

export default AccountAnalytics; 