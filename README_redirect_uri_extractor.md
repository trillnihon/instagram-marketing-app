# 🔍 Facebook OAuth redirect_uri 自動抽出スクリプト

Facebook Login実行時のNetworkログから`redirect_uri`パラメータを自動的に抽出するNode.jsスクリプトです。

## ✨ 機能

- **HAR (HTTP Archive) ファイル対応**
- **単純なJSON配列対応**
- **単一JSONオブジェクト対応**
- **URLデコード自動実行**
- **重複排除**
- **エラーハンドリング**

## 🚀 使用方法

### 基本的な使用方法

```bash
node redirect_uri_extractor.cjs <network_log_file>
```

### 実行例

```bash
# HARファイルから抽出
node redirect_uri_extractor.cjs network_log.har

# JSONファイルから抽出
node redirect_uri_extractor.cjs network_log.json

# サンプルファイルでテスト
node redirect_uri_extractor.cjs sample_network_log.json
node redirect_uri_extractor.cjs sample_network_log.har
```

## 📁 対応ファイル形式

### 1. HAR (HTTP Archive) ファイル
```json
{
  "log": {
    "entries": [
      {
        "request": {
          "url": "https://example.com/oauth?redirect_uri=https%3A//app.com/callback"
        },
        "response": {
          "headers": [
            {
              "name": "Location",
              "value": "https://app.com/callback?code=123"
            }
          ]
        }
      }
    ]
  }
}
```

### 2. 単純なJSON配列
```json
[
  {
    "request": {
      "url": "https://example.com/oauth?redirect_uri=https%3A//app.com/callback"
    }
  }
]
```

### 3. 単一JSONオブジェクト
```json
{
  "oauth_url": "https://example.com/oauth?redirect_uri=https%3A//app.com/callback",
  "callback_url": "https://app.com/callback"
}
```

## 🔧 抽出ロジック

### URLパラメータからの抽出
- クエリパラメータ: `?redirect_uri=...`
- フラグメント: `#redirect_uri=...`
- パス部分: `/path?redirect_uri=...`

### レスポンスヘッダーからの抽出
- `Location`ヘッダー
- その他のリダイレクト関連ヘッダー

### 文字列からの抽出
- 正規表現による抽出（フォールバック）
- URLデコード自動実行

## 📊 出力例

```
📁 JSON配列として処理中...
✅ JSON配列から 2 件のアイテムを処理しました

==================================================
=== Facebook OAuth redirect_uri List ===
==================================================
📊 合計 2 件のredirect_uriを発見しました:

1. https://instagram-marketing-app.vercel.app/auth/instagram/callback
2. https://example.com/dashboard

💡 これらのURLをFacebook Developer Consoleの
   「有効なOAuthリダイレクトURI」に追加してください
==================================================
```

## 🛠️ インストール

### 前提条件
- Node.js 14.0以上

### セットアップ
```bash
# ファイルをダウンロード
# 実行権限を付与（Linux/Mac）
chmod +x redirect_uri_extractor.cjs

# テスト実行
node redirect_uri_extractor.cjs
```

## 🧪 テスト

### サンプルファイルでのテスト

```bash
# JSON配列のテスト
node redirect_uri_extractor.cjs sample_network_log.json

# HARファイルのテスト
node redirect_uri_extractor.cjs sample_network_log.har
```

### 期待される結果

サンプルファイルから以下のredirect_uriが抽出されます：
- `https://instagram-marketing-app.vercel.app/auth/instagram/callback`
- `https://example.com/dashboard`

## 🔍 トラブルシューティング

### よくある問題

#### 1. ファイルが見つからない
```
❌ エラー: ファイルが見つかりません: network_log.json
```
**解決方法**: ファイルパスが正しいか確認してください

#### 2. JSON解析エラー
```
❌ エラー: JSONファイルの解析に失敗しました
```
**解決方法**: ファイルが有効なJSON形式か確認してください

#### 3. redirect_uriが見つからない
```
📭 redirect_uri が見つかりませんでした
```
**解決方法**: 
- ファイルに`redirect_uri`パラメータが含まれているか確認
- ファイル形式が対応しているか確認

### デバッグ方法

```bash
# 詳細なログ出力
NODE_DEBUG=* node redirect_uri_extractor.cjs network_log.json

# ファイル内容確認
cat network_log.json | head -20
```

## 📝 カスタマイズ

### モジュールとして使用

```javascript
const { extractFromHAR, extractFromJSONArray } = require('./redirect_uri_extractor.cjs');

// HARファイルから抽出
const harData = JSON.parse(fs.readFileSync('network_log.har', 'utf8'));
const redirectUris = extractFromHAR(harData);

// JSON配列から抽出
const jsonData = JSON.parse(fs.readFileSync('network_log.json', 'utf8'));
const redirectUris = extractFromJSONArray(jsonData);
```

### 抽出パターンのカスタマイズ

```javascript
// カスタム正規表現パターン
const customRegex = /custom_redirect=([^&]+)/gi;
// extractRedirectUrisFromURL関数を修正
```

## 📚 参考資料

- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/for-business)
- [OAuth 2.0 リダイレクトURI](https://tools.ietf.org/html/rfc6749#section-3.1.2)
- [HAR (HTTP Archive) 形式](https://w3c.github.io/web-performance/specs/HAR/Overview.html)

## 🤝 貢献

バグ報告や機能要望は、Issueとして報告してください。

## 📄 ライセンス

MIT License

---

**注意**: このスクリプトは機密情報を含むファイルを処理するため、適切なセキュリティ対策を講じてください。
