import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Type, Hash, Send, CheckCircle, AlertCircle, Loader, X, Camera } from 'lucide-react';
import InstagramService, { InstagramAccount, InstagramPage } from '../services/instagramService';
import UploadService from '../services/uploadService';

const CreatePostPage: React.FC = () => {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      const pages = await InstagramService.getPages();
      const instagramPage = pages.find(page => page.instagram_business_account);
      
      if (!instagramPage?.instagram_business_account) {
        throw new Error('Instagram Business Accountが見つかりません');
      }

      const accountInfo = await InstagramService.getInstagramAccount(
        instagramPage.instagram_business_account.id
      );
      setAccount(accountInfo);
    } catch (err: any) {
      console.error('アカウント情報取得エラー:', err);
      setError(err.message || 'アカウント情報の取得に失敗しました');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル検証
    const validation = UploadService.validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'ファイルが無効です');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // プレビュー作成
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !account) {
      setError('ファイルとアカウント情報が必要です');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setStatus('画像をアップロード中...');

      // ファイルをアップロード
      const url = await UploadService.uploadImage(selectedFile);
      setUploadedUrl(url);
      setStatus('アップロード完了！投稿の準備ができました');

    } catch (err: any) {
      console.error('アップロードエラー:', err);
      setError(err.message || 'ファイルアップロードに失敗しました');
      setStatus('');
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!uploadedUrl || !account) {
      setError('アップロードされた画像とアカウント情報が必要です');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setStatus('投稿を準備中...');

      // キャプションとハッシュタグを結合
      const fullCaption = `${caption}${hashtags ? `\n\n${hashtags}` : ''}`;

      // メディア作成
      setStatus('メディアを作成中...');
      const media = await InstagramService.createMedia(uploadedUrl, fullCaption, account.id);
      
      if (!media.id) {
        throw new Error('メディアの作成に失敗しました');
      }

      // メディア公開
      setStatus('投稿を公開中...');
      await InstagramService.publishMedia(media.id, account.id);

      setSuccess(true);
      setStatus('投稿が完了しました！');
      
      // フォームをリセット
      setTimeout(() => {
        resetForm();
      }, 3000);

    } catch (err: any) {
      console.error('投稿エラー:', err);
      setError(err.message || '投稿に失敗しました');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setHashtags('');
    setSelectedFile(null);
    setImagePreview(null);
    setUploadedUrl(null);
    setStatus('');
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const suggestedHashtags = [
    '#photography', '#instagood', '#picoftheday', '#photooftheday',
    '#beautiful', '#happy', '#cute', '#love', '#followme', '#like4like'
  ];

  const addHashtag = (hashtag: string) => {
    const currentHashtags = hashtags.split(' ').filter(h => h.trim());
    if (!currentHashtags.includes(hashtag)) {
      setHashtags([...currentHashtags, hashtag].join(' '));
    }
  };

  const formatFileSize = (bytes: number) => {
    return UploadService.formatFileSize(bytes);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">新しい投稿</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>@{account?.username || 'loading...'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 成功表示 */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm">{status}</p>
            </div>
          </div>
        )}

        {/* 投稿フォーム */}
        <div className="space-y-6">
          {/* ファイル選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              画像を選択
            </label>
            
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">画像をドラッグ&ドロップまたはクリックして選択</p>
                <p className="text-sm text-gray-500">JPEG、PNG、GIF、WebP（最大10MB）</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* ファイル情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                        setUploadedUrl(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* 画像プレビュー */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      プレビュー
                    </div>
                  </div>
                )}

                {/* アップロードボタン */}
                {!uploadedUrl && (
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>アップロード中...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>画像をアップロード</span>
                      </>
                    )}
                  </button>
                )}

                {/* アップロード完了 */}
                {uploadedUrl && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">アップロード完了</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* キャプション入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Type className="w-4 h-4 inline mr-1" />
              キャプション
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="投稿の説明を入力してください..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none resize-none"
              disabled={loading}
            />
          </div>

          {/* ハッシュタグ入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              ハッシュタグ
            </label>
            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#photography #instagood #picoftheday"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-black focus:outline-none resize-none"
              disabled={loading}
            />
            
            {/* おすすめハッシュタグ */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">おすすめハッシュタグ:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedHashtags.map((hashtag) => (
                  <button
                    key={hashtag}
                    onClick={() => addHashtag(hashtag)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 投稿ボタン */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {status && (
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{status}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handlePost}
              disabled={loading || !uploadedUrl || !account}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>投稿中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>投稿する</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* アカウント情報 */}
        {account && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">投稿先アカウント</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {account.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-black">@{account.username}</p>
                <p className="text-sm text-gray-600">{account.name}</p>
                <p className="text-xs text-gray-500">
                  {account.followers_count ? `${account.followers_count.toLocaleString()}フォロワー` : 'フォロワー数不明'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 投稿のヒント */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">投稿のヒント</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 高品質な画像を使用すると、より多くのエンゲージメントが得られます</li>
            <li>• 関連性の高いハッシュタグを使用して、より多くの人に見つけてもらいましょう</li>
            <li>• キャプションでストーリーを語り、フォロワーとのつながりを深めましょう</li>
            <li>• 投稿後は、コメントやいいねに積極的に返信しましょう</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;