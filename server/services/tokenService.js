import { Token } from '../models/Token.js';
import logger from '../utils/logger.js';

class TokenService {
  /**
   * 有効な長期トークンを取得
   */
  static async getValidLongLivedToken() {
    try {
      const token = await Token.getValidToken('ig_long_lived');
      if (!token) {
        logger.warn('有効な長期トークンが見つかりません');
        return null;
      }
      
      if (!token.isValid()) {
        logger.warn('トークンの有効期限が切れています');
        return null;
      }
      
      logger.info(`有効な長期トークンを取得: 残り${token.getRemainingDays()}日`);
      return token;
    } catch (error) {
      logger.error('トークン取得エラー:', error);
      return null;
    }
  }

  /**
   * トークンを保存または更新
   */
  static async upsertToken(type, token, expiresIn) {
    try {
      const expireAt = new Date(Date.now() + expiresIn * 1000);
      
      const result = await Token.findOneAndUpdate(
        { type: type },
        {
          type: type,
          token: token,
          expireAt: expireAt,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      
      logger.info(`トークンを保存/更新しました: ${type}`);
      return result;
    } catch (error) {
      logger.error('トークン保存エラー:', error);
      throw error;
    }
  }

  /**
   * トークンの有効性をチェック
   */
  static async validateToken(token) {
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name`);
      
      if (!response.ok) {
        return { isValid: false, isExpired: true, needsRotation: true };
      }
      
      const data = await response.json();
      
      if (data.error) {
        return { isValid: false, isExpired: true, needsRotation: true };
      }
      
      // 長期トークンの場合、有効期限をチェック
      const estimatedExpiryDays = 60;
      const needsRotation = estimatedExpiryDays <= 7;
      
      return {
        isValid: true,
        expiresInDays: estimatedExpiryDays,
        isExpired: false,
        needsRotation
      };
    } catch (error) {
      logger.error('トークン有効性チェックエラー:', error);
      return { isValid: false, isExpired: true, needsRotation: true };
    }
  }

  /**
   * トークンの状態を取得
   */
  static async getTokenStatus() {
    try {
      const token = await Token.getValidToken('ig_long_lived');
      if (!token) {
        return {
          hasToken: false,
          isValid: false,
          remainingDays: 0,
          needsRotation: true
        };
      }
      
      const isValid = token.isValid();
      const remainingDays = token.getRemainingDays();
      const needsRotation = remainingDays <= 7;
      
      return {
        hasToken: true,
        isValid,
        remainingDays,
        needsRotation,
        lastUpdated: token.updatedAt
      };
    } catch (error) {
      logger.error('トークン状態取得エラー:', error);
      return {
        hasToken: false,
        isValid: false,
        remainingDays: 0,
        needsRotation: true
      };
    }
  }
}

export default TokenService;
