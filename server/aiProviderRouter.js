import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

// OpenAIクライアントの初期化（APIキーがある場合のみ）
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

// Geminiクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// AIプロバイダー決定ロジック
function getDefaultProvider() {
    const envProvider = process.env.AI_PROVIDER;
    if (envProvider === 'gpt-3.5' || envProvider === 'gpt-4' || envProvider === 'gemini-pro') {
        return envProvider;
    }
    return 'gpt-3.5'; // デフォルト
}
// OpenAI GPT-3.5/GPT-4で分析
async function analyzeWithOpenAI(caption, model) {
    // OpenAI APIキーが設定されていない場合はデモモード
    if (!openai) {
        console.log('OpenAI APIキーが設定されていません。デモモードで動作します。');
        return {
            score: 75,
            reasons: ['デモモード: AI分析が完了しました'],
            suggestions: ['キャプションの改善を検討してください']
        };
    }

    const prompt = `
以下のInstagram投稿のキャプションを分析し、スコア（0-100）、評価理由、改善提案を提供してください。

キャプション: "${caption}"

以下のJSON形式で回答してください：
{
  "score": 数値（0-100）,
  "reasons": ["評価理由1", "評価理由2"],
  "suggestions": ["改善提案1", "改善提案2"]
}
`;
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: "あなたはInstagram投稿分析の専門家です。投稿の効果を数値化し、具体的な改善提案を提供してください。"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
    });
    const response = completion.choices[0]?.message?.content;
    if (!response) {
        throw new Error('OpenAI APIからの応答が空です');
    }
    try {
        // JSONレスポンスを解析
        const result = JSON.parse(response);
        return {
            score: result.score || 50,
            reasons: result.reasons || ['分析完了'],
            suggestions: result.suggestions || ['改善提案を確認してください']
        };
    }
    catch (error) {
        // JSON解析に失敗した場合のフォールバック
        return {
            score: 75,
            reasons: ['AI分析が完了しました'],
            suggestions: ['キャプションの改善を検討してください']
        };
    }
}
// Gemini Proで分析
async function analyzeWithGemini(caption) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
以下のInstagram投稿のキャプションを分析し、スコア（0-100）、評価理由、改善提案を提供してください。

キャプション: "${caption}"

以下のJSON形式で回答してください：
{
  "score": 数値（0-100）,
  "reasons": ["評価理由1", "評価理由2"],
  "suggestions": ["改善提案1", "改善提案2"]
}
`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    if (!response) {
        throw new Error('Gemini APIからの応答が空です');
    }
    try {
        // JSONレスポンスを解析
        const parsedResult = JSON.parse(response);
        return {
            score: parsedResult.score || 50,
            reasons: parsedResult.reasons || ['分析完了'],
            suggestions: parsedResult.suggestions || ['改善提案を確認してください']
        };
    }
    catch (error) {
        // JSON解析に失敗した場合のフォールバック
        return {
            score: 70,
            reasons: ['Gemini AI分析が完了しました'],
            suggestions: ['キャプションの改善を検討してください']
        };
    }
}
// メイン関数
export async function analyzePost(userId, post) {
    // プロバイダーを決定（フロントエンドから送信されたもの、またはデフォルト）
    const provider = post.aiProvider || getDefaultProvider();
    console.log(`AI分析開始 - ユーザー: ${userId}, プロバイダー: ${provider}`);
    try {
        let result;
        // プロバイダーごとに処理を分岐
        if (provider === 'gpt-3.5') {
            result = await analyzeWithOpenAI(post.caption, 'gpt-3.5-turbo');
        }
        else if (provider === 'gpt-4') {
            result = await analyzeWithOpenAI(post.caption, 'gpt-4');
        }
        else if (provider === 'gemini-pro') {
            result = await analyzeWithGemini(post.caption);
        }
        else {
            throw new Error(`サポートされていないAIプロバイダーです: ${provider}`);
        }
        console.log(`AI分析完了 - プロバイダー: ${provider}, スコア: ${result.score}`);
        return result;
    }
    catch (error) {
        console.error(`AI分析エラー - プロバイダー: ${provider}`, error);
        // エラー時のフォールバック
        return {
            score: 50,
            reasons: [`${provider}での分析中にエラーが発生しました`],
            suggestions: ['別のプロバイダーで再試行してください']
        };
    }
}
