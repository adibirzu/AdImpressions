import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests using JWT
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized - No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        email: string;
        role: string;
      };

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

/**
 * Middleware to check if user is an admin
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized - Not authenticated' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden - Admin access required' });
    return;
  }

  next();
}

/**
 * Optional authentication - doesn't fail if no token is provided
 */
export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        email: string;
        role: string;
      };

      req.user = decoded;
    } catch (error) {
      // Invalid token, but we don't fail the request
      console.warn('Invalid token provided:', error);
    }

    next();
  } catch (error) {
    next();
  }
}

/**
 * Generates a JWT token for a user
 */
export function generateToken(payload: {
  id: string;
  username: string;
  email: string;
  role: string;
}): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export default {
  authenticate,
  requireAdmin,
  optionalAuthenticate,
  generateToken
};
