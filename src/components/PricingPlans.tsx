import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  price: number;
  captionLimit: number;
  features: string[];
  priceId?: string;
}

interface PricingPlansProps {
  userId: string;
  currentPlan?: string;
  onPlanChange?: (planId: string) => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ userId, currentPlan = 'free', onPlanChange }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/plans`);
      setPlans(response.data.data);
    } catch (err) {
      setError('プラン情報の取得に失敗しました');
      console.error('Plans fetch error:', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Stripe Checkout Session作成
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/create-checkout-session`, {
        userId,
        planId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`
      });

      if (response.data.success) {
        // Stripe Checkoutにリダイレクト
        window.location.href = response.data.data.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '決済の開始に失敗しました');
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '無料';
    return `¥${price.toLocaleString()}/月`;
  };

  const formatLimit = (limit: number) => {
    if (limit >= 1000) return '無制限';
    return `${limit}回`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-red-500 hover:text-red-700 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          プランを選択してください
        </h2>
        <p className="text-lg text-gray-600">
          あなたのニーズに合わせて最適なプランをお選びください
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg border-2 p-8 ${
              currentPlan === plan.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  現在のプラン
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {formatPrice(plan.price)}
              </div>
              
              <div className="mb-6">
                <span className="text-gray-600">キャプション生成</span>
                <div className="text-2xl font-bold text-blue-600">
                  {formatLimit(plan.captionLimit)}
                </div>
              </div>

              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.id === 'free'
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    処理中...
                  </span>
                ) : currentPlan === plan.id ? (
                  '現在のプラン'
                ) : plan.id === 'free' ? (
                  '無料で開始'
                ) : (
                  'プランを選択'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 text-sm">
          すべてのプランには30日間の無料トライアルが含まれています
        </p>
        <p className="text-gray-600 text-sm mt-2">
          いつでもキャンセル可能です
        </p>
      </div>
    </div>
  );
};

export default PricingPlans; 