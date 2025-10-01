import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer設定（メモリストレージ）
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB制限
  },
  fileFilter: (req, file, cb) => {
    // 画像ファイルのみ許可
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'), false);
    }
  },
});

/**
 * 画像ファイルアップロード
 * POST /upload
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '画像ファイルが必要です'
      });
    }

    console.log('📤 [UPLOAD] ファイルアップロード開始:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Cloudinaryにアップロード
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'instagram-posts', // フォルダー整理
          public_id: `post_${Date.now()}`, // ユニークなID
          transformation: [
            { width: 1080, height: 1080, crop: 'limit' }, // Instagram推奨サイズ
            { quality: 'auto' }, // 自動品質最適化
            { format: 'auto' } // 自動フォーマット最適化
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    console.log('✅ [UPLOAD] Cloudinaryアップロード成功:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('❌ [UPLOAD] アップロードエラー:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'ファイルアップロードに失敗しました'
    });
  }
});

/**
 * ヘルスチェック
 * GET /upload/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Upload service is running',
    cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
    timestamp: new Date().toISOString()
  });
});

/**
 * Cloudinary設定確認
 * GET /upload/config
 */
router.get('/config', (req, res) => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '設定済み' : '未設定',
    api_key: process.env.CLOUDINARY_API_KEY ? '設定済み' : '未設定',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '設定済み' : '未設定'
  };

  res.json({
    success: true,
    config,
    timestamp: new Date().toISOString()
  });
});

export default router;
