import logger from '../utils/logger.js';

// カスタムエラークラス
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// エラーハンドラーミドルウェア
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // ログ出力
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose バリデーションエラー
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Mongoose 重複キーエラー
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} は既に使用されています`;
    error = new AppError(message, 400);
  }

  // Mongoose 無効なIDエラー
  if (err.name === 'CastError') {
    const message = '無効なIDです';
    error = new AppError(message, 400);
  }

  // JWT エラー
  if (err.name === 'JsonWebTokenError') {
    const message = '無効なトークンです';
    error = new AppError(message, 401);
  }

  // JWT 期限切れエラー
  if (err.name === 'TokenExpiredError') {
    const message = 'トークンの有効期限が切れています';
    error = new AppError(message, 401);
  }

  // 統一されたエラーレスポンス
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'サーバー内部エラーが発生しました',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404エラーハンドラー
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`エンドポイント ${req.originalUrl} が見つかりません`, 404);
  next(error);
};

// 非同期エラーハンドラー
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 