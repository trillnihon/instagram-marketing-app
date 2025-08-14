@echo off
chcp 65001 >nul
echo 🚀 Instagram Marketing App - 本番モード切替・一括実行スクリプト
echo ================================================================

REM 引数チェック
if "%~1"=="" (
    echo ❌ アクセストークンが指定されていません
    echo 使用方法: scripts\production-deploy.bat "EAAxxxx..."
    pause
    exit /b 1
)

set NEW_TOKEN=%~1
echo ℹ️  新しいトークン: %NEW_TOKEN:~0,20%...

REM プロジェクトディレクトリに移動
cd /d "%~dp0.."

REM Node.jsスクリプトを実行
echo 🔄 本番モード切替スクリプトを実行中...
node scripts/production-deploy.js "%NEW_TOKEN%"

REM 実行結果を確認
if %ERRORLEVEL% EQU 0 (
    echo ✅ 本番モード切替が正常に完了しました
) else (
    echo ❌ 本番モード切替でエラーが発生しました
)

pause
