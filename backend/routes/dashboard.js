const express = require('express');
const { fn, col } = require('sequelize');
const db = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/dashboard/admin — admin only
router.get('/admin', auth, roleCheck('admin'), async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const totalStores = await db.Store.count();
    const totalRatings = await db.Rating.count();

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/dashboard/store-owner — store_owner only
router.get('/store-owner', auth, roleCheck('store_owner'), async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const orderParam = sortOrder || req.query.order || 'desc';

    // Find the store owned by this user
    const store = await db.Store.findOne({
      where: { owner_id: req.user.id },
    });

    if (!store) {
      return res.status(404).json({ message: 'You do not own any store.' });
    }

    // Get average rating and total ratings
    const ratingStats = await db.Rating.findOne({
      where: { store_id: store.id },
      attributes: [
        [fn('AVG', col('rating')), 'averageRating'],
        [fn('COUNT', col('id')), 'totalRatings'],
      ],
      raw: true,
    });

    // Build sorting order
    const order = [];
    if (sortBy === 'name') {
      order.push([{ model: db.User, as: 'user' }, 'name', orderParam === 'desc' ? 'DESC' : 'ASC']);
    } else if (sortBy === 'email') {
      order.push([{ model: db.User, as: 'user' }, 'email', orderParam === 'desc' ? 'DESC' : 'ASC']);
    } else if (sortBy === 'rating') {
      order.push(['rating', orderParam === 'desc' ? 'DESC' : 'ASC']);
    } else {
      order.push(['createdAt', orderParam === 'desc' ? 'DESC' : 'ASC']);
    }

    // Get list of users who rated with their details
    const ratings = await db.Rating.findAll({
      where: { store_id: store.id },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
      attributes: ['id', 'rating', 'createdAt'],
      order,
    });

    const ratingsList = ratings.map((r) => ({
      id: r.id,
      name: r.user.name,
      email: r.user.email,
      rating: r.rating,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
      },
      averageRating: ratingStats.averageRating
        ? parseFloat(parseFloat(ratingStats.averageRating).toFixed(2))
        : null,
      totalRatings: parseInt(ratingStats.totalRatings) || 0,
      ratings: ratingsList,
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
