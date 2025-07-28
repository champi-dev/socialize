const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');

describe('Auth Integration Tests', () => {
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject duplicate username', async () => {
      const user = new User({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Existing User'
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('Username already taken');
    });

    it('should reject duplicate email', async () => {
      const user = new User({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Existing User'
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: '12345'
        })
        .expect(400);

      expect(response.body.error).toBe('Email already in use');
    });

    it('should validate input fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: 'invalid-email',
          password: '12345'
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      await testUser.save();
    });

    it('should login with email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should login with username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'testuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should update lastActive on login', async () => {
      const beforeLogin = testUser.lastActive;

      await request(app)
        .post('/api/auth/login')
        .send({
          login: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastActive.getTime()).toBeGreaterThan(beforeLogin.getTime());
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      await user.save();
      token = user.generateAuthToken();
    });

    it('should get current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });

  describe('PATCH /api/auth/profile', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      await user.save();
      token = user.generateAuthToken();
    });

    it('should update profile', async () => {
      const updates = {
        displayName: 'Updated Name',
        bio: 'New bio',
        isPrivate: true
      };

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body.displayName).toBe(updates.displayName);
      expect(response.body.bio).toBe(updates.bio);
      expect(response.body.isPrivate).toBe(updates.isPrivate);
    });

    it('should require authentication', async () => {
      await request(app)
        .patch('/api/auth/profile')
        .send({ displayName: 'New Name' })
        .expect(401);
    });

    it('should validate input', async () => {
      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'a'.repeat(161)
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });
});