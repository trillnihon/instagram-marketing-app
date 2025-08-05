// server/simple-server.js
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

try {
  const server = app.listen(PORT, () => {
    const address = server.address();
    console.log(`✅ Listening on ${address ? JSON.stringify(address) : 'unknown address'}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('❌ Unexpected error during startup:', err);
  process.exit(1);
} 