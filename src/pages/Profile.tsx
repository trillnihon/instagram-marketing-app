import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Navigation from '../components/Navigation';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, changePassword, deleteAccount, logout, isLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'settings'>('profile');
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatar: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        displayName: currentUser.profile?.displayName || '',
        bio: currentUser.profile?.bio || '',
        avatar: currentUser.profile?.avatar || ''
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const success = await updateProfile(profileForm);
    if (success) {
      setMessage('プロフィールを更新しました');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('新しいパスワードは6文字以上である必要があります');
      return;
    }

    const success = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage('パスワードを変更しました');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      const success = await deleteAccount();
      if (success) {
        navigate('/login');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Navigation activeTab="profile" onTabChange={() => {}} showAdminLink={currentUser.isAdmin} />
        
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👤 プロフィール
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🔒 セキュリティ
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⚙️ 設定
                </button>
              </nav>
            </div>

            <div className="p-6">
              {message && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">プロフィール情報</h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        表示名
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="表示名を入力"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        自己紹介
                      </label>
                      <textarea
                        id="bio"
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="自己紹介を入力"
                      />
                    </div>

                    <div>
                      <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                        アバターURL
                      </label>
                      <input
                        type="url"
                        id="avatar"
                        value={profileForm.avatar}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isLoading ? '更新中...' : '更新'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">セキュリティ設定</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        現在のパスワード
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        新しいパスワード
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        新しいパスワード（確認）
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isLoading ? '変更中...' : 'パスワード変更'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">アカウント設定</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-medium text-gray-900 mb-2">アカウント情報</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>ユーザー名:</strong> {currentUser.username}</p>
                        <p><strong>メールアドレス:</strong> {currentUser.email}</p>
                        <p><strong>最終ログイン:</strong> {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString('ja-JP') : '不明'}</p>
                        <p><strong>アカウント作成日:</strong> {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('ja-JP') : '不明'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        ログアウト
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        アカウント削除
                      </button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            注意事項
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              アカウント削除は取り消せません。削除すると、すべてのデータが完全に削除されます。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 