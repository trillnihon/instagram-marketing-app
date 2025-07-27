import { AppError, ErrorContext, ErrorReport } from '../types';

// エラーハンドリングユーティリティ
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private errorCallbacks: ((error: AppError) => void)[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // エラーを記録
  static logError(
    error: Error | string,
    context: Partial<ErrorContext> = {},
    severity: AppError['severity'] = 'MEDIUM',
    type: AppError['type'] = 'UNKNOWN_ERROR'
  ): AppError {
    const handler = ErrorHandler.getInstance();
    const appError: AppError = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      location: this.getErrorLocation(),
      function: this.getCallingFunction(),
      type,
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'string' ? null : error,
      stack: typeof error === 'string' ? undefined : (error.stack || undefined),
      userAction: context.userAction,
      severity,
      resolved: false
    };

    handler.errors.push(appError);
    handler.notifyErrorListeners(appError);
    
    // コンソールに詳細なエラー情報を出力
    console.group(`🚨 エラー発生: ${appError.type} (${appError.severity})`);
    console.log(`📍 場所: ${appError.location}`);
    console.log(`🔧 関数: ${appError.function}`);
    console.log(`📝 メッセージ: ${appError.message}`);
    console.log(`👤 ユーザーアクション: ${appError.userAction || '不明'}`);
    if (appError.details) {
      console.log('📋 詳細:', appError.details);
    }
    if (appError.stack) {
      console.log('📚 スタックトレース:', appError.stack);
    }
    console.groupEnd();

    return appError;
  }

  // APIエラーを記録
  static logApiError(
    endpoint: string,
    error: Error | string,
    requestData?: any,
    responseData?: any,
    userAction?: string
  ): AppError {
    return this.logError(
      error,
      {
        apiEndpoint: endpoint,
        requestData,
        responseData,
        userAction
      },
      'HIGH',
      'API_ERROR'
    );
  }

  // 認証エラーを記録
  static logAuthError(
    error: Error | string,
    userAction?: string
  ): AppError {
    return this.logError(
      error,
      { userAction },
      'CRITICAL',
      'AUTH_ERROR'
    );
  }

  // バリデーションエラーを記録
  static logValidationError(
    field: string,
    value: any,
    rule: string,
    userAction?: string
  ): AppError {
    return this.logError(
      `バリデーションエラー: ${field} (${rule}) - 値: ${JSON.stringify(value)}`,
      { userAction },
      'LOW',
      'VALIDATION_ERROR'
    );
  }

  // ネットワークエラーを記録
  static logNetworkError(
    error: Error | string,
    url?: string,
    userAction?: string
  ): AppError {
    return this.logError(
      error,
      { apiEndpoint: url, userAction },
      'HIGH',
      'NETWORK_ERROR'
    );
  }

  // エラーリスナーを追加
  static onError(callback: (error: AppError) => void): void {
    const handler = ErrorHandler.getInstance();
    handler.errorCallbacks.push(callback);
  }

  // エラーリスナーを削除
  static offError(callback: (error: AppError) => void): void {
    const handler = ErrorHandler.getInstance();
    handler.errorCallbacks = handler.errorCallbacks.filter(cb => cb !== callback);
  }

  // エラーを解決済みとしてマーク
  static resolveError(errorId: string): void {
    const handler = ErrorHandler.getInstance();
    const error = handler.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      console.log(`✅ エラー解決済み: ${errorId}`);
    }
  }

  // すべてのエラーを取得
  static getAllErrors(): AppError[] {
    return ErrorHandler.getInstance().errors;
  }

  // 未解決のエラーを取得
  static getUnresolvedErrors(): AppError[] {
    return ErrorHandler.getInstance().errors.filter(e => !e.resolved);
  }

  // エラーをクリア
  static clearErrors(): void {
    ErrorHandler.getInstance().errors = [];
  }

  // エラーを追加（同期用）
  static addError(error: AppError): void {
    ErrorHandler.getInstance().errors.push(error);
  }

  // エラーレポートを生成
  static generateErrorReport(): ErrorReport[] {
    const handler = ErrorHandler.getInstance();
    return handler.errors.map(error => ({
      error,
      context: {
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        currentPage: window.location.pathname,
        userAction: error.userAction,
        apiEndpoint: error.details?.apiEndpoint
      },
      browserInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }));
  }

  // エラーをエクスポート
  static exportErrors(): string {
    const reports = this.generateErrorReport();
    return JSON.stringify(reports, null, 2);
  }

  // エラーをインポート
  static importErrors(data: string): boolean {
    try {
      const reports: ErrorReport[] = JSON.parse(data);
      const handler = ErrorHandler.getInstance();
      handler.errors = reports.map(report => report.error);
      return true;
    } catch (error) {
      console.error('エラーデータのインポートに失敗:', error);
      return false;
    }
  }

  // エラー統計を取得
  static getErrorStats() {
    const errors = this.getAllErrors();
    const unresolved = this.getUnresolvedErrors();
    
    const stats = {
      total: errors.length,
      unresolved: unresolved.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: errors.filter(e => {
        const errorDate = new Date(e.timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return errorDate > oneHourAgo;
      }).length
    };

    errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  // プライベートメソッド
  private notifyErrorListeners(error: AppError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('エラーリスナーの実行中にエラーが発生:', callbackError);
      }
    });
  }

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getErrorLocation(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown:0';

    const lines = stack.split('\n');
    // 3行目以降から実際の呼び出し元を探す
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('instagram-marketing-app/src/') && !line.includes('errorHandler.ts')) {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          const [, functionName, filePath, lineNumber] = match;
          const fileName = filePath.split('/').pop() || 'unknown';
          return `${fileName}:${lineNumber}`;
        }
      }
    }
    return 'unknown:0';
  }

  private static getCallingFunction(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('instagram-marketing-app/src/') && !line.includes('errorHandler.ts')) {
        const match = line.match(/at\s+(.+?)\s+\(/);
        if (match) {
          return match[1];
        }
      }
    }
    return 'unknown';
  }

  private static getCurrentUserId(): string | undefined {
    // ストアからユーザーIDを取得する実装
    try {
      const store = localStorage.getItem('app-store');
      if (store) {
        const data = JSON.parse(store);
        return data.state?.currentUser?.userId;
      }
    } catch (error) {
      console.warn('ユーザーIDの取得に失敗:', error);
    }
    return undefined;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

// グローバルエラーハンドラーを設定
export const setupGlobalErrorHandling = () => {
  // 未処理のPromiseエラーをキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.logError(
      event.reason,
      { userAction: 'Promise rejection' },
      'HIGH',
      'UNKNOWN_ERROR'
    );
  });

  // 未処理のエラーをキャッチ
  window.addEventListener('error', (event) => {
    ErrorHandler.logError(
      event.error || new Error(event.message),
      { userAction: 'Global error' },
      'HIGH',
      'UNKNOWN_ERROR'
    );
  });

  console.log('🔧 グローバルエラーハンドリングが設定されました');
};

// デバッグ用のエラーハンドラー
export const debugErrorHandler = {
  // すべてのエラーをコンソールに表示
  showAllErrors: () => {
    const errors = ErrorHandler.getAllErrors();
    console.group('📊 すべてのエラー');
    errors.forEach(error => {
      console.log(`[${error.severity}] ${error.type}: ${error.message} (${error.location})`);
    });
    console.groupEnd();
  },

  // エラー統計を表示
  showErrorStats: () => {
    const stats = ErrorHandler.getErrorStats();
    console.group('📈 エラー統計');
    console.log('総エラー数:', stats.total);
    console.log('未解決エラー数:', stats.unresolved);
    console.log('1時間以内のエラー数:', stats.recent);
    console.log('タイプ別:', stats.byType);
    console.log('重要度別:', stats.bySeverity);
    console.groupEnd();
  },

  // エラーをクリア
  clearAllErrors: () => {
    ErrorHandler.clearErrors();
    console.log('🗑️ すべてのエラーをクリアしました');
  },

  // エラーをエクスポート
  exportErrors: () => {
    return ErrorHandler.exportErrors();
  }
}; 