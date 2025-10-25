#!/usr/bin/env node

/**
 * Test script for Amazon SES email service
 * Run this to verify SES configuration and send a test email
 */

import { emailService } from './src/services/emailService.js';
import { logger } from './src/utils/logger.js';

async function testEmailService() {
  console.log('🧪 Testing Amazon SES Email Service...\n');

  try {
    // Test 1: Configuration validation
    console.log('1️⃣ Testing SES configuration...');
    const configValid = await emailService.testConfiguration();
    
    if (configValid) {
      console.log('✅ SES configuration is valid');
    } else {
      console.log('❌ SES configuration failed');
      return;
    }

    // Test 2: Send test magic link email
    console.log('\n2️⃣ Sending test magic link email...');
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testMagicLink = 'https://example.com/auth/magic-link?token=test-token-123';
    
    await emailService.sendMagicLink(testEmail, testMagicLink);
    console.log(`✅ Test email sent successfully to ${testEmail}`);

    console.log('\n🎉 All tests passed! SES is ready for production.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify AWS credentials are set in environment variables');
    console.log('2. Check that SES is configured in your AWS account');
    console.log('3. Ensure the sender email is verified in SES');
    console.log('4. Check AWS region configuration');
  }
}

// Run the test
testEmailService().catch(console.error);
