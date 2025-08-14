#!/usr/bin/env node

/**
 * Instagram Marketing App - FB長期トークン設定・検証スクリプト
 * 
 * 機能:
 * 1. FB長期トークンの入力受付
 * 2. env.developmentとenv.productionのFB_USER_OR_LL_TOKEN更新
 * 3. 現在のターミナル環境変数に一時設定
 * 4. サーバー再起動
 * 5. /health確認
 * 6. npm run verify:graph実行
 * 7. 結果に応じた案内表示
 * 
 * 使用方法:
 * node scripts/setup-fb-token.js
 */

import chalk from 'chalk';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import readline from 'readline';

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
  input: (msg) => console.log(chalk.magenta('📝'), msg)
};

// メイン関数
async function main() {
  console.log(chalk.bold.cyan('🚀 Instagram Marketing App - FB長期トークン設定・検証スクリプト'));
  console.log(chalk.gray('='.repeat(80)));
  
  try {
    // ステップ1: FB長期トークンの入力
    const fbToken = await promptForToken();
    
    // ステップ2: 環境設定ファイルの更新
    await updateEnvironmentFiles(fbToken);
    
    // ステップ3: 現在のターミナル環境変数に設定
    await setTerminalEnvironment(fbToken);
    
    // ステップ4: サーバー再起動
    await restartServer();
    
    // ステップ5: ヘルスチェック
    const healthSuccess = await checkHealth();
    
    if (healthSuccess) {
      // ステップ6: Graph API検証
      const verificationSuccess = await runGraphVerification();
      
      if (verificationSuccess) {
        // 成功時の案内
        showSuccessGuide();
      } else {
        // 失敗時の案内
        showFailureGuide();
      }
    } else {
      log.error('ヘルスチェックが失敗したため、以降の処理をスキップします');
    }
    
  } catch (error) {
    log.error(`スクリプト実行中にエラーが発生しました: ${error.message}`);
    process.exit(1);
  }
}

// ステップ1: FB長期トークンの入力
async function promptForToken() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    log.input('Facebook長期アクセストークン（EAAxxxx...形式）を入力してください:');
    rl.question('> ', (token) => {
      rl.close();
      
      if (!token || !token.trim()) {
        log.error('トークンが入力されていません');
        process.exit(1);
      }
      
      const cleanToken = token.trim();
      if (!cleanToken.startsWith('EAA')) {
        log.warning('トークンがEAAで始まっていません。正しい形式か確認してください。');
      }
      
      log.success(`トークンを受け取りました: ${cleanToken.substring(0, 20)}...`);
      resolve(cleanToken);
    });
  });
}

// ステップ2: 環境設定ファイルの更新
async function updateEnvironmentFiles(fbToken) {
  log.step('ステップ2: 環境設定ファイルの更新');
  
  try {
    // env.developmentファイルの更新
    if (fs.existsSync(ENV_DEV_PATH)) {
      let devContent = fs.readFileSync(ENV_DEV_PATH, 'utf8');
      
      if (devContent.includes('FB_USER_OR_LL_TOKEN=')) {
        devContent = devContent.replace(
          /FB_USER_OR_LL_TOKEN=.*/,
          `FB_USER_OR_LL_TOKEN=${fbToken}`
        );
      } else {
        devContent += `\nFB_USER_OR_LL_TOKEN=${fbToken}`;
      }
      
      fs.writeFileSync(ENV_DEV_PATH, devContent);
      log.success('env.developmentファイルを更新しました');
    } else {
      log.warning('env.developmentファイルが見つかりません');
    }
    
    // env.productionファイルの更新
    if (fs.existsSync(ENV_PROD_PATH)) {
      let prodContent = fs.readFileSync(ENV_PROD_PATH, 'utf8');
      
      if (prodContent.includes('FB_USER_OR_LL_TOKEN=')) {
        prodContent = prodContent.replace(
          /FB_USER_OR_LL_TOKEN=.*/,
          `FB_USER_OR_LL_TOKEN=${fbToken}`
        );
      } else {
        prodContent += `\n# Facebook User Token (本番用)\nFB_USER_OR_LL_TOKEN=${fbToken}`;
      }
      
      fs.writeFileSync(ENV_PROD_PATH, prodContent);
      log.success('env.productionファイルを更新しました');
    } else {
      log.warning('env.productionファイルが見つかりません');
    }
    
  } catch (error) {
    throw new Error(`環境設定ファイルの更新に失敗: ${error.message}`);
  }
}

// ステップ3: 現在のターミナル環境変数に設定
async function setTerminalEnvironment(fbToken) {
  log.step('ステップ3: 現在のターミナル環境変数に設定');
  
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows PowerShell
      log.process('Windows環境で環境変数を設定中...');
      process.env.FB_USER_OR_LL_TOKEN = fbToken;
      
      // PowerShellコマンドも実行
      try {
        await execAsync(`$env:FB_USER_OR_LL_TOKEN="${fbToken}"`, { shell: 'powershell' });
        log.success('PowerShell環境変数を設定しました');
      } catch (psError) {
        log.warning(`PowerShell環境変数の設定に失敗: ${psError.message}`);
      }
      
    } else {
      // Unix系
      log.process('Unix環境で環境変数を設定中...');
      process.env.FB_USER_OR_LL_TOKEN = fbToken;
      
      try {
        await execAsync(`export FB_USER_OR_LL_TOKEN="${fbToken}"`, { shell: 'bash' });
        log.success('Bash環境変数を設定しました');
      } catch (bashError) {
        log.warning(`Bash環境変数の設定に失敗: ${bashError.message}`);
      }
    }
    
    log.success('現在のターミナル環境変数にFB_USER_OR_LL_TOKENを設定しました');
    
  } catch (error) {
    throw new Error(`環境変数の設定に失敗: ${error.message}`);
  }
}

