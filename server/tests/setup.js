// テスト環境の設定
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// 必要に応じてクリーンアップ処理
afterAll(async () => {
  // ここにクリーンアップ処理を追加
}); 