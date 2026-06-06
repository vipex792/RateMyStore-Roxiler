const express = require('express');
const { validationResult } = require('express-validator');
const db = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { submitRatingValidation, updateRatingValidation } = require('../validators');

const router = express.Router();

// POST /api/ratings — normal user only, create rating
router.post('/', auth, roleCheck('user'), submitRatingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { store_id, rating } = req.body;

    // Check if store exists
    const store = await db.Store.findByPk(store_id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if user already rated this store
    const existingRating = await db.Rating.findOne({
      where: {
        user_id: req.user.id,
        store_id,
      },
    });

    if (existingRating) {
      return res.status(409).json({
        message: 'You have already rated this store. Use PUT to update your rating.',
      });
    }

    const newRating = await db.Rating.create({
      user_id: req.user.id,
      store_id,
      rating,
    });

    return res.status(201).json({
      message: 'Rating submitted successfully.',
      rating: newRating,
    });
  } catch (error) {
    console.error('Create rating error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/ratings/:id — normal user only, update own rating
router.put('/:id', auth, roleCheck('user'), updateRatingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ratingRecord = await db.Rating.findByPk(req.params.id);

    if (!ratingRecord) {
      return res.status(404).json({ message: 'Rating not found.' });
    }

    // Ensure user can only update their own rating
    if (ratingRecord.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own rating.' });
    }

    ratingRecord.rating = req.body.rating;
    await ratingRecord.save();

    return res.status(200).json({
      message: 'Rating updated successfully.',
      rating: ratingRecord,
    });
  } catch (error) {
    console.error('Update rating error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
