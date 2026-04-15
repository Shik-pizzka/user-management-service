const { body, validationResult } = require('express-validator');

// Middleware, который проверяет результаты валидации.
// Если есть ошибки — возвращает 422 со списком проблем.
// Если всё чисто — передаёт управление дальше.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
];

const loginRules = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
};
