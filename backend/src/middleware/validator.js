import { body, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new AppError(errorMessages, 400, 'VALIDATION_ERROR'));
  }
  next();
};

// Phone number validation
export const validatePhone = [
  body('phone')
    .trim()
    .matches(/^\+91[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number. Format: +91XXXXXXXXXX'),
  validate,
];

// OTP validation
export const validateOTP = [
  body('phone')
    .trim()
    .matches(/^\+91[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  body('requestId')
    .trim()
    .notEmpty()
    .withMessage('Request ID is required'),
  validate,
];

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  validate,
];

// Message validation
export const validateMessage = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message must not exceed 5000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type'),
  validate,
];

