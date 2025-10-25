import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/auth';
import { EmailService } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const emailService = new EmailService();

/**
 * POST /api/auth/magic-link
 * Send magic link email
 */
router.post('/magic-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    logger.info(`🔗 Magic link requested for: ${email}`);

    // Generate magic link token
    const magicToken = await generateToken({ 
      email, 
      id: 'temp', 
      role: 'JOB_SEEKER' 
    });

    logger.info(`🔗 Generated magic token for: ${email}`);

    // Clean up any existing unused magic links for this email
    await prisma.magicLink.deleteMany({
      where: {
        email,
        used: false
      }
    });

    logger.info(`🧹 Cleaned up existing magic links for: ${email}`);

    // Store magic link token with expiration (15 minutes)
    await prisma.magicLink.create({
      data: {
        email,
        token: magicToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        used: false
      }
    });

    logger.info(`💾 Stored magic link token for: ${email}`);

    // Generate magic link URL
    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/magic-link?token=${magicToken}`;
    
    logger.info(`🔗 Generated magic link URL for: ${email}`);

    try {
      // Send magic link email via Amazon SES
      await emailService.sendMagicLink(email, magicLink);
      
      logger.info(`✅ Magic link email sent successfully to ${email}`);
      
      res.json({
        message: 'Magic link sent successfully',
        // In development, also return the link for testing
        ...(process.env.NODE_ENV === 'development' && { magicLink })
      });
      
    } catch (emailError: any) {
      logger.error(`❌ Failed to send magic link email to ${email}:`, emailError);
      
      // Clean up the stored token since email failed
      await prisma.magicLink.deleteMany({
        where: {
          email,
          token: magicToken,
          used: false
        }
      });
      
      res.status(500).json({
        error: 'Failed to send magic link email',
        message: emailError.message
      });
    }
    
  } catch (error: any) {
    logger.error('❌ Magic link request failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/verify-magic-link
 * Verify magic link token and authenticate user
 */
router.post('/verify-magic-link', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required' 
      });
    }

    logger.info(`🔍 Verifying magic link token`);

    // Find the magic link token
    const magicLinkRecord = await prisma.magicLink.findUnique({
      where: { token }
    });

    if (!magicLinkRecord) {
      return res.status(400).json({ 
        error: 'Invalid or expired magic link' 
      });
    }

    // Check if already used
    if (magicLinkRecord.used) {
      return res.status(400).json({ 
        error: 'Magic link has already been used' 
      });
    }

    // Check if expired
    if (magicLinkRecord.expiresAt < new Date()) {
      return res.status(400).json({ 
        error: 'Magic link has expired' 
      });
    }

    logger.info(`✅ Magic link token is valid for: ${magicLinkRecord.email}`);

    // Mark as used
    await prisma.magicLink.update({
      where: { id: magicLinkRecord.id },
      data: { used: true }
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: magicLinkRecord.email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: magicLinkRecord.email,
          passwordHash: '', // No password needed for magic link auth
          role: 'JOB_SEEKER',
          firstName: '',
          lastName: '',
          verified: true
        }
      });
      
      logger.info(`👤 Created new user: ${user.email}`);
    } else {
      logger.info(`👤 Found existing user: ${user.email}`);
    }

    // Generate JWT token
    const authToken = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    logger.info(`🔑 Generated auth token for: ${user.email}`);

    res.json({
      message: 'Authentication successful',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error: any) {
    logger.error('❌ Magic link verification failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/check-magic-link
 * Check if magic link has been used (for polling)
 */
router.post('/check-magic-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Check if user has authenticated
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Check if there's a recent magic link that was used
      const recentMagicLink = await prisma.magicLink.findFirst({
        where: {
          email,
          used: true,
          expiresAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Within last 15 minutes
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      if (recentMagicLink) {
        // Generate new auth token
        const authToken = await generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        return res.json({
          authenticated: true,
          token: authToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }
    }

    res.json({ authenticated: false });

  } catch (error: any) {
    logger.error('❌ Magic link check failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/email-health
 * Check email service health
 */
router.get('/email-health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await emailService.testConfiguration();
    
    if (isHealthy) {
      res.json({ 
        status: 'healthy',
        message: 'Email service is working correctly'
      });
    } else {
      res.status(500).json({ 
        status: 'unhealthy',
        message: 'Email service configuration is invalid'
      });
    }
  } catch (error: any) {
    logger.error('❌ Email health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: error.message
    });
  }
});

export default router;