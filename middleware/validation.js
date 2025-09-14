const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for payment creation
const validatePayment = [
  body('school_id')
    .notEmpty()
    .withMessage('School ID is required'),
  body('trustee_id')
    .notEmpty()
    .withMessage('Trustee ID is required'),
  body('student_info.name')
    .notEmpty()
    .withMessage('Student name is required'),
  body('student_info.id')
    .notEmpty()
    .withMessage('Student ID is required'),
  body('student_info.email')
    .isEmail()
    .withMessage('Please provide a valid student email'),
  body('gateway_name')
    .notEmpty()
    .withMessage('Gateway name is required'),
  body('order_amount')
    .isNumeric()
    .withMessage('Order amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Order amount must be greater than 0')
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validatePayment
};
