import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { EmailService } from './emailService';
import { getSecrets } from '../config/secrets';
import { logger } from '../utils/logger';

// Mock dependencies
jest.mock('@aws-sdk/client-ses');
jest.mock('../config/secrets');
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockSESClient: jest.Mocked<SESClient>;
  let mockSend: jest.Mock;
  let capturedCommandInputs: any[];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    capturedCommandInputs = [];
    
    // Create a new instance for each test
    emailService = new EmailService();
    
    // Mock SES client send method
    mockSend = jest.fn();
    mockSESClient = {
      send: mockSend,
    } as any;
    
    // Mock SESClient constructor
    (SESClient as jest.MockedClass<typeof SESClient>).mockImplementation(() => mockSESClient);
    
    // Mock SendEmailCommand to capture input
    (SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>).mockImplementation((input: any) => {
      capturedCommandInputs.push(input);
      return {
        input,
      } as any;
    });
    
    // Mock getSecrets to return valid credentials
    (getSecrets as jest.Mock).mockResolvedValue({
      AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
      AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    });
    
    // Set default environment variables
    process.env.SES_REGION = 'us-west-2';
    process.env.SES_FROM_EMAIL = 'test@example.com';
    process.env.FRONTEND_URL = 'https://jobmatch.zip';
  });

  afterEach(() => {
    delete process.env.SES_REGION;
    delete process.env.SES_FROM_EMAIL;
    delete process.env.FRONTEND_URL;
  });

  describe('initializeSESClient', () => {
    it('should initialize SES client with valid credentials', async () => {
      await emailService['initializeSESClient']();
      
      expect(getSecrets).toHaveBeenCalled();
      expect(SESClient).toHaveBeenCalledWith({
        region: 'us-west-2',
        credentials: {
          accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
          secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        },
      });
      expect(logger.info).toHaveBeenCalledWith('🔄 Initializing SES client...');
      expect(logger.info).toHaveBeenCalledWith('✅ SES client initialized successfully');
    });

    it('should not reinitialize if client already exists', async () => {
      await emailService['initializeSESClient']();
      jest.clearAllMocks();
      
      await emailService['initializeSESClient']();
      
      expect(logger.info).toHaveBeenCalledWith('SES client already initialized');
      expect(SESClient).not.toHaveBeenCalled();
    });

    it('should throw error if AWS credentials are missing', async () => {
      (getSecrets as jest.Mock).mockResolvedValue({
        AWS_ACCESS_KEY_ID: '',
        AWS_SECRET_ACCESS_KEY: '',
      });
      
      await expect(emailService['initializeSESClient']()).rejects.toThrow(
        'AWS credentials not found in secrets'
      );
    });

    it('should throw error if AWS Access Key ID has invalid length', async () => {
      (getSecrets as jest.Mock).mockResolvedValue({
        AWS_ACCESS_KEY_ID: 'SHORT',
        AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      });
      
      await expect(emailService['initializeSESClient']()).rejects.toThrow(
        'Invalid AWS Access Key ID length: 5'
      );
    });

    it('should throw error if AWS Secret Access Key has invalid length', async () => {
      (getSecrets as jest.Mock).mockResolvedValue({
        AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
        AWS_SECRET_ACCESS_KEY: 'SHORT',
      });
      
      await expect(emailService['initializeSESClient']()).rejects.toThrow(
        'Invalid AWS Secret Access Key length: 5'
      );
    });

    it('should use custom region from environment variable', async () => {
      process.env.SES_REGION = 'us-east-1';
      
      await emailService['initializeSESClient']();
      
      expect(SESClient).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
        })
      );
    });
  });

  describe('sendMagicLink', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send magic link email successfully', async () => {
      const email = 'user@example.com';
      const magicLink = 'https://jobmatch.zip/auth/magic-link?token=abc123';
      
      await emailService.sendMagicLink(email, magicLink);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      expect(params.Source).toBe('test@example.com');
      expect(params.Destination?.ToAddresses).toEqual([email]);
      expect(params.Message?.Subject?.Data).toBe('Your JobMatch AI Login Link');
      expect(params.Message?.Body?.Html?.Data).toContain(magicLink);
      expect(params.Message?.Body?.Text?.Data).toContain(magicLink);
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending magic link to ${email}`);
      expect(logger.info).toHaveBeenCalledWith(`✅ Magic link email sent successfully to ${email}`);
    });

    it('should use default from email if not set', async () => {
      delete process.env.SES_FROM_EMAIL;
      capturedCommandInputs.length = 0;
      
      await emailService.sendMagicLink('user@example.com', 'https://example.com/link');
      
      const params = capturedCommandInputs[0];
      expect(params.Source).toBe('admin@futurelink.zip');
    });

    it('should throw error if SES client fails to initialize', async () => {
      (getSecrets as jest.Mock).mockRejectedValue(new Error('Secret Manager error'));
      
      await expect(
        emailService.sendMagicLink('user@example.com', 'https://example.com/link')
      ).rejects.toThrow('Failed to send magic link email');
    });

    it('should throw error if SES send fails', async () => {
      mockSend.mockRejectedValue(new Error('SES send error'));
      
      await expect(
        emailService.sendMagicLink('user@example.com', 'https://example.com/link')
      ).rejects.toThrow('Failed to send magic link email');
    });
  });

  describe('sendWelcomeEmail', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send welcome email successfully', async () => {
      const email = 'user@example.com';
      const anonymousId = 'anon-1234567890abcdef';
      const assessmentUrl = 'https://jobmatch.zip/assessment';
      
      await emailService.sendWelcomeEmail(email, anonymousId, assessmentUrl);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      
      expect(params.Source).toBe('test@example.com');
      expect(params.Destination?.ToAddresses).toEqual([email]);
      expect(params.Message?.Subject?.Data).toBe('👋 Welcome to JobMatch.zip - Let\'s Get Started!');
      expect(params.Message?.Body?.Html?.Data).toContain(anonymousId.slice(0, 8));
      expect(params.Message?.Body?.Html?.Data).toContain(assessmentUrl);
      expect(params.Message?.Body?.Text?.Data).toContain(anonymousId.slice(0, 8));
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending welcome email to ${email}`);
      expect(logger.info).toHaveBeenCalledWith(`✅ Welcome email sent successfully to ${email}`);
    });
  });

  describe('sendAssessmentCompleteEmail', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send assessment complete email successfully', async () => {
      const email = 'user@example.com';
      const anonymousId = 'anon-1234567890abcdef';
      const profileUrl = 'https://jobmatch.zip/profile';
      
      await emailService.sendAssessmentCompleteEmail(email, anonymousId, profileUrl);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      
      expect(params.Message?.Subject?.Data).toBe('🎉 Assessment Complete - What Happens Next?');
      expect(params.Message?.Body?.Html?.Data).toContain('Congratulations');
      expect(params.Message?.Body?.Html?.Data).toContain(profileUrl);
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending assessment complete email to ${email}`);
    });
  });

  describe('sendGettingStartedReminder', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send getting started reminder successfully', async () => {
      const email = 'user@example.com';
      const anonymousId = 'anon-1234567890abcdef';
      const assessmentUrl = 'https://jobmatch.zip/assessment';
      
      await emailService.sendGettingStartedReminder(email, anonymousId, assessmentUrl);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      
      expect(params.Message?.Subject?.Data).toBe('💡 Quick Guide: Getting Started with JobMatch');
      expect(params.Message?.Body?.Html?.Data).toContain('Quick Guide');
      expect(params.Message?.Body?.Html?.Data).toContain(assessmentUrl);
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending getting started reminder to ${email}`);
    });
  });

  describe('sendAssessmentReminder', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send assessment reminder successfully', async () => {
      const email = 'user@example.com';
      const anonymousId = 'anon-1234567890abcdef';
      const assessmentUrl = 'https://jobmatch.zip/assessment';
      
      await emailService.sendAssessmentReminder(email, anonymousId, assessmentUrl);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      
      expect(params.Message?.Subject?.Data).toBe('⏰ Finish Your Assessment - You\'re Almost There!');
      expect(params.Message?.Body?.Html?.Data).toContain('Almost There');
      expect(params.Message?.Body?.Html?.Data).toContain(assessmentUrl);
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending assessment reminder to ${email}`);
    });
  });

  describe('sendFirstMatchEmail', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send first match email successfully', async () => {
      const email = 'user@example.com';
      const anonymousId = 'anon-1234567890abcdef';
      const matchUrl = 'https://jobmatch.zip/match/123';
      const matchDetails = 'Your skills match perfectly!';
      
      await emailService.sendFirstMatchEmail(email, anonymousId, matchUrl, matchDetails);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      
      expect(params.Message?.Subject?.Data).toBe('🎯 Great News - You Have a Match!');
      expect(params.Message?.Body?.Html?.Data).toContain('Great News');
      expect(params.Message?.Body?.Html?.Data).toContain(matchUrl);
      expect(params.Message?.Body?.Html?.Data).toContain(matchDetails);
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending first match notification to ${email}`);
    });

    it('should send first match email without match details', async () => {
      const email = 'user@example.com';
      const anonymousId = 'anon-1234567890abcdef';
      const matchUrl = 'https://jobmatch.zip/match/123';
      
      await emailService.sendFirstMatchEmail(email, anonymousId, matchUrl);
      
      const params = capturedCommandInputs[capturedCommandInputs.length - 1];
      
      expect(params.Message?.Body?.Html?.Data).toContain(
        'Your capabilities align well with what this opportunity is looking for'
      );
    });
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
    });

    it('should send generic email successfully', async () => {
      const email = 'user@example.com';
      const subject = 'Test Subject';
      const htmlBody = '<h1>Test HTML</h1>';
      const textBody = 'Test Text';
      
      await emailService.sendEmail(email, subject, htmlBody, textBody);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(capturedCommandInputs.length).toBe(1);
      
      const params = capturedCommandInputs[0];
      
      expect(params.Source).toBe('test@example.com');
      expect(params.Destination?.ToAddresses).toEqual([email]);
      expect(params.Message?.Subject?.Data).toBe(subject);
      expect(params.Message?.Body?.Html?.Data).toBe(htmlBody);
      expect(params.Message?.Body?.Text?.Data).toBe(textBody);
      
      expect(logger.info).toHaveBeenCalledWith(`📧 Sending email to ${email}: ${subject}`);
      expect(logger.info).toHaveBeenCalledWith(`✅ Email sent successfully to ${email}`);
    });
  });

  describe('testConfiguration', () => {
    it('should return true if configuration is valid', async () => {
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
      
      const result = await emailService.testConfiguration();
      
      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('✅ SES configuration test successful');
    });

    it('should return false if configuration test fails', async () => {
      mockSend.mockRejectedValue(new Error('SES error'));
      
      const result = await emailService.testConfiguration();
      
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        '❌ SES configuration test failed:',
        expect.any(Error)
      );
    });

    it('should use default from email in test', async () => {
      delete process.env.SES_FROM_EMAIL;
      capturedCommandInputs.length = 0;
      mockSend.mockResolvedValue({ MessageId: 'test-message-id-123' });
      
      await emailService.testConfiguration();
      
      const params = capturedCommandInputs[0];
      expect(params.Source).toBe('admin@futurelink.zip');
    });
  });

  describe('Email Template Generation', () => {
    it('should generate valid HTML magic link email', () => {
      const magicLink = 'https://example.com/link';
      const html = emailService['generateMagicLinkEmailHTML'](magicLink);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(magicLink);
      expect(html).toContain('JobMatch AI');
      expect(html).toContain('Login to JobMatch AI');
    });

    it('should generate valid text magic link email', () => {
      const magicLink = 'https://example.com/link';
      const text = emailService['generateMagicLinkEmailText'](magicLink);
      
      expect(text).toContain('JobMatch AI - Login Link');
      expect(text).toContain(magicLink);
      expect(text).toContain('15 minutes');
    });

    it('should generate welcome email with anonymous ID', () => {
      const anonymousId = 'anon-1234567890abcdef';
      const assessmentUrl = 'https://jobmatch.zip/assessment';
      const baseUrl = 'https://jobmatch.zip';
      
      const html = emailService['generateWelcomeEmailHTML'](anonymousId, assessmentUrl, baseUrl);
      const text = emailService['generateWelcomeEmailText'](anonymousId, assessmentUrl, baseUrl);
      
      expect(html).toContain(anonymousId.slice(0, 8));
      expect(html).toContain(assessmentUrl);
      expect(text).toContain(anonymousId.slice(0, 8));
      expect(text).toContain(assessmentUrl);
    });

    it('should generate assessment complete email with profile URL', () => {
      const anonymousId = 'anon-1234567890abcdef';
      const profileUrl = 'https://jobmatch.zip/profile';
      const baseUrl = 'https://jobmatch.zip';
      
      const html = emailService['generateAssessmentCompleteEmailHTML'](anonymousId, profileUrl, baseUrl);
      const text = emailService['generateAssessmentCompleteEmailText'](anonymousId, profileUrl, baseUrl);
      
      expect(html).toContain('Congratulations');
      expect(html).toContain(profileUrl);
      expect(text).toContain('Congratulations');
      expect(text).toContain(profileUrl);
    });

    it('should generate first match email with match details', () => {
      const anonymousId = 'anon-1234567890abcdef';
      const matchUrl = 'https://jobmatch.zip/match/123';
      const matchDetails = 'Perfect match!';
      const baseUrl = 'https://jobmatch.zip';
      
      const html = emailService['generateFirstMatchEmailHTML'](anonymousId, matchUrl, matchDetails, baseUrl);
      const text = emailService['generateFirstMatchEmailText'](anonymousId, matchUrl, matchDetails, baseUrl);
      
      expect(html).toContain('Great News');
      expect(html).toContain(matchUrl);
      expect(html).toContain(matchDetails);
      expect(text).toContain('Great News');
      expect(text).toContain(matchUrl);
      expect(text).toContain(matchDetails);
    });
  });
});

