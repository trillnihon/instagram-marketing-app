#!/usr/bin/env tsx

/**
 * Instagram Marketing App - ヘルスチェックスクリプト
 * 
 * このスクリプトは以下のサービスの到達性をチェックします：
 * 1. バックエンドサーバー (ポート4000)
 * 2. フロントエンドサーバー (ポート3001)
 * 3. Facebook Graph API
 * 
 * オプション:
 * --json: JSON形式で出力
 * --verbose: 詳細情報を出力
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// 環境変数の読み込み
dotenv.config({ path: '../server/env.development' });

// 設定
const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  GRAPH_API_URL: 'https://graph.facebook.com/v19.0/me',
  TIMEOUT: 10000, // 10秒
  RETRY_COUNT: 2
};

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isJsonOutput = args.includes('--json');
const isVerbose = args.includes('--verbose');

// カラーコード（Windows PowerShell対応）
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// ログ出力関数
function log(message: string, color: keyof typeof colors = 'reset') {
  if (!isJsonOutput) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ️ ${message}`, 'blue');
}

function logWarning(message: string) {
  log(`⚠️ ${message}`, 'yellow');
}

// ヘルスチェック結果の型定義
interface HealthCheckResult {
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    backend: ServiceStatus;
    frontend: ServiceStatus;
    graphApi: ServiceStatus;
  };
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  metadata: {
    scriptVersion: string;
    executionTime: string;
    nodeVersion: string;
  };
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  url: string;
  responseTime: number;
  error?: string;
  details?: any;
}

// サービスヘルスチェック関数
async function checkService(url: string, name: string, options: any = {}): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      signal: controller.signal,
      ...options
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        name,
        status: 'healthy',
        url,
        responseTime,
        details: {
          statusCode: response.status,
          statusText: response.statusText
        }
      };
    } else {
      return {
        name,
        status: 'degraded',
        url,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          statusCode: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      name,
      status: 'unhealthy',
      url,
      responseTime,
      error: errorMessage,
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: errorMessage
      }
    };
  }
}

// バックエンドサーバーのヘルスチェック
async function checkBackend(): Promise<ServiceStatus> {
  return await checkService(`${CONFIG.BACKEND_URL}/health`, 'Backend Server');
}

// フロントエンドサーバーのヘルスチェック
async function checkFrontend(): Promise<ServiceStatus> {
  return await checkService(`${CONFIG.FRONTEND_URL}`, 'Frontend Server');
}

// Facebook Graph APIのヘルスチェック
async function checkGraphAPI(): Promise<ServiceStatus> {
  const accessToken = process.env.FB_USER_OR_LL_TOKEN;
  
  if (!accessToken) {
    return {
      name: 'Facebook Graph API',
      status: 'degraded',
      url: CONFIG.GRAPH_API_URL,
      responseTime: 0,
      error: 'アクセストークンが設定されていません',
      details: {
        hasToken: false,
        tokenPreview: null
      }
    };
  }
  
  const url = `${CONFIG.GRAPH_API_URL}?access_token=${accessToken}&fields=id,name`;
  const tokenPreview = `${accessToken.substring(0, 8)}...${accessToken.substring(accessToken.length - 4)}`;
  
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.error) {
        return {
          name: 'Facebook Graph API',
          status: 'degraded',
          url: CONFIG.GRAPH_API_URL,
          responseTime,
          error: `Graph API Error: ${data.error.message}`,
          details: {
            statusCode: response.status,
            errorCode: data.error.code,
            errorMessage: data.error.message,
            hasToken: true,
            tokenPreview
          }
        };
      }
      
      return {
        name: 'Facebook Graph API',
        status: 'healthy',
        url: CONFIG.GRAPH_API_URL,
        responseTime,
        details: {
          statusCode: response.status,
          hasToken: true,
          tokenPreview,
          userId: data.id,
          userName: data.name
        }
      };
    } else {
      return {
        name: 'Facebook Graph API',
        status: 'degraded',
        url: CONFIG.GRAPH_API_URL,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          hasToken: true,
          tokenPreview
        }
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      name: 'Facebook Graph API',
      status: 'unhealthy',
      url: CONFIG.GRAPH_API_URL,
      responseTime,
      error: errorMessage,
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: errorMessage,
        hasToken: true,
        tokenPreview
      }
    };
  }
}

// メイン関数
async function runHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  if (!isJsonOutput) {
    console.log('\n' + '='.repeat(60));
    log('🏥 Instagram Marketing App - ヘルスチェック', 'bright');
    console.log('='.repeat(60) + '\n');
  }
  
  // 各サービスのヘルスチェック実行
  const [backendStatus, frontendStatus, graphApiStatus] = await Promise.all([
    checkBackend(),
    checkFrontend(),
    checkGraphAPI()
  ]);
  
  // 結果の集計
  const services = { backend: backendStatus, frontend: frontendStatus, graphApi: graphApiStatus };
  const statusCounts = Object.values(services).reduce((acc, service) => {
    acc[service.status]++;
    return acc;
  }, { healthy: 0, degraded: 0, unhealthy: 0 });
  
  // 全体の状態を決定
  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (statusCounts.unhealthy > 0) {
    overall = 'unhealthy';
  } else if (statusCounts.degraded > 0) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }
  
  const result: HealthCheckResult = {
    timestamp: new Date().toISOString(),
    overall,
    services,
    summary: {
      total: 3,
      healthy: statusCounts.healthy,
      degraded: statusCounts.degraded,
      unhealthy: statusCounts.unhealthy
    },
    metadata: {
      scriptVersion: '1.0.0',
      executionTime: `${Date.now() - startTime}ms`,
      nodeVersion: process.version
    }
  };
  
  // 結果の表示
  if (!isJsonOutput) {
    displayResults(result);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  
  return result;
}

// 結果表示関数
function displayResults(result: HealthCheckResult) {
  // 全体の状態
  const overallColor = result.overall === 'healthy' ? 'green' : 
                      result.overall === 'degraded' ? 'yellow' : 'red';
  const overallIcon = result.overall === 'healthy' ? '✅' : 
                     result.overall === 'degraded' ? '⚠️' : '❌';
  
  log(`\n${overallIcon} 全体の状態: ${result.overall.toUpperCase()}`, overallColor);
  log(`📊 サマリー: ${result.summary.healthy}/${result.summary.total} サービスが正常`, overallColor);
  
  // 各サービスの詳細
  console.log('\n' + '-'.repeat(40));
  log('🔍 サービス詳細:', 'bright');
  
  Object.values(result.services).forEach(service => {
    const statusColor = service.status === 'healthy' ? 'green' : 
                       service.status === 'degraded' ? 'yellow' : 'red';
    const statusIcon = service.status === 'healthy' ? '✅' : 
                      service.status === 'degraded' ? '⚠️' : '❌';
    
    log(`\n${statusIcon} ${service.name}`, statusColor);
    log(`   URL: ${service.url}`, 'reset');
    log(`   状態: ${service.status}`, statusColor);
    log(`   応答時間: ${service.responseTime}ms`, 'reset');
    
    if (service.error) {
      log(`   エラー: ${service.error}`, 'red');
    }
    
    if (isVerbose && service.details) {
      log(`   詳細: ${JSON.stringify(service.details, null, 2)}`, 'cyan');
    }
  });
  
  // メタデータ
  console.log('\n' + '-'.repeat(40));
  log('📋 メタデータ:', 'bright');
  log(`   実行時刻: ${result.timestamp}`, 'reset');
  log(`   実行時間: ${result.metadata.executionTime}`, 'reset');
  log(`   Node.js: ${result.metadata.nodeVersion}`, 'reset');
  
  // 推奨事項
  if (result.summary.unhealthy > 0 || result.summary.degraded > 0) {
    console.log('\n' + '-'.repeat(40));
    log('💡 推奨事項:', 'yellow');
    
    if (result.services.backend.status !== 'healthy') {
      log('   • バックエンドサーバーの状態を確認してください', 'yellow');
    }
    
    if (result.services.frontend.status !== 'healthy') {
      log('   • フロントエンドサーバーの状態を確認してください', 'yellow');
    }
    
    if (result.services.graphApi.status !== 'healthy') {
      log('   • Facebook Graph APIの接続とトークンの有効性を確認してください', 'yellow');
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

// スクリプト実行
runHealthCheck().then((result) => {
  const exitCode = result.overall === 'healthy' ? 0 : 
                  result.overall === 'degraded' ? 1 : 2;
  process.exit(exitCode);
}).catch((error) => {
  logError(`予期しないエラーが発生しました: ${error instanceof Error ? error.message : error}`);
  process.exit(255);
});
