#!/usr/bin/env node

/**
 * Instagram Marketing App - 本番モード切替・一括実行スクリプト
 * 
 * 機能:
 * 1. env.developmentを元にenv.productionを更新
 * 2. FB_USER_OR_LL_TOKENを新しいトークンで更新
 * 3. scripts/refreshAndVerify.jsを使ってサーバー起動
 * 4. /health確認
 * 5. verify:graph実行
 * 6. ブラウザ自動起動
 * 
 * 使用方法:
 * node scripts/production-deploy.js "EAAxxxx..."
 */

import chalk from 'chalk';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// 設定
const SERVER_PORT = 4000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const HEALTH_ENDPOINT = `${SERVER_URL}/health`;
const PROJECT_ROOT = path.join(__dirname, '..');
const ENV_DEV_PATH = path.join(PROJECT_ROOT, 'env.development');
const ENV_PROD_PATH = path.join(PROJECT_ROOT, 'env.production');
const SERVER_DIR = path.join(PROJECT_ROOT, 'server');

// 色付きログ関数
const log = {
  info: (msg) => console.log(chalk.blue('ℹ️'), msg),
  success: (msg) => console.log(chalk.green('✅'), msg),
  error: (msg) => console.log(chalk.red('❌'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠️'), msg),
  step: (msg) => console.log(chalk.cyan('🔍'), msg),
  process: (msg) => console.log(chalk.magenta('🔄'), msg),
  server: (msg) => console.log(chalk.cyan('📡'), msg),
  health: (msg) => console.log(chalk.green('💚'), msg),
  verify: (msg) => console.log(chalk.yellow('🔍'), msg),
  production: (msg) => console.log(chalk.red('🚀'), msg)
};

// メイン関数
async function main() {
  console.log(chalk.bold.red('🚀 Instagram Marketing App - 本番モード切替・一括実行スクリプト'));
  console.log(chalk.gray('='.repeat(80)));
  
  // 引数チェック
  const args = process.argv.slice(2);
  if (args.length === 0) {
    log.error('アクセストークンが指定されていません');
    console.log(chalk.yellow('使用方法: node scripts/production-deploy.js "EAAxxxx..."'));
    process.exit(1);
  }
  
  const newToken = args[0];
  
  try {
    // ステップ1: 本番環境設定ファイルの更新
    await updateProductionEnv(newToken);
    
    // ステップ2: refreshAndVerify.jsスクリプトの実行
    await runRefreshAndVerify(newToken);
    
    // ステップ3: ヘルスチェック
    const healthSuccess = await checkHealth();
    
    if (healthSuccess) {
      // ステップ4: Graph API検証
      await runGraphVerification();
      
      // ステップ5: ブラウザ自動起動
      await openBrowser();
    } else {
      log.error('ヘルスチェックが失敗したため、以降の処理をスキップします');
    }
    
  } catch (error) {
    log.error(`スクリプト実行中にエラーが発生しました: ${error.message}`);
    process.exit(1);
  }
}

// ステップ1: 本番環境設定ファイルの更新
async function updateProductionEnv(newToken) {
  log.step('ステップ1: 本番環境設定ファイルの更新');
  
  try {
    // env.developmentファイルの読み込み
    if (!fs.existsSync(ENV_DEV_PATH)) {
      throw new Error(`開発環境設定ファイルが見つかりません: ${ENV_DEV_PATH}`);
    }
    
    const devContent = fs.readFileSync(ENV_DEV_PATH, 'utf8');
    
    // env.productionファイルの読み込み
    if (!fs.existsSync(ENV_PROD_PATH)) {
      throw new Error(`本番環境設定ファイルが見つかりません: ${ENV_PROD_PATH}`);
    }
    
    let prodContent = fs.readFileSync(ENV_PROD_PATH, 'utf8');
    
    // FB_USER_OR_LL_TOKENを更新
    if (prodContent.includes('FB_USER_OR_LL_TOKEN=')) {
      prodContent = prodContent.replace(
        /FB_USER_OR_LL_TOKEN=.*/,
        `FB_USER_OR_LL_TOKEN=${newToken}`
      );
    } else {
      // 存在しない場合は追加
      prodContent += `\n# Facebook User Token (本番用)\nFB_USER_OR_LL_TOKEN=${newToken}`;
    }
    
    // ファイルに書き込み
    fs.writeFileSync(ENV_PROD_PATH, prodContent);
    log.success(`本番環境設定ファイルを更新しました: ${newToken.substring(0, 20)}...`);
    
  } catch (error) {
    throw new Error(`本番環境設定ファイルの更新に失敗: ${error.message}`);
  }
}

// ステップ2: refreshAndVerify.jsスクリプトの実行
async function runRefreshAndVerify(newToken) {
  log.step('ステップ2: refreshAndVerify.jsスクリプトの実行');
  
  try {
    log.process('refreshAndVerify.jsスクリプトを実行中...');
    
    // Windows環境ではcmdを使用してスクリプトを実行
    let command;
    if (process.platform === 'win32') {
      command = 'cmd /c node scripts/refreshAndVerify.js';
    } else {
      command = 'node scripts/refreshAndVerify.js';
    }
    
    // 引数付きでスクリプトを実行
    const fullCommand = `${command} "${newToken}"`;
    
    const { stdout, stderr } = await execAsync(fullCommand, {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        FB_USER_OR_LL_TOKEN: newToken
      },
      timeout: 120000 // 2分でタイムアウト
    });
    
    if (stderr && !stderr.includes('npm WARN')) {
      log.warning(`refreshAndVerify.jsで警告が発生しました: ${stderr}`);
    }
    
    log.success('refreshAndVerify.jsスクリプトが正常に完了しました');
    
    // 結果の表示
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes('✅') || line.includes('❌') || line.includes('⚠️')) {
        console.log(line.trim());
      }
    }
    
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      throw new Error('refreshAndVerify.jsスクリプトがタイムアウトしました');
    } else {
      throw new Error(`refreshAndVerify.jsスクリプトの実行に失敗: ${error.message}`);
    }
  }
}

