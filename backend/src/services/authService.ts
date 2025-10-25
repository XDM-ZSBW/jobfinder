import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create authentication token for user
   */
  async createAuthToken(user: { id: string; email: string; role: string }): Promise<string> {
    return await generateToken(user);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    try {
      // Validate email format
      if (!this.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.valid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as any
        }
      });

      // Generate token
      const token = this.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
