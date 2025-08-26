import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  size: string;
}

interface ImageGeneratorProps {
  onImageSelect?: (imageUrl: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageSelect }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('square');
  
  const { currentUser } = useAppStore();

  // 画像生成スタイルのプリセット
  const stylePresets = {
    realistic: 'リアルな写真風',
    artistic: 'アート風',
    minimalist: 'ミニマル',
    vintage: 'ビンテージ風',
    modern: 'モダン',
    colorful: 'カラフル',
    blackAndWhite: 'モノクロ',
    abstract: '抽象的な'
  };

  // アスペクト比のオプション
  const aspectRatios = {
    square: { label: '正方形 (1:1)', size: '1024x1024' },
    portrait: { label: '縦長 (4:5)', size: '1024x1280' },
    landscape: { label: '横長 (16:9)', size: '1024x576' },
    story: { label: 'ストーリー (9:16)', size: '576x1024' }
  };

  // 画像生成を実行
  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('プロンプトを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt} ${stylePresets[selectedStyle as keyof typeof stylePresets]} style`,
          size: aspectRatios[selectedAspectRatio as keyof typeof aspectRatios].size,
          userId: currentUser?.id || 'demo_user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt: prompt,
          timestamp: new Date().toISOString(),
          size: aspectRatios[selectedAspectRatio as keyof typeof aspectRatios].size
        };

        setGeneratedImages([newImage, ...generatedImages]);
        setPrompt('');
      } else {
        setError(data.error || '画像生成に失敗しました');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError('画像生成ツールへの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 画像を選択
  const handleImageSelect = (imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  // 画像をダウンロード
  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instagram-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('画像のダウンロードに失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* 生成設定 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 画像生成設定</h3>
        
        {/* プロンプト入力 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            画像の説明
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例: 朝のコーヒーと本のある静かなリビングルーム"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* スタイル選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            スタイル
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            {Object.entries(stylePresets).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* アスペクト比選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            アスペクト比
          </label>
          <select
            value={selectedAspectRatio}
            onChange={(e) => setSelectedAspectRatio(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            {Object.entries(aspectRatios).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>

        {/* 生成ボタン */}
        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className={`w-full px-6 py-3 rounded-lg font-semibold text-white ${
            loading || !prompt.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          {loading ? '生成中...' : '🎨 画像を生成'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* 生成された画像 */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ 生成された画像</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleImageSelect(image.url)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="選択"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => downloadImage(image.url, image.prompt)}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                      title="ダウンロード"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {image.prompt}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{image.size}</span>
                    <span>{new Date(image.timestamp).toLocaleString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 画像生成のヒント</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 具体的で詳細な説明を書くと良い結果が得られます</li>
          <li>• 「朝の光」「夕暮れ」「自然光」などの照明を指定してください</li>
          <li>• 「高画質」「4K」「プロ品質」などのキーワードで品質を向上</li>
          <li>• ブランドカラーやテーマを指定して一貫性を保ちましょう</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageGenerator; 