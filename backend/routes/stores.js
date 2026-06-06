const express = require('express');
const { validationResult } = require('express-validator');
const { Op, fn, col, literal } = require('sequelize');
const db = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { createStoreValidation } = require('../validators');

const router = express.Router();

// GET /api/stores — authenticated, list all stores with avg rating
router.get('/', auth, async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    // Build the query
    const includeOptions = [
      {
        model: db.Rating,
        as: 'ratings',
        attributes: [],
      },
    ];

    const attributes = {
      include: [
        [fn('AVG', col('ratings.rating')), 'averageRating'],
        [fn('COUNT', col('ratings.id')), 'totalRatings'],
      ],
    };

    const orderParam = sortOrder || req.query.order;
    const order = [];
    const allowedSortFields = ['name', 'email', 'createdAt'];
    if (sortBy === 'averageRating') {
      order.push([literal('averageRating'), orderParam === 'desc' ? 'DESC' : 'ASC']);
    } else if (sortBy && allowedSortFields.includes(sortBy)) {
      order.push([sortBy, orderParam === 'desc' ? 'DESC' : 'ASC']);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    const stores = await db.Store.findAll({
      where,
      include: includeOptions,
      attributes,
      group: ['Store.id'],
      order,
      subQuery: false,
    });

    // Format result
    let result = stores.map((store) => {
      const storeData = store.toJSON();
      storeData.averageRating = storeData.averageRating
        ? parseFloat(parseFloat(storeData.averageRating).toFixed(2))
        : null;
      storeData.totalRatings = parseInt(storeData.totalRatings) || 0;
      return storeData;
    });

    // If requester is a normal user, include their submitted rating for each store
    if (req.user.role === 'user') {
      const storeIds = result.map((s) => s.id);
      const userRatings = await db.Rating.findAll({
        where: {
          user_id: req.user.id,
          store_id: { [Op.in]: storeIds },
        },
      });

      const ratingMap = {};
      userRatings.forEach((r) => {
        ratingMap[r.store_id] = { id: r.id, rating: r.rating };
      });

      result = result.map((store) => ({
        ...store,
        userRating: ratingMap[store.id] || null,
      }));
    }

    return res.status(200).json({ stores: result });
  } catch (error) {
    console.error('Get stores error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/stores — admin only, create store
router.post('/', auth, roleCheck('admin'), createStoreValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, owner_id } = req.body;

    // If owner_id is provided, validate the user exists and is a store_owner
    if (owner_id) {
      const owner = await db.User.findByPk(owner_id);
      if (!owner) {
        return res.status(404).json({ message: 'Owner user not found.' });
      }
      if (owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'Owner must have role store_owner.' });
      }

      // Check if this owner already has a store
      const existingStore = await db.Store.findOne({ where: { owner_id } });
      if (existingStore) {
        return res.status(409).json({ message: 'This store owner already has a store.' });
      }
    }

    const store = await db.Store.create({
      name,
      email,
      address: address || null,
      owner_id: owner_id || null,
    });

    return res.status(201).json({
      message: 'Store created successfully.',
      store,
    });
  } catch (error) {
    console.error('Create store error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
