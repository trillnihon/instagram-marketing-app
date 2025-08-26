import React, { useState } from 'react';
import { 
  PlayIcon, 
  BookOpenIcon, 
  LightBulbIcon,
  ChartBarIcon,
  CogIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface QuickStartStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  onClick: () => void;
}

interface QuickStartGuideProps {
  onTabChange: (tab: string) => void;
  onShowTutorial: () => void;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onTabChange, onShowTutorial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickStartSteps: QuickStartStep[] = [
    {
      id: 'ai-analysis',
      title: 'AI投稿分析を試す',
      description: 'サンプルキャプションでAI分析の威力を体験',
      icon: <ChartBarIcon className="h-6 w-6" />,
      action: '分析開始',
      onClick: () => onTabChange('advanced-analysis')
    },
    {
      id: 'tutorial',
      title: '使い方ガイド',
      description: 'アプリの基本機能と使い方を学習',
      icon: <BookOpenIcon className="h-6 w-6" />,
      action: 'ガイド開始',
      onClick: onShowTutorial
    },
    {
      id: 'ai-settings',
      title: 'AI設定',
      description: 'AIプロバイダーの設定と管理',
      icon: <CogIcon className="h-6 w-6" />,
      action: '設定',
      onClick: () => onTabChange('ai-settings')
    },
    {
      id: 'scheduler',
      title: '投稿スケジューラー',
      description: '最適な時間に投稿をスケジュール',
      icon: <CalendarIcon className="h-6 w-6" />,
      action: 'スケジュール',
      onClick: () => onTabChange('scheduler')
    }
  ];

  const tips = [
    {
      icon: '🤖',
      title: 'AI分析のコツ',
      content: '複数のAIプロバイダーを選択して、より信頼性の高い分析結果を得ましょう'
    },
    {
      icon: '⏰',
      title: '投稿時間の最適化',
      content: 'ターゲットオーディエンスの生活パターンを考慮した投稿時間を設定しましょう'
    },
    {
      icon: '🏷️',
      title: 'ハッシュタグ戦略',
      content: '業界特化のハッシュタグとトレンドハッシュタグを組み合わせて使用しましょう'
    },
    {
      icon: '📊',
      title: '継続的な改善',
      content: '定期的に分析を行い、投稿パターンの改善点を見つけましょう'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <PlayIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">🚀 クイックスタート</h3>
            <p className="text-gray-600">初回利用の方はこちらから始めましょう</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? '折りたたむ' : '展開する'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* クイックスタートステップ */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📋 次のステップ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickStartSteps.map((step) => (
                <div key={step.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">{step.title}</h5>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      <button
                        onClick={step.onClick}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {step.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 活用のコツ */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              <span>💡 活用のコツ</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">{tip.title}</h5>
                      <p className="text-sm text-gray-600">{tip.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* サンプルデータ */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">🧪 サンプルデータで試す</h4>
            <p className="text-gray-600 text-sm mb-3">
              実際のAPIキーが設定されていない場合でも、サンプルデータでAI分析の動作を確認できます。
            </p>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-700 font-mono">
                "今日は素敵な一日でした！✨ 新しい発見があって、心が豊かになった気がします。みなさんも素敵な体験をシェアしてくださいね！"
              </p>
              <p className="text-xs text-gray-500 mt-2">
                このサンプルキャプションを「AI投稿分析」で試してみてください
              </p>
            </div>
          </div>

          {/* サポート情報 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📞 サポート</h4>
            <p className="text-blue-800 text-sm">
              何かご質問がございましたら、いつでもお気軽にお問い合わせください。
              使い方ガイドもご用意しています。
            </p>
            <button
              onClick={onShowTutorial}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              使い方ガイドを見る
            </button>
          </div>
        </div>
      )}

      {/* 折りたたまれた状態の表示 */}
      {!isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickStartSteps.slice(0, 2).map((step) => (
            <div key={step.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{step.title}</h5>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <button
                  onClick={step.onClick}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  {step.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickStartGuide;
