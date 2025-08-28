import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔍 [MongoDB] 接続開始...');
    console.log('🔍 [MongoDB] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [MongoDB] MONGODB_URI設定:', !!process.env.MONGODB_URI);
    
    // 開発環境でMONGODB_URIが設定されていない場合はデモモード
    if (process.env.NODE_ENV !== 'production' && !process.env.MONGODB_URI) {
      console.log('⚠️ [MongoDB] 開発環境でMONGODB_URI未設定: デモモードで動作します');
      return false;
    }

    // 本番環境ではMONGODB_URIが必須
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.error('🚨 [MongoDB] 本番環境でMONGODB_URI未設定');
      throw new Error('MONGODB_URI is required in production environment');
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/threads_analysis';
    console.log('🔍 [MongoDB] 接続URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // パスワードをマスク
    
    // MongoDB接続オプション（非推奨警告を抑制）
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10秒でタイムアウト（Atlas接続用に延長）
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    console.log('🔍 [MongoDB] 接続オプション:', options);
    console.log('🔍 [MongoDB] 接続試行中...');

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ [MongoDB] 接続成功: ${conn.connection.host}`);
    console.log(`✅ [MongoDB] データベース: ${conn.connection.name}`);
    console.log(`✅ [MongoDB] 接続状態: ${conn.connection.readyState}`);
    return true;
  } catch (error) {
    console.error('❌ [MongoDB] 接続エラー詳細:');
    console.error('❌ [MongoDB] エラータイプ:', error.name);
    console.error('❌ [MongoDB] エラーメッセージ:', error.message);
    console.error('❌ [MongoDB] エラーコード:', error.code);
    
    // エラーメッセージを簡潔に表示
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ [MongoDB] 開発環境でMONGODB_URI未設定: デモモードで動作します');
      return false;
    } else {
      console.error('🚨 [MongoDB] 本番環境での接続エラー: デモモードで動作します');
      console.error('💡 [MongoDB] 解決方法:');
      console.error('   1. MONGODB_URI環境変数が正しく設定されているか確認');
      console.error('   2. MongoDB Atlas側でNetwork Accessに0.0.0.0/0を追加');
      console.error('   3. ユーザー名・パスワードが正しいか確認');
      return false;
    }
  }
};

export default connectDB; 