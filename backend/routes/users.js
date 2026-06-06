const express = require('express');
const { validationResult } = require('express-validator');
const { Op, fn, col } = require('sequelize');
const db = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { createUserValidation, updatePasswordValidation } = require('../validators');
const { sendVerificationEmail } = require('../utils/mailer');

const router = express.Router();

// GET /api/users — admin only, list users with filters and sorting
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    if (role) {
      where.role = role;
    }

    const orderParam = sortOrder || req.query.order;
    const order = [];
    const allowedSortFields = ['name', 'email', 'role', 'createdAt'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      order.push([sortBy, orderParam === 'desc' ? 'DESC' : 'ASC']);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    const users = await db.User.findAll({
      where,
      order,
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/users/:id — admin only, user detail
router.get('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = user.toJSON();

    // If user is store_owner, include their store's average rating
    if (user.role === 'store_owner') {
      const store = await db.Store.findOne({
        where: { owner_id: user.id },
        include: [
          {
            model: db.Rating,
            as: 'ratings',
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [fn('AVG', col('ratings.rating')), 'averageRating'],
            [fn('COUNT', col('ratings.id')), 'totalRatings'],
          ],
        },
        group: ['Store.id'],
      });

      if (store) {
        userData.store = {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating: store.getDataValue('averageRating')
            ? parseFloat(parseFloat(store.getDataValue('averageRating')).toFixed(2))
            : null,
          totalRatings: parseInt(store.getDataValue('totalRatings')) || 0,
        };
      }
    }

    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error('Get user detail error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/users — admin only, create user with any role
router.post('/', auth, roleCheck('admin'), createUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = await db.User.create({
      name,
      email,
      password,
      address: address || null,
      role,
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/users/password/send-code — authenticated, send verification code to change password
router.post('/password/send-code', auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.verificationCode = code;
    user.verificationCodeExpires = expires;
    await user.save();

    await sendVerificationEmail(user.email, code, 'change_password');

    return res.status(200).json({
      message: 'Verification code sent to email.',
      code: code,
    });
  } catch (error) {
    console.error('Send change-password code error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/users/password — authenticated, update own password
router.put('/password', auth, updatePasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword, code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify verification code
    if (user.verificationCode !== code || !user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
