import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/User.js';

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
  });

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
}); 