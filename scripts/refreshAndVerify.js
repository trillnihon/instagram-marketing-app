#!/usr/bin/env node

/**
 * Instagram Marketing App - トークン更新・検証自動化スクリプト
 * 
 * 機能:
 * 1. 渡した引数のアクセストークンで env.development の FB_USER_OR_LL_TOKEN を更新
 * 2. ポート4000を使っている既存プロセスを自動kill（Windows/Mac両対応）
 * 3. サーバーを PORT=4000, IGNORE_SIGINT=1, NODE_ENV=development で起動
 * 4. 起動後 /health を自動チェックして成功/失敗を色付きログで表示
 * 5. 成功時は npm run verify:graph を実行し、結果を色付きで表示
 * 
 * 使用方法:
 * node scripts/refreshAndVerify.js "EAAxxxx..."
 */

import chalk from 'chalk';
import fetch from 'node-fetch';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// 設定
const SERVER_PORT = 4000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const HEALTH_ENDPOINT = `${SERVER_URL}/health`;
const ENV_FILE_PATH = path.join(__dirname, '..', 'env.development');
const SERVER_DIR = path.join(__dirname, '..', 'server');

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
  verify: (msg) => console.log(chalk.yellow('🔍'), msg)
};

// メイン関数
async function main() {
  console.log(chalk.bold.cyan('🚀 Instagram Marketing App - トークン更新・検証自動化スクリプト'));
  console.log(chalk.gray('='.repeat(80)));
  
  // 引数チェック
  const args = process.argv.slice(2);
  if (args.length === 0) {
    log.error('アクセストークンが指定されていません');
    console.log(chalk.yellow('使用方法: node scripts/refreshAndVerify.js "EAAxxxx..."'));
    process.exit(1);
  }
  
  const newToken = args[0];
  
  try {
    // ステップ1: アクセストークンの更新
    await updateAccessToken(newToken);
    
    // ステップ2: 既存プロセスの終了
    await killExistingProcesses();
    
    // ステップ3: サーバーの起動
    const serverProcess = await startServer();
    
    // ステップ4: ヘルスチェック
    const healthSuccess = await checkHealth();
    
    if (healthSuccess) {
      // ステップ5: Graph API検証
      await runGraphVerification();
    } else {
      log.error('ヘルスチェックが失敗したため、Graph API検証をスキップします');
    }
    
    // サーバープロセスを終了
    if (serverProcess) {
      serverProcess.kill();
      log.info('サーバープロセスを終了しました');
    }
    
  } catch (error) {
    log.error(`スクリプト実行中にエラーが発生しました: ${error.message}`);
    process.exit(1);
  }
}

// ステップ1: アクセストークンの更新
async function updateAccessToken(newToken) {
  log.step('ステップ1: アクセストークンの更新');
  
  try {
    // 環境変数ファイルの読み込み
    if (!fs.existsSync(ENV_FILE_PATH)) {
      throw new Error(`環境変数ファイルが見つかりません: ${ENV_FILE_PATH}`);
    }
    
    let envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    
    // 既存のFB_USER_OR_LL_TOKENを更新
    if (envContent.includes('FB_USER_OR_LL_TOKEN=')) {
      envContent = envContent.replace(
        /FB_USER_OR_LL_TOKEN=.*/,
        `FB_USER_OR_LL_TOKEN=${newToken}`
      );
    } else {
      // 存在しない場合は追加
      envContent += `\nFB_USER_OR_LL_TOKEN=${newToken}`;
    }
    
    // ファイルに書き込み
    fs.writeFileSync(ENV_FILE_PATH, envContent);
    log.success(`アクセストークンを更新しました: ${newToken.substring(0, 20)}...`);
    
  } catch (error) {
    throw new Error(`アクセストークンの更新に失敗: ${error.message}`);
  }
}

