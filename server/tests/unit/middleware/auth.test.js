const { auth, optionalAuth } = require('../../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');

jest.mock('jsonwebtoken');
jest.mock('../../../models/User');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('auth middleware', () => {
    it('should authenticate valid token', async () => {
      const token = 'validtoken';
      const decoded = { _id: 'userId' };
      const mockUser = { _id: 'userId', username: 'testuser' };
      
      req.header.mockReturnValue(`Bearer ${token}`);
      jwt.verify.mockReturnValue(decoded);
      
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });
      
      await auth(req, res, next);
      
      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(jwt.verify).toHaveBeenCalledWith(token, 'testsecret');
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'userId' });
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(req.token).toBe(token);
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      req.header.mockReturnValue(undefined);
      
      await auth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please authenticate' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token without Bearer prefix', async () => {
      req.header.mockReturnValue('invalidtoken');
      
      await auth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please authenticate' });
    });

    it('should reject invalid token', async () => {
      req.header.mockReturnValue('Bearer invalidtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await auth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please authenticate' });
    });

    it('should reject token for non-existent user', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ _id: 'userId' });
      
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: mockSelect });
      
      await auth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please authenticate' });
    });

    it('should handle empty authorization header', async () => {
      req.header.mockReturnValue('');
      
      await auth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please authenticate' });
    });

    it('should handle Bearer with no token', async () => {
      req.header.mockReturnValue('Bearer ');
      
      await auth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please authenticate' });
    });
  });

  describe('optionalAuth middleware', () => {
    it('should authenticate valid token', async () => {
      const token = 'validtoken';
      const decoded = { _id: 'userId' };
      const mockUser = { _id: 'userId', username: 'testuser' };
      
      req.header.mockReturnValue(`Bearer ${token}`);
      jwt.verify.mockReturnValue(decoded);
      
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });
      
      await optionalAuth(req, res, next);
      
      expect(req.token).toBe(token);
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should continue without token', async () => {
      req.header.mockReturnValue(undefined);
      
      await optionalAuth(req, res, next);
      
      expect(req.token).toBeUndefined();
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should continue with invalid token', async () => {
      req.header.mockReturnValue('Bearer invalidtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await optionalAuth(req, res, next);
      
      expect(req.token).toBeUndefined();
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should continue when user not found', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ _id: 'userId' });
      
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: mockSelect });
      
      await optionalAuth(req, res, next);
      
      expect(req.token).toBeUndefined();
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ _id: 'userId' });
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      await optionalAuth(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});