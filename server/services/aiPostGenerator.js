import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIPostGenerator {
  static async generateInstagramPost(keywords, targetAudience, hashtagCandidates, tone = 'professional') {
    try {
      const prompt = `
以下の情報を基に、Instagram用の最適化された投稿文を生成してください：

キーワード: ${keywords}
ターゲット層: ${targetAudience}
ハッシュタグ候補: ${hashtagCandidates}
トーン: ${tone}

以下の要素を含めてください：
- 魅力的なキャプション（150文字以内）
- 適切なハッシュタグ（5-10個）
- CTA（行動喚起）
- エンゲージメントを促す質問
- 2025年のInstagramアルゴリズムに最適化

JSON形式で返してください：
{
  "caption": "投稿文",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2"],
  "cta": "CTA文",
  "engagement_question": "エンゲージメント質問",
  "optimization_tips": ["最適化のヒント1", "最適化のヒント2"]
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "あなたはInstagramマーケティングの専門家です。エンゲージメント率を最大化する投稿文を作成してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('AI投稿文生成エラー:', error);
      throw new Error('投稿文の生成に失敗しました');
    }
  }

  static async generateThreadsPost(keywords, targetAudience, hashtagCandidates, tone = 'conversational') {
    try {
      const prompt = `
以下の情報を基に、Threads用の最適化された投稿文を生成してください：

キーワード: ${keywords}
ターゲット層: ${targetAudience}
ハッシュタグ候補: ${hashtagCandidates}
トーン: ${tone}

以下の要素を含めてください：
- 会話を促す投稿文（280文字以内）
- 適切なハッシュタグ（3-5個）
- フォローアップ質問
- 2025年のThreadsアルゴリズムに最適化
- コミュニティ参加を促す要素

JSON形式で返してください：
{
  "post": "投稿文",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2"],
  "follow_up_question": "フォローアップ質問",
  "conversation_starters": ["会話のきっかけ1", "会話のきっかけ2"],
  "optimization_tips": ["最適化のヒント1", "最適化のヒント2"]
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "あなたはThreadsマーケティングの専門家です。会話とエンゲージメントを最大化する投稿文を作成してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('AI投稿文生成エラー:', error);
      throw new Error('投稿文の生成に失敗しました');
    }
  }

  static async generateOptimizedPost(keywords, targetAudience, hashtagCandidates, platform = 'both') {
    try {
      let result = {};
      
      if (platform === 'instagram' || platform === 'both') {
        result.instagram = await this.generateInstagramPost(keywords, targetAudience, hashtagCandidates);
      }
      
      if (platform === 'threads' || platform === 'both') {
        result.threads = await this.generateThreadsPost(keywords, targetAudience, hashtagCandidates);
      }
      
      return result;
    } catch (error) {
      console.error('最適化投稿文生成エラー:', error);
      throw new Error('最適化投稿文の生成に失敗しました');
    }
  }
} 