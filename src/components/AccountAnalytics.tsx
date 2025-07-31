import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const AccountAnalytics: React.FC = () => {
  const { currentUser, accountAnalytics } = useAppStore();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // デモユーザーの場合はアクセストークンチェックをスキップ
    if (currentUser?.userId === 'demo_user' || currentUser?.username === 'demo_user') {
      console.log('🎭 [DEBUG] AccountAnalytics - デモユーザー、アクセストークンチェックをスキップ');
      setLoading(false);
      return;
    }

    // 本番ユーザーのみAPI通信
    const fetchAccount = async () => {
      if (!currentUser?.accessToken) {
        console.error('[ERROR] AccountAnalytics - アクセストークンがありません');
        setError('アクセストークンがありません。再ログインしてください。');
        return;
      }

      console.log('[DEBUG] AccountAnalytics - アカウント情報取得開始');
      setLoading(true);
      setError(null);

      try {
        // Instagram Graph APIを使用してアカウント情報を取得
        // 利用可能なフィールド: id, username, media_count, followers_count, follows_count
        const apiUrl = `https://graph.facebook.com/v18.0/${currentUser.instagramBusinessAccountId}?fields=id,username,media_count,followers_count,follows_count&access_token=${currentUser.accessToken}`;
        console.log('[DEBUG] AccountAnalytics - API URL:', apiUrl.replace(currentUser.accessToken, '***'));
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[ERROR] AccountAnalytics - API エラー:', errorData);
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('[DEBUG] AccountAnalytics - 取得したデータ:', data);
        
        // データの検証
        if (!data.id) {
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
  }, [currentUser, accountAnalytics]);

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
              userId: currentUser?.userId,
              hasAccessToken: !!currentUser?.accessToken,
              instagramBusinessAccountId: currentUser?.instagramBusinessAccountId
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (!account) {
    // デモユーザーの場合、フォールバックデータを表示
    if (currentUser?.userId === 'demo_user') {
      console.log('🎭 [DEBUG] AccountAnalytics - フォールバックデモデータ表示');
      return (
        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', color: '#333' }}>
          <h2>Instagramアカウント情報（デモ）</h2>
          <ul>
            <li><b>ユーザー名:</b> demo_user</li>
            <li><b>投稿数:</b> 1</li>
            <li><b>平均エンゲージメント:</b> 8.2</li>
            <li><b>ID:</b> demo_user</li>
          </ul>
        </div>
      );
    }
    return <div>アカウント情報がありません。</div>;
  }

  // デモユーザー用の表示
  if (currentUser?.userId === 'demo_user') {
    return (
      <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', color: '#333' }}>
        <h2>Instagramアカウント情報（デモ）</h2>
        <ul>
          <li><b>ユーザー名:</b> {account.username}</li>
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