// ステップ2: 既存プロセスの終了
async function killExistingProcesses() {
  log.step('ステップ2: 既存プロセスの終了');
  
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows
      log.process('Windows環境でポート4000を使用しているプロセスを検索中...');
      const { stdout } = await execAsync(`netstat -ano | findstr :${SERVER_PORT}`);
      
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            // PID 0（システムプロセス）は終了しない
            if (pid === '0') {
              log.info(`プロセスID ${pid} はシステムプロセスのためスキップします`);
              continue;
            }
            log.process(`プロセスID ${pid} を終了中...`);
            try {
              await execAsync(`taskkill /PID ${pid} /F`);
              log.success(`プロセスID ${pid} を終了しました`);
            } catch (killError) {
              log.warning(`プロセスID ${pid} の終了に失敗: ${killError.message}`);
            }
          }
        }
      } else {
        log.info('ポート4000を使用しているプロセスは見つかりませんでした');
      }
      
    } else {
      // macOS/Linux
      log.process('Unix環境でポート4000を使用しているプロセスを検索中...');
      const { stdout } = await execAsync(`lsof -ti:${SERVER_PORT}`);
      
      if (stdout.trim()) {
        const pids = stdout.trim().split('\n');
        for (const pid of pids) {
          if (pid.trim()) {
            // PID 0（システムプロセス）は終了しない
            if (pid === '0') {
              log.info(`プロセスID ${pid} はシステムプロセスのためスキップします`);
              continue;
            }
            log.process(`プロセスID ${pid} を終了中...`);
            try {
              await execAsync(`kill -9 ${pid}`);
              log.success(`プロセスID ${pid} を終了しました`);
            } catch (killError) {
              log.warning(`プロセスID ${pid} の終了に失敗: ${killError.message}`);
            }
          }
        }
      } else {
        log.info('ポート4000を使用しているプロセスは見つかりませんでした');
      }
    }
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    log.warning(`プロセス終了処理でエラーが発生しました: ${error.message}`);
  }
}

// ステップ3: サーバーの起動
async function startServer() {
  log.step('ステップ3: サーバーの起動');
  
  return new Promise((resolve, reject) => {
    log.server(`サーバーを起動中... (${SERVER_DIR})`);
    
    // Windows環境ではcmdを使用してnpmコマンドを実行
    let command, args;
    if (process.platform === 'win32') {
      command = 'cmd';
      args = ['/c', 'npm', 'start'];
    } else {
      command = 'npm';
      args = ['start'];
    }
    
    const serverProcess = spawn(command, args, {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
        IGNORE_SIGINT: '1',
        NODE_ENV: 'development'
      },
      stdio: 'pipe'
    });
    
    let serverStarted = false;
    
    // 標準出力の監視
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('✅ サーバー起動成功')) {
        if (!serverStarted) {
          serverStarted = true;
          log.success('サーバーが正常に起動しました');
          resolve(serverProcess);
        }
      }
      
      // エラーログの表示
      if (output.includes('❌') || output.includes('エラー')) {
        log.error(`サーバーエラー: ${output.trim()}`);
      }
    });
    
    // 標準エラーの監視
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('npm WARN')) { // npmの警告は無視
        log.error(`サーバーエラー: ${error.trim()}`);
      }
    });
    
    // プロセス終了の監視
    serverProcess.on('close', (code) => {
      if (code !== 0 && !serverStarted) {
        reject(new Error(`サーバーが異常終了しました (終了コード: ${code})`));
      }
    });
    
    // タイムアウト処理
    setTimeout(() => {
      if (!serverStarted) {
        serverProcess.kill();
        reject(new Error('サーバー起動がタイムアウトしました'));
      }
    }, 30000); // 30秒でタイムアウト
  });
}

// ステップ4: ヘルスチェック
async function checkHealth() {
  log.step('ステップ4: ヘルスチェック');
  
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

// ステップ5: Graph API検証
async function runGraphVerification() {
  log.step('ステップ5: Graph API検証');
  
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
      cwd: SERVER_DIR,
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
    console.log(chalk.bold.cyan('\n📊 Graph API検証結果サマリー'));
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
