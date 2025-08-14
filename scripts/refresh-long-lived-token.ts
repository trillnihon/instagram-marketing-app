#!/usr/bin/env tsx

/**
 * Instagram Marketing App - 長期トークン管理スクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * 1. 短期トークンを長期トークンに交換
 * 2. 既存の長期トークンの有効期限チェック
 * 3. トークンの自動ローテーション
 * 4. トークン情報のDB保存または標準出力
 * 
 * オプション:
 * --dry-run: 実際のAPI呼び出しを行わず設定のみ確認
 * --rotate-now: 即座にトークンをローテーション
 * --report: JSONレポートをlogs/に保存
 */

import dotenv from 'dotenv';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// 環境変数の読み込み
config({ path: '../env.development' });

// MongoDB接続設定
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram-marketing-app';

// トークンスキーマ定義
const tokenSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  token: { type: String, required: true },
  expireAt: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// トークンモデル
const Token = mongoose.model('Token', tokenSchema);

// 定数定義
const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const TOKEN_EXCHANGE_ENDPOINT = '/oauth/access_token';

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isRotateNow = args.includes('--rotate-now');
const isReport = args.includes('--report');

// 環境変数の取得
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FB_USER_SHORT_TOKEN = process.env.FB_USER_SHORT_TOKEN;
const FB_USER_OR_LL_TOKEN = process.env.FB_USER_OR_LL_TOKEN;

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

// トークン情報の型定義
interface TokenInfo {
  access_token: string;
  token_type: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token?: string;
}

interface TokenExchangeResult {
  timestamp: string;
  success: boolean;
  exitCode: number;
  environment: {
    hasAppId: boolean;
    hasAppSecret: boolean;
    hasShortToken: boolean;
    hasLongToken: boolean;
    hasMongoDB: boolean;
  };
  tokenInfo?: {
    access_token: string;
    token_type: string;
    expires_in?: number;
    expires_at?: number;
    refresh_token?: string;
  };
  validation?: {
    isValid: boolean;
    expiresInDays?: number;
    isExpired: boolean;
    needsRotation: boolean;
  };
  actions: {
    [key: string]: {
      success: boolean;
      error?: string;
      details?: any;
    };
  };
  summary: {
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    warnings: string[];
    recommendations: string[];
  };
  metadata: {
    scriptVersion: string;
    executionTime: string;
    nodeVersion: string;
  };
}

// MongoDB接続関数
async function connectToMongoDB(): Promise<boolean> {
  try {
    await mongoose.connect(MONGODB_URI);
    logSuccess('✅ MongoDB接続成功');
    return true;
  } catch (error) {
    logError(`❌ MongoDB接続失敗: ${error.message}`);
    return false;
  }
}

