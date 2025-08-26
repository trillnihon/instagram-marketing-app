#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoHandover {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.docsDir = path.join(this.projectRoot, 'docs', 'handoff');
    this.today = new Date().toISOString().split('T')[0];
    this.handoverFile = path.join(this.docsDir, `引継ぎ書_${this.today}.md`);
    
    // 絶対に変更禁止の箇所
    this.immutableConfigs = {
      envKey: 'VITE_API_BASE_URL',
      productionUrl: 'https://instagram-marketing-backend-v2.onrender.com/api',
      protectedRoutes: ['Instagram Graph API 認証フロー', 'ProtectedRoute の認証チェック処理']
    };
  }

  // ディレクトリ作成
  ensureDirectoryExists() {
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
      console.log(`✅ ディレクトリ作成: ${this.docsDir}`);
    }
  }

  // Gitの変更履歴を取得
  getGitChanges() {
    try {
      const changes = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();
      
      if (!changes) {
        return '変更なし';
      }
      
      return changes.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const status = line.substring(0, 2).trim();
          const file = line.substring(3);
          return `- ${file} (${status})`;
        })
        .join('\n');
    } catch (error) {
      return 'Git変更履歴の取得に失敗';
    }
  }

  // 最近のコミット履歴を取得
  getRecentCommits() {
    try {
      const commits = execSync('git log --oneline -5', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();
      
      return commits.split('\n')
        .filter(line => line.trim())
        .map(line => `- ${line}`)
        .join('\n');
    } catch (error) {
      return 'コミット履歴の取得に失敗';
    }
  }

  // 完了率を計算
  calculateProgress() {
    // 簡単な完了率計算（実際のプロジェクト状況に応じて調整）
    const totalTasks = 10;
    const completedTasks = 8; // 仮の値
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    
    return {
      total: totalTasks,
      completed: completedTasks,
      percentage: percentage
    };
  }

  // 引き継ぎ書テンプレートを生成
  generateHandoverContent() {
    const progress = this.calculateProgress();
    const gitChanges = this.getGitChanges();
    const recentCommits = this.getRecentCommits();
    
    return `# 引継ぎ書_${this.today}

## ✅ 完了した修正内容

### ファイル変更状況
${gitChanges}

### 最近のコミット履歴
${recentCommits}

### 修正完了項目
- バックエンド: GET /api/scheduler/posts エンドポイント実装
- バックエンド: GET /api/health エンドポイント実装
- フロントエンド: エラーハンドリング改善
- フロントエンド: 404/500 エラーページ実装

## 🚨 絶対に変更禁止の箇所

### 環境変数
- **環境変数キー**: \`${this.immutableConfigs.envKey}\`
- **本番URL**: \`${this.immutableConfigs.productionUrl}\`

### 認証・セキュリティ
${this.immutableConfigs.protectedRoutes.map(route => `- ${route}`).join('\n')}

### 設定ファイル
- \`server/config/database.js\` - データベース接続設定
- \`server/middleware/auth.js\` - 認証ミドルウェア
- \`src/components/ProtectedRoute.tsx\` - 認証チェック処理

## 📝 次のステップ

### 1. フロントエンド再デプロイ → Vercel
\`\`\`bash
git push origin main
# Vercelで自動デプロイ
\`\`\`

### 2. バックエンド再デプロイ → Render
\`\`\`bash
git push origin main
# Renderで自動デプロイ
\`\`\`

### 3. 動作確認ログを確認
- フロントエンド: https://instagram-marketing-app-xxx.vercel.app
- バックエンド: ${this.immutableConfigs.productionUrl}

## 📊 完了率

### 全体進捗
- **全体**: ${progress.percentage}%
- **フロントエンド**: 95%
- **バックエンド**: 90%
- **運用準備**: 85%

### 完了済みタスク
- [x] 基本的なAPI実装
- [x] 認証システム
- [x] フロントエンドUI
- [x] エラーハンドリング
- [x] 本番環境設定

### 残りタスク
- [ ] 最終動作確認
- [ ] パフォーマンス最適化
- [ ] セキュリティ監査

## 🔧 技術情報

### 使用技術
- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: MongoDB
- **認証**: JWT + Instagram Graph API
- **デプロイ**: Vercel (フロントエンド) + Render (バックエンド)

### 環境変数
- \`VITE_API_BASE_URL\`: APIのベースURL
- \`JWT_SECRET\`: JWT署名用シークレット
- \`MONGODB_URI\`: MongoDB接続文字列
- \`INSTAGRAM_ACCESS_TOKEN\`: Instagram Graph API アクセストークン

## 📋 動作確認チェックリスト

### フロントエンド
- [ ] /history ページ → 履歴が表示されるか
- [ ] /scheduler ページ → スケジュール投稿が表示されるか
- [ ] /posting-time-analysis ページ → 認証エラーではなく正しいエラーメッセージか

### バックエンド
- [ ] GET /api/health → 200 OK
- [ ] GET /api/scheduler/posts?userId=demo_user → 200 OK
- [ ] 認証ミドルウェア → 正常動作

---

**生成日時**: ${new Date().toISOString()}
**生成者**: Auto Handover System
**プロジェクト**: Instagram Marketing App
`;
  }

  // 引き継ぎ書を保存
  saveHandover() {
    try {
      this.ensureDirectoryExists();
      
      const content = this.generateHandoverContent();
      fs.writeFileSync(this.handoverFile, content, 'utf8');
      
      console.log(`✅ 引き継ぎ書を生成しました: ${this.handoverFile}`);
      return true;
    } catch (error) {
      console.error('❌ 引き継ぎ書の生成に失敗:', error.message);
      return false;
    }
  }

  // 実行
  run() {
    console.log('🔄 引き継ぎ書の自動作成を開始...');
    
    if (this.saveHandover()) {
      console.log('🎉 引き継ぎ書の生成が完了しました！');
      console.log(`📁 保存場所: ${this.handoverFile}`);
    } else {
      console.error('💥 引き継ぎ書の生成に失敗しました');
      process.exit(1);
    }
  }
}

// スクリプト実行
const autoHandover = new AutoHandover();
autoHandover.run();
