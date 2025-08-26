import React, { useState, useEffect } from 'react';
import { 
  AI_PROVIDERS, 
  AiProviderConfig, 
  updateAiProviderConfig 
} from '../services/aiAnalysis';

interface AIProviderSettingsProps {
  onSettingsChange?: (providers: Record<string, AiProviderConfig>) => void;
}

const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({ onSettingsChange }) => {
  const [providers, setProviders] = useState(AI_PROVIDERS);
  const [activeTab, setActiveTab] = useState('openai');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 設定変更時にコールバックを呼び出し
    if (onSettingsChange) {
      onSettingsChange(providers);
    }
  }, [providers, onSettingsChange]);

  const handleProviderToggle = (providerKey: string) => {
    const updatedProviders = {
      ...providers,
      [providerKey]: {
        ...providers[providerKey],
        isEnabled: !providers[providerKey].isEnabled
      }
    };
    setProviders(updatedProviders);
    updateAiProviderConfig(providerKey, { isEnabled: !providers[providerKey].isEnabled });
  };

  const handleConfigUpdate = (providerKey: string, field: keyof AiProviderConfig, value: any) => {
    const updatedProviders = {
      ...providers,
      [providerKey]: {
        ...providers[providerKey],
        [field]: value
      }
    };
    setProviders(updatedProviders);
    updateAiProviderConfig(providerKey, { [field]: value });
  };

  const handleSaveAll = () => {
    Object.keys(providers).forEach(providerKey => {
      updateAiProviderConfig(providerKey, providers[providerKey]);
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    setProviders(AI_PROVIDERS);
    setIsEditing(false);
  };

  const renderProviderTab = (providerKey: string) => {
    const provider = providers[providerKey];
    if (!provider) return null;

    return (
      <div className="space-y-6">
        {/* 基本設定 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {provider.name} の基本設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロバイダー名
              </label>
              <input
                type="text"
                value={provider.name}
                onChange={(e) => handleConfigUpdate(providerKey, 'name', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                モデル
              </label>
              <input
                type="text"
                value={provider.model}
                onChange={(e) => handleConfigUpdate(providerKey, 'model', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大トークン数
              </label>
              <input
                type="number"
                value={provider.maxTokens}
                onChange={(e) => handleConfigUpdate(providerKey, 'maxTokens', parseInt(e.target.value))}
                disabled={!isEditing}
                min="100"
                max="8000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                温度（創造性）
              </label>
              <input
                type="number"
                value={provider.temperature}
                onChange={(e) => handleConfigUpdate(providerKey, 'temperature', parseFloat(e.target.value))}
                disabled={!isEditing}
                min="0"
                max="2"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* API設定 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            API設定
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                APIキー
              </label>
              <input
                type="password"
                value={provider.apiKey}
                onChange={(e) => handleConfigUpdate(providerKey, 'apiKey', e.target.value)}
                disabled={!isEditing}
                placeholder="sk-... または gsk_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効化
                </label>
                <p className="text-sm text-gray-500">
                  {provider.isEnabled ? '有効' : '無効'}
                </p>
              </div>
              
              <button
                onClick={() => handleProviderToggle(providerKey)}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:ring-offset-2 ${
                  provider.isEnabled ? 'bg-instagram-primary' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    provider.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 使用状況 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            使用状況
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-instagram-primary">
                {provider.isEnabled ? '利用可能' : '無効'}
              </div>
              <div className="text-sm text-gray-500">ステータス</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {provider.maxTokens.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">最大トークン</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {provider.temperature}
              </div>
              <div className="text-sm text-gray-500">創造性レベル</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AIプロバイダー設定
            </h2>
            <p className="text-gray-600 mt-2">
              複数のAIプロバイダーを設定し、投稿分析の精度を向上させましょう
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-instagram-primary text-white rounded-md hover:bg-instagram-secondary transition-colors"
              >
                設定を編集
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  リセット
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <nav className="flex space-x-8 px-6">
          {Object.keys(providers).map((providerKey) => (
            <button
              key={providerKey}
              onClick={() => setActiveTab(providerKey)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === providerKey
                  ? 'border-instagram-primary text-instagram-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {providers[providerKey].name}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="bg-gray-50 rounded-lg p-6">
        {renderProviderTab(activeTab)}
      </div>

      {/* 設定の説明 */}
      <div className="bg-blue-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 設定のヒント
        </h3>
        <ul className="text-blue-800 space-y-2">
          <li>• <strong>温度（創造性）</strong>: 0.0（論理的）〜 2.0（創造的）の範囲で設定</li>
          <li>• <strong>最大トークン</strong>: 長い分析が必要な場合は増加、短い場合は減少</li>
          <li>• <strong>APIキー</strong>: 各プロバイダーの開発者ポータルで取得</li>
          <li>• <strong>複数プロバイダー</strong>: 比較分析でより正確な結果を取得</li>
        </ul>
      </div>
    </div>
  );
};

export default AIProviderSettings;
