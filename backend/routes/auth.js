const express = require('express');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const { Op } = require('sequelize');
const db = require('../models');
const { signupValidation, loginValidation } = require('../validators');
const { sendVerificationEmail } = require('../utils/mailer');

const router = express.Router();

// POST /api/auth/signup — register normal user/store owner/admin (with role)
router.post('/signup', signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = await db.User.create({
      name,
      email,
      password,
      address: address || null,
      role: role || 'user',
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/auth/login — validate credentials, return JWT
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username.' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Access denied: Selected role does not match user account role.' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/auth/forgot-password/send-code — send reset password verification code
router.post(
  '/forgot-password/send-code',
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Email not registered.' });
      }

      // Generate 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      user.verificationCode = code;
      user.verificationCodeExpires = expires;
      await user.save();

      await sendVerificationEmail(email, code, 'forgot_password');

      return res.status(200).json({
        message: 'Verification code sent to email.',
        code: code,
      });
    } catch (error) {
      console.error('Forgot password send-code error:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

// POST /api/auth/forgot-password/reset — verify reset code and set new password
router.post(
  '/forgot-password/reset',
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
    body('code').notEmpty().withMessage('Verification code is required.'),
    body('newPassword')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code, newPassword } = req.body;
      const user = await db.User.findOne({
        where: {
          email,
          verificationCode: code,
        },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification code.' });
      }

      if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
        return res.status(400).json({ message: 'Invalid or expired verification code.' });
      }

      user.password = newPassword;
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      await user.save();

      return res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
      console.error('Forgot password reset error:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

module.exports = router;
