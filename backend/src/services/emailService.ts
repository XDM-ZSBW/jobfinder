import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { logger } from '../utils/logger';
import { getSecrets } from '../config/secrets';

export class EmailService {
  private sesClient: SESClient | null = null;

  private async initializeSESClient(): Promise<void> {
    if (this.sesClient) return; // Already initialized
    
    const secrets = await getSecrets();
    
    this.sesClient = new SESClient({
      region: process.env.SES_REGION || 'us-west-2',
      credentials: {
        accessKeyId: secrets.AWS_ACCESS_KEY_ID,
        secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Send magic link email
   */
  async sendMagicLink(email: string, magicLink: string): Promise<void> {
    try {
      await this.initializeSESClient();
      
      const fromEmail = process.env.SES_FROM_EMAIL || 'admin@futurelink.zip';
      
      const params = {
        Source: fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: '🎯 Your JobMatch AI Login Link',
            Charset: 'UTF-8',
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
      if (!this.sesClient) {
        throw new Error('SES client not initialized');
      }
      await this.sesClient.send(command);
      
      logger.info(`Magic link email sent successfully to ${email}`);
    } catch (error) {
      logger.error('Error sending magic link email:', error);
      throw new Error('Failed to send magic link email');
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
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎯 JobMatch AI</div>
            <h1 class="title">Your Login Link</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            <p>You requested a login link for JobMatch AI. Click the button below to securely sign in to your account:</p>
            
            <div style="text-align: center;">
              <a href="${magicLink}" class="button">Sign In to JobMatch AI</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 15 minutes and can only be used once. If you didn't request this link, please ignore this email.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              ${magicLink}
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent by JobMatch AI</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for magic link
   */
  private generateMagicLinkEmailText(magicLink: string): string {
    return `
🎯 JobMatch AI - Your Login Link

Hello!

You requested a login link for JobMatch AI. Click the link below to securely sign in to your account:

${magicLink}

⚠️ Security Notice: This link will expire in 15 minutes and can only be used once. If you didn't request this link, please ignore this email.

If you have any questions, please contact our support team.

Best regards,
JobMatch AI Team
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      await this.initializeSESClient();
      
      const fromEmail = process.env.SES_FROM_EMAIL || 'admin@futurelink.zip';
      
      const params = {
        Source: fromEmail,
        Destination: {
          ToAddresses: ['test@example.com'],
        },
        Message: {
          Subject: {
            Data: 'Test Email',
            Charset: 'UTF-8',
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
      if (!this.sesClient) {
        throw new Error('SES client not initialized');
      }
      await this.sesClient.send(command);
      
      logger.info('SES configuration test successful');
      return true;
    } catch (error) {
      logger.error('SES configuration test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
