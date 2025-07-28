# マルチステージビルド
FROM node:20-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.cjs ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# フロントエンドをビルド
RUN npm run build

# 本番用イメージ
FROM node:20-alpine AS production

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 本番用依存関係のみをインストール
RUN npm ci --only=production

# サーバーコードをコピー
COPY server/ ./server/

# ビルドされたフロントエンドをコピー
COPY --from=builder /app/dist ./dist

# ログディレクトリを作成
RUN mkdir -p logs

# ポートを公開
EXPOSE 4000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# アプリケーションを起動
CMD ["node", "server/server.js"] 