#!/usr/bin/env pwsh

<#
.SYNOPSIS
Instagram Marketing App - 本番モード切替・一括実行スクリプト

.DESCRIPTION
本番モードへの切替と一括実行を行うスクリプトです。

.PARAMETER Token
Facebookアクセストークン（EAAxxxx...形式）

.EXAMPLE
.\scripts\production-deploy.ps1 -Token "EAAxxxx..."

.NOTES
このスクリプトは以下の処理を実行します：
1. env.developmentを元にenv.productionを更新
2. FB_USER_OR_LL_TOKENを新しいトークンで更新
3. scripts/refreshAndVerify.jsを使ってサーバー起動
4. /health確認
5. verify:graph実行
6. ブラウザ自動起動
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

# エラー時に停止
$ErrorActionPreference = "Stop"

# プロジェクトディレクトリに移動
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host "🚀 Instagram Marketing App - 本番モード切替・一括実行スクリプト" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Gray
Write-Host "ℹ️  新しいトークン: $($Token.Substring(0, [Math]::Min(20, $Token.Length)))..." -ForegroundColor Blue

try {
    # Node.jsスクリプトを実行
    Write-Host "🔄 本番モード切替スクリプトを実行中..." -ForegroundColor Magenta
    
    $env:FB_USER_OR_LL_TOKEN = $Token
    $result = & node scripts/production-deploy.js $Token
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 本番モード切替が正常に完了しました" -ForegroundColor Green
    } else {
        Write-Host "❌ 本番モード切替でエラーが発生しました" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ スクリプト実行中にエラーが発生しました: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 すべての処理が完了しました！" -ForegroundColor Green
