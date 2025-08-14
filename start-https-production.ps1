#!/usr/bin/env pwsh

# Instagram Marketing App - HTTPS対応本番モード起動＆FB長期トークン設定・検証
# 改善版PowerShellスクリプト

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

function Write-HttpsLog {
    param([string]$Message)
    Write-Host "🔒 $Message" -ForegroundColor DarkGreen
}

# 設定可能なパラメータ
$Config = @{
    ServerDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app\server"
    RootDir = "C:\Users\yukis\OneDrive\make_code\ebay_projects\instagram-marketing-app"
    Port = "4000"
    MaxHealthCheckAttempts = 15
    HealthCheckInterval = 3
    MaxFrontendAttempts = 20
    FrontendCheckInterval = 2
    UseHttps = $true
    EnableTokenInput = $true
}

# メイン処理
try {
    Write-Host "🚀 Instagram Marketing App - HTTPS対応本番モード起動＆FB長期トークン設定・検証" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host "=" * 80 -ForegroundColor Gray
    Write-Host "🔒 HTTPS対応: $($Config.UseHttps)" -ForegroundColor DarkGreen
    Write-Host "🔑 トークン入力: $($Config.EnableTokenInput)" -ForegroundColor DarkGreen
    Write-Host "⏱️  ヘルスチェック最大試行回数: $($Config.MaxHealthCheckAttempts)" -ForegroundColor DarkGreen
    Write-Host "=" * 80 -ForegroundColor Gray
    
    Write-InfoLog "設定ディレクトリ: $($Config.ServerDir)"
    Write-InfoLog "ルートディレクトリ: $($Config.RootDir)"
    
    # ステップ1: 既存のnodeプロセスを終了
    Write-StepLog "ステップ1: 既存のnodeプロセスを終了"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-InfoLog "既存のNode.jsプロセスを終了中..."
        $nodeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 3
        Write-SuccessLog "既存のNode.jsプロセスを終了しました"
    } else {
        Write-InfoLog "既存のNode.jsプロセスはありません"
    }
    
    # ステップ2: サーバーディレクトリに移動
    Write-StepLog "ステップ2: サーバーディレクトリに移動"
    if (Test-Path $Config.ServerDir) {
        Set-Location $Config.ServerDir
        Write-SuccessLog "サーバーディレクトリに移動しました: $($Config.ServerDir)"
    } else {
        throw "サーバーディレクトリが存在しません: $($Config.ServerDir)"
    }
    
    # ステップ3: 環境変数を設定
    Write-StepLog "ステップ3: 環境変数を設定"
    $env:PORT = $Config.Port
    $env:IGNORE_SIGINT = "1"
    $env:NODE_ENV = "production"
    Write-SuccessLog "環境変数を設定しました: PORT=$env:PORT, IGNORE_SIGINT=$env:IGNORE_SIGINT, NODE_ENV=$env:NODE_ENV"
    
    # ステップ4: サーバー起動（HTTPS対応）
    Write-StepLog "ステップ4: HTTPS対応サーバー起動"
    Write-ProcessLog "HTTPS対応サーバーを起動中..."
    
    if ($Config.UseHttps) {
        # HTTPSサーバーを起動
        $serverJob = Start-Job -ScriptBlock {
            param($ServerDir, $Port, $IgnoreSigint, $NodeEnv)
            Set-Location $ServerDir
            $env:PORT = $Port
            $env:IGNORE_SIGINT = $IgnoreSigint
            $env:NODE_ENV = $NodeEnv
            node https-server.js
        } -ArgumentList $Config.ServerDir, $env:PORT, $env:IGNORE_SIGINT, $env:NODE_ENV
        
        Write-SuccessLog "HTTPS対応サーバー起動ジョブを開始しました"
        $healthUrl = "https://localhost:$($Config.Port)/health"
    } else {
        # 従来のHTTPサーバーを起動
        $serverJob = Start-Job -ScriptBlock {
            param($ServerDir, $Port, $IgnoreSigint, $NodeEnv)
            Set-Location $ServerDir
            $env:PORT = $Port
            $env:IGNORE_SIGINT = $IgnoreSigint
            $env:NODE_ENV = $NodeEnv
            npm start
        } -ArgumentList $Config.ServerDir, $env:PORT, $env:IGNORE_SIGINT, $env:NODE_ENV
        
        Write-SuccessLog "HTTPサーバー起動ジョブを開始しました"
        $healthUrl = "http://localhost:$($Config.Port)/health"
    }
    
    # ステップ5: ヘルスチェックエンドポイントの確認（柔軟な待機時間）
    Write-StepLog "ステップ5: ヘルスチェックエンドポイントの確認"
    Write-HealthLog "ヘルスチェックエンドポイントを確認中: $healthUrl"
    
    $healthOk = $false
    $totalWaitTime = 0
    
    for ($i = 1; $i -le $Config.MaxHealthCheckAttempts; $i++) {
        try {
            Write-ProcessLog "ヘルスチェック試行 $i/$($Config.MaxHealthCheckAttempts)..."
            
            # HTTPSの場合は証明書警告を無視
            if ($Config.UseHttps) {
                $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5 -SkipCertificateCheck -ErrorAction Stop
            } else {
                $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            }
            
            if ($response.StatusCode -eq 200) {
                Write-SuccessLog "ヘルスチェック成功: HTTP $($response.StatusCode)"
                Write-HealthLog "レスポンス: $($response.Content.Substring(0, [Math]::Min(150, $response.Content.Length)))"
                $healthOk = $true
                break
            } else {
                Write-WarningLog "ヘルスチェック失敗: HTTP $($response.StatusCode)"
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-WarningLog "ヘルスチェック接続エラー (試行 $i/$($Config.MaxHealthCheckAttempts)): $errorMsg"
            
            # エラーの詳細分析
            if ($errorMsg -like "*SSL*" -or $errorMsg -like "*certificate*") {
                Write-InfoLog "SSL証明書関連のエラーです。自己署名証明書の生成を確認してください。"
            } elseif ($errorMsg -like "*timeout*") {
                Write-InfoLog "タイムアウトエラーです。サーバーの起動に時間がかかっている可能性があります。"
            } elseif ($errorMsg -like "*connection refused*") {
                Write-InfoLog "接続拒否エラーです。サーバーがまだ起動していない可能性があります。"
            }
        }
        
        if ($i -lt $Config.MaxHealthCheckAttempts) {
            $waitTime = $Config.HealthCheckInterval * $i
            $totalWaitTime += $waitTime
            Write-InfoLog "$waitTime秒後にリトライします... (累計待機時間: ${totalWaitTime}秒)"
            Start-Sleep -Seconds $waitTime
        }
    }
    
    if (-not $healthOk) {
        $errorDetails = @"
ヘルスチェックが$($Config.MaxHealthCheckAttempts)回の試行後も失敗しました
累計待機時間: ${totalWaitTime}秒
ヘルスチェックURL: $healthUrl

考えられる原因:
1. サーバーの起動に時間がかかっている
2. ポート$($Config.Port)が他のプロセスで使用されている
3. 証明書の生成に失敗している（HTTPSの場合）
4. 環境変数の設定に問題がある

対処方法:
1. サーバーログを確認してください
2. ポート$($Config.Port)の使用状況を確認してください
3. 必要に応じてポート番号を変更してください
"@
        throw $errorDetails
    }
    
    Write-SuccessLog "✅ backend: $healthUrl OK"
    
    # ステップ6: ルートディレクトリに戻る
    Write-StepLog "ステップ6: ルートディレクトリに戻る"
    Set-Location $Config.RootDir
    Write-SuccessLog "ルートディレクトリに戻りました: $($Config.RootDir)"
    
    # ステップ7: FB長期トークンの設定（対話形式または自動）
    Write-StepLog "ステップ7: FB長期トークンの設定"
    
    if ($Config.EnableTokenInput) {
        Write-InfoLog "FB長期トークンの設定方法を選択してください:"
        Write-InfoLog "1. 手動入力"
        Write-InfoLog "2. ファイルから読み込み"
        Write-InfoLog "3. 既存の設定を使用"
        
        $choice = Read-Host "選択してください (1-3)"
        
        switch ($choice) {
            "1" {
                Write-InfoLog "Facebook長期トークンを入力してください:"
                $token = Read-Host "トークン" -AsSecureString
                $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))
                
                if ($plainToken) {
                    Write-InfoLog "トークンを設定中..."
                    try {
                        $tokenResponse = Invoke-RestMethod -Uri "https://localhost:$($Config.Port)/api/set-token" -Method POST -Body (@{token=$plainToken} | ConvertTo-Json) -ContentType "application/json" -SkipCertificateCheck
                        Write-SuccessLog "トークンが設定されました: $($tokenResponse.message)"
                    } catch {
                        Write-WarningLog "API経由でのトークン設定に失敗: $($_.Exception.Message)"
                        Write-InfoLog "手動で環境変数ファイルを更新してください"
                    }
                }
            }
            "2" {
                $tokenFile = Read-Host "トークンファイルのパスを入力してください"
                if (Test-Path $tokenFile) {
                    $token = Get-Content $tokenFile -Raw | Out-String
                    $token = $token.Trim()
                    Write-InfoLog "ファイルからトークンを読み込みました: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."
                    
                    try {
                        $tokenResponse = Invoke-RestMethod -Uri "https://localhost:$($Config.Port)/api/set-token" -Method POST -Body (@{token=$token} | ConvertTo-Json) -ContentType "application/json" -SkipCertificateCheck
                        Write-SuccessLog "トークンが設定されました: $($tokenResponse.message)"
                    } catch {
                        Write-WarningLog "API経由でのトークン設定に失敗: $($_.Exception.Message)"
                        Write-InfoLog "手動で環境変数ファイルを更新してください"
                    }
                } else {
                    Write-WarningLog "指定されたファイルが見つかりません: $tokenFile"
                }
            }
            "3" {
                Write-InfoLog "既存の設定を使用します"
            }
            default {
                Write-WarningLog "無効な選択です。既存の設定を使用します"
            }
        }
    }
    
    # ステップ8: Graph API検証を実行
    Write-StepLog "ステップ8: Graph API検証を実行"
    Write-VerifyLog "Graph API検証を実行中..."
    
    try {
        # まずトークンの検証を実行
        Write-InfoLog "トークンの有効性を確認中..."
        $verifyResponse = Invoke-RestMethod -Uri "https://localhost:$($Config.Port)/api/verify-token" -SkipCertificateCheck
        
        if ($verifyResponse.success) {
            Write-SuccessLog "Graph API検証成功: $($verifyResponse.message)"
            Write-InfoLog "ユーザーID: $($verifyResponse.data.id), 名前: $($verifyResponse.data.name)"
        } else {
            Write-WarningLog "Graph API検証で問題が発生しました"
        }
        
        # npm run verify:graphも実行
        Write-InfoLog "npm run verify:graphを実行中..."
        $verifyResult = npm run verify:graph
        Write-SuccessLog "Graph API検証が完了しました"
        
    } catch {
        $errorMsg = $_.Exception.Message
        Write-WarningLog "Graph API検証でエラーが発生しました: $errorMsg"
        
        # エラーの詳細分析と推奨事項
        if ($errorMsg -like "*400*" -or $errorMsg -like "*Bad Request*") {
            Write-InfoLog "HTTP 400エラーの原因分析:"
            Write-InfoLog "1. トークンが期限切れの可能性があります"
            Write-InfoLog "2. トークンに適切な権限がない可能性があります"
            Write-InfoLog "3. Facebookアプリの設定に問題がある可能性があります"
            Write-InfoLog ""
            Write-InfoLog "推奨事項:"
            Write-InfoLog "1. Facebook Graph API Explorerでトークンをテストしてください"
            Write-InfoLog "2. 新しい長期トークンを取得してください"
            Write-InfoLog "3. アプリの権限設定を確認してください"
        }
    }
    
    # ステップ9: フロントエンド起動
    Write-StepLog "ステップ9: フロントエンド起動"
    Write-ProcessLog "フロントエンドを起動中..."
    
    # バックグラウンドでフロントエンドを起動
    $frontendJob = Start-Job -ScriptBlock {
        param($RootDir)
        Set-Location $RootDir
        npm run dev
    } -ArgumentList $Config.RootDir
    
    Write-SuccessLog "フロントエンド起動ジョブを開始しました"
    
    # ステップ10: フロントエンドの起動確認（柔軟な待機時間）
    Write-StepLog "ステップ10: フロントエンドの起動確認"
    Write-InfoLog "フロントエンドの起動を確認中: http://localhost:3001"
    
    $frontendOk = $false
    $totalFrontendWaitTime = 0
    
    for ($i = 1; $i -le $Config.MaxFrontendAttempts; $i++) {
        try {
            Write-ProcessLog "フロントエンド確認試行 $i/$($Config.MaxFrontendAttempts)..."
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -in @(200, 304)) {
                Write-SuccessLog "フロントエンド確認成功: HTTP $($response.StatusCode)"
                $frontendOk = $true
                break
            } else {
                Write-WarningLog "フロントエンド確認失敗: HTTP $($response.StatusCode)"
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-WarningLog "フロントエンド確認接続エラー (試行 $i/$($Config.MaxFrontendAttempts)): $errorMsg"
        }
        
        if ($i -lt $Config.MaxFrontendAttempts) {
            $waitTime = $Config.FrontendCheckInterval * $i
            $totalFrontendWaitTime += $waitTime
            Write-InfoLog "$waitTime秒後にリトライします... (累計待機時間: ${totalFrontendWaitTime}秒)"
            Start-Sleep -Seconds $waitTime
        }
    }
    
    if (-not $frontendOk) {
        Write-WarningLog "フロントエンドの起動確認が$($Config.MaxFrontendAttempts)回の試行後も失敗しました"
        Write-WarningLog "累計待機時間: ${totalFrontendWaitTime}秒"
    } else {
        Write-SuccessLog "✅ frontend: http://localhost:3001 OK"
    }
    
    # 成功時の案内
    Write-Host ""
    Write-Host "🎉 Instagram Marketing App HTTPS対応本番モード起動が完了しました！" -ForegroundColor Green -BackgroundColor Black
    Write-Host "=" * 80 -ForegroundColor Gray
    Write-Host "✅ バックエンド: $healthUrl OK" -ForegroundColor Green
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
    
    # エラー時の詳細情報と対処法
    Write-Host ""
    Write-Host "🔧 トラブルシューティング情報:" -ForegroundColor Yellow
    Write-Host "1. サーバーログを確認してください" -ForegroundColor White
    Write-Host "2. ポート$($Config.Port)の使用状況を確認してください" -ForegroundColor White
    Write-Host "3. 環境変数ファイルの設定を確認してください" -ForegroundColor White
    Write-Host "4. 必要に応じてスクリプトの設定を調整してください" -ForegroundColor White
    
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
