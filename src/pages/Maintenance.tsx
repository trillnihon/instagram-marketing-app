import React, { useState, useEffect } from 'react';

const Maintenance: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // メンテナンス終了予定時刻（例：2時間後）
    const endTime = new Date().getTime() + 2 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          {/* メンテナンスアイコン */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* メインコンテンツ */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            メンテナンス中
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            より良いサービスを提供するため、現在システムメンテナンスを実施しています。
            <br />
            ご不便をおかけしますが、しばらくお待ちください。
          </p>

          {/* 残り時間 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              予想復旧時刻
            </h2>
            <div className="flex justify-center space-x-4">
              <div className="bg-blue-50 rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl font-bold text-blue-600">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600">時間</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl font-bold text-blue-600">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600">分</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl font-bold text-blue-600">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600">秒</div>
              </div>
            </div>
          </div>

          {/* メンテナンス内容 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🔧 今回のメンテナンス内容
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  システムパフォーマンスの向上
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  新機能の追加（AI投稿文生成）
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  セキュリティ強化
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  バグ修正と安定性向上
                </li>
              </ul>
            </div>
          </div>

          {/* お知らせ */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-blue-800 mb-2">
              📢 お知らせ
            </h4>
            <p className="text-sm text-blue-700">
              メンテナンス中も、お客様のデータは安全に保護されています。
              復旧後は、より快適で高機能なサービスをお楽しみいただけます。
            </p>
          </div>

          {/* お問い合わせ */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-4">
              緊急のご用件がございましたら、以下までお問い合わせください。
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                📧 メール: support@instagram-analyzer.com
              </p>
              <p className="text-gray-700">
                📞 電話: 03-1234-5678（平日 9:00-18:00）
              </p>
            </div>
          </div>

          {/* 自動リロードボタン */}
          <div className="mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🔄 ページを更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance; 