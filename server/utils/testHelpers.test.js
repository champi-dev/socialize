const { generateTestToken, createMockRequest, createMockResponse } = require('./testHelpers');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Test Helpers', () => {
  describe('generateTestToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = new mongoose.Types.ObjectId();
      const token = generateTestToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
      expect(decoded._id).toBe(userId.toString());
      expect(decoded.username).toBe('testuser');
    });

    it('should use default userId if not provided', () => {
      const token = generateTestToken();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
      expect(decoded._id).toBeDefined();
      expect(decoded.username).toBe('testuser');
    });

    it('should set expiration', () => {
      const token = generateTestToken();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(86400); // 1 day in seconds
    });
  });

  describe('createMockRequest', () => {
    it('should create request with default properties', () => {
      const req = createMockRequest();
      
      expect(req.body).toEqual({});
      expect(req.params).toEqual({});
      expect(req.query).toEqual({});
      expect(req.headers).toEqual({});
      expect(req.header).toBeDefined();
      expect(typeof req.header).toBe('function');
    });

    it('should override default properties', () => {
      const req = createMockRequest({
        body: { test: 'data' },
        params: { id: '123' },
        custom: 'value'
      });
      
      expect(req.body).toEqual({ test: 'data' });
      expect(req.params).toEqual({ id: '123' });
      expect(req.query).toEqual({});
      expect(req.custom).toBe('value');
    });

    it('should preserve header mock function', () => {
      const customHeader = jest.fn().mockReturnValue('test-value');
      const req = createMockRequest({ header: customHeader });
      
      const result = req.header('test');
      expect(customHeader).toHaveBeenCalledWith('test');
      expect(result).toBe('test-value');
    });
  });

  describe('createMockResponse', () => {
    it('should create response with chainable methods', () => {
      const res = createMockResponse();
      
      expect(res.status).toBeDefined();
      expect(res.json).toBeDefined();
      expect(res.send).toBeDefined();
      expect(res.set).toBeDefined();
    });

    it('should allow method chaining', () => {
      const res = createMockResponse();
      
      const result = res.status(200).json({ success: true });
      
      expect(result).toBe(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should track method calls', () => {
      const res = createMockResponse();
      
      res.status(404);
      res.json({ error: 'Not found' });
      res.send('text');
      res.set('X-Custom-Header', 'value');
      
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
      expect(res.send).toHaveBeenCalledWith('text');
      expect(res.set).toHaveBeenCalledWith('X-Custom-Header', 'value');
    });
  });
});