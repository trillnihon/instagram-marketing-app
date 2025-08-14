#!/usr/bin/env node

/**
 * Instagram Marketing App - Graph API エラー修正スクリプト
 * 
 * このスクリプトは以下の問題を解決します：
 * 1. Graph API 400エラーの原因特定
 * 2. トークンの有効性確認
 * 3. 必要な権限の確認
 * 4. 環境変数の自動修正
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import readline from 'readline';

// ESM対応の__dirname再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定
const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const ENV_FILE_PATH = path.resolve(__dirname, '../server/env.development');

// カラーコード
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

// ログ関数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logStep(message) {
  log(`🔍 ${message}`, 'cyan');
}

// 環境変数ファイルの読み込み
function loadEnvFile() {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      throw new Error(`環境変数ファイルが見つかりません: ${ENV_FILE_PATH}`);
    }
    
    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    logError(`環境変数ファイルの読み込みに失敗: ${error.message}`);
    return null;
  }
}

// 環境変数ファイルの更新
function updateEnvFile(updates) {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      throw new Error(`環境変数ファイルが見つかりません: ${ENV_FILE_PATH}`);
    }
    
    let envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(ENV_FILE_PATH, envContent);
    return true;
  } catch (error) {
    logError(`環境変数ファイルの更新に失敗: ${error.message}`);
    return false;
  }
}

// Graph API呼び出し
async function callGraphAPI(endpoint, token, fields = '') {
  const url = `${GRAPH_API_BASE}${endpoint}?access_token=${token}${fields ? `&fields=${fields}` : ''}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${data.error?.message || 'Unknown error'}`);
    }
    
    if (data.error) {
      throw new Error(`Graph API Error: ${data.error.message} (Code: ${data.error.code})`);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// トークンの詳細診断
async function diagnoseToken(token) {
  logStep('トークンの詳細診断を開始...');
  
  const diagnostics = {
    token: token.substring(0, 20) + '...',
    isValid: false,
    permissions: [],
    errors: [],
    recommendations: []
  };
  
  try {
    // 基本的な/me呼び出し
    logInfo('基本的な/me呼び出しをテスト中...');
    const meData = await callGraphAPI('/me', token, 'id,name,email');
    diagnostics.isValid = true;
    diagnostics.permissions.push('basic_profile');
    logSuccess(`基本権限確認成功: ${meData.name} (ID: ${meData.id})`);
    
    // ページ一覧取得テスト
    try {
      logInfo('ページ一覧取得をテスト中...');
      const pagesData = await callGraphAPI('/me/accounts', token, 'id,name,access_token,instagram_business_account');
      diagnostics.permissions.push('pages_access');
      
      if (pagesData.data && pagesData.data.length > 0) {
        logSuccess(`${pagesData.data.length}件のページにアクセス可能`);
        
        // Instagram連携状況を確認
        const instagramPages = pagesData.data.filter(page => page.instagram_business_account);
        if (instagramPages.length > 0) {
          diagnostics.permissions.push('instagram_basic');
          logSuccess(`${instagramPages.length}件のページにInstagram連携あり`);
        } else {
          logWarning('Instagram連携済みのページが見つかりません');
          diagnostics.recommendations.push('FacebookページにInstagramビジネスアカウントを連携してください');
        }
      } else {
        logWarning('アクセス可能なページが見つかりません');
        diagnostics.recommendations.push('Facebookページの管理者権限を確認してください');
      }
    } catch (error) {
      diagnostics.errors.push(`ページアクセスエラー: ${error.message}`);
      if (error.message.includes('100')) {
        diagnostics.recommendations.push('pages_show_list権限が必要です');
      }
    }
    
    // Instagram Graph API権限テスト
    try {
      logInfo('Instagram Graph API権限をテスト中...');
      const instagramData = await callGraphAPI('/me/accounts', token, 'id,name,instagram_business_account{id,username,media_count}');
      diagnostics.permissions.push('instagram_graph_api');
      logSuccess('Instagram Graph API権限確認成功');
    } catch (error) {
      diagnostics.errors.push(`Instagram Graph APIエラー: ${error.message}`);
      if (error.message.includes('100')) {
        diagnostics.recommendations.push('instagram_basic権限が必要です');
      }
    }
    
  } catch (error) {
    diagnostics.errors.push(`基本診断エラー: ${error.message}`);
    
    // エラーコード別の推奨事項
    if (error.message.includes('190')) {
      diagnostics.recommendations.push('アクセストークンが無効です。新しいトークンを取得してください');
    } else if (error.message.includes('100')) {
      diagnostics.recommendations.push('必要な権限が不足しています。アプリの設定を確認してください');
    } else if (error.message.includes('4')) {
      diagnostics.recommendations.push('API呼び出し制限に達しています。しばらく待ってから再試行してください');
    } else if (error.message.includes('10')) {
      diagnostics.recommendations.push('アプリが一時的に無効化されています。Facebook開発者コンソールを確認してください');
    }
  }
  
  return diagnostics;
}

// 新しいトークンの取得ガイド
function showTokenAcquisitionGuide() {
  logStep('新しいFacebook長期トークンの取得方法:');
  logInfo('1. Facebook Graph API Explorerにアクセス: https://developers.facebook.com/tools/explorer/');
  logInfo('2. アプリを選択: Instagram Marketing App');
  logInfo('3. 必要な権限を追加:');
  logInfo('   - instagram_basic');
  logInfo('   - instagram_content_publish');
  logInfo('   - instagram_manage_insights');
  logInfo('   - pages_show_list');
  logInfo('   - pages_read_engagement');
  logInfo('   - public_profile');
  logInfo('   - email');
  logInfo('4. "Generate Access Token"をクリック');
  logInfo('5. 生成されたトークンをコピー');
  logInfo('6. このスクリプトでトークンを設定');
}

// メイン処理
async function main() {
  console.log('='.repeat(60));
  log('🚀 Instagram Marketing App - Graph API エラー修正スクリプト', 'bright');
  console.log('='.repeat(60));
  
  // 環境変数の読み込み
  logStep('環境変数ファイルを読み込み中...');
  const envVars = loadEnvFile();
  
  if (!envVars) {
    logError('環境変数の読み込みに失敗しました');
    process.exit(1);
  }
  
  const currentToken = envVars.FB_USER_OR_LL_TOKEN;
  
  if (!currentToken || currentToken === 'EAAxxxx...test_token_for_production') {
    logWarning('有効なFB_USER_OR_LL_TOKENが設定されていません');
    logInfo('現在の設定: ' + (currentToken || '未設定'));
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('新しいトークンを入力しますか？ (y/n): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() === 'y') {
      showTokenAcquisitionGuide();
      
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const newToken = await new Promise(resolve => {
        rl2.question('新しいトークンを入力してください: ', resolve);
      });
      
      rl2.close();
      
      if (newToken && newToken.trim()) {
        logInfo('トークンを更新中...');
        if (updateEnvFile({ FB_USER_OR_LL_TOKEN: newToken.trim() })) {
          logSuccess('トークンが更新されました');
          logInfo('新しいトークンで診断を実行します...');
          
          // 新しいトークンで診断
          const diagnostics = await diagnoseToken(newToken.trim());
          displayDiagnostics(diagnostics);
        } else {
          logError('トークンの更新に失敗しました');
        }
      } else {
        logWarning('トークンが入力されませんでした');
      }
    } else {
      logInfo('既存のトークンで診断を実行します...');
      
      if (currentToken && currentToken !== 'EAAxxxx...test_token_for_production') {
        const diagnostics = await diagnoseToken(currentToken);
        displayDiagnostics(diagnostics);
      } else {
        logError('診断可能なトークンがありません');
        showTokenAcquisitionGuide();
      }
    }
  } else {
    logInfo('既存のトークンで診断を実行中...');
    const diagnostics = await diagnoseToken(currentToken);
    displayDiagnostics(diagnostics);
  }
  
  console.log('='.repeat(60));
  log('🔧 修正完了！', 'green');
  console.log('='.repeat(60));
}

// 診断結果の表示
function displayDiagnostics(diagnostics) {
  console.log('\n' + '='.repeat(60));
  log('📊 トークン診断結果', 'bright');
  console.log('='.repeat(60));
  
  logInfo(`トークン: ${diagnostics.token}`);
  logInfo(`有効性: ${diagnostics.isValid ? '有効' : '無効'}`);
  
  if (diagnostics.permissions.length > 0) {
    logSuccess('利用可能な権限:');
    diagnostics.permissions.forEach(perm => logInfo(`  - ${perm}`));
  }
  
  if (diagnostics.errors.length > 0) {
    logError('発生したエラー:');
    diagnostics.errors.forEach(error => logError(`  - ${error}`));
  }
  
  if (diagnostics.recommendations.length > 0) {
    logWarning('推奨事項:');
    diagnostics.recommendations.forEach(rec => logWarning(`  - ${rec}`));
  }
  
  console.log('='.repeat(60));
}

// スクリプト実行
main().catch(error => {
  logError(`スクリプト実行エラー: ${error.message}`);
  process.exit(1);
});
