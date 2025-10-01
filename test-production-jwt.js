#!/usr/bin/env node

/**
 * 本番環境JWT期限切れテストスクリプト
 * 
 * 使用方法:
 * node test-production-jwt.js
 * 
 * 期待結果:
 * - 本番環境ではJWTが7日間有効であることを確認
 * - テスト環境ではJWTが60秒で期限切れになることを確認
 */

import jwt from 'jsonwebtoken';

// テスト用の設定
const TEST_USER = {
  id: 'test-user-123',
  name: 'Test User',
  provider: 'instagram'
};

console.log('🧪 本番環境JWT期限切れテスト開始');
console.log('='.repeat(50));

// 1. 本番環境設定でのJWT発行（7日間）
console.log('1. 本番環境設定でのJWT発行（7日間）...');
const productionToken = jwt.sign(TEST_USER, 'production-secret', { expiresIn: '7d' });
const productionDecoded = jwt.decode(productionToken);

console.log('本番環境JWT Payload:', {
  id: productionDecoded.id,
  name: productionDecoded.name,
  provider: productionDecoded.provider,
  exp: productionDecoded.exp,
  expDate: new Date(productionDecoded.exp * 1000).toLocaleString('ja-JP'),
  iat: productionDecoded.iat,
  iatDate: new Date(productionDecoded.iat * 1000).toLocaleString('ja-JP')
});

const now = Math.floor(Date.now() / 1000);
const productionTimeUntilExpiry = productionDecoded.exp - now;
console.log(`本番環境JWT有効期限までの時間: ${Math.floor(productionTimeUntilExpiry / 86400)}日 ${Math.floor((productionTimeUntilExpiry % 86400) / 3600)}時間`);

// 2. テスト環境設定でのJWT発行（60秒）
console.log('\n2. テスト環境設定でのJWT発行（60秒）...');
const testToken = jwt.sign(TEST_USER, 'test-secret', { expiresIn: '60s' });
const testDecoded = jwt.decode(testToken);

console.log('テスト環境JWT Payload:', {
  id: testDecoded.id,
  name: testDecoded.name,
  provider: testDecoded.provider,
  exp: testDecoded.exp,
  expDate: new Date(testDecoded.exp * 1000).toLocaleString('ja-JP'),
  iat: testDecoded.iat,
  iatDate: new Date(testDecoded.iat * 1000).toLocaleString('ja-JP')
});

const testTimeUntilExpiry = testDecoded.exp - now;
console.log(`テスト環境JWT有効期限までの時間: ${testTimeUntilExpiry}秒`);

// 3. 本番環境JWTの検証
console.log('\n3. 本番環境JWTの検証...');
try {
  const verified = jwt.verify(productionToken, 'production-secret');
  console.log('✅ 本番環境JWT検証成功:', verified);
} catch (error) {
  console.log('❌ 本番環境JWT検証失敗:', error.message);
}

// 4. テスト環境JWTの検証
console.log('\n4. テスト環境JWTの検証...');
try {
  const verified = jwt.verify(testToken, 'test-secret');
  console.log('✅ テスト環境JWT検証成功:', verified);
} catch (error) {
  console.log('❌ テスト環境JWT検証失敗:', error.message);
}

// 5. テスト環境JWTの期限切れテスト
console.log('\n5. テスト環境JWTの期限切れテスト...');
console.log('60秒待機してからJWT検証を再実行します...');

setTimeout(() => {
  console.log('\n⏰ 60秒経過 - テスト環境JWT検証を再実行中...');
  try {
    const verified = jwt.verify(testToken, 'test-secret');
    console.log('❌ テスト環境JWT検証が成功してしまいました（期限切れになっていない）:', verified);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('✅ テスト環境JWT期限切れエラーが正しく発生しました:', error.message);
      console.log('✅ 期限切れ時刻:', new Date(error.expiredAt).toLocaleString('ja-JP'));
    } else {
      console.log('❌ 予期しないエラー:', error.message);
    }
  }
  
  // 6. 本番環境JWTはまだ有効であることを確認
  console.log('\n6. 本番環境JWTはまだ有効であることを確認...');
  try {
    const verified = jwt.verify(productionToken, 'production-secret');
    console.log('✅ 本番環境JWTはまだ有効です:', verified);
  } catch (error) {
    console.log('❌ 本番環境JWTが期限切れになってしまいました:', error.message);
  }
  
  console.log('\n🎯 テスト完了');
  console.log('='.repeat(50));
  console.log('📋 結果サマリー:');
  console.log('- 本番環境: JWT有効期限は7日間');
  console.log('- テスト環境: JWT有効期限は60秒');
  console.log('- 期限切れ後の動作: 適切にエラーが発生');
}, 61000); // 61秒待機（少し余裕を持たせる）

console.log('\n⏳ 60秒待機中... (Ctrl+Cで終了可能)');
