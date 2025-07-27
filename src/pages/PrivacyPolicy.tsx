import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation activeTab="privacy" onTabChange={() => {}} showAdminLink={false} />
        
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              プライバシーポリシー
            </h1>
            <p className="text-sm text-gray-600">
              最終更新日: 2025年1月25日
            </p>
          </div>

          <div className="prose prose-sm sm:prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 個人情報の取り扱いについて</h2>
              <p className="text-gray-700 mb-4">
                当社は、お客様のプライバシーを尊重し、個人情報の保護を最優先に考えています。
                本プライバシーポリシーは、当社が収集・利用・管理する個人情報について説明します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 収集する情報</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-800">2.1 お客様が提供する情報</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Instagramアカウント情報（ユーザー名、プロフィール画像等）</li>
                  <li>メールアドレス</li>
                  <li>お問い合わせ内容</li>
                  <li>利用履歴</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800">2.2 自動的に収集される情報</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IPアドレス</li>
                  <li>ブラウザ情報</li>
                  <li>アクセス日時</li>
                  <li>利用ページ</li>
                  <li>Cookie情報</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 情報の利用目的</h2>
              <div className="space-y-4 text-gray-700">
                <p>収集した情報は以下の目的で利用します：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>サービスの提供・運営</li>
                  <li>投稿分析・最適化提案</li>
                  <li>AI投稿文生成</li>
                  <li>お客様サポート</li>
                  <li>サービス改善</li>
                  <li>セキュリティ確保</li>
                  <li>法令遵守</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 情報の共有</h2>
              <div className="space-y-4 text-gray-700">
                <p>当社は、以下の場合を除き、お客様の個人情報を第三者に提供しません：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>お客様の事前同意がある場合</li>
                  <li>法令に基づく場合</li>
                  <li>お客様の生命・身体・財産の保護のため必要な場合</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のため特に必要な場合</li>
                  <li>国の機関または地方公共団体が法令の定める事務を遂行することに対して協力する必要がある場合</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 情報の管理</h2>
              <div className="space-y-4 text-gray-700">
                <p>当社は、お客様の個人情報を適切に管理し、以下の措置を講じます：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>アクセス制御による不正アクセスの防止</li>
                  <li>暗号化による情報の保護</li>
                  <li>定期的なセキュリティ監査</li>
                  <li>従業員への教育・研修</li>
                  <li>個人情報の削除・無効化</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. お客様の権利</h2>
              <div className="space-y-4 text-gray-700">
                <p>お客様は以下の権利を有します：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>個人情報の開示請求</li>
                  <li>個人情報の訂正・追加・削除請求</li>
                  <li>個人情報の利用停止・消去請求</li>
                  <li>個人情報の第三者提供の停止請求</li>
                  <li>同意の撤回</li>
                </ul>
                <p className="mt-4">
                  これらの請求については、
                  <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline">
                    お問い合わせフォーム
                  </Link>
                  からお申し込みください。
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Cookieの利用</h2>
              <div className="space-y-4 text-gray-700">
                <p>当社は、お客様により良いサービスを提供するため、Cookieを使用しています：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>セッション管理</li>
                  <li>ユーザー設定の保存</li>
                  <li>利用統計の収集</li>
                  <li>セキュリティの確保</li>
                </ul>
                <p className="mt-4">
                  ブラウザの設定でCookieを無効にすることも可能ですが、
                  一部の機能が正常に動作しない場合があります。
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. データの保持期間</h2>
              <div className="space-y-4 text-gray-700">
                <p>個人情報の保持期間は以下の通りです：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>アカウント情報: アカウント削除まで</li>
                  <li>利用履歴: 1年間</li>
                  <li>分析データ: 30日間（無料プラン）</li>
                  <li>お問い合わせ内容: 3年間</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 mb-4">
                当社は、事前の通知なく本プライバシーポリシーを変更する場合があります。
                変更後は、本ページで最新のプライバシーポリシーをご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">10. お問い合わせ</h2>
              <p className="text-gray-700 mb-4">
                プライバシーポリシーに関するお問い合わせは、以下の方法でお願いします：
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  📧 メール: privacy@instagram-analyzer.com<br />
                  📞 電話: 03-1234-5678（平日 9:00-18:00）<br />
                  📝 お問い合わせフォーム: 
                  <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline ml-1">
                    こちら
                  </Link>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <Link
                to="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                ← ホームに戻る
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/terms-of-service"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  利用規約
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  お問い合わせ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 