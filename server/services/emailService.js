import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// SendGrid APIキーを設定
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class EmailService {
  static async sendVerificationEmail(email, verificationToken) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@instagram-analyzer.com',
        subject: '【Instagram & Threads分析アプリ】メールアドレスの確認',
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // SendGridテンプレートID（実際のIDに置き換え）
        dynamicTemplateData: {
          verification_url: verificationUrl,
          user_email: email,
          expiry_hours: 24
        }
      };

      await sgMail.send(msg);
      console.log(`[EMAIL] 認証メール送信成功: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] 認証メール送信失敗:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendWelcomeEmail(email, username) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@instagram-analyzer.com',
        subject: '【Instagram & Threads分析アプリ】ご登録ありがとうございます',
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // SendGridテンプレートID（実際のIDに置き換え）
        dynamicTemplateData: {
          username: username,
          login_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
          dashboard_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        }
      };

      await sgMail.send(msg);
      console.log(`[EMAIL] ウェルカムメール送信成功: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] ウェルカムメール送信失敗:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@instagram-analyzer.com',
        subject: '【Instagram & Threads分析アプリ】パスワードリセット',
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // SendGridテンプレートID（実際のIDに置き換え）
        dynamicTemplateData: {
          reset_url: resetUrl,
          user_email: email,
          expiry_hours: 1
        }
      };

      await sgMail.send(msg);
      console.log(`[EMAIL] パスワードリセットメール送信成功: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] パスワードリセットメール送信失敗:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendUsageLimitEmail(email, username, usageType) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@instagram-analyzer.com',
        subject: '【Instagram & Threads分析アプリ】利用制限のお知らせ',
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // SendGridテンプレートID（実際のIDに置き換え）
        dynamicTemplateData: {
          username: username,
          usage_type: usageType,
          upgrade_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upgrade`
        }
      };

      await sgMail.send(msg);
      console.log(`[EMAIL] 利用制限メール送信成功: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] 利用制限メール送信失敗:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendSecurityAlertEmail(email, username, alertType, details) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@instagram-analyzer.com',
        subject: '【Instagram & Threads分析アプリ】セキュリティアラート',
        templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // SendGridテンプレートID（実際のIDに置き換え）
        dynamicTemplateData: {
          username: username,
          alert_type: alertType,
          details: details,
          support_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact`
        }
      };

      await sgMail.send(msg);
      console.log(`[EMAIL] セキュリティアラートメール送信成功: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] セキュリティアラートメール送信失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // メール送信のテスト用
  static async sendTestEmail(email) {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@instagram-analyzer.com',
        subject: '【Instagram & Threads分析アプリ】メール送信テスト',
        text: 'これはテストメールです。メール送信機能が正常に動作しています。',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Instagram & Threads分析アプリ</h2>
            <p>これはテストメールです。メール送信機能が正常に動作しています。</p>
            <p>送信日時: ${new Date().toLocaleString('ja-JP')}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              このメールは自動送信されています。返信はできません。
            </p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log(`[EMAIL] テストメール送信成功: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] テストメール送信失敗:', error);
      return { success: false, error: error.message };
    }
  }
} 