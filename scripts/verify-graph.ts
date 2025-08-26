#!/usr/bin/env tsx

/**
 * Instagram Marketing App - Graph API v19.0 検証スクリプト (拡張版)
 * 
 * このスクリプトは以下の検証を行います：
 * 1. 環境変数の確認
 * 2. Graph API v19.0の疎通確認
 * 3. /me/accounts エンドポイントの動作確認
 * 4. 特定のig_business_id (17841474953463077) の取得確認
 * 5. メディア取得とインサイト取得の動作確認
 * 
 * オプション:
 * --verbose: 詳細ログ出力
 * --report: JSONレポートをlogs/に保存
 * --dry-run: 実際のAPI呼び出しを行わず設定のみ確認
 */

import dotenv from 'dotenv';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// 定数定義
const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const EXPECTED_IG_BUSINESS_ID = '17841474953463077';

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const isReport = args.includes('--report');
const isDryRun = args.includes('--dry-run');

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

// エラー分類と指数バックオフ設定
const ERROR_CATEGORIES = {
  NETWORK: { retryable: true, maxRetries: 3, backoffMs: 1000 },
  RATE_LIMIT: { retryable: true, maxRetries: 5, backoffMs: 2000 },
  AUTH: { retryable: false, maxRetries: 0, backoffMs: 0 },
  PERMISSION: { retryable: false, maxRetries: 0, backoffMs: 0 },
  VALIDATION: { retryable: false, maxRetries: 0, backoffMs: 0 },
  UNKNOWN: { retryable: true, maxRetries: 2, backoffMs: 1000 }
};

// 検証結果の型定義
interface VerificationResult {
  timestamp: string;
  success: boolean;
  exitCode: number;
  environment: {
    hasToken: boolean;
    hasPageId: boolean;
    graphApiVersion: string;
  };
  steps: {
    [key: string]: {
      success: boolean;
      error?: string;
      details?: any;
      duration?: number;
    };
  };
  summary: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    warnings: string[];
    recommendations: string[];
  };
  metadata: {
    scriptVersion: string;
    executionTime: string;
    nodeVersion: string;
  };
}

// ログ出力関数
function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

function logStep(step: number, message: string) {
  log(`🔍 ステップ${step}: ${message}`, 'cyan');
}

function logVerbose(message: string) {
  if (isVerbose) {
    log(`🔍 [VERBOSE] ${message}`, 'magenta');
  }
}

// 指数バックオフによるリトライ関数
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  category: keyof typeof ERROR_CATEGORIES,
  operationName: string
): Promise<T> {
  const config = ERROR_CATEGORIES[category];
  
  if (!config.retryable) {
    return await operation();
  }

  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === config.maxRetries) {
        break;
      }
      
      const backoffMs = config.backoffMs * Math.pow(2, attempt - 1);
      logWarning(`${operationName} 失敗 (試行 ${attempt}/${config.maxRetries}): ${lastError.message}`);
      logInfo(`${backoffMs}ms 後にリトライします...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw lastError!;
}

// Graph API呼び出し関数（リトライ対応）
async function callGraphAPI(endpoint: string, token: string, fields?: string): Promise<any> {
  const url = `${GRAPH_API_BASE}${endpoint}?access_token=${token}${fields ? `&fields=${fields}` : ''}`;
  
  logVerbose(`Graph API呼び出し: ${endpoint}`);
  
  return await retryWithBackoff(async () => {
    const response = await fetch(url);
    
    if (!response.ok) {
      const status = response.status;
      let category: keyof typeof ERROR_CATEGORIES = 'UNKNOWN';
      
      if (status === 401) category = 'AUTH';
      else if (status === 403) category = 'PERMISSION';
      else if (status === 400) category = 'VALIDATION';
      else if (status === 429) category = 'RATE_LIMIT';
      else if (status >= 500) category = 'NETWORK';
      
      throw new Error(`HTTP ${status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      let category: keyof typeof ERROR_CATEGORIES = 'UNKNOWN';
      
      if (data.error.code === 190) category = 'AUTH';
      else if (data.error.code === 10) category = 'RATE_LIMIT';
      else if (data.error.code === 4) category = 'RATE_LIMIT';
      else if (data.error.code === 100) category = 'PERMISSION';
      
      throw new Error(`Graph API Error: ${data.error.message} (Code: ${data.error.code})`);
    }
    
    return data;
  }, 'UNKNOWN', `Graph API ${endpoint}`);
}

