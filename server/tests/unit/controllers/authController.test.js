const { register, login, getMe, updateProfile } = require('../../../controllers/authController');
const User = require('../../../models/User');
const { validationResult } = require('express-validator');

jest.mock('../../../models/User');
jest.mock('express-validator');

describe('Auth Controller', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      user: { _id: 'testUserId' },
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    beforeEach(() => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn()
      });
    });

    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      };
      
      req.body = userData;
      
      const mockUser = {
        ...userData,
        _id: 'userId',
        save: jest.fn(),
        generateAuthToken: jest.fn().mockReturnValue('token123')
      };
      
      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      
      await register(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: userData.email }, { username: userData.username }]
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        token: 'token123'
      });
    });

    it('should use username as displayName if not provided', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        save: jest.fn(),
        generateAuthToken: jest.fn().mockReturnValue('token123')
      };
      
      User.findOne.mockResolvedValue(null);
      User.mockImplementation((data) => {
        expect(data.displayName).toBe('testuser');
        return mockUser;
      });
      
      await register(req, res);
    });

    it('should return validation errors', async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid input' }])
      });
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ msg: 'Invalid input' }]
      });
    });

    it('should handle existing email', async () => {
      req.body = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email already in use'
      });
    });

    it('should handle existing username', async () => {
      req.body = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue({ username: 'existinguser' });
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username already taken'
      });
    });

    it('should handle server errors', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn()
      });
    });

    it('should login with email successfully', async () => {
      req.body = {
        login: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        generateAuthToken: jest.fn().mockReturnValue('token123'),
        save: jest.fn()
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      await login(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { username: 'test@example.com' }]
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        token: 'token123'
      });
    });

    it('should login with username successfully', async () => {
      req.body = {
        login: 'testuser',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'userId',
        username: 'testuser',
        comparePassword: jest.fn().mockResolvedValue(true),
        generateAuthToken: jest.fn().mockReturnValue('token123'),
        save: jest.fn()
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      await login(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'testuser' }, { username: 'testuser' }]
      });
    });

    it('should return validation errors', async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid input' }])
      });
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ msg: 'Invalid input' }]
      });
    });

    it('should handle invalid user', async () => {
      req.body = {
        login: 'nonexistent',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue(null);
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle invalid password', async () => {
      req.body = {
        login: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle server errors', async () => {
      req.body = {
        login: 'test@example.com',
        password: 'password123'
      };
      
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getMe', () => {
    it('should get current user with populated fields', async () => {
      const mockUser = {
        _id: 'userId',
        username: 'testuser',
        followers: [],
        following: []
      };
      
      const mockPopulate = jest.fn().mockReturnThis();
      
      User.findById.mockReturnValue({
        populate: mockPopulate
      });
      
      mockPopulate.mockResolvedValue(mockUser);
      
      await getMe(req, res);
      
      expect(User.findById).toHaveBeenCalledWith('testUserId');
      expect(mockPopulate).toHaveBeenCalledWith('followers', 'username displayName avatar');
      expect(mockPopulate).toHaveBeenCalledWith('following', 'username displayName avatar');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle server errors', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis().mockRejectedValue(new Error('Database error'))
      });
      
      await getMe(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('updateProfile', () => {
    beforeEach(() => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn()
      });
    });

    it('should update profile successfully', async () => {
      req.body = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
        avatar: 'https://example.com/avatar.jpg',
        coverImage: 'https://example.com/cover.jpg',
        isPrivate: true
      };
      
      const mockUser = {
        _id: 'userId',
        ...req.body
      };
      
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      
      await updateProfile(req, res);
      
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'testUserId',
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should only update provided fields', async () => {
      req.body = {
        displayName: 'Updated Name',
        randomField: 'should be ignored'
      };
      
      const mockUser = { _id: 'userId' };
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      
      await updateProfile(req, res);
      
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'testUserId',
        { displayName: 'Updated Name' },
        { new: true, runValidators: true }
      );
    });

    it('should handle undefined fields', async () => {
      req.body = {
        displayName: 'Updated Name',
        bio: undefined
      };
      
      const mockUser = { _id: 'userId' };
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      
      await updateProfile(req, res);
      
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'testUserId',
        { displayName: 'Updated Name' },
        { new: true, runValidators: true }
      );
    });

    it('should return validation errors', async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid input' }])
      });
      
      await updateProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ msg: 'Invalid input' }]
      });
    });

    it('should handle server errors', async () => {
      req.body = { displayName: 'Updated Name' };
      User.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
      
      await updateProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});