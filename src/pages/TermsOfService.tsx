import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation activeTab="terms" onTabChange={() => {}} showAdminLink={false} />
        
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              利用規約
            </h1>
            <p className="text-sm text-gray-600">
              最終更新日: 2025年1月25日
            </p>
          </div>

          <div className="prose prose-sm sm:prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. サービスの概要</h2>
              <p className="text-gray-700 mb-4">
                本サービス（Instagram & Threads分析アプリ）は、InstagramおよびThreadsの投稿分析、最適化提案、AI投稿文生成を提供するWebアプリケーションです。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 利用条件</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  本サービスを利用するには、以下の条件を満たす必要があります：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>18歳以上であること</li>
                  <li>Instagramアカウントを保有していること</li>
                  <li>本利用規約に同意すること</li>
                  <li>適切な利用目的でサービスを利用すること</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 禁止事項</h2>
              <div className="space-y-4 text-gray-700">
                <p>以下の行為は禁止されています：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>法令違反行為</li>
                  <li>他者の権利を侵害する行為</li>
                  <li>サービスの運営を妨害する行為</li>
                  <li>不正アクセスやハッキング行為</li>
                  <li>スパムや迷惑行為</li>
                  <li>著作権侵害行為</li>
                  <li>その他、当社が不適切と判断する行為</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. プライバシー</h2>
              <p className="text-gray-700 mb-4">
                お客様のプライバシーは重要です。個人情報の取り扱いについては、
                <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                  プライバシーポリシー
                </Link>
                をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 免責事項</h2>
              <div className="space-y-4 text-gray-700">
                <p>当社は以下の事項について責任を負いません：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>サービスの利用により生じた損害</li>
                  <li>分析結果の正確性や完全性</li>
                  <li>InstagramやThreadsの仕様変更による影響</li>
                  <li>システム障害やメンテナンスによるサービス停止</li>
                  <li>第三者による不正利用</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. 利用制限</h2>
              <div className="space-y-4 text-gray-700">
                <p>無料プランでは以下の制限があります：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>月間分析回数: 10回</li>
                  <li>AI投稿文生成: 5回</li>
                  <li>履歴保存期間: 30日</li>
                  <li>一部の高度な機能は利用できません</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. 利用規約の変更</h2>
              <p className="text-gray-700 mb-4">
                当社は、事前の通知なく本利用規約を変更する場合があります。
                変更後は、本ページで最新の利用規約をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. お問い合わせ</h2>
              <p className="text-gray-700 mb-4">
                本利用規約に関するお問い合わせは、以下の方法でお願いします：
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  📧 メール: support@instagram-analyzer.com<br />
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
                  to="/privacy-policy"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  プライバシーポリシー
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

export default TermsOfService; 