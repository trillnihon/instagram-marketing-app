#!/usr/bin/env pwsh

# Instagram Marketing App 本番モード起動＆FB長期トークン設定・検証
# PowerShellスクリプト

# 色付きログ関数
function Write-SuccessLog {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-InfoLog {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Blue
}

function Write-WarningLog {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-StepLog {
    param([string]$Message)
    Write-Host "🔍 $Message" -ForegroundColor Cyan
}

function Write-ProcessLog {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor Magenta
}

function Write-ServerLog {
    param([string]$Message)
    Write-Host "📡 $Message" -ForegroundColor Cyan
}

function Write-HealthLog {
    param([string]$Message)
    Write-Host "💚 $Message" -ForegroundColor Green
}

function Write-VerifyLog {
    param([string]$Message)
    Write-Host "🔍 $Message" -ForegroundColor Yellow
}

# メイン処理
try {
    Write-Host "🚀 Instagram Marketing App - 本番モード起動＆FB長期トークン設定・検証" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host "=" * 80 -ForegroundColor Gray
    
    # 変数設定
    $ServerDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app\server"
    $RootDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app"
    
    Write-InfoLog "設定ディレクトリ: $ServerDir"
    Write-InfoLog "ルートディレクトリ: $RootDir"
    
    # ステップ1: 既存のnodeプロセスを終了
    Write-StepLog "ステップ1: 既存のnodeプロセスを終了"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-InfoLog "既存のNode.jsプロセスを終了中..."
        $nodeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-SuccessLog "既存のNode.jsプロセスを終了しました"
    } else {
        Write-InfoLog "既存のNode.jsプロセスはありません"
    }
    
    # ステップ2: サーバーディレクトリに移動
    Write-StepLog "ステップ2: サーバーディレクトリに移動"
    if (Test-Path $ServerDir) {
        Set-Location $ServerDir
        Write-SuccessLog "サーバーディレクトリに移動しました: $ServerDir"
    } else {
        throw "サーバーディレクトリが存在しません: $ServerDir"
    }
    
    # ステップ3: 環境変数を設定
    Write-StepLog "ステップ3: 環境変数を設定"
    $env:PORT = "4000"
    $env:IGNORE_SIGINT = "1"
    $env:NODE_ENV = "production"
    Write-SuccessLog "環境変数を設定しました: PORT=$env:PORT, IGNORE_SIGINT=$env:IGNORE_SIGINT, NODE_ENV=$env:NODE_ENV"
    
    # ステップ4: npm startでサーバー起動
    Write-StepLog "ステップ4: npm startでサーバー起動"
    Write-ProcessLog "サーバーを起動中..."
    
    # バックグラウンドでサーバーを起動
    $serverJob = Start-Job -ScriptBlock {
        param($ServerDir, $Port, $IgnoreSigint, $NodeEnv)
        Set-Location $ServerDir
        $env:PORT = $Port
        $env:IGNORE_SIGINT = $IgnoreSigint
        $env:NODE_ENV = $NodeEnv
        npm start
    } -ArgumentList $ServerDir, $env:PORT, $env:IGNORE_SIGINT, $env:NODE_ENV
    
    Write-SuccessLog "サーバー起動ジョブを開始しました"
    
    # ステップ5: /healthエンドポイントがHTTP 200を返すまで待機
    Write-StepLog "ステップ5: /healthエンドポイントの確認"
    Write-HealthLog "ヘルスチェックエンドポイントを確認中: http://localhost:4000/health"
    
    $healthOk = $false
    for ($i = 1; $i -le 10; $i++) {
        try {
            Write-ProcessLog "ヘルスチェック試行 $i/10..."
            $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-SuccessLog "ヘルスチェック成功: HTTP $($response.StatusCode)"
                Write-HealthLog "レスポンス: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))"
                $healthOk = $true
                break
            } else {
                Write-WarningLog "ヘルスチェック失敗: HTTP $($response.StatusCode)"
            }
        } catch {
            Write-WarningLog "ヘルスチェック接続エラー (試行 $i/10): $($_.Exception.Message)"
        }
        
        if ($i -lt 10) {
            Write-InfoLog "$(2 * $i)秒後にリトライします..."
            Start-Sleep -Seconds (2 * $i)
        }
    }
    
    if (-not $healthOk) {
        throw "ヘルスチェックが10回の試行後も失敗しました"
    }
    
    Write-SuccessLog "✅ backend: http://localhost:4000/health OK"
    
    # ステップ6: ルートディレクトリに戻る
    Write-StepLog "ステップ6: ルートディレクトリに戻る"
    Set-Location $RootDir
    Write-SuccessLog "ルートディレクトリに戻りました: $RootDir"
    
    # ステップ7: scripts/setup-fb-token.jsを実行
    Write-StepLog "ステップ7: FB長期トークン設定スクリプトを実行"
    Write-ProcessLog "setup-fb-token.jsを実行中..."
    
    if (Test-Path "scripts\setup-fb-token.js") {
        Write-InfoLog "FB長期トークン設定スクリプトを実行します..."
        Write-InfoLog "対話形式で新しいFB長期トークンを入力してください"
        
        # 対話形式でスクリプトを実行
        node .\scripts\setup-fb-token.js
        
        Write-SuccessLog "FB長期トークン設定スクリプトが完了しました"
    } else {
        throw "setup-fb-token.jsファイルが見つかりません: scripts\setup-fb-token.js"
    }
    
    # ステップ8: npm run verify:graphを実行
    Write-StepLog "ステップ8: Graph API検証を実行"
    Write-VerifyLog "npm run verify:graphを実行中..."
    
    try {
        $verifyResult = npm run verify:graph
        Write-SuccessLog "Graph API検証が完了しました"
        Write-InfoLog "検証結果: $verifyResult"
    } catch {
        Write-WarningLog "Graph API検証でエラーが発生しました: $($_.Exception.Message)"
    }
    
    # ステップ9: フロントエンド起動
    Write-StepLog "ステップ9: フロントエンド起動"
    Write-ProcessLog "フロントエンドを起動中..."
    
    # バックグラウンドでフロントエンドを起動
    $frontendJob = Start-Job -ScriptBlock {
        param($RootDir)
        Set-Location $RootDir
        npm run dev
    } -ArgumentList $RootDir
    
    Write-SuccessLog "フロントエンド起動ジョブを開始しました"
    
    # ステップ10: フロントエンドの起動確認
    Write-StepLog "ステップ10: フロントエンドの起動確認"
    Write-InfoLog "フロントエンドの起動を確認中: http://localhost:3001"
    
    $frontendOk = $false
    for ($i = 1; $i -le 15; $i++) {
        try {
            Write-ProcessLog "フロントエンド確認試行 $i/15..."
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($response.StatusCode -in @(200, 304)) {
                Write-SuccessLog "フロントエンド確認成功: HTTP $($response.StatusCode)"
                $frontendOk = $true
                break
            } else {
                Write-WarningLog "フロントエンド確認失敗: HTTP $($response.StatusCode)"
            }
        } catch {
            Write-WarningLog "フロントエンド確認接続エラー (試行 $i/15): $($_.Exception.Message)"
        }
        
        if ($i -lt 15) {
            Write-InfoLog "$(1 * $i)秒後にリトライします..."
            Start-Sleep -Seconds (1 * $i)
        }
    }
    
    if (-not $frontendOk) {
        Write-WarningLog "フロントエンドの起動確認が15回の試行後も失敗しました"
    } else {
        Write-SuccessLog "✅ frontend: http://localhost:3001 OK"
    }
    
    # 成功時の案内
    Write-Host ""
    Write-Host "🎉 Instagram Marketing App 本番モード起動が完了しました！" -ForegroundColor Green -BackgroundColor Black
    Write-Host "=" * 80 -ForegroundColor Gray
    Write-Host "✅ バックエンド: http://localhost:4000/health OK" -ForegroundColor Green
    Write-Host "✅ フロントエンド: http://localhost:3001 OK" -ForegroundColor Green
    Write-Host "✅ FB長期トークン設定・検証完了" -ForegroundColor Green
    Write-Host "=" * 80 -ForegroundColor Gray
    Write-Host "📱 次のステップ:" -ForegroundColor Cyan
    Write-Host "1. ブラウザで http://localhost:3001/login を開く" -ForegroundColor Yellow
    Write-Host "2. 'Facebook Login for Business'でログイン" -ForegroundColor Yellow
    Write-Host "3. 必要な権限を承認" -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Gray
    
    # ブラウザで自動オープン
    Write-ProcessLog "ブラウザでログインページを自動オープン中..."
    try {
        Start-Process "http://localhost:3001/login"
        Write-SuccessLog "ブラウザでログインページを開きました"
    } catch {
        Write-WarningLog "ブラウザの自動オープンに失敗しました: $($_.Exception.Message)"
        Write-InfoLog "手動で http://localhost:3001/login を開いてください"
    }
    
} catch {
    Write-ErrorLog "スクリプト実行中にエラーが発生しました: $($_.Exception.Message)"
    Write-ErrorLog "スタックトレース: $($_.ScriptStackTrace)"
    exit 1
} finally {
    # クリーンアップ
    Write-InfoLog "クリーンアップ処理中..."
    
    # ジョブの状況確認
    if ($serverJob) {
        $serverJobState = Get-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
        if ($serverJobState) {
            Write-InfoLog "サーバージョブ状態: $($serverJobState.State)"
        }
    }
    
    if ($frontendJob) {
        $frontendJobState = Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
        if ($frontendJobState) {
            Write-InfoLog "フロントエンドジョブ状態: $($frontendJobState.State)"
        }
    }
    
    Write-SuccessLog "スクリプトが完了しました"
}
