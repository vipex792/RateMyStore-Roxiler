const { body } = require('express-validator');

const nameValidation = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
];

const emailValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
];

const passwordValidation = [
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character.'),
];

const addressValidation = [
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

const signupValidation = [
  ...nameValidation,
  ...emailValidation,
  ...passwordValidation,
  ...addressValidation,
  body('role')
    .optional()
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be one of: admin, user, store_owner.'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const createUserValidation = [
  ...nameValidation,
  ...emailValidation,
  ...passwordValidation,
  ...addressValidation,
  body('role')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be one of: admin, user, store_owner.'),
];

const createStoreValidation = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('owner_id')
    .optional({ values: 'null' })
    .isInt()
    .withMessage('Owner ID must be a valid integer.'),
];

const submitRatingValidation = [
  body('store_id')
    .isInt()
    .withMessage('Store ID must be a valid integer.'),
  ...ratingValidation,
];

const updateRatingValidation = [...ratingValidation];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('New password must contain at least one special character.'),
];

module.exports = {
  signupValidation,
  loginValidation,
  createUserValidation,
  createStoreValidation,
  submitRatingValidation,
  updateRatingValidation,
  updatePasswordValidation,
};
