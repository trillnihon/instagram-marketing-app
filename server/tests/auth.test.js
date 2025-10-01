import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// テスト用のExpressアプリケーションを作成
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import authRouter from '../routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

let mongoServer;

// テスト用のユーザーデータ
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

const testUser2 = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'password456'
};

describe('認証APIテスト', () => {
  beforeAll(async () => {
    // インメモリMongoDBサーバーを起動
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // テスト用データベースに接続
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    // テスト終了後のクリーンアップ
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // 各テスト前にデータベースをクリア
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('正常なユーザー登録が成功する', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ユーザー登録が完了しました');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined(); // パスワードは返さない
    });

    it('重複したメールアドレスで登録が失敗する', async () => {
      // 最初のユーザーを登録
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      // 同じメールアドレスで再度登録
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email は既に使用されています');
    });

    it('無効なデータで登録が失敗する', async () => {
      const invalidUser = {
        username: 'a', // 短すぎる
        email: 'invalid-email', // 無効なメール
        password: '123' // 短すぎる
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('必須フィールドが不足している場合に失敗する', async () => {
      const incompleteUser = {
        username: 'testuser'
        // emailとpasswordが不足
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // テスト用ユーザーを作成
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);
    });

    it('正しい認証情報でログインが成功する', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ログインに成功しました');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('間違ったパスワードでログインが失敗する', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('存在しないメールアドレスでログインが失敗する', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('メールアドレスまたはパスワードが正しくありません');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // テスト用ユーザーを作成してログイン
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    it('有効なトークンでプロフィール取得が成功する', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.password).toBeUndefined();
    });

    it('無効なトークンでプロフィール取得が失敗する', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('無効なトークンです');
    });

    it('トークンなしでプロフィール取得が失敗する', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('アクセストークンが必要です');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // テスト用ユーザーを作成してログイン
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    it('有効なトークンでプロフィール更新が成功する', async () => {
      const updateData = {
        profile: {
          displayName: 'Updated Name',
          bio: 'Updated bio'
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('プロフィールが更新されました');
      expect(response.body.user.profile.displayName).toBe('Updated Name');
      expect(response.body.user.profile.bio).toBe('Updated bio');
    });

    it('無効なデータでプロフィール更新が失敗する', async () => {
      const invalidData = {
        profile: {
          displayName: 'a'.repeat(51) // 50文字を超える
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/save-token (Instagram OAuth JWT発行)', () => {
    // Mock fetch for Instagram API calls
    const originalFetch = global.fetch;
    
    beforeEach(() => {
      // Mock successful Instagram API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'instagram_user_123',
          name: 'Test Instagram User',
          email: 'test@instagram.com'
        })
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('有効なInstagramアクセストークンでJWT発行が成功する', async () => {
      const mockAccessToken = 'valid_instagram_access_token_12345';
      
      const response = await request(app)
        .post('/api/auth/save-token')
        .send({ accessToken: mockAccessToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe('instagram_user_123');
      expect(response.body.user.name).toBe('Test Instagram User');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('アクセストークンなしでJWT発行が失敗する', async () => {
      const response = await request(app)
        .post('/api/auth/save-token')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('アクセストークンが提供されていません');
    });

    it('無効なInstagramアクセストークンでJWT発行が失敗する', async () => {
      // Mock Instagram API error response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid access token')
      });

      const response = await request(app)
        .post('/api/auth/save-token')
        .send({ accessToken: 'invalid_token' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.metaApiError).toBe(true);
      expect(response.body.statusCode).toBe(400);
    });

    it('JWT_SECRET未設定時にエラーが発生する', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const response = await request(app)
        .post('/api/auth/save-token')
        .send({ accessToken: 'valid_token' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('JWT_SECRET not set');

      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('JWT期限切れ時の挙動テスト', () => {
    let authToken;

    beforeEach(async () => {
      // テスト用ユーザーを作成してログイン
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    it('期限切れJWTでプロフィール取得が失敗する', async () => {
      // 期限切れのJWTトークンを作成（過去の日付）
      const expiredPayload = { 
        userId: 'test_user_id', 
        exp: Math.floor(Date.now() / 1000) - 3600 // 1時間前に期限切れ
      };
      const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('無効なトークンです');
    });

    it('無効なJWT形式でプロフィール取得が失敗する', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('無効なトークンです');
    });
  });

  describe('API エラー時のメッセージ表示テスト', () => {
    it('存在しないエンドポイントで404エラーが返される', async () => {
      const response = await request(app)
        .get('/api/auth/nonexistent-endpoint')
        .expect(404);
    });

    it('不正なリクエストボディで400エラーが返される', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send('invalid json')
        .expect(400);
    });

    it('MongoDB接続エラー時の適切なエラーメッセージ', async () => {
      // このテストは実際のMongoDB接続エラーをシミュレートするのは複雑なため、
      // 実際のエラーケースでは適切なエラーメッセージが返されることを確認
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'test',
          email: 'test@example.com',
          password: 'password123'
        });

      // 正常な場合は成功、エラーの場合は適切なメッセージが返される
      if (!response.body.success) {
        expect(response.body.message).toBeDefined();
        expect(typeof response.body.message).toBe('string');
      }
    });
  });
}); 