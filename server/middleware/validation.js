import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
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

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateBarber = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('workingHours').optional().isArray().withMessage('Working hours must be an array'),
  handleValidationErrors
];

export const validateService = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  body('barbers').optional().isArray().withMessage('Barbers must be an array'),
  handleValidationErrors
];

export const validateAppointment = [
  body('barber').isMongoId().withMessage('Valid barber ID is required'),
  body('service').isMongoId().withMessage('Valid service ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
  body('notes').optional().trim(),
  handleValidationErrors
];

export const validateProduct = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').optional().isIn(['haircare', 'beardcare', 'styling', 'accessories', 'other']),
  handleValidationErrors
];

export const validateSale = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.type').isIn(['service', 'product']).withMessage('Item type must be service or product'),
  body('items.*.item').isMongoId().withMessage('Valid item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cash', 'card', 'mobile', 'other']).withMessage('Valid payment method required'),
  handleValidationErrors
];

export const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  handleValidationErrors
];

export const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];