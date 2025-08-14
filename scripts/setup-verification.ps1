# Instagram Marketing App 検証セットアップスクリプト
# PowerShell用

Write-Host "🔧 Instagram Marketing App 検証セットアップ" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. 環境変数設定ガイド
Write-Host "`n📋 1. 環境変数設定（必須）" -ForegroundColor Yellow
Write-Host "以下のコマンドで環境変数を設定してください：" -ForegroundColor White
Write-Host ""
Write-Host '$env:FB_USER_OR_LL_TOKEN="実際のFacebookユーザートークン"' -ForegroundColor Green
Write-Host '$env:FB_PAGE_ID="736448266214336"  # 合同会社トリルページID（任意）' -ForegroundColor Green
Write-Host ""

# 2. 検証実行
Write-Host "📋 2. 検証実行" -ForegroundColor Yellow
Write-Host "環境変数設定後、以下のコマンドで検証を実行してください：" -ForegroundColor White
Write-Host ""
Write-Host "npm run verify:graph" -ForegroundColor Green
Write-Host ""

# 3. 期待される結果
Write-Host "📋 3. 期待される結果" -ForegroundColor Yellow
Write-Host "✅ Page: 合同会社トリル (736448266214336)" -ForegroundColor White
Write-Host "✅ instagram_business_account: 17841474953463077" -ForegroundColor White
Write-Host "✅ /media OK, count=0（または実際のメディア数）" -ForegroundColor White
Write-Host "✅ insights OK（メディアがある場合）" -ForegroundColor White
Write-Host "🎉 Graph API v19.0 疎通・権限 OK" -ForegroundColor White
Write-Host ""

# 4. 本番環境設定
Write-Host "📋 4. 本番環境設定" -ForegroundColor Yellow
Write-Host "以下の環境変数を本番環境に設定してください：" -ForegroundColor White
Write-Host ""
Write-Host "Vercel:" -ForegroundColor Cyan
Write-Host "  FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c" -ForegroundColor Green
Write-Host ""
Write-Host "Render:" -ForegroundColor Cyan
Write-Host "  FACEBOOK_APP_SECRET=fd6a61c31a9f1f5798b4d48a927d8f0c" -ForegroundColor Green
Write-Host ""

# 5. 長期トークン管理
Write-Host "📋 5. 長期トークン管理" -ForegroundColor Yellow
Write-Host "トークンの有効期限管理：" -ForegroundColor White
Write-Host ""
Write-Host "# 新しい長期トークンを取得" -ForegroundColor Green
Write-Host "node server/get_long_lived_token.js <short_lived_token>" -ForegroundColor Green
Write-Host ""
Write-Host "# 既存トークンを更新" -ForegroundColor Green
Write-Host "node server/get_long_lived_token.js --refresh <current_token>" -ForegroundColor Green
Write-Host ""

# 6. 現在の状況確認
Write-Host "📋 6. 現在の状況確認" -ForegroundColor Yellow
Write-Host "プロジェクトの現在の状況：" -ForegroundColor White
Write-Host "✅ Graph API v19.0統一完了" -ForegroundColor Green
Write-Host "✅ 検証スクリプト準備完了" -ForegroundColor Green
Write-Host "✅ 長期トークン管理実装完了" -ForegroundColor Green
Write-Host "✅ 本番環境設定完了" -ForegroundColor Green
Write-Host "🔄 環境変数設定待ち（検証準備完了）" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 セットアップ完了！環境変数を設定して検証を実行してください。" -ForegroundColor Cyan
Write-Host "詳細は docs/HANDOVER_REPORT_20250810.md を参照してください。" -ForegroundColor White
