#!/usr/bin/env node

/**
 * Facebook OAuth redirect_uri 自動抽出スクリプト
 * 
 * 使用方法:
 * node redirect_uri_extractor.js <network_log_file>
 * 
 * 対応形式:
 * - HAR (HTTP Archive) ファイル
 * - 単純なJSON配列
 */

const fs = require('fs');
const path = require('path');
const url = require('url');

/**
 * メイン処理
 */
function main() {
  try {
    // コマンドライン引数の確認
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      showUsage();
      process.exit(1);
    }
    
    const filePath = args[0];
    
    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      console.error(`❌ エラー: ファイルが見つかりません: ${filePath}`);
      process.exit(1);
    }
    
    // ファイルの読み込み
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // ファイル形式の判定と処理
    let redirectUris = [];
    
    try {
      const jsonData = JSON.parse(fileContent);
      
      if (isHARFile(jsonData)) {
        console.log('📁 HARファイルとして処理中...');
        redirectUris = extractFromHAR(jsonData);
      } else if (Array.isArray(jsonData)) {
        console.log('📁 JSON配列として処理中...');
        redirectUris = extractFromJSONArray(jsonData);
      } else {
        console.log('📁 単一JSONオブジェクトとして処理中...');
        redirectUris = extractFromJSONObject(jsonData);
      }
    } catch (parseError) {
      console.error('❌ エラー: JSONファイルの解析に失敗しました');
      console.error(`詳細: ${parseError.message}`);
      process.exit(1);
    }
    
    // 結果の表示
    displayResults(redirectUris);
    
  } catch (error) {
    console.error('❌ 致命的なエラーが発生しました:');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * 使用方法の表示
 */
function showUsage() {
  console.log('📋 Facebook OAuth redirect_uri 自動抽出スクリプト');
  console.log('');
  console.log('使用方法:');
  console.log('  node redirect_uri_extractor.js <network_log_file>');
  console.log('');
  console.log('対応ファイル形式:');
  console.log('  - HAR (HTTP Archive) ファイル');
  console.log('  - 単純なJSON配列');
  console.log('  - 単一JSONオブジェクト');
  console.log('');
  console.log('例:');
  console.log('  node redirect_uri_extractor.js network_log.har');
  console.log('  node redirect_uri_extractor.js network_log.json');
}

/**
 * HARファイルかどうかの判定
 */
function isHARFile(data) {
  return data && data.log && data.log.entries && Array.isArray(data.log.entries);
}

/**
 * HARファイルからredirect_uriを抽出
 */
function extractFromHAR(harData) {
  const redirectUris = new Set();
  
  try {
    const entries = harData.log.entries;
    
    for (const entry of entries) {
      if (entry.request && entry.request.url) {
        const extractedUris = extractRedirectUrisFromURL(entry.request.url);
        extractedUris.forEach(uri => redirectUris.add(uri));
      }
      
      // レスポンスヘッダーも確認
      if (entry.response && entry.response.headers) {
        for (const header of entry.response.headers) {
          if (header.name.toLowerCase() === 'location') {
            const extractedUris = extractRedirectUrisFromURL(header.value);
            extractedUris.forEach(uri => redirectUris.add(uri));
          }
        }
      }
    }
    
    console.log(`✅ HARファイルから ${entries.length} 件のエントリを処理しました`);
    
  } catch (error) {
    console.error('⚠️ HARファイルの処理中にエラーが発生しました:', error.message);
  }
  
  return Array.from(redirectUris);
}

/**
 * JSON配列からredirect_uriを抽出
 */
function extractFromJSONArray(jsonArray) {
  const redirectUris = new Set();
  
  try {
    for (const item of jsonArray) {
      if (typeof item === 'object' && item !== null) {
        const extractedUris = extractFromJSONObject(item);
        extractedUris.forEach(uri => redirectUris.add(uri));
      }
    }
    
    console.log(`✅ JSON配列から ${jsonArray.length} 件のアイテムを処理しました`);
    
  } catch (error) {
    console.error('⚠️ JSON配列の処理中にエラーが発生しました:', error.message);
  }
  
  return Array.from(redirectUris);
}

/**
 * 単一JSONオブジェクトからredirect_uriを抽出
 */
function extractFromJSONObject(jsonObj) {
  const redirectUris = new Set();
  
  try {
    // 再帰的にオブジェクトを探索
    extractFromObjectRecursive(jsonObj, redirectUris);
    
  } catch (error) {
    console.error('⚠️ JSONオブジェクトの処理中にエラーが発生しました:', error.message);
  }
  
  return Array.from(redirectUris);
}

/**
 * オブジェクトを再帰的に探索してredirect_uriを抽出
 */
function extractFromObjectRecursive(obj, redirectUris, depth = 0) {
  // 深さ制限（無限ループ防止）
  if (depth > 10) return;
  
  if (obj === null || typeof obj !== 'object') return;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // URL文字列の場合
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('uri')) {
        const extractedUris = extractRedirectUrisFromURL(value);
        extractedUris.forEach(uri => redirectUris.add(uri));
      }
      
      // 一般的な文字列からも抽出を試行
      const extractedUris = extractRedirectUrisFromURL(value);
      extractedUris.forEach(uri => redirectUris.add(uri));
      
    } else if (Array.isArray(value)) {
      // 配列の場合
      for (const item of value) {
        extractFromObjectRecursive(item, redirectUris, depth + 1);
      }
      
    } else if (typeof value === 'object' && value !== null) {
      // オブジェクトの場合
      extractFromObjectRecursive(value, redirectUris, depth + 1);
    }
  }
}

