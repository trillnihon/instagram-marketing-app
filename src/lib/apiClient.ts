/**
 * APIクライアント - 自動リトライ機能付き
 * Renderの無料プランのスピンダウン対策
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com/api';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelay: 500, // 初回500ms
  maxDelay: 5000,    // 最大5秒
  backoffMultiplier: 2
};

// リトライ対象のエラーかどうかを判定
function shouldRetry(status: number, error: Error | null): boolean {
  // HTTPステータスコードでリトライ判定
  if (status === 503 || status === 502 || status === 504) {
    return true;
  }
  
  // ネットワークエラーでリトライ判定
  if (error && (
    error.name === 'TypeError' || // fetch失敗
    error.name === 'AbortError' || // タイムアウト
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError')
  )) {
    return true;
  }
  
  return false;
}

// エクスポネンシャルバックオフでディレイ計算
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

// リトライ可能なfetch関数
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30秒タイムアウト
      });
      
      // 成功した場合
      if (response.ok) {
        if (attempt > 1) {
          console.log(`🔄 [API] リトライ成功 (${attempt}/${config.maxRetries}): ${url}`);
        }
        return response;
      }
      
      // リトライ対象のエラーかチェック
      if (shouldRetry(response.status, null)) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      } else {
        // リトライ対象外のエラーは即座に返す
        return response;
      }
      
    } catch (error) {
      lastError = error as Error;
      
      // リトライ対象のエラーかチェック
      if (!shouldRetry(0, lastError)) {
        throw lastError;
      }
    }
    
    // 最後の試行でない場合はリトライ
    if (attempt < config.maxRetries) {
      const delay = calculateDelay(attempt, config);
      console.log(`⏳ [API] リトライ待機 (${attempt}/${config.maxRetries}): ${delay}ms後に再試行 - ${url}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // 最大リトライ回数に達した場合
  console.error(`💀 [API] 最大リトライ回数に達しました: ${url}`);
  throw lastError || new Error('最大リトライ回数に達しました');
}

// 主要なAPI関数
export const apiClient = {
  // GET リクエスト
  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, { ...options, method: 'GET' });
  },
  
  // POST リクエスト
  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  // PUT リクエスト
  async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  // DELETE リクエスト
  async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, { ...options, method: 'DELETE' });
  },
  
  // カスタムリトライ設定付きリクエスト
  async request(
    endpoint: string,
    options: RequestInit = {},
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    return fetchWithRetry(url, options, retryConfig);
  }
};

// 既存のfetchを置き換えるためのヘルパー
export function createApiUrl(endpoint: string): string {
  return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
}

// デフォルトエクスポート
export default apiClient;
