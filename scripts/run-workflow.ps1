# PowerShell用 完全自動ワークフロー実行スクリプト
# 使用方法: .\scripts\run-workflow.ps1

param(
    [switch]$HandoverOnly,
    [switch]$DeployOnly,
    [switch]$VerifyOnly,
    [switch]$FullWorkflow
)

# スクリプトの実行ポリシーを確認
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "⚠️  実行ポリシーが制限されています。以下のコマンドで変更してください:" -ForegroundColor Yellow
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
    exit 1
}

# プロジェクトルートディレクトリに移動
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "🚀 Instagram Marketing App 自動ワークフロー" -ForegroundColor Green
Write-Host "📁 プロジェクトディレクトリ: $projectRoot" -ForegroundColor Cyan

# Node.jsの確認
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js バージョン: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js が見つかりません。インストールしてください。" -ForegroundColor Red
    exit 1
}

# Gitの確認
try {
    $gitVersion = git --version
    Write-Host "✅ Git バージョン: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git が見つかりません。インストールしてください。" -ForegroundColor Red
    exit 1
}

# 依存関係の確認
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 依存関係をインストール中..." -ForegroundColor Yellow
    npm install
}

# 実行オプションの処理
if ($HandoverOnly) {
    Write-Host "📋 引き継ぎ書の自動作成のみを実行します..." -ForegroundColor Cyan
    npm run handover
} elseif ($DeployOnly) {
    Write-Host "🚀 自動デプロイのみを実行します..." -ForegroundColor Cyan
    npm run deploy
} elseif ($VerifyOnly) {
    Write-Host "🧪 動作確認ログの生成のみを実行します..." -ForegroundColor Cyan
    npm run verify:deploy
} elseif ($FullWorkflow) {
    Write-Host "🔄 完全自動ワークフローを実行します..." -ForegroundColor Cyan
    npm run workflow
} else {
    # デフォルト: メニュー表示
    Show-Menu
}

function Show-Menu {
    Clear-Host
    Write-Host "📋 実行するタスクを選択してください:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. 📋 引き継ぎ書の自動作成" -ForegroundColor Cyan
    Write-Host "2. 🚀 自動デプロイ" -ForegroundColor Cyan
    Write-Host "3. 🧪 動作確認ログの生成" -ForegroundColor Cyan
    Write-Host "4. 🔄 完全自動ワークフロー（推奨）" -ForegroundColor Green
    Write-Host "5. ❌ 終了" -ForegroundColor Red
    Write-Host ""
    
    $choice = Read-Host "選択肢を入力してください (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host "📋 引き継ぎ書の自動作成を開始します..." -ForegroundColor Cyan
            npm run handover
        }
        "2" {
            Write-Host "🚀 自動デプロイを開始します..." -ForegroundColor Cyan
            npm run deploy
        }
        "3" {
            Write-Host "🧪 動作確認ログの生成を開始します..." -ForegroundColor Cyan
            npm run verify:deploy
        }
        "4" {
            Write-Host "🔄 完全自動ワークフローを開始します..." -ForegroundColor Green
            npm run workflow
        }
        "5" {
            Write-Host "👋 終了します。" -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "❌ 無効な選択肢です。" -ForegroundColor Red
            Start-Sleep -Seconds 2
            Show-Menu
        }
    }
}

# 実行完了後の処理
Write-Host ""
Write-Host "🎉 スクリプトの実行が完了しました！" -ForegroundColor Green
Write-Host "📋 引き継ぎ書は docs/handoff/ フォルダに保存されています。" -ForegroundColor Cyan
Write-Host "🔧 問題が発生した場合は、手動で確認してください。" -ForegroundColor Yellow

# Enterキーを待機
Read-Host "Enterキーを押して終了"