// ステップ4: サーバー再起動
async function restartServer() {
  log.step('ステップ4: サーバー再起動');
  
  try {
    // 既存プロセスの終了
    log.process('既存のサーバープロセスを終了中...');
    
    const platform = process.platform;
    if (platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${SERVER_PORT}`);
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid !== '0') {
              try {
                await execAsync(`taskkill /PID ${pid} /F`);
                log.success(`プロセスID ${pid} を終了しました`);
              } catch (killError) {
                log.warning(`プロセスID ${pid} の終了に失敗: ${killError.message}`);
              }
            }
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -ti:${SERVER_PORT}`);
      if (stdout.trim()) {
        const pids = stdout.trim().split('\n');
        for (const pid of pids) {
          if (pid.trim() && pid !== '0') {
            try {
              await execAsync(`kill -9 ${pid}`);
              log.success(`プロセスID ${pid} を終了しました`);
            } catch (killError) {
              log.warning(`プロセスID ${pid} の終了に失敗: ${killError.message}`);
            }
          }
        }
      }
    }
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // サーバー起動
    log.process('サーバーを起動中...');
    
    const serverProcess = spawn('npm', ['start'], {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
        NODE_ENV: 'development'
      },
      stdio: 'pipe'
    });
    
    // サーバー起動完了を待機
    await new Promise((resolve, reject) => {
      let serverStarted = false;
      
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('✅ サーバー起動成功')) {
          if (!serverStarted) {
            serverStarted = true;
            log.success('サーバーが正常に起動しました');
            resolve();
          }
        }
      });
      
      serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('npm WARN')) {
          log.error(`サーバーエラー: ${error.trim()}`);
        }
      });
      
      // タイムアウト処理
      setTimeout(() => {
        if (!serverStarted) {
          serverProcess.kill();
          reject(new Error('サーバー起動がタイムアウトしました'));
        }
      }, 30000);
    });
    
    // サーバープロセスを終了
    serverProcess.kill();
    
  } catch (error) {
    throw new Error(`サーバー再起動に失敗: ${error.message}`);
  }
}

// ステップ5: ヘルスチェック
async function checkHealth() {
  log.step('ステップ5: ヘルスチェック');
  
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

// ステップ6: Graph API検証
async function runGraphVerification() {
  log.step('ステップ6: Graph API検証');
  
  try {
    log.verify('npm run verify:graph を実行中...');
    
    const platform = process.platform;
    let command;
    if (platform === 'win32') {
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
    
    // 結果の解析
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
      return true;
    } else {
      log.warning(`⚠️  ${totalSteps - successCount}件の検証が失敗しました`);
      return false;
    }
    
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      log.error('Graph API検証がタイムアウトしました');
    } else {
      log.error(`Graph API検証中にエラーが発生しました: ${error.message}`);
    }
    return false;
  }
}

// 成功時の案内
function showSuccessGuide() {
  console.log(chalk.bold.green('\n🎉 設定が完了しました！'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.green('✅ FB長期トークンの設定が完了しました'));
  console.log(chalk.green('✅ サーバーが正常に起動しています'));
  console.log(chalk.green('✅ Graph API検証が成功しました'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.cyan('📱 次のステップ:'));
  console.log(chalk.yellow('1. ブラウザで http://localhost:3001/login を開く'));
  console.log(chalk.yellow('2. "Facebook Login for Business"でログイン'));
  console.log(chalk.yellow('3. 必要な権限を承認'));
  console.log(chalk.gray('='.repeat(60)));
}

// 失敗時の案内
function showFailureGuide() {
  console.log(chalk.bold.red('\n❌ Graph API検証が失敗しました'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.red('🔍 失敗の原因候補:'));
  console.log(chalk.yellow('• トークンの期限切れ'));
  console.log(chalk.yellow('• アプリIDの不一致'));
  console.log(chalk.yellow('• 権限不足'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.cyan('📋 必要なスコープ一覧:'));
  console.log(chalk.blue('• instagram_basic'));
  console.log(chalk.blue('• instagram_content_publish'));
  console.log(chalk.blue('• instagram_manage_comments'));
  console.log(chalk.blue('• instagram_manage_insights'));
  console.log(chalk.blue('• pages_show_list'));
  console.log(chalk.blue('• pages_read_engagement'));
  console.log(chalk.blue('• pages_manage_posts'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.cyan('🔄 対処方法:'));
  console.log(chalk.yellow('1. Facebook Developer Consoleでトークンの有効性を確認'));
  console.log(chalk.yellow('2. アプリIDとアプリシークレットが正しいか確認'));
  console.log(chalk.yellow('3. 必要なスコープが付与されているか確認'));
  console.log(chalk.yellow('4. 新しいトークンを生成して再実行'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.magenta('💡 再実行する場合は、このスクリプトを再度実行してください'));
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
