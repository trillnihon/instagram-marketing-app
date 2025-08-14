import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAIクライアントの初期化（APIキーがある場合のみ）
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export class AIPostGenerator {
  static async generateInstagramPost(keywords, targetAudience, hashtagCandidates, tone = 'professional') {
    try {
      // OpenAI APIキーが設定されていない場合はデモモード
      if (!openai) {
        console.log('OpenAI APIキーが設定されていません。デモモードで動作します。');
        return {
          caption: `デモモード: ${keywords} に関する魅力的な投稿です！${targetAudience} の皆さんに響く内容になっています。`,
          hashtags: hashtagCandidates ? hashtagCandidates.split(',').slice(0, 5) : ['#デモ', '#テスト', '#instagram'],
          cta: 'コメントで感想を教えてください！',
          engagement_question: 'あなたはどう思いますか？',
          optimization_tips: ['ハッシュタグを最適化しましょう', 'エンゲージメントを促す質問を追加しましょう']
        };
      }

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
      // OpenAI APIキーが設定されていない場合はデモモード
      if (!openai) {
        console.log('OpenAI APIキーが設定されていません。デモモードで動作します。');
        return {
          post: `デモモード: ${keywords} について話しましょう！${targetAudience} の皆さんはどう思いますか？`,
          hashtags: hashtagCandidates ? hashtagCandidates.split(',').slice(0, 3) : ['#デモ', '#テスト', '#threads'],
          follow_up_question: 'あなたの経験を教えてください！',
          conversation_starters: ['このトピックについてどう思いますか？', '経験談を聞かせてください'],
          optimization_tips: ['会話を促す質問を追加しましょう', 'コミュニティ参加を促しましょう']
        };
      }

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