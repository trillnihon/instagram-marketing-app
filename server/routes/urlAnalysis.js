import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// OpenAIクライアントの初期化（APIキーがある場合のみ）
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// 分析テンプレート
const analysisTemplates = {
  general: {
    system: "あなたはInstagram投稿分析の専門家です。投稿URLを分析して、エンゲージメント率、投稿スタイル、ハッシュタグ、CTAについて詳細な分析を行ってください。",
    user: "以下はInstagram投稿のURLです。この投稿について以下の項目で分析してください：\n\n1. 推定エンゲージメント率とその理由\n2. 投稿スタイルの特徴\n3. ハッシュタグの改善案\n4. CTA（行動喚起）の最適化案\n5. 総合評価と改善ポイント\n\nURL: {url}"
  },
  sales: {
    system: "あなたはInstagram投稿分析の専門家で、特に売上向上に焦点を当てた分析を行います。",
    user: "以下はInstagram投稿のURLです。売上向上の観点から以下の項目で分析してください：\n\n1. 売上への影響度と推定効果\n2. 商品訴求力の分析\n3. 購買意欲を高めるハッシュタグ提案\n4. 売上向上のためのCTA改善案\n5. 総合的な売上戦略評価\n\nURL: {url}"
  },
  engagement: {
    system: "あなたはInstagram投稿分析の専門家で、特にエンゲージメント向上に焦点を当てた分析を行います。",
    user: "以下はInstagram投稿のURLです。エンゲージメント向上の観点から以下の項目で分析してください：\n\n1. 現在のエンゲージメント率推定と改善余地\n2. エンゲージメントを高める投稿スタイル分析\n3. エンゲージメント向上のためのハッシュタグ戦略\n4. コメント・いいねを誘発するCTA案\n5. 総合的なエンゲージメント戦略評価\n\nURL: {url}"
  },
  saves: {
    system: "あなたはInstagram投稿分析の専門家で、特に保存率向上に焦点を当てた分析を行います。",
    user: "以下はInstagram投稿のURLです。保存率向上の観点から以下の項目で分析してください：\n\n1. 保存率推定と改善ポイント\n2. 保存したくなる投稿スタイルの特徴\n3. 保存率向上のためのハッシュタグ提案\n4. 保存を促すCTA改善案\n5. 総合的な保存率戦略評価\n\nURL: {url}"
  },
  brand: {
    system: "あなたはInstagram投稿分析の専門家で、特にブランド認知向上に焦点を当てた分析を行います。",
    user: "以下はInstagram投稿のURLです。ブランド認知向上の観点から以下の項目で分析してください：\n\n1. ブランド認知への影響度分析\n2. ブランドイメージの表現スタイル\n3. ブランド認知向上のためのハッシュタグ戦略\n4. ブランド想起を高めるCTA案\n5. 総合的なブランド戦略評価\n\nURL: {url}"
  }
};

// レスポンスを構造化する関数
function structureResponse(content) {
  const sections = {
    engagement: '',
    style: '',
    hashtags: '',
    cta: '',
    overall: ''
  };

  // レスポンスをセクションごとに分割
  const lines = content.split('\n');
  let currentSection = 'overall';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('エンゲージメント') || trimmedLine.includes('1.')) {
      currentSection = 'engagement';
    } else if (trimmedLine.includes('スタイル') || trimmedLine.includes('2.')) {
      currentSection = 'style';
    } else if (trimmedLine.includes('ハッシュタグ') || trimmedLine.includes('3.')) {
      currentSection = 'hashtags';
    } else if (trimmedLine.includes('CTA') || trimmedLine.includes('4.')) {
      currentSection = 'cta';
    } else if (trimmedLine.includes('総合') || trimmedLine.includes('5.')) {
      currentSection = 'overall';
    }
    
    if (trimmedLine && !trimmedLine.match(/^\d+\./)) {
      sections[currentSection] += (sections[currentSection] ? '\n' : '') + trimmedLine;
    }
  }

  // 空のセクションにデフォルトメッセージを設定
  Object.keys(sections).forEach(key => {
    if (!sections[key].trim()) {
      sections[key] = 'この項目の分析結果が取得できませんでした。';
    }
  });

  return sections;
}

// URL分析エンドポイント
router.post('/analyze-url', async (req, res) => {
  try {
    const { url, template = 'general', userId } = req.body;

    // バリデーション
    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'URLが必要です'
      });
    }

    // Instagram URLの形式チェック
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/;
    if (!instagramRegex.test(url)) {
      return res.status(400).json({
        success: false,
        error: '有効なInstagram投稿URLを入力してください'
      });
    }

    // テンプレートの選択
    const selectedTemplate = analysisTemplates[template] || analysisTemplates.general;
    const prompt = selectedTemplate.user.replace('{url}', url);

    console.log('🔍 [DEBUG] URL分析開始:', {
      url: url.substring(0, 50) + '...',
      template,
      userId,
      timestamp: new Date().toISOString()
    });

    // OpenAI API呼び出し（デモモード対応）
    let analysisContent;
    if (!openai) {
      console.log('OpenAI APIキーが設定されていません。デモモードで動作します。');
      analysisContent = `デモモード: ${url} の分析結果

1. 推定エンゲージメント率とその理由
推定エンゲージメント率: 4.5%
理由: ハッシュタグの使用が適切で、視覚的に魅力的な投稿

2. 投稿スタイルの特徴
ビジュアル重視の投稿スタイルで、ブランドの一貫性が保たれています。

3. ハッシュタグの改善案
より具体的で関連性の高いハッシュタグを追加することをお勧めします。

4. CTA（行動喚起）の最適化案
明確な行動喚起を含めることで、エンゲージメント率の向上が期待できます。

5. 総合評価と改善ポイント
全体的に良好な投稿ですが、CTAの強化とハッシュタグの最適化でさらなる改善が可能です。`;
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: selectedTemplate.system
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });
      analysisContent = completion.choices[0].message.content;
    }
    
    // レスポンスを構造化
    const structuredResult = structureResponse(analysisContent);

    console.log('✅ [DEBUG] URL分析完了:', {
      url: url.substring(0, 50) + '...',
      template,
      userId,
      resultSections: Object.keys(structuredResult),
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      result: structuredResult,
      rawContent: analysisContent // デバッグ用
    });

  } catch (error) {
    console.error('❌ [DEBUG] URL分析エラー:', error);
    
    // OpenAI APIエラーの詳細ログ
    if (error.response) {
      console.error('OpenAI API Error:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      error: '分析に失敗しました。しばらく時間をおいて再度お試しください。',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 分析履歴取得エンドポイント（オプション）
router.get('/analysis-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // 実際の実装ではDBから取得
    // 現在はダミーデータを返す
    const history = [
      {
        id: '1',
        url: 'https://www.instagram.com/p/example1/',
        template: 'general',
        timestamp: new Date().toISOString(),
        result: {
          engagement: '推定エンゲージメント率: 5.2%',
          style: 'ビジュアル重視の投稿スタイル',
          hashtags: 'ハッシュタグの改善提案',
          cta: 'CTA最適化案',
          overall: '総合評価'
        }
      }
    ];

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('履歴取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '履歴の取得に失敗しました'
    });
  }
});

export default router; 