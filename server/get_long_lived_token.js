#!/usr/bin/env node

/**
 * Instagram Marketing App - 長期トークン管理ラッパー
 * 
 * このファイルは新しいTypeScriptスクリプト (scripts/refresh-long-lived-token.ts) の
 * ラッパーとして機能します。既存のコードとの互換性を保ちながら、
 * 新しい機能を利用できます。
 * 
 * 使用方法:
 *   node get_long_lived_token.js <short_lived_token> [--refresh] [--dry-run] [--report]
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 新しいTypeScriptスクリプトのパス
const SCRIPT_PATH = join(__dirname, '..', 'scripts', 'refresh-long-lived-token.ts');

// スクリプトが存在するかチェック
if (!fs.existsSync(SCRIPT_PATH)) {
  console.error('❌ 新しいスクリプトが見つかりません:', SCRIPT_PATH);
  console.error('scripts/refresh-long-lived-token.ts を確認してください');
  process.exit(1);
}

// コマンドライン引数の解析
const args = process.argv.slice(2);
const shortToken = args[0];
const isRefresh = args.includes('--refresh');
const isDryRun = args.includes('--dry-run');
const isReport = args.includes('--report');

// 引数チェック
if (!shortToken && !isRefresh) {
  console.log('長期アクセストークン取得ツール (新バージョン)');
  console.log('');
  console.log('使用方法:');
  console.log('  1. 新しい長期トークンを取得: node get_long_lived_token.js <short_lived_token>');
  console.log('  2. 既存トークンを更新: node get_long_lived_token.js --refresh');
  console.log('  3. ドライラン: node get_long_lived_token.js --refresh --dry-run');
  console.log('  4. レポート付き: node get_long_lived_token.js --refresh --report');
  console.log('');
  console.log('注意: このファイルは scripts/refresh-long-lived-token.ts のラッパーです');
  console.log('新しい機能を使用するには、直接TypeScriptスクリプトを実行してください:');
  console.log('  npm run token:refresh');
  console.log('  npm run token:rotate-now');
  console.log('');
  
  if (!shortToken) {
    console.log('短期アクセストークンを指定してください');
    console.log('例: node get_long_lived_token.js EAAOQ4eQNXqIBP...');
    process.exit(1);
  }
}

// 環境変数ファイルに短期トークンを設定
function setShortTokenInEnv(token) {
  try {
    const envPath = join(__dirname, '..', 'env.development');
    
    if (!fs.existsSync(envPath)) {
      console.error('❌ 環境変数ファイルが見つかりません:', envPath);
      return false;
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 既存のFB_USER_SHORT_TOKENを更新
    if (envContent.includes('FB_USER_SHORT_TOKEN=')) {
      envContent = envContent.replace(
        /FB_USER_SHORT_TOKEN=.*/,
        `FB_USER_SHORT_TOKEN=${token}`
      );
    } else {
      // 存在しない場合は追加
      envContent += `\nFB_USER_SHORT_TOKEN=${token}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ 短期トークンを環境変数ファイルに設定しました');
    return true;
  } catch (error) {
    console.error('❌ 環境変数ファイル更新に失敗:', error.message);
    return false;
  }
}

// TypeScriptスクリプトを実行
function runTypeScriptScript() {
  const scriptArgs = [];
  
  if (isRefresh) {
    scriptArgs.push('--rotate-now');
  }
  
  if (isDryRun) {
    scriptArgs.push('--dry-run');
  }
  
  if (isReport) {
    scriptArgs.push('--report');
  }
  
  console.log('🚀 新しいTypeScriptスクリプトを実行中...');
  console.log(`スクリプト: ${SCRIPT_PATH}`);
  console.log(`引数: ${scriptArgs.join(' ')}`);
  console.log('');
  
  // tsxを使用してTypeScriptスクリプトを実行
  const child = spawn('npx', ['tsx', SCRIPT_PATH, ...scriptArgs], {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  child.on('close', (code) => {
    console.log('');
    console.log(`スクリプトが終了しました (終了コード: ${code})`);
    
    if (code === 0) {
      console.log('✅ スクリプトが正常に完了しました');
    } else {
      console.log('❌ スクリプトがエラーで終了しました');
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    console.error('❌ スクリプト実行エラー:', error.message);
    console.error('');
    console.error('tsxがインストールされていない可能性があります:');
    console.error('  npm install -g tsx');
    console.error('  または');
    console.error('  npm install --save-dev tsx');
    process.exit(1);
  });
}

// メイン処理
async function main() {
  console.log('🔄 Instagram Marketing App - 長期トークン管理');
  console.log('='.repeat(60));
  
  if (shortToken) {
    console.log('📝 短期トークンを環境変数ファイルに設定中...');
    if (!setShortTokenInEnv(shortToken)) {
      process.exit(1);
    }
    console.log('');
  }
  
  if (isRefresh) {
    console.log('🔄 トークン更新モード');
  } else if (shortToken) {
    console.log('🆕 新規トークン取得モード');
  }
  
  console.log('');
  
  // TypeScriptスクリプトを実行
  runTypeScriptScript();
}

// スクリプト実行
main().catch((error) => {
  console.error('❌ 予期しないエラーが発生しました:', error.message);
  process.exit(1);
}); 