// ステップ3: ヘルスチェック
async function checkHealth() {
  log.step('ステップ3: ヘルスチェック');
  
  try {
    log.health(`ヘルスチェックエンドポイントにアクセス中: ${HEALTH_ENDPOINT}`);
    
    // 最大10回までリトライ
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const response = await fetch(HEALTH_ENDPOINT, {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.text();
          log.success(`ヘルスチェック成功 (試行 ${attempt}/10): ${response.status} ${response.statusText}`);
          log.health(`レスポンス: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
          return true;
        } else {
          log.warning(`ヘルスチェック失敗 (試行 ${attempt}/10): ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        log.warning(`ヘルスチェック接続エラー (試行 ${attempt}/10): ${fetchError.message}`);
      }
      
      // 最後の試行でない場合は待機
      if (attempt < 10) {
        log.info(`${attempt * 2}秒後にリトライします...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
    
    log.error('ヘルスチェックが10回の試行後も失敗しました');
    return false;
    
  } catch (error) {
    log.error(`ヘルスチェック中にエラーが発生しました: ${error.message}`);
    return false;
  }
}

// ステップ4: Graph API検証
async function runGraphVerification() {
  log.step('ステップ4: Graph API検証');
  
  try {
    log.verify('npm run verify:graph を実行中...');
    
    // Windows環境ではcmdを使用してnpmコマンドを実行
    let command;
    if (process.platform === 'win32') {
      command = 'cmd /c npm run verify:graph';
    } else {
      command = 'npm run verify:graph';
    }
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: PROJECT_ROOT,
      timeout: 60000 // 60秒でタイムアウト
    });
    
    if (stderr && !stderr.includes('npm WARN')) {
      log.warning(`Graph API検証で警告が発生しました: ${stderr}`);
    }
    
    // 結果の解析と表示
    const lines = stdout.split('\n');
    let successCount = 0;
    let totalSteps = 0;
    
    for (const line of lines) {
      if (line.includes('✅')) {
        log.success(line.trim());
        successCount++;
      } else if (line.includes('❌')) {
        log.error(line.trim());
      } else if (line.includes('⚠️')) {
        log.warning(line.trim());
      } else if (line.includes('ℹ️')) {
        log.info(line.trim());
      } else if (line.includes('🔍')) {
        log.step(line.trim());
      } else if (line.includes('🎉')) {
        log.success(line.trim());
      } else if (line.includes('成功ステップ:')) {
        const match = line.match(/(\d+)\/(\d+)/);
        if (match) {
          successCount = parseInt(match[1]);
          totalSteps = parseInt(match[2]);
        }
      }
    }
    
    // 結果サマリー
    console.log(chalk.bold.red('\n📊 Graph API検証結果サマリー'));
    console.log(chalk.gray('='.repeat(50)));
    log.info(`成功ステップ: ${successCount}/${totalSteps}`);
    
    if (successCount === totalSteps) {
      log.success('🎉 すべての検証が成功しました！');
    } else {
      log.warning(`⚠️  ${totalSteps - successCount}件の検証が失敗しました`);
    }
    
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      log.error('Graph API検証がタイムアウトしました');
    } else {
      log.error(`Graph API検証中にエラーが発生しました: ${error.message}`);
    }
  }
}

// ステップ5: ブラウザ自動起動
async function openBrowser() {
  log.step('ステップ5: ブラウザ自動起動');
  
  try {
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
      // Windows
      command = 'start';
    } else if (platform === 'darwin') {
      // macOS
      command = 'open';
    } else {
      // Linux
      command = 'xdg-open';
    }
    
    log.process(`${platform}環境でブラウザを起動中...`);
    
    if (platform === 'win32') {
      await execAsync(`start ${SERVER_URL}`);
    } else {
      await execAsync(`${command} ${SERVER_URL}`);
    }
    
    log.success(`ブラウザで ${SERVER_URL} を開きました`);
    
  } catch (error) {
    log.warning(`ブラウザの自動起動に失敗しました: ${error.message}`);
    log.info(`手動でブラウザを開いて ${SERVER_URL} にアクセスしてください`);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  log.error(`未処理のPromise拒否: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log.error(`未処理の例外: ${error.message}`);
  process.exit(1);
});

// スクリプト実行
main().catch((error) => {
  log.error(`致命的なエラーが発生しました: ${error.message}`);
  process.exit(1);
});