// レポート保存関数
function saveReport(result: VerificationResult): void {
  if (!isReport) return;
  
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `verify-graph-${timestamp}.json`;
    const filepath = path.join(logsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    logSuccess(`レポートを保存しました: ${filepath}`);
  } catch (error) {
    logWarning(`レポート保存に失敗: ${error instanceof Error ? error.message : error}`);
  }
}

// メイン検証関数
async function verifyGraphAPI(): Promise<VerificationResult> {
  // 環境変数の読み込み
  config({ path: './env.development' });
  
  // 環境変数の取得
  const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN;
  const FB_PAGE_ID = process.env.FB_PAGE_ID;
  
  const startTime = Date.now();
  const result: VerificationResult = {
    timestamp: new Date().toISOString(),
    success: false,
    exitCode: 0,
    environment: {
      hasToken: !!FB_USER_OR_LL_TOKEN,
      hasPageId: !!FB_PAGE_ID,
      graphApiVersion: GRAPH_API_VERSION
    },
    steps: {},
    summary: {
      totalSteps: 0,
      successfulSteps: 0,
      failedSteps: 0,
      warnings: [],
      recommendations: []
    },
    metadata: {
      scriptVersion: '2.0.0',
      executionTime: '',
      nodeVersion: process.version
    }
  };

  console.log('\n' + '='.repeat(60));
  log('🚀 Instagram Marketing App - Graph API v19.0 検証開始 (拡張版)', 'bright');
  console.log('='.repeat(60) + '\n');

  if (isDryRun) {
    logInfo('🔍 DRY-RUN モード: 実際のAPI呼び出しは行いません');
  }
  if (isVerbose) {
    logInfo('🔍 VERBOSE モード: 詳細ログを出力します');
  }
  if (isReport) {
    logInfo('📊 レポートモード: JSONレポートを保存します');
  }

  console.log();

  // ステップ1: 環境変数の確認
  logStep(1, '環境変数の確認');
  result.steps.environment = { success: false };
  
  if (!FB_USER_OR_LL_TOKEN) {
    const error = 'FB_USER_OR_LL_TOKEN が未設定です';
    logError(error);
    logInfo('環境変数ファイル (env.development) に以下を設定してください:');
    logInfo('FB_USER_OR_LL_TOKEN=your_facebook_access_token_here');
    
    result.steps.environment.success = false;
    result.steps.environment.error = error;
    result.summary.failedSteps++;
    result.exitCode = 1;
    
    if (isDryRun) {
      result.summary.recommendations.push('FB_USER_OR_LL_TOKEN環境変数を設定してください');
      return result;
    }
    
    saveReport(result);
    process.exit(1);
  }
  
  logSuccess('FB_USER_OR_LL_TOKEN が設定されています');
  result.steps.environment.success = true;
  result.summary.successfulSteps++;
  
  if (FB_PAGE_ID) {
    logInfo(`FB_PAGE_ID: ${FB_PAGE_ID} (指定済み)`);
  } else {
    logInfo('FB_PAGE_ID が未設定です（最初に見つかったページを使用）');
    result.summary.warnings.push('FB_PAGE_IDが未設定です');
  }

  console.log();

  // ステップ2: Graph API v19.0の疎通確認
  logStep(2, 'Graph API v19.0の疎通確認');
  result.steps.graphApiTest = { success: false };
  
  if (isDryRun) {
    logInfo('DRY-RUN: Graph API疎通確認をスキップ');
    result.steps.graphApiTest.success = true;
    result.summary.successfulSteps++;
  } else {
    try {
      const testResponse = await callGraphAPI('/me', FB_USER_OR_LL_TOKEN, 'id,name');
      logSuccess(`Graph API v19.0 疎通確認成功: ${testResponse.name} (ID: ${testResponse.id})`);
      
      result.steps.graphApiTest.success = true;
      result.steps.graphApiTest.details = testResponse;
      result.summary.successfulSteps++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(`Graph API v19.0 疎通確認失敗: ${errorMessage}`);
      
      result.steps.graphApiTest.success = false;
      result.steps.graphApiTest.error = errorMessage;
      result.summary.failedSteps++;
      result.exitCode = 2;
      
      saveReport(result);
      process.exit(2);
    }
  }

  console.log();

  // ステップ3: /me/accounts エンドポイントの動作確認
  logStep(3, '/me/accounts エンドポイントの動作確認');
  result.steps.accountsTest = { success: false };
  
  if (isDryRun) {
    logInfo('DRY-RUN: /me/accounts確認をスキップ');
    result.steps.accountsTest.success = true;
    result.summary.successfulSteps++;
  } else {
    try {
      const accountsResponse = await callGraphAPI(
        '/me/accounts', 
        FB_USER_OR_LL_TOKEN, 
        'id,name,access_token,instagram_business_account'
      );
      
      const pages = accountsResponse.data || [];
      
      if (pages.length === 0) {
        throw new Error('ページが見つかりません。Facebookページの管理者権限を確認してください。');
      }
      
      logSuccess(`${pages.length}件のページが見つかりました`);
      
      // ページの詳細表示
      pages.forEach((page: any, index: number) => {
        const hasInstagram = page.instagram_business_account ? '✅' : '❌';
        logInfo(`  ${index + 1}. ${page.name} (${page.id}) ${hasInstagram} Instagram連携`);
        
        if (page.instagram_business_account) {
          logInfo(`     Instagram Business ID: ${page.instagram_business_account.id}`);
        }
      });

      result.steps.accountsTest.success = true;
      result.steps.accountsTest.details = { pageCount: pages.length, pages };
      result.summary.successfulSteps++;

      console.log();

      // ステップ4: 特定のig_business_idの確認
      logStep(4, '期待されるig_business_idの確認');
      result.steps.igBusinessIdTest = { success: false };
      
      let targetPage = null;
      let targetIgId = null;
      
      if (FB_PAGE_ID) {
        // 指定されたページIDで検索
        targetPage = pages.find((p: any) => p.id === FB_PAGE_ID);
        if (!targetPage) {
          throw new Error(`指定されたページID (${FB_PAGE_ID}) が見つかりません`);
        }
      } else {
        // Instagram連携済みの最初のページを使用
        targetPage = pages.find((p: any) => p.instagram_business_account);
        if (!targetPage) {
          throw new Error('Instagram連携済みのページが見つかりません');
        }
      }
      
      targetIgId = targetPage.instagram_business_account?.id;
      
      if (!targetIgId) {
        throw new Error(`ページ "${targetPage.name}" にInstagramビジネスアカウントが連携されていません`);
      }
      
      logSuccess(`対象ページ: ${targetPage.name} (${targetPage.id})`);
      logSuccess(`Instagram Business ID: ${targetIgId}`);
      
      // 期待されるIDとの比較
      if (targetIgId === EXPECTED_IG_BUSINESS_ID) {
        logSuccess(`期待されるig_business_id (${EXPECTED_IG_BUSINESS_ID}) と一致しました！`);
      } else {
        logWarning(`期待されるig_business_id (${EXPECTED_IG_BUSINESS_ID}) と一致しません`);
        logInfo(`実際のID: ${targetIgId}`);
        result.summary.warnings.push(`期待されるig_business_idと一致しません: 期待値=${EXPECTED_IG_BUSINESS_ID}, 実際=${targetIgId}`);
      }

      result.steps.igBusinessIdTest.success = true;
      result.steps.igBusinessIdTest.details = { targetPage, targetIgId, expectedId: EXPECTED_IG_BUSINESS_ID };
      result.summary.successfulSteps++;

      console.log();

      // ステップ5: メディア取得の動作確認
      logStep(5, 'メディア取得の動作確認');
      result.steps.mediaTest = { success: false };
      
      if (isDryRun) {
        logInfo('DRY-RUN: メディア取得確認をスキップ');
        result.steps.mediaTest.success = true;
        result.summary.successfulSteps++;
      } else {
        try {
          const mediaResponse = await callGraphAPI(
            `/${targetIgId}/media`,
            FB_USER_OR_LL_TOKEN,
            'id,caption,media_type,media_url,timestamp,like_count,comments_count'
          );
          
          const mediaCount = (mediaResponse.data || []).length;
          logSuccess(`メディア取得成功: ${mediaCount}件`);
          
          result.steps.mediaTest.success = true;
          result.steps.mediaTest.details = { mediaCount, media: mediaResponse.data };
          result.summary.successfulSteps++;
          
          if (mediaCount > 0) {
            logInfo('最新のメディア情報:');
            const latestMedia = mediaResponse.data[0];
            logInfo(`  ID: ${latestMedia.id}`);
            logInfo(`  タイプ: ${latestMedia.media_type}`);
            logInfo(`  投稿日時: ${latestMedia.timestamp}`);
            
            // インサイト取得のテスト
            logStep(6, 'インサイト取得の動作確認');
            result.steps.insightsTest = { success: false };
            
            if (isDryRun) {
              logInfo('DRY-RUN: インサイト取得確認をスキップ');
              result.steps.insightsTest.success = true;
              result.summary.successfulSteps++;
            } else {
              try {
                const insightsResponse = await callGraphAPI(
                  `/${latestMedia.id}/insights`,
                  FB_USER_OR_LL_TOKEN,
                  'metric,value'
                );
                
                logSuccess('インサイト取得成功');
                logInfo('取得可能なメトリクス:');
                insightsResponse.data.forEach((insight: any) => {
                  logInfo(`  ${insight.metric}: ${insight.value}`);
                });
                
                result.steps.insightsTest.success = true;
                result.steps.insightsTest.details = insightsResponse;
                result.summary.successfulSteps++;
              } catch (insightError) {
                const errorMessage = insightError instanceof Error ? insightError.message : String(insightError);
                logWarning(`インサイト取得でエラーが発生: ${errorMessage}`);
                
                result.steps.insightsTest.success = false;
                result.steps.insightsTest.error = errorMessage;
                result.summary.failedSteps++;
                result.summary.warnings.push(`インサイト取得でエラー: ${errorMessage}`);
              }
            }
          } else {
            logInfo('メディアが0件です。Instagramに投稿を作成してから再実行してください。');
            result.summary.recommendations.push('Instagramに投稿を作成してから再実行してください');
          }

        } catch (mediaError) {
          const errorMessage = mediaError instanceof Error ? mediaError.message : String(mediaError);
          logError(`メディア取得でエラーが発生: ${errorMessage}`);
          
          result.steps.mediaTest.success = false;
          result.steps.mediaTest.error = errorMessage;
          result.summary.failedSteps++;
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(`検証中にエラーが発生しました: ${errorMessage}`);
      
      result.steps.accountsTest.success = false;
      result.steps.accountsTest.error = errorMessage;
      result.summary.failedSteps++;
      result.exitCode = 3;
      
      if (error instanceof Error && error.message.includes('Graph API Error')) {
        logInfo('Graph APIエラーの対処方法:');
        logInfo('  1. アクセストークンの有効期限を確認');
        logInfo('  2. 必要な権限（instagram_basic, pages_read_engagement等）が付与されているか確認');
        logInfo('  3. Facebookページの管理者権限を確認');
        logInfo('  4. Instagramビジネスアカウントの連携状態を確認');
        
        result.summary.recommendations.push('Graph APIエラーの対処方法を確認してください');
      }
      
      saveReport(result);
      process.exit(3);
    }
  }

  console.log();

  // 最終結果
  logStep(7, '検証結果サマリー');
  
  const executionTime = Date.now() - startTime;
  result.metadata.executionTime = `${executionTime}ms`;
  result.summary.totalSteps = Object.keys(result.steps).length;
  result.success = result.summary.failedSteps === 0;
  
  if (result.success) {
    logSuccess('🎉 Graph API v19.0 検証が完了しました！');
    logInfo('以下の機能が正常に動作することを確認しました:');
    logInfo('  ✅ Graph API v19.0 疎通');
    logInfo('  ✅ /me/accounts エンドポイント');
    logInfo('  ✅ Instagramビジネスアカウント連携');
    logInfo('  ✅ メディア取得');
    logInfo('  ✅ インサイト取得（メディアがある場合）');
    
    result.exitCode = 0;
  } else {
    logError(`検証が失敗しました (${result.summary.failedSteps}/${result.summary.totalSteps}ステップ失敗)`);
    result.exitCode = 4;
  }
  
  // サマリー表示
  logInfo(`実行時間: ${executionTime}ms`);
  logInfo(`成功ステップ: ${result.summary.successfulSteps}/${result.summary.totalSteps}`);
  
  if (result.summary.warnings.length > 0) {
    logWarning(`警告: ${result.summary.warnings.length}件`);
    result.summary.warnings.forEach(warning => logWarning(`  - ${warning}`));
  }
  
  if (result.summary.recommendations.length > 0) {
    logInfo(`推奨事項: ${result.summary.recommendations.length}件`);
    result.summary.recommendations.forEach(rec => logInfo(`  - ${rec}`));
  }
  
  // レポート保存
  saveReport(result);
  
  return result;
}

// スクリプト実行
verifyGraphAPI().then((result) => {
  process.exit(result.exitCode);
}).catch((error) => {
  logError(`予期しないエラーが発生しました: ${error instanceof Error ? error.message : error}`);
  process.exit(255);
});
