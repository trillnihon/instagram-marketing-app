import { 
  CaptionGenerationRequest, 
  CaptionGenerationResponse, 
  CaptionOption,
  PostGenre,
  PostPurpose,
  TargetAudience 
} from '../types';

// APIベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com';

// キャプション生成サービス
export class OpenAIService {
  
  // キャプション生成
  static async generateCaptions(request: CaptionGenerationRequest): Promise<CaptionGenerationResponse> {
    try {
      // デモユーザーまたは現在のユーザーの場合はAPI呼び出しをスキップ
      if (request.userId === 'demo_user' || request.userId === '17841474953463077') {
        console.log('[DEBUG] デモユーザーのためAPI呼び出しをスキップ');
        console.log('[DEBUG] デモユーザーの使用量カウントをスキップ');
        return {
          captions: [
            {
              id: 'demo_caption_1',
              text: '今日は素敵な一日でした！✨ 新しい発見があって、心が豊かになった気がします。みなさんも素敵な体験をシェアしてくださいね！#ライフスタイル #日常 #発見',
              style: 'conversational',
              estimatedSaveRate: 85,
              estimatedShareRate: 45,
              wordCount: 120
            },
            {
              id: 'demo_caption_2',
              text: '人生は小さな幸せの積み重ね。今日も新しい学びがありました。この瞬間を大切にしたいと思います。みなさんは今日どんな発見がありましたか？#幸せ #学び #感謝',
              style: 'inspirational',
              estimatedSaveRate: 75,
              estimatedShareRate: 65,
              wordCount: 150
            },
            {
              id: 'demo_caption_3',
              text: '朝のコーヒータイムは特別な時間。今日も新しい一日が始まります。みなさんはどんな朝のルーティンがありますか？#朝活 #コーヒー #ルーティン #新しい一日',
              style: 'conversational',
              estimatedSaveRate: 90,
              estimatedShareRate: 55,
              wordCount: 140
            }
          ],
          hashtags: ['#ライフスタイル', '#日常', '#発見', '#幸せ', '#学び', '#朝活', '#コーヒー', '#ルーティン'],
          estimatedEngagement: 78,
          tips: [
            '投稿時間は午前9-11時または午後7-9時がおすすめです',
            '画像とキャプションの一貫性を保ちましょう',
            'フォロワーとの対話を促進する質問を入れると効果的です'
          ],
          usage: {
            current: 0, // デモユーザーは常に0
            limit: 10
          }
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/generate-captions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'キャプション生成に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // エラーメッセージをより具体的にする
      if (error instanceof Error) {
        if (error.message.includes('API利用制限')) {
          throw new Error('API利用制限に達しました。しばらく時間をおいてから再試行してください。');
        } else if (error.message.includes('APIキーが無効')) {
          throw new Error('APIキーが無効です。管理者にお問い合わせください。');
        } else if (error.message.includes('リクエストが多すぎます')) {
          throw new Error('リクエストが多すぎます。しばらく時間をおいてから再試行してください。');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('サーバーに接続できません。ネットワーク接続を確認してください。');
        }
      }
      
      throw new Error('キャプション生成中にエラーが発生しました');
    }
  }

  // 使用量チェック
  static async checkUsage(): Promise<{
    totalUsage: number;
    limit: number;
    remaining: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usage`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '使用量の取得に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('Usage check error:', error);
      return {
        totalUsage: 0,
        limit: 1000000,
        remaining: 1000000
      };
    }
  }

  // 画像生成（将来的な機能）
  static async generateImage(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '画像生成に失敗しました');
      }

      return result.data.url;
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('画像生成に失敗しました');
    }
  }
}

export const openaiService = OpenAIService; 