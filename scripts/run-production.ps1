# ==========================================
# Instagram Marketing App 本番モード起動＆FB長期トークン検証
# ==========================================

param (
    [string]$Token
)

$ServerDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app\server"
$RootDir   = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app"

function Write-Log($msg, $color="White") {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor $color
}

Write-Log "=== Instagram Marketing App 本番起動スクリプト ===" Cyan

# 1) 既存のnodeプロセス停止
Write-Log "既存のNodeプロセスを終了中..." Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# 2) 環境変数設定
Write-Log "環境変数設定: PORT=4000, NODE_ENV=production" Green
$env:PORT="4000"
$env:NODE_ENV="production"
$env:IGNORE_SIGINT="1"

if (-not $Token) {
    $Token = Read-Host "FB長期トークン(EAA...で始まる値)を入力してください"
}
if ($Token) {
    Write-Log "envファイルを更新中..." Green
    (Get-Content "$RootDir\env.production") -replace '^FB_USER_OR_LL_TOKEN=.*', "FB_USER_OR_LL_TOKEN=$Token" | Set-Content "$RootDir\env.production"
    (Get-Content "$RootDir\env.development") -replace '^FB_USER_OR_LL_TOKEN=.*', "FB_USER_OR_LL_TOKEN=$Token" | Set-Content "$RootDir\env.development"
}

# 3) サーバー起動
Write-Log "サーバー起動中..." Cyan
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $ServerDir
Start-Sleep -Seconds 5

# 4) ヘルスチェック
try {
    $resp = Invoke-WebRequest "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -eq 200) {
        Write-Log "ヘルスチェック成功: サーバー稼働中" Green
    } else {
        Write-Log "ヘルスチェック失敗: HTTP $($resp.StatusCode)" Red
    }
} catch {
    Write-Log "ヘルスチェック失敗: サーバー応答なし" Red
}

# 5) Graph API検証
Write-Log "Graph API接続確認中..." Cyan
Push-Location $ServerDir
npm run verify:graph
Pop-Location

Write-Log "=== 実行完了 ===" Cyan
