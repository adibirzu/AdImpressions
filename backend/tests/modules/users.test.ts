import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { UsersService } from '../../src/modules/users/users.service';
import { setupTestDatabase, clearTestData, createTestUser, createTestAd, createTestVote } from '../setup';
import { AppError } from '../../src/middleware/errorHandler';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {} as Database.Database
}));

describe('UsersService', () => {
  let testDb: Database.Database;
  let usersService: UsersService;

  beforeAll(() => {
    testDb = setupTestDatabase();
    // Replace the db import with our test database
    const dbModule = require('../../src/config/database');
    dbModule.db = testDb;
    usersService = new UsersService();
  });

  beforeEach(() => {
    clearTestData(testDb);
  });

  afterAll(() => {
    testDb.close();
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await usersService.register(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should hash the password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await usersService.register(userData);

      const dbUser = testDb
        .prepare('SELECT * FROM users WHERE username = ?')
        .get('testuser') as any;

      expect(dbUser.password_hash).toBeDefined();
      expect(dbUser.password_hash).not.toBe('password123');

      const isValid = await bcrypt.compare('password123', dbUser.password_hash);
      expect(isValid).toBe(true);
    });

    it('should throw error if username is missing', async () => {
      const userData = {
        username: '',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(usersService.register(userData)).rejects.toThrow(AppError);
      await expect(usersService.register(userData)).rejects.toThrow('required');
    });

    it('should throw error if email is missing', async () => {
      const userData = {
        username: 'testuser',
        email: '',
        password: 'password123'
      };

      await expect(usersService.register(userData)).rejects.toThrow(AppError);
    });

    it('should throw error if password is missing', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: ''
      };

      await expect(usersService.register(userData)).rejects.toThrow(AppError);
    });

    it('should throw error for invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(usersService.register(userData)).rejects.toThrow(AppError);
      await expect(usersService.register(userData)).rejects.toThrow('Invalid email format');
    });

    it('should throw error for password shorter than 6 characters', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      };

      await expect(usersService.register(userData)).rejects.toThrow(AppError);
      await expect(usersService.register(userData)).rejects.toThrow('at least 6 characters');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await usersService.register(userData);

      const duplicateUser = {
        username: 'differentuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(usersService.register(duplicateUser)).rejects.toThrow(AppError);
      await expect(usersService.register(duplicateUser)).rejects.toThrow('Email already registered');
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await usersService.register(userData);

      const duplicateUser = {
        username: 'testuser',
        email: 'different@example.com',
        password: 'password123'
      };

      await expect(usersService.register(duplicateUser)).rejects.toThrow(AppError);
      await expect(usersService.register(duplicateUser)).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await usersService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await usersService.login(loginData);

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      await expect(usersService.login(loginData)).rejects.toThrow(AppError);
      await expect(usersService.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(usersService.login(loginData)).rejects.toThrow(AppError);
      await expect(usersService.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if email is missing', async () => {
      const loginData = {
        email: '',
        password: 'password123'
      };

      await expect(usersService.login(loginData)).rejects.toThrow(AppError);
      await expect(usersService.login(loginData)).rejects.toThrow('required');
    });

    it('should throw error if password is missing', async () => {
      const loginData = {
        email: 'test@example.com',
        password: ''
      };

      await expect(usersService.login(loginData)).rejects.toThrow(AppError);
    });
  });

  describe('getUserById', () => {
    it('should retrieve an existing user', () => {
      const testUser = createTestUser(testDb, { username: 'findme' });

      const user = usersService.getUserById(testUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUser.id);
      expect(user?.username).toBe('findme');
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should return null for non-existent user', () => {
      const user = usersService.getUserById('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    beforeEach(() => {
      createTestUser(testDb, { username: 'user1', email: 'user1@test.com' });
      createTestUser(testDb, { username: 'user2', email: 'user2@test.com' });
      createTestUser(testDb, { username: 'user3', email: 'user3@test.com' });
    });

    it('should retrieve all users', () => {
      const users = usersService.getAllUsers();

      expect(users).toHaveLength(3);
    });

    it('should not include password_hash in results', () => {
      const users = usersService.getAllUsers();

      users.forEach(user => {
        expect(user).not.toHaveProperty('password_hash');
      });
    });

    it('should return users ordered by created_at DESC', () => {
      const users = usersService.getAllUsers();

      expect(users[0].username).toBe('user3');
    });
  });

  describe('updateUser', () => {
    it('should update username', async () => {
      const user = createTestUser(testDb, { username: 'oldname' });

      const updatedUser = await usersService.updateUser(user.id, { username: 'newname' });

      expect(updatedUser.username).toBe('newname');
    });

    it('should update email', async () => {
      const user = createTestUser(testDb, { email: 'old@test.com' });

      const updatedUser = await usersService.updateUser(user.id, { email: 'new@test.com' });

      expect(updatedUser.email).toBe('new@test.com');
    });

    it('should update password', async () => {
      const user = createTestUser(testDb);

      await usersService.updateUser(user.id, { password: 'newpassword123' });

      const dbUser = testDb.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
      const isValid = await bcrypt.compare('newpassword123', dbUser.password_hash);

      expect(isValid).toBe(true);
    });

    it('should throw error for invalid email format', async () => {
      const user = createTestUser(testDb);

      await expect(
        usersService.updateUser(user.id, { email: 'invalid-email' })
      ).rejects.toThrow(AppError);
      await expect(
        usersService.updateUser(user.id, { email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');
    });

    it('should throw error for password shorter than 6 characters', async () => {
      const user = createTestUser(testDb);

      await expect(
        usersService.updateUser(user.id, { password: '12345' })
      ).rejects.toThrow(AppError);
      await expect(
        usersService.updateUser(user.id, { password: '12345' })
      ).rejects.toThrow('at least 6 characters');
    });

    it('should throw error if username is already taken by another user', async () => {
      const user1 = createTestUser(testDb, { username: 'user1' });
      const user2 = createTestUser(testDb, { username: 'user2' });

      await expect(
        usersService.updateUser(user2.id, { username: 'user1' })
      ).rejects.toThrow(AppError);
      await expect(
        usersService.updateUser(user2.id, { username: 'user1' })
      ).rejects.toThrow('Username already taken');
    });

    it('should throw error if email is already taken by another user', async () => {
      const user1 = createTestUser(testDb, { email: 'user1@test.com' });
      const user2 = createTestUser(testDb, { email: 'user2@test.com' });

      await expect(
        usersService.updateUser(user2.id, { email: 'user1@test.com' })
      ).rejects.toThrow(AppError);
      await expect(
        usersService.updateUser(user2.id, { email: 'user1@test.com' })
      ).rejects.toThrow('Email already registered');
    });

    it('should allow updating to same username/email', async () => {
      const user = createTestUser(testDb, { username: 'testuser', email: 'test@test.com' });

      const updatedUser = await usersService.updateUser(user.id, {
        username: 'testuser',
        email: 'test@test.com'
      });

      expect(updatedUser.username).toBe('testuser');
      expect(updatedUser.email).toBe('test@test.com');
    });

    it('should throw error when updating non-existent user', async () => {
      await expect(
        usersService.updateUser('non-existent-id', { username: 'newname' })
      ).rejects.toThrow(AppError);
      await expect(
        usersService.updateUser('non-existent-id', { username: 'newname' })
      ).rejects.toThrow('User not found');
    });

    it('should return unchanged user when no updates provided', async () => {
      const user = createTestUser(testDb, { username: 'testuser' });

      const updatedUser = await usersService.updateUser(user.id, {});

      expect(updatedUser.username).toBe('testuser');
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', () => {
      const user = createTestUser(testDb);

      usersService.deleteUser(user.id);

      const deletedUser = usersService.getUserById(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should throw error when deleting non-existent user', () => {
      expect(() => usersService.deleteUser('non-existent-id')).toThrow(AppError);
      expect(() => usersService.deleteUser('non-existent-id')).toThrow('User not found');
    });

    it('should set user_id to null in votes when user is deleted', () => {
      const user = createTestUser(testDb);
      const ad = createTestAd(testDb);
      createTestVote(testDb, { ad_id: ad.id, user_id: user.id, rating: 5 });

      usersService.deleteUser(user.id);

      const vote = testDb.prepare('SELECT * FROM votes WHERE ad_id = ?').get(ad.id) as any;
      expect(vote.user_id).toBeNull();
    });
  });

  describe('getUserStats', () => {
    it('should calculate correct user statistics', () => {
      const user = createTestUser(testDb);
      const ad1 = createTestAd(testDb);
      const ad2 = createTestAd(testDb);

      createTestVote(testDb, { ad_id: ad1.id, user_id: user.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad2.id, user_id: user.id, rating: 3 });

      const stats = usersService.getUserStats(user.id);

      expect(stats.totalVotes).toBe(2);
      expect(stats.averageRating).toBe(4); // (5 + 3) / 2 = 4
    });

    it('should return zero stats for user with no votes', () => {
      const user = createTestUser(testDb);

      const stats = usersService.getUserStats(user.id);

      expect(stats.totalVotes).toBe(0);
      expect(stats.averageRating).toBe(0);
    });

    it('should only count votes by the specific user', () => {
      const user1 = createTestUser(testDb);
      const user2 = createTestUser(testDb);
      const ad = createTestAd(testDb);

      createTestVote(testDb, { ad_id: ad.id, user_id: user1.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad.id, user_id: user2.id, rating: 3 });

      const stats = usersService.getUserStats(user1.id);

      expect(stats.totalVotes).toBe(1);
      expect(stats.averageRating).toBe(5);
    });
  });
});
