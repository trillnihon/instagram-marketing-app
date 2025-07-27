# --- Build stage ---
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# --- Run stage ---
FROM node:18
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
ENV NODE_ENV=production
CMD ["node", "dist/index.js"] 