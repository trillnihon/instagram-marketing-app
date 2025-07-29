import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 開発環境でMONGODB_URIが設定されていない場合はデモモード
    if (process.env.NODE_ENV !== 'production' && !process.env.MONGODB_URI) {
      console.log('⚠️ MongoDBなしでデモモードで動作します');
      return false;
    }

    // 本番環境ではMONGODB_URIが必須
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required in production environment');
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/threads_analysis';
    
    // MongoDB接続オプション（非推奨警告を抑制）
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // 3秒でタイムアウト
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    // エラーメッセージを簡潔に表示
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ MongoDBなしでデモモードで動作します');
      return false;
    } else {
      console.error('🚨 MongoDB接続エラー: 本番環境ではMongoDB接続が推奨されます');
      console.error('💡 解決方法: MONGODB_URI環境変数を設定してください');
      return false;
    }
  }
};

export default connectDB; 