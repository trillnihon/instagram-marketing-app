import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'instagram-marketing';

if (!uri) {
  throw new Error('MONGODB_URI is not set');
}

// 参考: v8では余計な接続オプション不要。タイムアウトだけ明示
mongoose.set('strictQuery', true);

async function connectMongo() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10sで早めに失敗
      dbName,                          // URIにDB名がない場合でも固定
    });

    const state = mongoose.connection.readyState; // 1=connected
    console.log(`[mongo] connected: ${state === 1}`);
  } catch (err) {
    // パスワードやURIの秘匿（ユーザー/パスワード/クエリは出さない）
    console.error('[mongo] connection error:', {
      name: err?.name,
      code: err?.code,
      reason: err?.reason?.code,
      message: err?.message,
    });
    // 起動は継続し、/api/health で failed を返せるようにする
  }

  // 追加の可視化ログ
  mongoose.connection.on('error', (e) => {
    console.error('[mongo] runtime error:', e?.message || e);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] disconnected');
  });
}

export { connectMongo };
export default connectMongo;