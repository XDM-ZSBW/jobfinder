import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import { generateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const result = await authService.login(email, password);
    
    res.json({
      message: 'Login successful',
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({ 
      error: 'Invalid credentials',
      message: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role
    });
    
    res.status(201).json({
      message: 'Registration successful',
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({ 
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

// Send magic link endpoint
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Validate email format
    if (!authService.validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Generate magic link token
    const magicToken = await generateToken({ 
      email, 
      id: 'temp', 
      role: 'JOB_SEEKER' 
    });

    // Clean up any existing unused magic links for this email
    await prisma.magicLink.deleteMany({
      where: {
        email,
        used: false
      }
    });

    // Store magic link token with expiration (15 minutes)
    await prisma.magicLink.create({
      data: {
        email,
        token: magicToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        used: false
      }
    });

    // Generate magic link URL
    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/magic-link?token=${magicToken}`;
    
    try {
      // Send magic link email via Amazon SES
      await emailService.sendMagicLink(email, magicLink);
      
      logger.info(`Magic link email sent successfully to ${email}`);
      
      res.json({
        message: 'Magic link sent successfully',
        // In development, also return the link for testing
        ...(process.env.NODE_ENV === 'development' && { magicLink })
      });
    } catch (emailError) {
      logger.error('Failed to send magic link email:', emailError);
      
      // Still return success but log the error
      res.json({
        message: 'Magic link sent successfully',
        warning: 'Email delivery may be delayed',
        // In development, return the link for testing
        ...(process.env.NODE_ENV === 'development' && { magicLink })
      });
    }
  } catch (error) {
    logger.error('Magic link error:', error);
    res.status(500).json({ 
      error: 'Failed to send magic link',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify magic link endpoint
router.post('/verify-magic-link', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required' 
      });
    }

    // Find magic link token
    const magicLink = await prisma.magicLink.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!magicLink) {
      return res.status(400).json({ 
        error: 'Invalid or expired magic link' 
      });
    }

    // Mark token as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { used: true }
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: magicLink.email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: magicLink.email,
          passwordHash: '', // No password needed for magic link auth
          firstName: 'User',
          lastName: 'Name',
          role: 'JOB_SEEKER'
        }
      });
    }

    // Generate auth token
    const authToken = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Authentication successful',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Magic link verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify magic link',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check magic link status endpoint
router.post('/check-magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Check if user has authenticated recently
    const recentAuth = await prisma.magicLink.findFirst({
      where: {
        email,
        used: true,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (recentAuth) {
      // User has authenticated, get their token
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        const authToken = await generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        return res.json({
          authenticated: true,
          token: authToken
        });
      }
    }

    res.json({
      authenticated: false
    });
  } catch (error) {
    logger.error('Check magic link error:', error);
    res.status(500).json({ 
      error: 'Failed to check magic link status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for email service
router.get('/email-health', async (req, res) => {
  try {
    const configValid = await emailService.testConfiguration();
    
    if (configValid) {
      res.json({
        status: 'healthy',
        service: 'email',
        provider: 'amazon-ses',
        region: process.env.SES_REGION || 'us-west-2',
        fromEmail: process.env.SES_FROM_EMAIL || 'admin@futurelink.zip'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'email',
        error: 'SES configuration invalid'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
