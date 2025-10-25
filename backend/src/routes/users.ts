import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        hiringManagerProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For Chrome extension, we need resume text
    let resumeText = '';
    if (user.jobSeekerProfile?.summary) {
      resumeText = user.jobSeekerProfile.summary;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      resume: resumeText,
      profile: user.jobSeekerProfile || user.hiringManagerProfile
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, resume, skills, location } = req.body;

    // Update basic user info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined
      }
    });

    // Update job seeker profile if user is a job seeker
    if (updatedUser.role === 'JOB_SEEKER') {
      await prisma.jobSeekerProfile.upsert({
        where: { userId },
        update: {
          summary: resume || undefined,
          skills: skills || undefined,
          location: location || undefined
        },
        create: {
          userId,
          summary: resume || '',
          skills: skills || [],
          location: location || ''
        }
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role
      }
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
