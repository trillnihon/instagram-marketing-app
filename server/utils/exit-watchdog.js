// exit-watchdog.js - process.exitと各種終了イベントを監視
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// シングルトン化：多重登録防止
const EXIT_WATCHDOG_SYMBOL = Symbol.for('exit_watchdog_installed');

// デフォルトの空の関数をエクスポート
export function patchHttpServer() {
  if (!globalThis[EXIT_WATCHDOG_SYMBOL]) {
    console.log('[EXIT-WATCHDOG] 初期化されていないため、何もしません');
    return;
  }
}

if (globalThis[EXIT_WATCHDOG_SYMBOL]) {
  console.log('[EXIT-WATCHDOG] 既にインストール済み、スキップ');
} else {
  globalThis[EXIT_WATCHDOG_SYMBOL] = true;
  console.log('[EXIT-WATCHDOG] 初期化開始');

  // 元のprocess.exitを保存
  const originalExit = process.exit;

  // SIGINTスロットリング用変数
  let sigintCount = 0;
  let lastSigintTime = 0;
  const SIGINT_THROTTLE_MS = 3000;

  // process.exitをラップ
  process.exit = async function(code) {
    const stack = new Error().stack;
    console.error('[EXIT-WATCHDOG] process.exit() 呼び出し検出!');
    console.error('[EXIT-WATCHDOG] 終了コード:', code);
    console.error('[EXIT-WATCHDOG] 呼び出しスタック:', stack);
    console.error('[EXIT-WATCHDOG] 呼び出し元ファイル:', __filename);
    
    // DEV_NO_EXIT ガードチェック
    if (process.env.DEV_NO_EXIT === 'true') {
      console.error('[EXIT-WATCHDOG] DEV_NO_EXIT=true: process.exitを無効化');
      return;
    }
    
    // ログファイルに記録
    try {
      const fs = await import('fs');
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, 'exit-watchdog.log');
      const logEntry = `[${new Date().toISOString()}] process.exit(${code}) called\nStack: ${stack}\n\n`;
      fs.appendFileSync(logFile, logEntry);
    } catch (logError) {
      console.error('[EXIT-WATCHDOG] ログファイル書き込み失敗:', logError);
    }
    
    // 元のprocess.exitを呼び出し
    originalExit.call(this, code);
  };

  // 各種終了イベントを監視
  process.on('SIGINT', () => {
    const now = Date.now();
    sigintCount++;
    
    // スロットリングチェック
    if (now - lastSigintTime < SIGINT_THROTTLE_MS) {
      console.log(`[EXIT-WATCHDOG] SIGINT受信 (${sigintCount}回目) - スロットリング中、無視`);
      return;
    }
    
    lastSigintTime = now;
    console.log(`[EXIT-WATCHDOG] SIGINT受信 (${sigintCount}回目) - 最終時刻: ${new Date(now).toISOString()}`);
    const stack = new Error().stack;
    console.log('[EXIT-WATCHDOG] SIGINT呼び出しスタック:', stack);
    
    // DEV環境でIGNORE_SIGINT=1の場合はSIGINTを無視
    if (process.env.NODE_ENV === 'development' && process.env.IGNORE_SIGINT === '1') {
      console.log('[EXIT-WATCHDOG] DEV環境 + IGNORE_SIGINT=1: SIGINTを無視、exitしない');
      return;
    }
    
    // 通常のSIGINT処理
    console.log('[EXIT-WATCHDOG] SIGINT処理完了、プロセス終了');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('[EXIT-WATCHDOG] SIGTERM受信');
    const stack = new Error().stack;
    console.log('[EXIT-WATCHDOG] SIGTERM呼び出しスタック:', stack);
  });

  process.on('SIGUSR2', () => {
    console.log('[EXIT-WATCHDOG] SIGUSR2受信');
    const stack = new Error().stack;
    console.log('[EXIT-WATCHDOG] SIGUSR2呼び出しスタック:', stack);
  });

  process.on('beforeExit', (code) => {
    console.log('[EXIT-WATCHDOG] beforeExit受信, コード:', code);
    const stack = new Error().stack;
    console.log('[EXIT-WATCHDOG] beforeExit呼び出しスタック:', stack);
    
    // アクティブハンドルとリクエストをダンプ
    try {
      const activeHandles = process._getActiveHandles();
      const activeRequests = process._getActiveRequests();
      console.log('[BEFORE_EXIT] アクティブハンドル数:', activeHandles.length);
      console.log('[BEFORE_EXIT] アクティブリクエスト数:', activeRequests.length);
      
      if (activeHandles.length > 0) {
        console.log('[BEFORE_EXIT] アクティブハンドル詳細:', activeHandles.map(h => h.constructor.name));
      }
    } catch (e) {
      console.log('[BEFORE_EXIT] アクティブハンドル取得失敗:', e.message);
    }
  });

  process.on('exit', (code) => {
    console.log('[EXIT-WATCHDOG] exit受信, コード:', code);
    const stack = new Error().stack;
    console.log('[EXIT-WATCHDOG] exit呼び出しスタック:', stack);
  });

  // patchHttpServer関数を再定義
  const originalPatchHttpServer = patchHttpServer;
  globalThis.patchHttpServer = function(httpServer) {
    if (!httpServer || typeof httpServer.close !== 'function') return;
    
    const originalClose = httpServer.close;
    httpServer.close = function(callback) {
      const stack = new Error().stack;
      console.log('[MONKEY-CLOSE] httpServer.close() 呼び出し検出!');
      console.log('[MONKEY-CLOSE] 呼び出しスタック:', stack);
      console.log('[MONKEY-CLOSE] httpServer.listening:', httpServer.listening);
      
      // DEV_NO_EXIT ガードチェック
      if (process.env.DEV_NO_EXIT === 'true') {
        console.log('[MONKEY-CLOSE] DEV_NO_EXIT=true: httpServer.closeを無効化');
        return;
      }
      
      // 元のcloseを呼び出し
      return originalClose.call(this, callback);
    };
    
    console.log('[EXIT-WATCHDOG] httpServer.close モンキーパッチ完了');
  };

  console.log('[EXIT-WATCHDOG] 初期化完了');
}
