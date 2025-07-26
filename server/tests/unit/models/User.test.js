const mongoose = require('mongoose');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      };
      
      const user = new User(userData);
      const error = user.validateSync();
      expect(error).toBeUndefined();
    });

    it('should require username', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const error = user.validateSync();
      expect(error.errors.username).toBeDefined();
    });

    it('should require email', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123'
      });
      
      const error = user.validateSync();
      expect(error.errors.email).toBeDefined();
    });

    it('should require password', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com'
      });
      
      const error = user.validateSync();
      expect(error.errors.password).toBeDefined();
    });

    it('should validate email format', () => {
      const user = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      });
      
      const error = user.validateSync();
      expect(error.errors.email).toBeDefined();
    });

    it('should validate username format', () => {
      const user = new User({
        username: 'test@user',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const error = user.validateSync();
      expect(error.errors.username).toBeDefined();
    });

    it('should enforce username length constraints', () => {
      const shortUsername = new User({
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const longUsername = new User({
        username: 'a'.repeat(31),
        email: 'test2@example.com',
        password: 'password123'
      });
      
      expect(shortUsername.validateSync().errors.username).toBeDefined();
      expect(longUsername.validateSync().errors.username).toBeDefined();
    });

    it('should enforce password length constraints', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      });
      
      const error = user.validateSync();
      expect(error.errors.password).toBeDefined();
    });

    it('should set default values', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      
      expect(user.bio).toBe('');
      expect(user.avatar).toBeNull();
      expect(user.coverImage).toBeNull();
      expect(user.followers).toEqual([]);
      expect(user.following).toEqual([]);
      expect(user.isVerified).toBe(false);
      expect(user.isPrivate).toBe(false);
      expect(user.createdAt).toBeDefined();
      expect(user.lastActive).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      
      const plainPassword = user.password;
      await user.save();
      
      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/);
    });

    it('should not rehash password if not modified', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      
      await user.save();
      const hashedPassword = user.password;
      
      user.bio = 'Updated bio';
      await user.save();
      
      expect(user.password).toBe(hashedPassword);
    });
  });

  describe('Methods', () => {
    let user;
    
    beforeEach(async () => {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      await user.save();
    });

    describe('comparePassword', () => {
      it('should return true for correct password', async () => {
        const isMatch = await user.comparePassword('password123');
        expect(isMatch).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const isMatch = await user.comparePassword('wrongpassword');
        expect(isMatch).toBe(false);
      });
    });

    describe('generateAuthToken', () => {
      it('should generate valid JWT token', () => {
        process.env.JWT_SECRET = 'testsecret';
        const token = user.generateAuthToken();
        
        expect(token).toBeDefined();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded._id).toBe(user._id.toString());
        expect(decoded.username).toBe(user.username);
      });

      it('should set expiration', () => {
        process.env.JWT_SECRET = 'testsecret';
        process.env.JWT_EXPIRE = '7d';
        const token = user.generateAuthToken();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.exp).toBeDefined();
      });
    });

    describe('toJSON', () => {
      it('should exclude password from JSON output', () => {
        const userJSON = user.toJSON();
        expect(userJSON.password).toBeUndefined();
        expect(userJSON.username).toBe(user.username);
        expect(userJSON.email).toBe(user.email);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle bcrypt errors in pre-save hook', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      
      jest.spyOn(bcrypt, 'genSalt').mockRejectedValueOnce(new Error('Bcrypt error'));
      
      await expect(user.save()).rejects.toThrow('Bcrypt error');
    });
  });
});