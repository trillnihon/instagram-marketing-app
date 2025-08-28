import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  saveAnalysisHistory,
  getUserAnalysisHistory,
  getUserAnalysisStats,
  getAnalysisHistoryById,
  updateAnalysisHistory,
  deleteAnalysisHistory,
  markAnalysisAsExported,
  searchAnalysisHistory,
  bulkUpdateAnalysisHistory,
  exportAnalysisHistory
} from '../services/analysisHistoryService.js';

const router = express.Router();

let history = [];

// 履歴取得
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const userHistory = history.filter(h => h.userId === userId);
  // データが空でも200 OKを返す（404エラーを解消）
  res.json({ 
    success: true, 
    data: userHistory,
    message: userHistory.length === 0 ? '履歴データが存在しません（初回利用の可能性があります）' : '履歴データを取得しました'
  });
});

// 履歴追加
router.post('/', (req, res) => {
  const { userId, analysis } = req.body;
  if (!userId || !analysis) {
    return res.status(400).json({ error: 'userId and analysis are required' });
  }
  const newHistory = { id: Date.now().toString(), userId, analysis, createdAt: new Date() };
  history.push(newHistory);
  res.json({ success: true, entry: newHistory });
});

// ヘルスチェック（認証不要）
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '分析履歴APIサービスは正常に動作しています',
    timestamp: new Date().toISOString()
  });
});

// すべてのエンドポイントで認証が必要
router.use(authenticateToken);

// 分析履歴を保存
router.post('/save', async (req, res) => {
  try {
    const userId = req.user._id;
    const analysisData = req.body;

    const savedHistory = await saveAnalysisHistory(userId, analysisData);

    res.status(201).json({
      success: true,
      message: '分析履歴を保存しました',
      data: savedHistory
    });
  } catch (error) {
    console.error('分析履歴保存エラー:', error);
    res.status(500).json({
      success: false,
      error: '分析履歴の保存に失敗しました'
    });
  }
});

// ユーザーの分析履歴を取得
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      analysisType,
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const history = await getUserAnalysisHistory(userId, {
      analysisType,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('分析履歴取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '分析履歴の取得に失敗しました'
    });
  }
});

// ユーザーの統計情報を取得
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await getUserAnalysisStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '統計情報の取得に失敗しました'
    });
  }
});

// 特定の分析履歴を取得
router.get('/history/:historyId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { historyId } = req.params;

    const history = await getAnalysisHistoryById(historyId, userId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('分析履歴取得エラー:', error);
    res.status(404).json({
      success: false,
      error: '分析履歴が見つかりません'
    });
  }
});

// 分析履歴を更新
router.put('/history/:historyId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { historyId } = req.params;
    const updates = req.body;

    const updatedHistory = await updateAnalysisHistory(historyId, userId, updates);

    res.json({
      success: true,
      message: '分析履歴を更新しました',
      data: updatedHistory
    });
  } catch (error) {
    console.error('分析履歴更新エラー:', error);
    res.status(500).json({
      success: false,
      error: '分析履歴の更新に失敗しました'
    });
  }
});

// 分析履歴を削除
router.delete('/history/:historyId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { historyId } = req.params;

    const result = await deleteAnalysisHistory(historyId, userId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('分析履歴削除エラー:', error);
    res.status(500).json({
      success: false,
      error: '分析履歴の削除に失敗しました'
    });
  }
});

// PDFエクスポート状態を更新
router.patch('/history/:historyId/export', async (req, res) => {
  try {
    const userId = req.user._id;
    const { historyId } = req.params;

    const updatedHistory = await markAnalysisAsExported(historyId, userId);

    res.json({
      success: true,
      message: 'PDFエクスポート状態を更新しました',
      data: updatedHistory
    });
  } catch (error) {
    console.error('PDFエクスポート状態更新エラー:', error);
    res.status(500).json({
      success: false,
      error: 'PDFエクスポート状態の更新に失敗しました'
    });
  }
});

// 分析履歴を検索
router.get('/search', async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      query,
      analysisType,
      dateFrom,
      dateTo,
      minScore,
      maxScore,
      limit = 20,
      skip = 0
    } = req.query;

    const searchResult = await searchAnalysisHistory(userId, {
      query,
      analysisType,
      dateFrom,
      dateTo,
      minScore: minScore ? parseFloat(minScore) : undefined,
      maxScore: maxScore ? parseFloat(maxScore) : undefined,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({
      success: true,
      data: searchResult
    });
  } catch (error) {
    console.error('分析履歴検索エラー:', error);
    res.status(500).json({
      success: false,
      error: '分析履歴の検索に失敗しました'
    });
  }
});

// 分析履歴の一括更新
router.patch('/bulk-update', async (req, res) => {
  try {
    const userId = req.user._id;
    const { historyIds, updates } = req.body;

    if (!historyIds || !Array.isArray(historyIds) || historyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '更新対象の履歴IDが必要です'
      });
    }

    const result = await bulkUpdateAnalysisHistory(userId, historyIds, updates);

    res.json({
      success: true,
      message: `${result.modifiedCount}件の分析履歴を更新しました`,
      data: result
    });
  } catch (error) {
    console.error('一括更新エラー:', error);
    res.status(500).json({
      success: false,
      error: '一括更新に失敗しました'
    });
  }
});

// 分析履歴をエクスポート
router.get('/export', async (req, res) => {
  try {
    const userId = req.user._id;
    const { format = 'json', analysisType, dateFrom, dateTo } = req.query;

    const exportData = await exportAnalysisHistory(userId, format, {
      analysisType,
      dateFrom,
      dateTo
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analysis_history_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(exportData);
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error('分析履歴エクスポートエラー:', error);
    res.status(500).json({
      success: false,
      error: '分析履歴のエクスポートに失敗しました'
    });
  }
});

// 分析履歴の一括削除
router.delete('/bulk-delete', async (req, res) => {
  try {
    const userId = req.user._id;
    const { historyIds } = req.body;

    if (!historyIds || !Array.isArray(historyIds) || historyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '削除対象の履歴IDが必要です'
      });
    }

    // 分析履歴モデルをインポート
    const { AnalysisHistory } = await import('../models/AnalysisHistory.js');
    
    const result = await AnalysisHistory.deleteMany({
      _id: { $in: historyIds },
      userId: userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount}件の分析履歴を削除しました`,
      data: result
    });
  } catch (error) {
    console.error('一括削除エラー:', error);
    res.status(500).json({
      success: false,
      error: '一括削除に失敗しました'
    });
  }
});

export default router; 