const UPLOAD_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://instagram-marketing-backend-v2.onrender.com/upload'
  : 'http://localhost:3001/upload';

export interface UploadResponse {
  success: boolean;
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  error?: string;
}

class UploadService {
  private baseURL: string;

  constructor() {
    this.baseURL = UPLOAD_BASE_URL;
  }

  /**
   * 画像ファイルをアップロード
   */
  async uploadImage(file: File): Promise<string> {
    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('image', file);

      console.log('📤 [UPLOAD] ファイルアップロード開始:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // アップロード実行
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UploadResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      console.log('✅ [UPLOAD] アップロード成功:', {
        url: data.url,
        public_id: data.public_id,
        width: data.width,
        height: data.height
      });

      return data.url;

    } catch (error: any) {
      console.error('❌ [UPLOAD] アップロードエラー:', error);
      throw new Error(error.message || 'ファイルアップロードに失敗しました');
    }
  }

  /**
   * 複数ファイルをアップロード
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      console.log('✅ [UPLOAD] 複数ファイルアップロード成功:', urls.length);
      return urls;
    } catch (error: any) {
      console.error('❌ [UPLOAD] 複数ファイルアップロードエラー:', error);
      throw new Error(error.message || '複数ファイルのアップロードに失敗しました');
    }
  }

  /**
   * アップロードサービスのヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Upload service health check failed:', error);
      return false;
    }
  }

  /**
   * Cloudinary設定確認
   */
  async checkConfig(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/config`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Config check failed:', error);
      throw new Error(error.message || '設定確認に失敗しました');
    }
  }

  /**
   * ファイルサイズをフォーマット
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * ファイルタイプを検証
   */
  isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * ファイルサイズを検証（10MB制限）
   */
  isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }

  /**
   * ファイルを検証
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isValidImageType(file)) {
      return {
        isValid: false,
        error: '画像ファイル（JPEG、PNG、GIF、WebP）のみアップロード可能です'
      };
    }

    if (!this.isValidFileSize(file)) {
      return {
        isValid: false,
        error: 'ファイルサイズは10MB以下にしてください'
      };
    }

    return { isValid: true };
  }
}

export default new UploadService();
