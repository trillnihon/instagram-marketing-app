#!/bin/bash

echo "🚀 Instagram Marketing App 一括検証開始"
echo "========================================"

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

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

# 依存関係のインストール
log_info "📦 依存関係をインストール中..."
npm install
cd server && npm install && cd ..

# 1. APIエンドポイントのテスト
log_info "🔧 1. ExpressサーバーのAPIエンドポイントテスト"
npm run test:api
if [ $? -eq 0 ]; then
    log_success "✅ APIエンドポイントテスト完了"
else
    log_error "❌ APIエンドポイントテスト失敗"
    exit 1
fi

# 2. コンポーネントテスト
log_info "🧩 2. ThreadsPostCreatorコンポーネントテスト"
npm run test:component
if [ $? -eq 0 ]; then
    log_success "✅ コンポーネントテスト完了"
else
    log_error "❌ コンポーネントテスト失敗"
    exit 1
fi

# 3. ビルドテスト
log_info "🏗️ 3. ビルドテスト"
npm run build
if [ $? -eq 0 ]; then
    log_success "✅ ビルドテスト完了"
else
    log_error "❌ ビルドテスト失敗"
    exit 1
fi

# 4. 環境変数確認
log_info "🔍 4. 環境変数確認"
if grep -q "API_TOKEN=your_actual_token_here" env.development; then
    log_success "✅ API_TOKEN設定確認済み"
else
    log_warning "⚠️ API_TOKEN設定を確認してください"
fi

# 5. サーバー起動テスト（バックグラウンド）
log_info "🖥️ 5. バックエンドサーバー起動テスト"
cd server
timeout 10s npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# サーバーが起動しているかチェック
if curl -s http://localhost:4000/api/diagnostics > /dev/null 2>&1; then
    log_success "✅ バックエンドサーバー起動確認"
    kill $SERVER_PID 2>/dev/null
else
    log_error "❌ バックエンドサーバー起動失敗"
    kill $SERVER_PID 2>/dev/null
    cd ..
    exit 1
fi
cd ..

# 6. フロントエンド起動テスト
log_info "🌐 6. フロントエンド起動テスト"
timeout 10s npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
sleep 3

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    log_success "✅ フロントエンド起動確認"
    kill $FRONTEND_PID 2>/dev/null
else
    log_error "❌ フロントエンド起動失敗"
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

# 7. カバレッジレポート生成
log_info "📊 7. カバレッジレポート生成"
npm run test:coverage

echo ""
echo "🎉 一括検証完了！"
echo "========================================"
echo "✅ APIエンドポイント: 正常"
echo "✅ コンポーネントテスト: 正常"
echo "✅ ビルド: 正常"
echo "✅ サーバー起動: 正常"
echo "✅ フロントエンド起動: 正常"
echo ""
echo "🚀 次のステップ:"
echo "1. npm run dev:full でフルスタック開発環境起動"
echo "2. http://localhost:3001/threads-management でThreads管理画面アクセス"
echo "3. http://localhost:3001/login でFacebook Login認証テスト"
echo "" 