#!/bin/bash

echo "🔨 Instagram Marketing App ビルドテスト開始"

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# TypeScriptコンパイルチェック
echo "🔍 TypeScriptコンパイルチェック中..."
npm run build

# ビルド結果の確認
if [ -d "dist" ]; then
    echo "✅ ビルド成功: dist/ディレクトリが作成されました"
    echo "📁 ビルド内容:"
    ls -la dist/
    
    # index.htmlの存在確認
    if [ -f "dist/index.html" ]; then
        echo "✅ index.htmlが正常に生成されました"
    else
        echo "❌ index.htmlが見つかりません"
        exit 1
    fi
    
    # 静的ファイルの確認
    echo "📊 静的ファイル統計:"
    find dist/ -type f | wc -l
    echo "個のファイルが生成されました"
    
else
    echo "❌ ビルド失敗: dist/ディレクトリが作成されませんでした"
    exit 1
fi

echo "🎉 ビルドテスト完了！"
echo "🚀 デプロイ準備完了です" 