// トークンをDBに保存する関数
async function saveTokenToDB(token: string, expiresIn: number): Promise<boolean> {
  try {
    const expireAt = new Date(Date.now() + expiresIn * 1000);
    
    await Token.findOneAndUpdate(
      { type: 'ig_long_lived' },
      {
        type: 'ig_long_lived',
        token: token,
        expireAt: expireAt,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    logSuccess('✅ トークンをDBに保存しました');
    return true;
  } catch (error) {
    logError(`❌ トークンDB保存失敗: ${error.message}`);
    return false;
  }
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
  log(`🔍 [VERBOSE] ${message}`, 'magenta');
}

// トークン有効期限の計算
function calculateExpiryDate(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000);
}

function calculateDaysUntilExpiry(expiresAt: number): number {
  const now = Date.now();
  const diffMs = expiresAt - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// トークンの有効性チェック
function validateToken(token: string): Promise<{ isValid: boolean; expiresInDays?: number; isExpired: boolean; needsRotation: boolean }> {
  return new Promise(async (resolve) => {
    try {
      const response = await fetch(`${GRAPH_API_BASE}/me?access_token=${token}&fields=id,name`);
      
      if (!response.ok) {
        resolve({
          isValid: false,
          isExpired: true,
          needsRotation: true
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        resolve({
          isValid: false,
          isExpired: true,
          needsRotation: true
        });
        return;
      }
      
      // 長期トークンの場合、有効期限をチェック
      // 注: Facebook Graph APIは長期トークンの有効期限を直接返さないため、
      // 実際の有効期限は約60日と推定
      const estimatedExpiryDays = 60;
      const needsRotation = estimatedExpiryDays <= 7; // 7日以内ならローテーション推奨
      
      resolve({
        isValid: true,
        expiresInDays: estimatedExpiryDays,
        isExpired: false,
        needsRotation
      });
    } catch (error) {
      resolve({
        isValid: false,
        isExpired: true,
        needsRotation: true
      });
    }
  });
}

// トークン交換関数
async function exchangeToken(shortToken: string, appId: string, appSecret: string): Promise<TokenInfo> {
  const url = `${GRAPH_API_BASE}${TOKEN_EXCHANGE_ENDPOINT}`;
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken
  });
  
  logVerbose(`トークン交換API呼び出し: ${url}`);
  
  const response = await fetch(`${url}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Graph API Error: ${data.error.message} (Code: ${data.error.code})`);
  }
  
  // 有効期限の計算
  if (data.expires_in) {
    data.expires_at = Date.now() + data.expires_in * 1000;
  }
  
  return data;
}

// レポート保存関数
function saveReport(result: TokenExchangeResult): void {
  if (!isReport) return;
  
  try {
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `token-refresh-${timestamp}.json`;
    const filepath = path.join(logsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    logSuccess(`レポートを保存しました: ${filepath}`);
  } catch (error) {
    logWarning(`レポート保存に失敗: ${error instanceof Error ? error.message : error}`);
  }
}

// 環境変数ファイル更新関数
function updateEnvFile(token: string, envPath: string = '../env.development'): void {
  try {
    const envFilePath = path.join(__dirname, envPath);
    
    if (!fs.existsSync(envFilePath)) {
      logWarning(`環境変数ファイルが見つかりません: ${envFilePath}`);
      return;
    }
    
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // 既存のFB_USER_OR_LL_TOKENを更新
    if (envContent.includes('FB_USER_OR_LL_TOKEN=')) {
      envContent = envContent.replace(
        /FB_USER_OR_LL_TOKEN=.*/,
        `FB_USER_OR_LL_TOKEN=${token}`
      );
    } else {
      // 存在しない場合は追加
      envContent += `\nFB_USER_OR_LL_TOKEN=${token}`;
    }
    
    fs.writeFileSync(envFilePath, envContent);
    logSuccess(`環境変数ファイルを更新しました: ${envFilePath}`);
  } catch (error) {
    logWarning(`環境変数ファイル更新に失敗: ${error instanceof Error ? error.message : error}`);
  }
}

// メイン関数
async function manageLongLivedToken(): Promise<TokenExchangeResult> {
  const startTime = Date.now();
  const result: TokenExchangeResult = {
    timestamp: new Date().toISOString(),
    success: false,
    exitCode: 0,
    environment: {
      hasAppId: !!FACEBOOK_APP_ID,
      hasAppSecret: !!FACEBOOK_APP_SECRET,
      hasShortToken: !!FB_USER_SHORT_TOKEN,
      hasLongToken: !!FB_USER_OR_LL_TOKEN,
      hasMongoDB: !!MONGODB_URI
    },
    actions: {},
    summary: {
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      warnings: [],
      recommendations: []
    },
    metadata: {
      scriptVersion: '1.0.0',
      executionTime: '',
      nodeVersion: process.version
    }
  };

  console.log('\n' + '='.repeat(60));
  log('🚀 Instagram Marketing App - 長期トークン管理スクリプト', 'bright');
  console.log('='.repeat(60) + '\n');

  if (isDryRun) {
    logInfo('🔍 DRY-RUN モード: 実際のAPI呼び出しは行いません');
  }
  if (isRotateNow) {
    logInfo('🔄 ROTATE-NOW モード: 即座にトークンをローテーションします');
  }
  if (isReport) {
    logInfo('📊 レポートモード: JSONレポートを保存します');
  }

  console.log();

  // ステップ1: MongoDB接続
  logStep(1, 'MongoDB接続');
  result.actions.mongoDBConnect = { success: false };
  
  try {
    await connectToMongoDB();
    result.actions.mongoDBConnect.success = true;
    result.summary.successfulActions++;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`MongoDB接続に失敗: ${errorMessage}`);
    
    result.actions.mongoDBConnect.success = false;
    result.actions.mongoDBConnect.error = errorMessage;
    result.summary.failedActions++;
    result.exitCode = 1;
    
    saveReport(result);
    process.exit(1);
  }

  // ステップ2: 環境変数の確認
  logStep(2, '環境変数の確認');
  result.actions.environmentCheck = { success: false };
  
  const missingVars = [];
  if (!FACEBOOK_APP_ID) missingVars.push('FACEBOOK_APP_ID');
  if (!FACEBOOK_APP_SECRET) missingVars.push('FACEBOOK_APP_SECRET');
  if (!FB_USER_SHORT_TOKEN) missingVars.push('FB_USER_SHORT_TOKEN');
  
  if (missingVars.length > 0) {
    const error = `必要な環境変数が未設定: ${missingVars.join(', ')}`;
    logError(error);
    logInfo('環境変数ファイル (env.development) に以下を設定してください:');
    missingVars.forEach(varName => {
      logInfo(`${varName}=your_value_here`);
    });
    
    result.actions.environmentCheck.success = false;
    result.actions.environmentCheck.error = error;
    result.summary.failedActions++;
    result.exitCode = 1;
    
    saveReport(result);
    process.exit(1);
  }
  
  logSuccess('必要な環境変数が設定されています');
  result.actions.environmentCheck.success = true;
  result.summary.successfulActions++;

  console.log();

  // ステップ3: 既存の長期トークンの有効性チェック
  logStep(3, '既存の長期トークンの有効性チェック');
  result.actions.existingTokenCheck = { success: false };
  
  if (FB_USER_OR_LL_TOKEN) {
    logInfo('既存の長期トークンが見つかりました。有効性をチェック中...');
    
    if (isDryRun) {
      logInfo('DRY-RUN: トークン有効性チェックをスキップ');
      result.actions.existingTokenCheck.success = true;
      result.summary.successfulActions++;
    } else {
      try {
        const validation = await validateToken(FB_USER_OR_LL_TOKEN);
        
        if (validation.isValid) {
          logSuccess('既存の長期トークンは有効です');
          
          if (validation.expiresInDays !== undefined) {
            logInfo(`推定有効期限: ${validation.expiresInDays}日`);
          }
          
          if (validation.needsRotation) {
            logWarning('トークンのローテーションが推奨されます（7日以内に期限切れの可能性）');
            result.summary.warnings.push('トークンのローテーションが推奨されます');
            result.summary.recommendations.push('--rotate-nowオプションでトークンを更新してください');
          } else {
            logInfo('トークンは十分に有効です');
          }
          
          result.validation = validation;
        } else {
          logWarning('既存の長期トークンは無効です');
          result.summary.warnings.push('既存の長期トークンは無効です');
        }
        
        result.actions.existingTokenCheck.success = true;
        result.actions.existingTokenCheck.details = validation;
        result.summary.successfulActions++;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logWarning(`トークン有効性チェックでエラー: ${errorMessage}`);
        
        result.actions.existingTokenCheck.success = false;
        result.actions.existingTokenCheck.error = errorMessage;
        result.summary.failedActions++;
      }
    }
  } else {
    logInfo('既存の長期トークンが見つかりません');
    result.actions.existingTokenCheck.success = true;
    result.summary.successfulActions++;
  }

  console.log();

  // ステップ4: トークン交換の実行
  if (isRotateNow || !FB_USER_OR_LL_TOKEN || (result.validation?.needsRotation && !isDryRun)) {
    logStep(4, '短期トークンを長期トークンに交換');
    result.actions.tokenExchange = { success: false };
    
    if (isDryRun) {
      logInfo('DRY-RUN: トークン交換をスキップ');
      result.actions.tokenExchange.success = true;
      result.summary.successfulActions++;
    } else {
      try {
        logInfo('短期トークンを長期トークンに交換中...');
        
        const tokenInfo = await exchangeToken(FB_USER_SHORT_TOKEN!, FACEBOOK_APP_ID!, FACEBOOK_APP_SECRET!);
        
        logSuccess('トークン交換が完了しました');
        logInfo(`トークンタイプ: ${tokenInfo.token_type}`);
        
        if (tokenInfo.expires_in) {
          const expiryDate = calculateExpiryDate(tokenInfo.expires_in);
          const daysUntilExpiry = calculateDaysUntilExpiry(tokenInfo.expires_at!);
          
          logInfo(`有効期限: ${expiryDate.toISOString()} (${daysUntilExpiry}日後)`);
          
          if (daysUntilExpiry <= 7) {
            logWarning('このトークンも短期間で期限切れになります');
            result.summary.warnings.push('新しいトークンも短期間で期限切れになります');
          }
        }
        
        result.tokenInfo = tokenInfo;
        result.actions.tokenExchange.success = true;
        result.actions.tokenExchange.details = tokenInfo;
        result.summary.successfulActions++;
        
        // 環境変数ファイルの更新
        logStep(5, '環境変数ファイルの更新');
        result.actions.envFileUpdate = { success: false };
        
        try {
          updateEnvFile(tokenInfo.access_token);
          result.actions.envFileUpdate.success = true;
          result.summary.successfulActions++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logWarning(`環境変数ファイル更新に失敗: ${errorMessage}`);
          
          result.actions.envFileUpdate.success = false;
          result.actions.envFileUpdate.error = errorMessage;
          result.summary.failedActions++;
        }
        
        // トークンをDBに保存
        logStep(6, 'トークンをDBに保存');
        result.actions.saveTokenToDB = { success: false };
        
        try {
          await saveTokenToDB(tokenInfo.access_token, tokenInfo.expires_in!);
          result.actions.saveTokenToDB.success = true;
          result.summary.successfulActions++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logWarning(`トークンDB保存に失敗: ${errorMessage}`);
          
          result.actions.saveTokenToDB.success = false;
          result.actions.saveTokenToDB.error = errorMessage;
          result.summary.failedActions++;
        }
        
        // 新しいトークンの有効性確認
        logStep(7, '新しいトークンの有効性確認');
        result.actions.newTokenValidation = { success: false };
        
        try {
          const newValidation = await validateToken(tokenInfo.access_token);
          
          if (newValidation.isValid) {
            logSuccess('新しい長期トークンは有効です');
            result.validation = newValidation;
          } else {
            logError('新しい長期トークンが無効です');
            result.summary.warnings.push('新しい長期トークンが無効です');
          }
          
          result.actions.newTokenValidation.success = true;
          result.actions.newTokenValidation.details = newValidation;
          result.summary.successfulActions++;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logWarning(`新しいトークン有効性チェックでエラー: ${errorMessage}`);
          
          result.actions.newTokenValidation.success = false;
          result.actions.newTokenValidation.error = errorMessage;
          result.summary.failedActions++;
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError(`トークン交換でエラーが発生: ${errorMessage}`);
        
        result.actions.tokenExchange.success = false;
        result.actions.tokenExchange.error = errorMessage;
        result.summary.failedActions++;
        result.exitCode = 2;
        
        if (errorMessage.includes('Graph API Error')) {
          logInfo('Graph APIエラーの対処方法:');
          logInfo('  1. 短期トークンが有効か確認');
          logInfo('  2. アプリIDとシークレットが正しいか確認');
          logInfo('  3. アプリの権限設定を確認');
          
          result.summary.recommendations.push('Graph APIエラーの対処方法を確認してください');
        }
        
        saveReport(result);
        process.exit(2);
      }
    }
  } else {
    logInfo('トークンのローテーションは不要です');
  }

  console.log();

  // 最終結果
  logStep(8, '実行結果サマリー');
  
  const executionTime = Date.now() - startTime;
  result.metadata.executionTime = `${executionTime}ms`;
  result.summary.totalActions = Object.keys(result.actions).length;
  result.success = result.summary.failedActions === 0;
  
  if (result.success) {
    if (result.tokenInfo) {
      logSuccess('🎉 長期トークンの管理が完了しました！');
      logInfo('以下の処理が完了しました:');
      logInfo('  ✅ MongoDB接続');
      logInfo('  ✅ 環境変数チェック');
      logInfo('  ✅ 既存トークン有効性チェック');
      logInfo('  ✅ トークン交換');
      logInfo('  ✅ 環境変数ファイル更新');
      logInfo('  ✅ トークンDB保存');
      logInfo('  ✅ 新トークン有効性確認');
    } else {
      logSuccess('🎉 長期トークンの状態確認が完了しました！');
      logInfo('既存のトークンは有効で、更新は不要です');
    }
    
    result.exitCode = 0;
  } else {
    logError(`トークン管理が失敗しました (${result.summary.failedActions}/${result.summary.totalActions}アクション失敗)`);
    result.exitCode = 3;
  }
  
  // サマリー表示
  logInfo(`実行時間: ${executionTime}ms`);
  logInfo(`成功アクション: ${result.summary.successfulActions}/${result.summary.totalActions}`);
  
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
manageLongLivedToken().then((result) => {
  process.exit(result.exitCode);
}).catch((error) => {
  logError(`予期しないエラーが発生しました: ${error instanceof Error ? error.message : error}`);
  process.exit(255);
});