/**
 * URL文字列からredirect_uriパラメータを抽出
 */
function extractRedirectUrisFromURL(urlString) {
  const redirectUris = new Set();
  
  try {
    if (!urlString || typeof urlString !== 'string') {
      return redirectUris;
    }
    
    // URLパース
    const parsedUrl = new URL(urlString);
    
    // クエリパラメータからredirect_uriを抽出
    const redirectUri = parsedUrl.searchParams.get('redirect_uri');
    if (redirectUri) {
      const decodedUri = decodeURIComponent(redirectUri);
      redirectUris.add(decodedUri);
    }
    
    // フラグメントからも抽出（一部のOAuth実装で使用）
    if (parsedUrl.hash) {
      const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
      const hashRedirectUri = hashParams.get('redirect_uri');
      if (hashRedirectUri) {
        const decodedUri = decodeURIComponent(hashRedirectUri);
        redirectUris.add(decodedUri);
      }
    }
    
    // パス部分にredirect_uriが含まれている場合
    if (parsedUrl.pathname.includes('redirect_uri=')) {
      const pathParams = new URLSearchParams(parsedUrl.pathname.split('?')[1] || '');
      const pathRedirectUri = pathParams.get('redirect_uri');
      if (pathRedirectUri) {
        const decodedUri = decodeURIComponent(pathRedirectUri);
        redirectUris.add(decodedUri);
      }
    }
    
    // 文字列全体から正規表現で抽出（フォールバック）
    const redirectUriRegex = /redirect_uri=([^&]+)/gi;
    let match;
    
    while ((match = redirectUriRegex.exec(urlString)) !== null) {
      if (match[1]) {
        try {
          const decodedUri = decodeURIComponent(match[1]);
          redirectUris.add(decodedUri);
        } catch (decodeError) {
          console.warn(`⚠️ URLデコードに失敗: ${match[1]}`);
        }
      }
    }
    
  } catch (error) {
    // URLパースに失敗した場合、正規表現で抽出を試行
    try {
      const redirectUriRegex = /redirect_uri=([^&]+)/gi;
      let match;
      
      while ((match = redirectUriRegex.exec(urlString)) !== null) {
        if (match[1]) {
          try {
            const decodedUri = decodeURIComponent(match[1]);
            redirectUris.add(decodedUri);
          } catch (decodeError) {
            console.warn(`⚠️ URLデコードに失敗: ${match[1]}`);
          }
        }
      }
    } catch (regexError) {
      console.warn(`⚠️ 正規表現での抽出に失敗: ${urlString}`);
    }
  }
  
  return redirectUris;
}

/**
 * 結果の表示
 */
function displayResults(redirectUris) {
  console.log('');
  console.log('='.repeat(50));
  console.log('=== Facebook OAuth redirect_uri List ===');
  console.log('='.repeat(50));
  
  if (redirectUris.length === 0) {
    console.log('📭 redirect_uri が見つかりませんでした');
    console.log('');
    console.log('考えられる原因:');
    console.log('• ファイルにredirect_uriパラメータが含まれていない');
    console.log('• ファイル形式が対応していない');
    console.log('• ファイルが破損している');
  } else {
    console.log(`📊 合計 ${redirectUris.length} 件のredirect_uriを発見しました:`);
    console.log('');
    
    redirectUris.forEach((uri, index) => {
      console.log(`${index + 1}. ${uri}`);
    });
    
    console.log('');
    console.log('💡 これらのURLをFacebook Developer Consoleの');
    console.log('   「有効なOAuthリダイレクトURI」に追加してください');
  }
  
  console.log('='.repeat(50));
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  extractFromHAR,
  extractFromJSONArray,
  extractFromJSONObject,
  extractRedirectUrisFromURL
};
