const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Vercel自動デプロイ開始...');

try {
  // 1. ビルド確認
  console.log('📦 フロントエンドビルド中...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ ビルド完了');

  // 2. Vercelデプロイ（非対話式）
  console.log('🌐 Vercelデプロイ中...');
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('✅ Vercelデプロイ完了');

} catch (error) {
  console.error('❌ デプロイエラー:', error.message);
  process.exit(1);
} 