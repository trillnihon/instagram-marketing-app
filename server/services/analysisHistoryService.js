import { AnalysisHistory } from '../models/AnalysisHistory.js';

// 分析履歴を保存
export const saveAnalysisHistory = async (userId, analysisData) => {
  try {
    const {
      analysisType,
      postData,
      engagementScore,
      algorithmFactors,
      feedback,
      recommendations,
      strengths,
      weaknesses,
      metadata = {}
    } = analysisData;

    const analysisHistory = new AnalysisHistory({
      userId,
      analysisType,
      postData,
      engagementScore,
      algorithmFactors,
      feedback,
      recommendations,
      strengths,
      weaknesses,
      metadata: {
        ...metadata,
        processingTime: metadata.processingTime || 0,
        aiModel: metadata.aiModel || 'gpt-4',
        confidence: metadata.confidence || 0.8
      }
    });

    await analysisHistory.save();
    console.log(`✅ 分析履歴を保存しました: ${analysisType} for user ${userId}`);
    
    return analysisHistory;
  } catch (error) {
    console.error('❌ 分析履歴保存エラー:', error);
    throw error;
  }
};

// ユーザーの分析履歴を取得
export const getUserAnalysisHistory = async (userId, options = {}) => {
  try {
    const {
      analysisType,
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const history = await AnalysisHistory.getUserHistory(userId, {
      analysisType,
      limit,
      skip,
      sortBy,
      sortOrder
    });

    return history;
  } catch (error) {
    console.error('❌ 分析履歴取得エラー:', error);
    throw error;
  }
};

// ユーザーの統計情報を取得
export const getUserAnalysisStats = async (userId) => {
  try {
    const stats = await AnalysisHistory.getUserStats(userId);
    const typeStats = await AnalysisHistory.getAnalysisTypeStats(userId);
    
    return {
      overall: stats[0] || {
        totalAnalyses: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        analysisTypes: [],
        totalExported: 0
      },
      byType: typeStats
    };
  } catch (error) {
    console.error('❌ 統計情報取得エラー:', error);
    throw error;
  }
};

// 特定の分析履歴を取得
export const getAnalysisHistoryById = async (historyId, userId) => {
  try {
    const history = await AnalysisHistory.findOne({
      _id: historyId,
      userId: userId
    }).populate('userId', 'username email profile.displayName');

    if (!history) {
      throw new Error('分析履歴が見つかりません');
    }

    return history;
  } catch (error) {
    console.error('❌ 分析履歴取得エラー:', error);
    throw error;
  }
};

// 分析履歴を更新
export const updateAnalysisHistory = async (historyId, userId, updates) => {
  try {
    const history = await AnalysisHistory.findOneAndUpdate(
      { _id: historyId, userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!history) {
      throw new Error('分析履歴が見つかりません');
    }

    return history;
  } catch (error) {
    console.error('❌ 分析履歴更新エラー:', error);
    throw error;
  }
};

// 分析履歴を削除
export const deleteAnalysisHistory = async (historyId, userId) => {
  try {
    const result = await AnalysisHistory.findOneAndDelete({
      _id: historyId,
      userId: userId
    });

    if (!result) {
      throw new Error('分析履歴が見つかりません');
    }

    return { success: true, message: '分析履歴を削除しました' };
  } catch (error) {
    console.error('❌ 分析履歴削除エラー:', error);
    throw error;
  }
};

// PDFエクスポート状態を更新
export const markAnalysisAsExported = async (historyId, userId) => {
  try {
    const history = await AnalysisHistory.findOne({
      _id: historyId,
      userId: userId
    });

    if (!history) {
      throw new Error('分析履歴が見つかりません');
    }

    await history.markAsExported();
    return history;
  } catch (error) {
    console.error('❌ PDFエクスポート状態更新エラー:', error);
    throw error;
  }
};

// 分析履歴の検索
export const searchAnalysisHistory = async (userId, searchParams) => {
  try {
    const {
      query,
      analysisType,
      dateFrom,
      dateTo,
      minScore,
      maxScore,
      limit = 20,
      skip = 0
    } = searchParams;

    const searchQuery = { userId };

    // 分析タイプフィルター
    if (analysisType) {
      searchQuery.analysisType = analysisType;
    }

    // 日付範囲フィルター
    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
    }

    // スコア範囲フィルター
    if (minScore || maxScore) {
      searchQuery.engagementScore = {};
      if (minScore) searchQuery.engagementScore.$gte = minScore;
      if (maxScore) searchQuery.engagementScore.$lte = maxScore;
    }

    // テキスト検索
    if (query) {
      searchQuery.$or = [
        { 'postData.caption': { $regex: query, $options: 'i' } },
        { 'postData.hashtags': { $regex: query, $options: 'i' } },
        { feedback: { $regex: query, $options: 'i' } }
      ];
    }

    const history = await AnalysisHistory.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email profile.displayName');

    const total = await AnalysisHistory.countDocuments(searchQuery);

    return {
      history,
      total,
      hasMore: total > skip + limit
    };
  } catch (error) {
    console.error('❌ 分析履歴検索エラー:', error);
    throw error;
  }
};

// 分析履歴の一括操作
export const bulkUpdateAnalysisHistory = async (userId, historyIds, updates) => {
  try {
    const result = await AnalysisHistory.updateMany(
      { _id: { $in: historyIds }, userId: userId },
      { $set: updates }
    );

    return result;
  } catch (error) {
    console.error('❌ 一括更新エラー:', error);
    throw error;
  }
};

// 分析履歴のエクスポート（CSV/JSON）
export const exportAnalysisHistory = async (userId, format = 'json', options = {}) => {
  try {
    const { analysisType, dateFrom, dateTo } = options;
    
    const query = { userId };
    if (analysisType) query.analysisType = analysisType;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const history = await AnalysisHistory.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email profile.displayName');

    if (format === 'csv') {
      return convertToCSV(history);
    }

    return history;
  } catch (error) {
    console.error('❌ 分析履歴エクスポートエラー:', error);
    throw error;
  }
};

// CSV変換ヘルパー関数
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = [
    'ID',
    '分析タイプ',
    '作成日',
    'エンゲージメントスコア',
    '投稿ID',
    'キャプション',
    'ハッシュタグ',
    'いいね数',
    'コメント数',
    '保存数',
    'シェア数',
    'リーチ数',
    'インプレッション数',
    'フィードバック',
    'PDFエクスポート済み'
  ];

  const csvRows = [headers.join(',')];

  data.forEach(item => {
    const row = [
      item._id,
      item.analysisType,
      item.createdAt.toISOString(),
      item.engagementScore,
      item.postData?.postId || '',
      `"${(item.postData?.caption || '').replace(/"/g, '""')}"`,
      `"${(item.postData?.hashtags || []).join(', ')}"`,
      item.postData?.engagement?.likes || 0,
      item.postData?.engagement?.comments || 0,
      item.postData?.engagement?.saves || 0,
      item.postData?.engagement?.shares || 0,
      item.postData?.engagement?.reach || 0,
      item.postData?.engagement?.impressions || 0,
      `"${item.feedback.replace(/"/g, '""')}"`,
      item.exportedToPDF ? 'Yes' : 'No'
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}; 