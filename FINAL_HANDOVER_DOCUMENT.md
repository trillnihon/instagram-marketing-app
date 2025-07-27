# 🔄 Instagram×Facebook連携 申し送り書（最終版）

## 📋 利用者情報（確認済み）

| 項目 | 内容 |
|------|------|
| **Instagramアカウント** | @1100_ai_ko（ビジネスアカウント） |
| **Facebookページ名** | インスタ支援テスト |
| **Meta Business名** | トリル管理（ビジネスサポートフォリオ） |
| **Metaアカウント管理者** | とりる（trill.0310.0321@gmail.com） |
| **ユーザーID** | 122097305486919546 |

## 🎯 今回の目的

Meta Graph APIを用いたInstagramデータ連携（投稿・分析・自動投稿など）のため、
FacebookページとInstagramビジネスアカウントの正しい接続とMeta Business Suiteでの権限・アセット確認を行う。

## 📊 これまでの対応内容（時系列）

| Step | 日時 | 対応内容 | 結果 |
|------|------|----------|------|
| Step1 | 完了 | Instagramアカウントをビジネスアカウントに切り替え | ✅ 完了 |
| Step2 | 完了 | Facebookアカウントを作成し、Metaアカウントとして登録 | ✅ 完了 |
| Step3 | 完了 | Facebookページ「インスタ支援テスト」を作成 | ✅ 完了 |
| Step4 | 完了 | InstagramとFacebookを連携（アプリ側「プロフィール間のシェア」設定済） | ✅ 完了 |
| Step5 | 完了 | Meta Business ManagerにFacebookページ・Instagramをアセット登録 | ✅ 完了 |
| Step6 | 完了 | Meta Business ManagerでInstagramアカウントとFacebookページをリンク | ✅ 完了 |
| Step7 | 完了 | Graph APIで認証試行（アクセストークンの取得・エラー検証） | ⚠️ エラー発生 → 解消済み |
| Step8 | 完了 | Meta Businessユーザー（とりる）に全権限を付与 | ✅ 完了 |
| Step9 | 完了 | /me/accounts で Facebookページ情報取得 → instagram_business_account の確認準備 | ⚠️ **問題発見** |
| **Step10** | **2025年1月** | **診断ツールによる詳細分析実行** | **🔍 詳細結果取得** |

## 🔍 現在の接続状態（診断結果）

### ✅ 正常な項目
- **ユーザー認証**: とりる（trill.0310.0321@gmail.com）で正常に認証
- **API権限**: 必要な権限がすべて付与済み
  - ✅ `email`: granted
  - ✅ `instagram_basic`: granted
  - ✅ `instagram_manage_insights`: granted
  - ✅ `public_profile`: granted

### ❌ 問題項目
- **Facebookページ一覧**: `"data": []` - **主要問題**
- **Instagram連携ページ数**: 0
- **ビジネスアカウント数**: 0
- **ビジネスアセット数**: 0
- **不足権限**: `pages_show_list`, `pages_read_engagement` が未付与

## 🚨 未対応・今後の作業（API実装に向けて）

### 最優先（即座に対応）
| 項目 | 内容 | 備考 |
|------|------|------|
| **Facebookページのビジネスアセット登録確認** | Meta Business Managerでページ設定を確認 | 申し送り書では作成済みだがAPIで検出されない |
| **デモモードでの全機能テスト** | アプリケーションの品質確認 | APIに依存しない範囲で体験価値を確認 |

### 高優先（1-2日以内）
| 項目 | 内容 | 備考 |
|------|------|------|
| **Instagramビジネスアカウント設定の最終確認** | ビジネスアカウント設定の再確認 | 申し送り書では完了済み |
| **API権限の追加申請** | `pages_show_list`, `pages_read_engagement` の追加 | Facebook App設定で権限を追加 |

### 中優先（1週間以内）
| 項目 | 内容 | 備考 |
|------|------|------|
| **長期アクセストークンの取得（60日トークン）** | Graph API Explorer またはスクリプトで処理 | `get_long_lived_token.js` で自動化可能 |
| **Instagram Graph APIの実装** | 投稿取得・インサイト・自動投稿機能のAPI連携 | `/me/accounts` → `instagram_business_account` 確認必須 |

## 🛠️ 作成済みツール・スクリプト

### 診断・分析ツール
- **`instagram_connection_test.js`**: 詳細な接続状況診断
- **`get_long_lived_token.js`**: 長期アクセストークン取得・更新

### 使用方法
```bash
# 診断ツールの実行
cd ebay_projects/instagram-marketing-app/server
node instagram_connection_test.js <access_token>

# 長期トークンの取得
node get_long_lived_token.js <short_lived_token>

# トークンの更新
node get_long_lived_token.js --refresh <current_token>
```

## 📊 申し送り書の更新（推奨追加項目）

| チェック項目 | 状況 | 備考 |
|-------------|------|------|
| 診断ツールによる接続状態の分析完了 | ✅ 完了 | 2025年1月実行済み |
| Facebookページのアセット登録状況の再確認 | ❌ 未完了 | **要対応** |
| Instagramビジネスアカウント設定の最終確認 | ❌ 未完了 | 申し送り書では完了済みだが要再確認 |
| 長期アクセストークンの取得（Graph API Explorer等） | ❌ 未完了 | スクリプト準備済み |
| 実際のAPI連携テスト（/media, /insights）成功 | ❌ 未完了 | Facebookページ問題解決後 |

## 💡 補足・注意点

### 技術的な注意点
- **Instagramの「個人アカウント」ではGraph API連携不可**のため、ビジネスアカウントが必須
- **FacebookページがInstagramと直接リンクされていない状態ではAPIエラー**になる
- **Meta Business Managerの「アセットリンク」がGraph API上のリンク条件**となる
- **Graph API v18.0** を使用
- **HTTPS必須**（localhost:4000）
- **権限不足**: `pages_show_list`、`pages_read_engagement` が必要

### 開発環境情報
- **サーバー起動**: `https://localhost:4000`
- **フロントエンド**: `https://localhost:3001`
- **ヘルスチェック**: `https://localhost:4000/health`
- **デバッグ情報**: `https://localhost:4000/debug`

## 🎯 担当者メモ（引き継ぎの際に）

### 重要なポイント
1. **すべての連携はMeta Business Manager（https://business.facebook.com）上で管理**
2. **FacebookページがAPIで検出されない問題が主要な課題**
3. **申し送り書では設定完了と記載されているが、実際のAPIでは検出されていない**
4. **今後APIの設定・実装時は、アクセストークンとInstagram Business IDを利用する**
5. **Facebook Appはすでに登録済み（例：Caption AI Tool-IG）で、認証済み**

### 推奨する次のアクション
1. **Meta Business Managerで「インスタ支援テスト」ページの状態を確認**
2. **ページがビジネスアセットに正しく登録されているか確認**
3. **必要に応じてページを再作成または再設定**
4. **デモモードでアプリケーションの全機能をテスト**
5. **Facebook App設定で不足している権限を追加**

### 参考リンク
- [Instagram Graph API ドキュメント](https://developers.facebook.com/docs/instagram-api)
- [Meta Business Manager](https://business.facebook.com)
- [Facebook for Developers](https://developers.facebook.com)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

---

**最終更新**: 2025年1月
**担当者**: とりる（trill.0310.0321@gmail.com）
**ステータス**: 設定完了、API連携テスト中
**診断実行日**: 2025年1月
**次回確認予定**: Facebookページ問題解決後 