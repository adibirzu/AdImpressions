import { Request, Response } from 'express';
import usersService from './users.service';
import { RegisterDTO, LoginDTO, UpdateUserDTO } from './users.types';
import { AuthRequest } from '../../middleware/auth';
import { generateToken } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export class UsersController {
  /**
   * POST /api/users/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDTO = req.body;
      const user = await usersService.register(data);
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/users/login
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDTO = req.body;
      const user = await usersService.login(data);

      const publicUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      const token = generateToken(publicUser);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: publicUser,
          token
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/me
   * Get current user profile
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = usersService.getUserById(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const stats = usersService.getUserStats(req.user.id);

      res.json({
        success: true,
        data: {
          ...user,
          stats
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/users/me
   * Update current user profile
   */
  async updateCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const data: UpdateUserDTO = req.body;
      const user = await usersService.updateUser(req.user.id, data);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = usersService.getAllUsers();

      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/:id
   * Get a user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = usersService.getUserById(id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const stats = usersService.getUserStats(id);

      res.json({
        success: true,
        data: {
          ...user,
          stats
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete a user (admin only)
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      usersService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/:id/profile
   * Get user profile (public)
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const profileData = usersService.getUserProfile(id);

      res.json({
        success: true,
        data: profileData
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/:id/votes
   * Get user's voting history
   */
  async getUserVotes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = usersService.getUserVotingHistory(id, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/me/stats
   * Get current user's stats
   */
  async getMyStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const stats = usersService.getFullUserStats(req.user.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new UsersController();
