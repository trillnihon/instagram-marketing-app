import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 本番環境ではMONGODB_URIが必須
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required in production environment');
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/threads_analysis';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // 開発環境でのみデモモードを許可
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ MongoDBなしでデモモードで動作します');
      return false;
    } else {
      // 本番環境ではMongoDB接続が必須だが、アプリは起動し続ける
      console.error('🚨 MongoDB接続エラー: 本番環境ではMongoDB接続が推奨されます');
      console.error('💡 解決方法: MONGODB_URI環境変数を設定してください');
      console.error('📝 例: mongodb+srv://username:password@cluster.mongodb.net/database');
      
      // 本番環境でもアプリを起動し続ける（MongoDB機能は無効化）
      return false;
    }
  }
};

export default connectDB; 