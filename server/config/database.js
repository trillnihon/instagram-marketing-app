import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

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

    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/threads_analysis';
    console.log('🔍 [MongoDB] 接続URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // パスワードをマスク
    
    // データベース名が含まれているかチェック
    if (!mongoUri.includes('/instagram-marketing') && !mongoUri.includes('/threads_analysis')) {
      console.log('⚠️ [MongoDB] 接続文字列にデータベース名が含まれていません。instagram-marketingを追加します。');
      mongoUri = mongoUri.replace(/\/\?/, '/instagram-marketing?').replace(/\/$/, '/instagram-marketing');
      console.log('🔍 [MongoDB] 修正後URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    }
    
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
    
    // データベースとコレクションの存在確認と自動作成
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`🔍 [MongoDB] 既存コレクション: ${collections.map(c => c.name).join(', ') || 'なし'}`);
      
      // tokensコレクションが存在しない場合は作成
      if (!collections.find(c => c.name === 'tokens')) {
        console.log('🔍 [MongoDB] tokensコレクションを作成中...');
        await db.createCollection('tokens');
        console.log('✅ [MongoDB] tokensコレクション作成完了');
      }
      
      // usersコレクションが存在しない場合は作成
      if (!collections.find(c => c.name === 'users')) {
        console.log('🔍 [MongoDB] usersコレクションを作成中...');
        await db.createCollection('users');
        console.log('✅ [MongoDB] usersコレクション作成完了');
      }
      
    } catch (collectionError) {
      console.warn('⚠️ [MongoDB] コレクション確認/作成でエラー:', collectionError.message);
      // コレクション作成エラーは致命的ではないので続行
    }
    
    return true;
  } catch (error) {
    console.error('❌ [MongoDB] 接続エラー詳細:');
    console.error('❌ [MongoDB] エラータイプ:', error.name);
    console.error('❌ [MongoDB] エラーメッセージ:', error.message);
    console.error('❌ [MongoDB] エラーコード:', error.code);
    
    // 開発環境でのみデモモードにフォールバック
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ [MongoDB] 開発環境でMONGODB_URI未設定: デモモードで動作します');
      return false;
    } else {
      // 本番環境では接続エラーを再スローしてサーバー起動を停止
      console.error('🚨 [MongoDB] 本番環境での接続エラー: サーバー起動を停止します');
      console.error('💡 [MongoDB] 解決方法:');
      console.error('   1. MONGODB_URI環境変数が正しく設定されているか確認');
      console.error('   2. MongoDB Atlas側でNetwork Accessに0.0.0.0/0を追加');
      console.error('   3. ユーザー名・パスワードが正しいか確認');
      console.error('   4. データベース名が接続文字列に含まれているか確認');
      throw error; // エラーを再スローしてサーバー起動を停止
    }
  }
};

// MongoDBネイティブクライアントを取得する関数
let mongoClient = null;

export const getMongoClient = async () => {
  try {
    // 既存のクライアントがある場合は再利用
    if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
      return mongoClient;
    }

    // MONGODB_URIが設定されていない場合はデモモード
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ [MongoDB] MONGODB_URI未設定: デモモードで動作します');
      throw new Error('MongoDB URI not configured - running in demo mode');
    }

    const mongoUri = process.env.MONGODB_URI;
    console.log('🔍 [MongoDB] ネイティブクライアント接続開始...');
    
    mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    await mongoClient.connect();
    console.log('✅ [MongoDB] ネイティブクライアント接続成功');
    
    return mongoClient;
  } catch (error) {
    console.error('❌ [MongoDB] ネイティブクライアント接続エラー:', error);
    throw error;
  }
};

export default connectDB;