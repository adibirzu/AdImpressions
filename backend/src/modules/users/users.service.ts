import { db } from '../../config/database';
import { User, UserPublic, RegisterDTO, LoginDTO, UpdateUserDTO } from './users.types';
import { generateId, isValidEmail } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export class UsersService {
  /**
   * Convert User to UserPublic (remove password_hash)
   */
  private toPublicUser(user: User): UserPublic {
    const { password_hash, ...publicUser } = user;
    return publicUser;
  }

  /**
   * Get all users
   */
  getAllUsers(): UserPublic[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const users = stmt.all() as User[];
    return users.map(user => this.toPublicUser(user));
  }

  /**
   * Get a user by ID
   */
  getUserById(id: string): UserPublic | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Get a user by email (internal use)
   */
  private getUserByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | undefined;
    return user || null;
  }

  /**
   * Get a user by username (internal use)
   */
  private getUserByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    return user || null;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<UserPublic> {
    // Validate input
    if (!data.username || !data.email || !data.password) {
      throw new AppError('Username, email, and password are required', 400);
    }

    if (!isValidEmail(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    if (data.password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const existingEmail = this.getUserByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email already registered', 400);
    }

    const existingUsername = this.getUserByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username already taken', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.username, data.email, passwordHash, 'user', now, now);

    const user = this.getUserById(id);
    if (!user) {
      throw new AppError('Failed to create user', 500);
    }

    return user;
  }

  /**
   * Login a user
   */
  async login(data: LoginDTO): Promise<User> {
    if (!data.email || !data.password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = this.getUserByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    return user;
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: UpdateUserDTO): Promise<UserPublic> {
    const existingUser = this.getUserById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.username !== undefined) {
      // Check if username is already taken by another user
      const userWithUsername = this.getUserByUsername(data.username);
      if (userWithUsername && userWithUsername.id !== id) {
        throw new AppError('Username already taken', 400);
      }
      updates.push('username = ?');
      params.push(data.username);
    }

    if (data.email !== undefined) {
      if (!isValidEmail(data.email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Check if email is already taken by another user
      const userWithEmail = this.getUserByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new AppError('Email already registered', 400);
      }

      updates.push('email = ?');
      params.push(data.email);
    }

    if (data.password !== undefined) {
      if (data.password.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400);
      }
      const passwordHash = await bcrypt.hash(data.password, 10);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return existingUser;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    const updatedUser = this.getUserById(id);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return updatedUser;
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): void {
    const user = this.getUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): {
    totalVotes: number;
    averageRating: number;
  } {
    const stmt = db.prepare(`
      SELECT COUNT(*) as total_votes, AVG(rating) as average_rating
      FROM votes
      WHERE user_id = ?
    `);

    const result = stmt.get(userId) as { total_votes: number; average_rating: number | null };

    return {
      totalVotes: result.total_votes || 0,
      averageRating: result.average_rating ? Math.round(result.average_rating * 100) / 100 : 0
    };
  }
}

export default new UsersService();
