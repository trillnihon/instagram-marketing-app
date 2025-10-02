import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'instagram-marketing';

mongoose.set('strictQuery', true);

async function connectDB() {
  if (!uri) throw new Error('MONGODB_URI is not set');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      dbName,
    });
    console.log('[mongo] connected');
  } catch (err) {
    console.error('[mongo] connection error:', err.message);
  }

  mongoose.connection.on('error', (e) => {
    console.error('[mongo] runtime error:', e?.message || e);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] disconnected');
  });
}

export default connectDB;