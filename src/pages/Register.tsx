import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { register } from '../services/authService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setError, setLoading } = useAppStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // バリデーション関数
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // メールアドレスのバリデーション
    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    // ユーザー名のバリデーション
    if (!formData.username) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上で入力してください';
    }

    // パスワードのバリデーション
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'パスワードは大文字、小文字、数字を含む必要があります';
    }

    // 確認パスワードのバリデーション
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '確認パスワードを入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    // 利用規約の同意チェック
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError?.(null);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      // 登録成功時の処理
      navigate('/login', { 
        state: { message: 'アカウントが正常に作成されました。ログインしてください。' } 
      });
    } catch (error) {
      setError?.(error instanceof Error ? error.message : '登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォーム入力処理
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // OAuthサインアップ処理
  const handleOAuthSignup = async (provider: 'instagram' | 'facebook') => {
    // デモモード：OAuth設定が完了していないため、一時的にアラートで説明
    if (provider === 'instagram') {
      alert('📱 Instagram登録機能について\n\n現在、Instagram OAuth設定が進行中です。\n\n✅ 利用可能な機能：\n• メールアドレス・パスワードでの新規登録\n• ログイン\n• AI投稿分析・生成\n• 分析履歴管理\n\n🔧 開発者向け情報：\nInstagram OAuthを有効にするには、Facebook開発者コンソールでの設定が必要です。\n\n📧 今すぐ登録するには、メールアドレスとパスワードを使用してください。');
    } else {
      alert('📘 Facebook登録機能について\n\n現在、Facebook OAuth設定が進行中です。\n\n✅ 利用可能な機能：\n• メールアドレス・パスワードでの新規登録\n• ログイン\n• AI投稿分析・生成\n• 分析履歴管理\n\n🔧 開発者向け情報：\nFacebook OAuthを有効にするには、Facebook開発者コンソールでの設定が必要です。\n\n📧 今すぐ登録するには、メールアドレスとパスワードを使用してください。');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif'
      }}
    >
      <div className="w-full max-w-md">
        {/* ロゴセクション */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Instagram Marketing App
          </h1>
          <p className="text-white/80 text-sm">
            AIがあなたのSNS投稿を分析・最適化
          </p>
          </div>
          
        {/* 登録カード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
            アカウント作成
          </h2>
            <p className="text-gray-600 text-sm">
            Instagram マーケティングアプリに参加しましょう
          </p>
        </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* ユーザー名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ユーザー名を入力"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                style={{ fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif' }}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="メールアドレスを入力"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{ fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif' }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="パスワードを入力（8文字以上）"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={{ fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif' }}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* 確認パスワード */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                確認パスワード
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="パスワードを再入力"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                style={{ fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif' }}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
          </div>

          {/* 利用規約同意 */}
            <div className="flex items-start pt-2">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            />
              <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700" style={{ fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif' }}>
              <span>
                  <Link to="/terms" className="text-purple-600 hover:text-purple-500 transition-colors duration-200">
                  利用規約
                  </Link>
                と
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-500 transition-colors duration-200">
                  プライバシーポリシー
                  </Link>
                に同意します
              </span>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
          )}

          {/* 登録ボタン */}
            <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(45deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)',
                  fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(131, 58, 180, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(131, 58, 180, 0.2)';
                  }
                }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  アカウント作成中...
                </div>
              ) : (
                'アカウントを作成'
              )}
            </button>
            </div>
          </form>

          {/* ソーシャルログイン */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Instagram登録ボタン */}
              <button
                onClick={() => handleOAuthSignup('instagram')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13a1 1 0 112 0 1 1 0 01-2 0zm0 8a1 1 0 01-1-1V8a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Instagram (デモ)</span>
              </button>

              {/* Facebook登録ボタン */}
              <button
                onClick={() => handleOAuthSignup('facebook')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Facebook (デモ)</span>
              </button>
            </div>
          </div>

          {/* ログインリンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちですか？{' '}
              <Link 
                to="/login" 
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                style={{ fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif' }}
              >
                ログインする
              </Link>
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-xs">
            © 2025 Instagram Marketing App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 