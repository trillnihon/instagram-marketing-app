import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false 
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const { currentUser } = useAppStore();

  if (!error) return null;

  // エラータイプを判定
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('認証') || errorMessage.includes('access_token')) {
      return 'auth';
    } else if (errorMessage.includes('権限') || errorMessage.includes('permission')) {
      return 'permission';
    } else if (errorMessage.includes('ネットワーク') || errorMessage.includes('fetch')) {
      return 'network';
    } else if (errorMessage.includes('Instagram') || errorMessage.includes('Graph API')) {
      return 'instagram';
    } else if (errorMessage.includes('OpenAI') || errorMessage.includes('AI')) {
      return 'ai';
    } else {
      return 'general';
    }
  };

  // エラータイプに応じた対処法を取得
  const getErrorSolution = (errorType: string) => {
    switch (errorType) {
      case 'auth':
        return {
          title: '認証エラー',
          description: 'Instagram認証に問題があります',
          solutions: [
            'Instagram認証ページで再度連携してください',
            'ブラウザのキャッシュをクリアしてください',
            '別のブラウザで試してください'
          ],
          action: '認証ページへ移動'
        };
      case 'permission':
        return {
          title: '権限エラー',
          description: '必要な権限が不足しています',
          solutions: [
            'Facebookページが正しく設定されているか確認してください',
            'Instagramビジネスアカウントが連携されているか確認してください',
            'アプリの権限設定を確認してください'
          ],
          action: '診断ツールを実行'
        };
      case 'network':
        return {
          title: 'ネットワークエラー',
          description: 'インターネット接続に問題があります',
          solutions: [
            'インターネット接続を確認してください',
            'ファイアウォールの設定を確認してください',
            'しばらく時間をおいて再度お試しください'
          ],
          action: '再試行'
        };
      case 'instagram':
        return {
          title: 'Instagram API エラー',
          description: 'Instagram Graph APIとの通信に問題があります',
          solutions: [
            'Instagramビジネスアカウントの設定を確認してください',
            'アクセストークンの有効期限を確認してください',
            'Facebookページとの連携を確認してください'
          ],
          action: '接続テスト'
        };
      case 'ai':
        return {
          title: 'AI機能エラー',
          description: 'AI機能の利用に問題があります',
          solutions: [
            '使用回数制限に達していないか確認してください',
            'プランをアップグレードしてください',
            'しばらく時間をおいて再度お試しください'
          ],
          action: 'プラン確認'
        };
      default:
        return {
          title: 'エラーが発生しました',
          description: '予期しないエラーが発生しました',
          solutions: [
            'ページを再読み込みしてください',
            'ブラウザを再起動してください',
            'サポートにお問い合わせください'
          ],
          action: '再読み込み'
        };
    }
  };

  const errorType = getErrorType(error);
  const solution = getErrorSolution(errorType);

  // アクションハンドラー
  const handleAction = () => {
    switch (errorType) {
      case 'auth':
        window.location.href = '/auth/instagram';
        break;
      case 'permission':
        window.location.href = '/diagnostics';
        break;
      case 'network':
      case 'general':
        if (onRetry) onRetry();
        break;
      case 'instagram':
        window.location.href = '/diagnostics';
        break;
      case 'ai':
        window.location.href = '/dashboard';
        break;
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {solution.title}
          </h3>
          
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-2">{solution.description}</p>
            
            <div className="mt-3">
              <h4 className="font-medium mb-2">対処法:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {solution.solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>

            {/* デバッグ情報（開発者向け） */}
            {showDetails && (
              <div className="mt-3">
                <button
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  {showFullDetails ? '詳細を隠す' : '詳細を表示'}
                </button>
                
                {showFullDetails && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                    <div className="mb-1">
                      <strong>エラータイプ:</strong> {errorType}
                    </div>
                    <div className="mb-1">
                      <strong>ユーザーID:</strong> {currentUser?.userId || '不明'}
                    </div>
                    <div className="mb-1">
                      <strong>Instagram連携:</strong> {currentUser?.instagramBusinessAccountId ? 'あり' : 'なし'}
                    </div>
                    <div>
                      <strong>エラーメッセージ:</strong> {error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleAction}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {solution.action}
            </button>
            
            {onRetry && errorType !== 'auth' && errorType !== 'permission' && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                再試行
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler; 