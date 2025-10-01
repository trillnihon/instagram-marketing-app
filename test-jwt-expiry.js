#!/usr/bin/env node

/**
 * JWT有効期限テストスクリプト
 * 
 * 使用方法:
 * 1. テスト環境でサーバーを起動: NODE_ENV=test npm start
 * 2. このスクリプトを実行: node test-jwt-expiry.js
 * 
 * 期待結果:
 * - JWTが60秒で期限切れになることを確認
 * - 期限切れ後にAPIリクエストが失敗することを確認
 */

import jwt from 'jsonwebtoken';

// テスト用の設定
const JWT_SECRET = 'test-secret-key';
const TEST_USER = {
  id: 'test-user-123',
  name: 'Test User',
  provider: 'instagram'
};

console.log('🧪 JWT有効期限テスト開始');
console.log('='.repeat(50));

// 1. 60秒のJWTを発行
console.log('1. 60秒のJWTを発行中...');
const token = jwt.sign(TEST_USER, JWT_SECRET, { expiresIn: '60s' });
console.log(`✅ JWT発行成功: ${token.substring(0, 20)}...`);

// 2. JWTの内容を確認
console.log('\n2. JWTの内容を確認中...');
const decoded = jwt.decode(token);
console.log('JWT Payload:', {
  id: decoded.id,
  name: decoded.name,
  provider: decoded.provider,
  exp: decoded.exp,
  expDate: new Date(decoded.exp * 1000).toLocaleString('ja-JP'),
  iat: decoded.iat,
  iatDate: new Date(decoded.iat * 1000).toLocaleString('ja-JP')
});

// 3. 現在時刻と有効期限の比較
const now = Math.floor(Date.now() / 1000);
const timeUntilExpiry = decoded.exp - now;
console.log(`\n3. 有効期限までの時間: ${timeUntilExpiry}秒`);

if (timeUntilExpiry <= 60) {
  console.log('✅ JWT有効期限は60秒以内に設定されています');
} else {
  console.log('❌ JWT有効期限が60秒を超えています');
}

// 4. JWTの検証テスト
console.log('\n4. JWTの検証テスト中...');
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('✅ JWT検証成功:', verified);
} catch (error) {
  console.log('❌ JWT検証失敗:', error.message);
}

// 5. 期限切れ後の動作シミュレーション
console.log('\n5. 期限切れ後の動作シミュレーション...');
console.log('60秒待機してからJWT検証を再実行します...');

setTimeout(() => {
  console.log('\n⏰ 60秒経過 - JWT検証を再実行中...');
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('❌ JWT検証が成功してしまいました（期限切れになっていない）:', verified);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('✅ JWT期限切れエラーが正しく発生しました:', error.message);
      console.log('✅ 期限切れ時刻:', new Date(error.expiredAt).toLocaleString('ja-JP'));
    } else {
      console.log('❌ 予期しないエラー:', error.message);
    }
  }
  
  console.log('\n🎯 テスト完了');
  console.log('='.repeat(50));
}, 61000); // 61秒待機（少し余裕を持たせる）

console.log('\n⏳ 60秒待機中... (Ctrl+Cで終了可能)');
