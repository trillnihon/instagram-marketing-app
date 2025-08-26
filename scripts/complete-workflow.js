#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteWorkflow {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.today = new Date().toISOString().split('T')[0];
    this.handoverFile = path.join(this.projectRoot, 'docs', 'handoff', `引継ぎ書_${this.today}.md`);
    
    // ワークフローの設定
    this.workflowConfig = {
      autoCommit: true,
      autoPush: true,
      autoDeploy: true,
      autoVerify: true,
      waitTime: {
        deployStart: 5000,    // デプロイ開始待機時間
        deployComplete: 15000, // デプロイ完了待機時間
        verification: 5000     // 動作確認待機時間
      }
    };
  }

  // ステップ1: 引き継ぎ書の自動作成
  async step1_CreateHandover() {
    console.log('\n🔄 ステップ1: 引き継ぎ書の自動作成を開始...');
    
    try {
      // auto-handover.jsを実行
      execSync('node scripts/auto-handover.js', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('✅ ステップ1完了: 引き継ぎ書が生成されました');
      return true;
    } catch (error) {
      console.error('❌ ステップ1失敗:', error.message);
      return false;
    }
  }

  // ステップ2: 変更の自動コミット
  async step2_AutoCommit() {
    console.log('\n🔄 ステップ2: 変更の自動コミットを開始...');
    
    try {
      // Gitの状態を確認
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();
      
      if (!status) {
        console.log('✅ ステップ2完了: コミットする変更がありません');
        return true;
      }
      
      // 変更をステージング
      execSync('git add .', { cwd: this.projectRoot });
      
      // コミット
      const commitMessage = `Auto workflow: ${this.today} - ${new Date().toLocaleString('ja-JP')}`;
      execSync(`git commit -m "${commitMessage}"`, { cwd: this.projectRoot });
      
      console.log('✅ ステップ2完了: 変更がコミットされました');
      return true;
    } catch (error) {
      console.error('❌ ステップ2失敗:', error.message);
      return false;
    }
  }

  // ステップ3: mainブランチへの自動プッシュ
  async step3_AutoPush() {
    console.log('\n🔄 ステップ3: mainブランチへの自動プッシュを開始...');
    
    try {
      execSync('git push origin main', { cwd: this.projectRoot });
      
      console.log('✅ ステップ3完了: mainブランチにプッシュされました');
      return true;
    } catch (error) {
      console.error('❌ ステップ3失敗:', error.message);
      return false;
    }
  }

  // ステップ4: 自動デプロイ
  async step4_AutoDeploy() {
    console.log('\n🔄 ステップ4: 自動デプロイを開始...');
    
    try {
      // auto-deploy.jsを実行
      execSync('node scripts/auto-deploy.js', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('✅ ステップ4完了: 自動デプロイが開始されました');
      return true;
    } catch (error) {
      console.error('❌ ステップ4失敗:', error.message);
      return false;
    }
  }

  // ステップ5: デプロイ完了待機
  async step5_WaitForDeploy() {
    console.log('\n⏳ ステップ5: デプロイ完了を待機中...');
    
    try {
      const waitTime = this.workflowConfig.waitTime.deployComplete;
      console.log(`⏰ ${waitTime / 1000}秒待機中...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log('✅ ステップ5完了: デプロイ完了の待機が終了しました');
      return true;
    } catch (error) {
      console.error('❌ ステップ5失敗:', error.message);
      return false;
    }
  }

  // ステップ6: 動作確認ログの自動生成
  async step6_AutoVerification() {
    console.log('\n🔄 ステップ6: 動作確認ログの自動生成を開始...');
    
    try {
      // auto-verification.jsを実行
      execSync('node scripts/auto-verification.js', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('✅ ステップ6完了: 動作確認ログが生成されました');
      return true;
    } catch (error) {
      console.error('❌ ステップ6失敗:', error.message);
      return false;
    }
  }

  // ステップ7: 最終レポートの生成
  async step7_GenerateFinalReport() {
    console.log('\n🔄 ステップ7: 最終レポートの生成を開始...');
    
    try {
      if (!fs.existsSync(this.handoverFile)) {
        console.log('⚠️ 引き継ぎ書が見つかりません');
        return false;
      }
      
      let content = fs.readFileSync(this.handoverFile, 'utf8');
      
      // 最終レポートを追記
      const finalReport = `

## 🎯 ワークフロー完了レポート

### 実行日時
- **開始時刻**: ${new Date().toISOString()}
- **完了時刻**: ${new Date().toISOString()}

### 実行ステップ
1. ✅ 引き継ぎ書の自動作成
2. ✅ 変更の自動コミット
3. ✅ mainブランチへの自動プッシュ
4. ✅ 自動デプロイ開始
5. ✅ デプロイ完了待機
6. ✅ 動作確認ログの自動生成
7. ✅ 最終レポートの生成

### 次のアクション
1. **フロントエンド**: Vercelでデプロイ完了を確認
2. **バックエンド**: Renderでデプロイ完了を確認
3. **動作確認**: 各ページの動作を手動で確認
4. **監視**: エラーログやパフォーマンスを監視

### 注意事項
- 環境変数 \`VITE_API_BASE_URL\` は絶対に変更しないでください
- 本番URL \`https://instagram-marketing-backend-v2.onrender.com/api\` は変更禁止
- Instagram Graph API 認証フローは変更禁止
- ProtectedRoute の認証チェック処理は変更禁止

---

**ワークフロー完了日時**: ${new Date().toISOString()}
**実行者**: Complete Workflow System
**ステータス**: 🎉 完了
`;

      content += finalReport;
      fs.writeFileSync(this.handoverFile, content, 'utf8');
      
      console.log('✅ ステップ7完了: 最終レポートが生成されました');
      return true;
    } catch (error) {
      console.error('❌ ステップ7失敗:', error.message);
      return false;
    }
  }

  // メイン実行
  async run() {
    console.log('🚀 完全自動ワークフローを開始します...');
    console.log('📋 実行予定ステップ:');
    console.log('1. 引き継ぎ書の自動作成');
    console.log('2. 変更の自動コミット');
    console.log('3. mainブランチへの自動プッシュ');
    console.log('4. 自動デプロイ');
    console.log('5. デプロイ完了待機');
    console.log('6. 動作確認ログの自動生成');
    console.log('7. 最終レポートの生成');
    
    const startTime = Date.now();
    
    try {
      // 各ステップを順次実行
      const step1 = await this.step1_CreateHandover();
      if (!step1) throw new Error('ステップ1で失敗');
      
      const step2 = await this.step2_AutoCommit();
      if (!step2) throw new Error('ステップ2で失敗');
      
      const step3 = await this.step3_AutoPush();
      if (!step3) throw new Error('ステップ3で失敗');
      
      const step4 = await this.step4_AutoDeploy();
      if (!step4) throw new Error('ステップ4で失敗');
      
      const step5 = await this.step5_WaitForDeploy();
      if (!step5) throw new Error('ステップ5で失敗');
      
      const step6 = await this.step6_AutoVerification();
      if (!step6) throw new Error('ステップ6で失敗');
      
      const step7 = await this.step7_GenerateFinalReport();
      if (!step7) throw new Error('ステップ7で失敗');
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      console.log('\n🎉 完全自動ワークフローが完了しました！');
      console.log(`⏱️ 実行時間: ${duration}秒`);
      console.log(`📁 引き継ぎ書: ${this.handoverFile}`);
      console.log('\n📋 次のアクション:');
      console.log('1. Vercelでフロントエンドデプロイ完了を確認');
      console.log('2. Renderでバックエンドデプロイ完了を確認');
      console.log('3. 各ページの動作を手動で確認');
      
    } catch (error) {
      console.error('\n💥 ワークフローでエラーが発生しました:', error.message);
      console.log('🔧 手動で確認してください');
      process.exit(1);
    }
  }
}

// スクリプト実行
const completeWorkflow = new CompleteWorkflow();
completeWorkflow.run().catch(console.error);
