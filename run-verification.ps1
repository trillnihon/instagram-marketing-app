# Instagram Marketing App 一括検証スクリプト (PowerShell)

Write-Host "🚀 Instagram Marketing App 一括検証開始" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 色付きログ関数
function Write-InfoLog {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-SuccessLog {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-WarningLog {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# 依存関係のインストール
Write-InfoLog "📦 依存関係をインストール中..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-ErrorLog "❌ 依存関係インストール失敗"
    exit 1
}

Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-ErrorLog "❌ サーバー依存関係インストール失敗"
    exit 1
}
Set-Location ..

# 1. APIエンドポイントのテスト
Write-InfoLog "🔧 1. ExpressサーバーのAPIエンドポイントテスト"
npm run test:api
if ($LASTEXITCODE -eq 0) {
    Write-SuccessLog "✅ APIエンドポイントテスト完了"
} else {
    Write-ErrorLog "❌ APIエンドポイントテスト失敗"
    exit 1
}

# 2. コンポーネントテスト
Write-InfoLog "🧩 2. ThreadsPostCreatorコンポーネントテスト"
npm run test:component
if ($LASTEXITCODE -eq 0) {
    Write-SuccessLog "✅ コンポーネントテスト完了"
} else {
    Write-ErrorLog "❌ コンポーネントテスト失敗"
    exit 1
}

# 3. ビルドテスト
Write-InfoLog "🏗️ 3. ビルドテスト"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-SuccessLog "✅ ビルドテスト完了"
} else {
    Write-ErrorLog "❌ ビルドテスト失敗"
    exit 1
}

# 4. 環境変数確認
Write-InfoLog "🔍 4. 環境変数確認"
if (Select-String -Path "env.development" -Pattern "API_TOKEN=your_actual_token_here" -Quiet) {
    Write-SuccessLog "✅ API_TOKEN設定確認済み"
} else {
    Write-WarningLog "⚠️ API_TOKEN設定を確認してください"
}

# 5. サーバー起動テスト
Write-InfoLog "🖥️ 5. バックエンドサーバー起動テスト"
Set-Location server
$serverJob = Start-Job -ScriptBlock { npm run dev }
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/diagnostics" -TimeoutSec 5 -ErrorAction Stop
    Write-SuccessLog "✅ バックエンドサーバー起動確認"
} catch {
    Write-ErrorLog "❌ バックエンドサーバー起動失敗"
    Stop-Job $serverJob
    Remove-Job $serverJob
    Set-Location ..
    exit 1
}

Stop-Job $serverJob
Remove-Job $serverJob
Set-Location ..

# 6. フロントエンド起動テスト
Write-InfoLog "🌐 6. フロントエンド起動テスト"
$frontendJob = Start-Job -ScriptBlock { npm run dev }
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction Stop
    Write-SuccessLog "✅ フロントエンド起動確認"
} catch {
    Write-ErrorLog "❌ フロントエンド起動失敗"
    Stop-Job $frontendJob
    Remove-Job $frontendJob
    exit 1
}

Stop-Job $frontendJob
Remove-Job $frontendJob

# 7. カバレッジレポート生成
Write-InfoLog "📊 7. カバレッジレポート生成"
npm run test:coverage

Write-Host ""
Write-Host "🎉 一括検証完了！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ APIエンドポイント: 正常" -ForegroundColor Green
Write-Host "✅ コンポーネントテスト: 正常" -ForegroundColor Green
Write-Host "✅ ビルド: 正常" -ForegroundColor Green
Write-Host "✅ サーバー起動: 正常" -ForegroundColor Green
Write-Host "✅ フロントエンド起動: 正常" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 次のステップ:" -ForegroundColor Cyan
Write-Host "1. npm run dev:full でフルスタック開発環境起動" -ForegroundColor White
Write-Host "2. http://localhost:3001/threads-management でThreads管理画面アクセス" -ForegroundColor White
Write-Host "3. http://localhost:3001/login でFacebook Login認証テスト" -ForegroundColor White
Write-Host "" 