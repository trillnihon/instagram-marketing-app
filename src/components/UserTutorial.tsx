import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon: string;
  content: React.ReactNode;
}

interface UserTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const UserTutorial: React.FC<UserTutorialProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Instagram Marketing Appへようこそ！',
      description: 'AIを活用したInstagram投稿分析ツールの使い方をご紹介します',
      icon: '🎉',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Instagram Marketing Appへようこそ！
          </h2>
          <p className="text-gray-600 text-lg">
            このアプリでは、最新のAI技術を使用してInstagram投稿の効果を分析し、<br />
            より良い投稿戦略を提案します。
          </p>
          <div className="bg-gradient-to-r from-instagram-secondary to-instagram-primary p-6 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-2">✨ 主な機能</h3>
            <ul className="text-left space-y-2">
              <li>• 🤖 AI投稿分析（複数プロバイダー対応）</li>
              <li>• 📊 詳細なエンゲージメント分析</li>
              <li>• 🏷️ 最適なハッシュタグ提案</li>
              <li>• ⏰ 投稿時間最適化</li>
              <li>• 📈 競合分析とトレンド把握</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'ai-analysis',
      title: 'AI投稿分析の使い方',
      description: '投稿の効果をAIが分析し、改善提案を提供します',
      icon: '🤖',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900">AI投稿分析</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📝 ステップ1: キャプション入力</h4>
              <p className="text-blue-800 text-sm">
                分析したい投稿のキャプションを入力してください。AIが内容を理解し、効果を分析します。
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🎯 ステップ2: 分析設定</h4>
              <p className="text-green-800 text-sm">
                業界、ターゲットオーディエンス、分析タイプを選択して、より精度の高い分析を行います。
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🤖 ステップ3: AIプロバイダー選択</h4>
              <p className="text-purple-800 text-sm">
                OpenAI GPT-4とGoogle Geminiから選択。複数プロバイダーでの比較分析も可能です。
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">📊 ステップ4: 結果確認</h4>
              <p className="text-orange-800 text-sm">
                スコア、改善提案、ハッシュタグ、最適投稿時間など、詳細な分析結果を確認できます。
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">💡 活用のコツ</h4>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• 定期的に分析を行い、投稿パターンの改善点を見つけましょう</li>
              <li>• 業界特化の分析で、より効果的な戦略を立てましょう</li>
              <li>• 複数AIプロバイダーの結果を比較して、より信頼性の高い分析を行いましょう</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'ダッシュボードの使い方',
      description: '6つの主要機能でInstagramマーケティングを効率化',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900">ダッシュボード機能</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🤖</span>
                <h4 className="font-semibold text-gray-900">AI投稿分析</h4>
              </div>
              <p className="text-gray-600 text-sm">
                投稿の効果をAIが分析し、改善提案を提供
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📊</span>
                <h4 className="font-semibold text-gray-900">アカウント分析</h4>
              </div>
              <p className="text-gray-600 text-sm">
                フォロワー数、エンゲージメント率などの統計
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📈</span>
                <h4 className="font-semibold text-gray-900">投稿分析</h4>
              </div>
              <p className="text-gray-600 text-sm">
                個別投稿のパフォーマンス分析
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">💡</span>
                <h4 className="font-semibold text-gray-900">コンテンツ提案</h4>
              </div>
              <p className="text-gray-600 text-sm">
                AIによる次回投稿のアイデア提案
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📅</span>
                <h4 className="font-semibold text-gray-900">投稿スケジューラー</h4>
              </div>
              <p className="text-gray-600 text-sm">
                最適な時間に投稿をスケジュール
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">⚙️</span>
                <h4 className="font-semibold text-gray-900">AI設定</h4>
              </div>
              <p className="text-gray-600 text-sm">
                AIプロバイダーの設定と管理
              </p>
            </div>
          </div>
          
          <div className="bg-instagram-primary bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-semibold text-instagram-primary mb-2">🚀 クイックスタート</h4>
            <p className="text-instagram-primary text-sm">
              初回利用の方は「AI投稿分析」から始めることをお勧めします。
              サンプルキャプションで分析を試してみてください！
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai-settings',
      title: 'AIプロバイダー設定',
      description: '複数のAIプロバイダーを設定して分析精度を向上',
      icon: '⚙️',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900">AIプロバイダー設定</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🤖</span>
                <h4 className="font-semibold text-gray-900">OpenAI GPT-4</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">推奨</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                高精度な自然言語処理で、詳細な分析と提案を提供
              </p>
              <div className="text-xs text-gray-500">
                設定項目: APIキー、モデル、最大トークン数、温度（創造性）
              </div>
            </div>
            

            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🌐</span>
                <h4 className="font-semibold text-gray-900">Google Gemini</h4>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">最新技術</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Googleの最新AI技術で、リアルタイムトレンドとの連携
              </p>
              <div className="text-xs text-gray-500">
                設定項目: APIキー、モデル、最大トークン数、温度（創造性）
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 重要事項</h4>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• 各AIプロバイダーのAPIキーは開発者ポータルで取得してください</li>
              <li>• APIキーは機密情報です。安全に管理してください</li>
              <li>• 複数プロバイダーを有効にすることで、比較分析が可能になります</li>
              <li>• 本番環境では、適切なAPIキーを設定してください</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: '活用のコツとベストプラクティス',
      description: 'より効果的なInstagramマーケティングのためのアドバイス',
      icon: '💡',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-900">活用のコツとベストプラクティス</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">📱 投稿戦略</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 一貫性のある投稿スケジュールを維持</li>
                <li>• 業界に特化したハッシュタグを使用</li>
                <li>• フォロワーとの対話を促進する質問形式</li>
                <li>• 画像とキャプションの一貫性を保つ</li>
                <li>• トレンドを活用したタイムリーな投稿</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">📊 分析の活用</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 定期的な投稿分析でパターンを把握</li>
                <li>• エンゲージメント率の高い時間帯を特定</li>
                <li>• 競合アカウントの分析で差別化</li>
                <li>• A/Bテストで最適な投稿形式を検証</li>
                <li>• 季節性やイベントを考慮した戦略</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-instagram-secondary to-instagram-primary p-6 rounded-lg text-white">
            <h4 className="font-semibold text-xl mb-3">🚀 成功のための3つのポイント</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h5 className="font-semibold mb-1">明確な目標設定</h5>
                <p className="text-sm opacity-90">
                  フォロワー増加、エンゲージメント向上、ブランド認知など、具体的な目標を設定
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <h5 className="font-semibold mb-1">継続的な改善</h5>
                <p className="text-sm opacity-90">
                  AI分析結果を基に、投稿内容と戦略を継続的に改善
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤝</div>
                <h5 className="font-semibold mb-1">コミュニティ構築</h5>
                <p className="text-sm opacity-90">
                  フォロワーとの双方向コミュニケーションで信頼関係を構築
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">✅ 次のステップ</h4>
            <p className="text-green-800 text-sm">
              チュートリアルが完了しました！早速「AI投稿分析」で投稿の分析を始めてみましょう。
              何かご質問がございましたら、いつでもお気軽にお問い合わせください。
            </p>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isOpen && isAutoPlay) {
      const timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < tutorialSteps.length - 1) {
            return prev + 1;
          } else {
            setIsAutoPlay(false);
            return prev;
          }
        });
      }, 8000); // 8秒ごとに自動進行

      return () => clearInterval(timer);
    }
  }, [isOpen, isAutoPlay, tutorialSteps.length]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-instagram-secondary to-instagram-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{tutorialSteps[currentStep].icon}</span>
              <div>
                <h2 className="text-xl font-bold">{tutorialSteps[currentStep].title}</h2>
                <p className="text-sm opacity-90">{tutorialSteps[currentStep].description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tutorialSteps[currentStep].content}
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAutoPlay}
                className={`p-2 rounded-full transition-colors ${
                  isAutoPlay 
                    ? 'bg-instagram-primary text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={isAutoPlay ? '自動再生停止' : '自動再生開始'}
              >
                {isAutoPlay ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              </button>
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {tutorialSteps.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                スキップ
              </button>
              
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`p-2 rounded-full transition-colors ${
                  currentStep === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-instagram-secondary to-instagram-primary text-white rounded-md hover:from-instagram-primary hover:to-instagram-secondary transition-all duration-200 font-medium"
              >
                {currentStep === tutorialSteps.length - 1 ? '完了' : '次へ'}
              </button>
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-instagram-secondary to-instagram-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTutorial;
