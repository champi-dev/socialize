const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateTestToken = (userId = new mongoose.Types.ObjectId()) => {
  return jwt.sign(
    { _id: userId.toString(), username: 'testuser' },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1d' }
  );
};

const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    header: jest.fn(),
    ...overrides
  };
};

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis()
  };
  return res;
};

module.exports = {
  generateTestToken,
  createMockRequest,
  createMockResponse
};