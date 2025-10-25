import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { logger } from '../utils/logger';
import { getSecrets } from '../config/secrets';

export class EmailService {
  private sesClient: SESClient | null = null;

  /**
   * Initialize SES client with credentials from Secret Manager
   */
  private async initializeSESClient(): Promise<void> {
    if (this.sesClient) {
      logger.info('SES client already initialized');
      return;
    }
    
    try {
      logger.info('🔄 Initializing SES client...');
      
      // Load secrets from Google Secret Manager
      const secrets = await getSecrets();
      
      // Debug logging
      logger.info('🔍 AWS_ACCESS_KEY_ID length:', secrets.AWS_ACCESS_KEY_ID?.length);
      logger.info('🔍 AWS_SECRET_ACCESS_KEY length:', secrets.AWS_SECRET_ACCESS_KEY?.length);
      logger.info('🔍 AWS_ACCESS_KEY_ID first 10 chars:', secrets.AWS_ACCESS_KEY_ID?.substring(0, 10));
      logger.info('🔍 AWS_SECRET_ACCESS_KEY first 10 chars:', secrets.AWS_SECRET_ACCESS_KEY?.substring(0, 10));
      
      // Validate credentials
      if (!secrets.AWS_ACCESS_KEY_ID || !secrets.AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials not found in secrets');
      }
      
      if (secrets.AWS_ACCESS_KEY_ID.length !== 20) {
        throw new Error(`Invalid AWS Access Key ID length: ${secrets.AWS_ACCESS_KEY_ID.length}`);
      }
      
      if (secrets.AWS_SECRET_ACCESS_KEY.length !== 40) {
        throw new Error(`Invalid AWS Secret Access Key length: ${secrets.AWS_SECRET_ACCESS_KEY.length}`);
      }
      
      // Create SES client
      this.sesClient = new SESClient({
        region: process.env.SES_REGION || 'us-west-2',
        credentials: {
          accessKeyId: secrets.AWS_ACCESS_KEY_ID,
          secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
        },
      });
      
      logger.info('✅ SES client initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize SES client:', error);
      throw error;
    }
  }

  /**
   * Send magic link email
   */
  async sendMagicLink(email: string, magicLink: string): Promise<void> {
    try {
      logger.info(`📧 Sending magic link to ${email}`);
      
      // Initialize SES client
      await this.initializeSESClient();
      
      if (!this.sesClient) {
        throw new Error('SES client not initialized');
      }
      
      const fromEmail = process.env.SES_FROM_EMAIL || 'admin@futurelink.zip';
      
      logger.info(`📧 From email: ${fromEmail}`);
      logger.info(`📧 Magic link: ${magicLink}`);
      
      const params = {
        Source: fromEmail,
        Destination: { 
          ToAddresses: [email] 
        },
        Message: {
          Subject: { 
            Data: 'Your JobMatch AI Login Link', 
            Charset: 'UTF-8' 
          },
          Body: {
            Html: {
              Data: this.generateMagicLinkEmailHTML(magicLink),
              Charset: 'UTF-8',
            },
            Text: {
              Data: this.generateMagicLinkEmailText(magicLink),
              Charset: 'UTF-8',
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      
      logger.info('📧 Sending email via SES...');
      const result = await this.sesClient.send(command);
      
      logger.info(`✅ Magic link email sent successfully to ${email}`);
      logger.info(`📧 Message ID: ${result.MessageId}`);
      
    } catch (error: any) {
      logger.error(`❌ Failed to send magic link email to ${email}:`, error);
      throw new Error(`Failed to send magic link email: ${error.message}`);
    }
  }

  /**
   * Generate HTML email template for magic link
   */
  private generateMagicLinkEmailHTML(magicLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JobMatch AI Login</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 JobMatch AI</h1>
            <p>Your AI-powered job matching assistant</p>
          </div>
          <div class="content">
            <h2>Welcome to JobMatch AI!</h2>
            <p>Click the button below to securely log in to your JobMatch AI account:</p>
            <a href="${magicLink}" class="button">🔗 Login to JobMatch AI</a>
            <p><strong>This link will expire in 15 minutes for security.</strong></p>
            <p>If you didn't request this login link, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>JobMatch AI - Making job matching smarter</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email template for magic link
   */
  private generateMagicLinkEmailText(magicLink: string): string {
    return `
JobMatch AI - Login Link

Welcome to JobMatch AI!

Click the link below to securely log in to your account:
${magicLink}

This link will expire in 15 minutes for security.

If you didn't request this login link, you can safely ignore this email.

---
JobMatch AI - Making job matching smarter
This is an automated message, please do not reply.
    `;
  }

  /**
   * Test SES configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      await this.initializeSESClient();
      
      if (!this.sesClient) {
        throw new Error('SES client not initialized');
      }
      
      const fromEmail = process.env.SES_FROM_EMAIL || 'admin@futurelink.zip';
      
      const params = {
        Source: fromEmail,
        Destination: { 
          ToAddresses: ['test@example.com'] 
        },
        Message: {
          Subject: { 
            Data: 'JobMatch AI - SES Test', 
            Charset: 'UTF-8' 
          },
          Body: {
            Text: {
              Data: 'This is a test email to verify SES configuration.',
              Charset: 'UTF-8',
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      
      logger.info('✅ SES configuration test successful');
      return true;
      
    } catch (error) {
      logger.error('❌ SES configuration test failed:', error);
      return false;
    }
  }
}