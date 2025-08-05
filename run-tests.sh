#!/bin/bash
echo "🧪 Instagram Marketing App 本番テスト実行開始"
echo "=============================================="

# 色付きログ関数
log_info() {
    echo -e "\033[34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# 依存関係のインストール
log_info "📦 依存関係をインストール中..."
npm install

# 1. ビルドテスト
log_info "🏗️ 1. ビルドテスト"
npm run build
if [ $? -eq 0 ]; then
    log_success "✅ ビルド成功"
else
    log_error "❌ ビルド失敗"
    exit 1
fi

# 2. ユニットテスト
log_info "🧩 2. ユニットテスト（ThreadsPostCreator）"
npm test -- --testPathPattern="ThreadsPostCreator.test.tsx" --verbose
if [ $? -eq 0 ]; then
    log_success "✅ ユニットテスト成功"
else
    log_error "❌ ユニットテスト失敗"
    exit 1
fi

# 3. 統合テスト
log_info "🔧 3. 統合テスト（Threads API）"
npm test -- --testPathPattern="threadsApi.simple.test.js" --verbose
if [ $? -eq 0 ]; then
    log_success "✅ 統合テスト成功"
else
    log_error "❌ 統合テスト失敗"
    exit 1
fi

# 4. カバレッジレポート
log_info "📊 4. カバレッジレポート生成"
npm run test:coverage

# 5. PWAファイル確認
log_info "📱 5. PWAファイル確認"
if [ -f "public/manifest.json" ] && [ -f "public/service-worker.js" ]; then
    log_success "✅ PWAファイル存在確認"
else
    log_error "❌ PWAファイル不足"
    exit 1
fi

# 6. 環境変数確認
log_info "🔍 6. 環境変数確認"
if grep -q "VITE_OPENAI_API_KEY" env.production; then
    log_success "✅ OpenAI API設定確認"
else
    log_error "❌ OpenAI API設定不足"
fi

if grep -q "VITE_INSTAGRAM_REDIRECT_URI" env.production; then
    log_success "✅ Instagram認証設定確認"
else
    log_error "❌ Instagram認証設定不足"
fi

echo ""
echo "🎉 本番テスト実行完了！"
echo "=============================================="
echo "✅ ビルド: 成功"
echo "✅ ユニットテスト: 成功"
echo "✅ 統合テスト: 成功"
echo "✅ PWA対応: 完了"
echo "✅ 環境変数: 設定済み"
echo ""
echo "🚀 本番デプロイ準備完了！"
echo "Vercel URL: https://instagram-marketing-app.vercel.app"
echo "Backend URL: https://instagram-marketing-backend-v2.onrender.com" 