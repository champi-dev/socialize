const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().isLength({ max: 50 })
], register);

router.post('/login', [
  body('login').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', auth, getMe);

router.patch('/profile', auth, [
  body('displayName').optional().isLength({ max: 50 }),
  body('bio').optional().isLength({ max: 160 }),
  body('avatar').optional().isURL(),
  body('coverImage').optional().isURL(),
  body('isPrivate').optional().isBoolean()
], updateProfile);

module.exports = router;