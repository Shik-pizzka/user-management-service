const { Router } = require('express');
const controller = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { registerRules, loginRules, validate } = require('./user.validator');

const router = Router();

// при публичной регистрации роль всегда 'user', admin создаётся только через seed
const forceUserRole = (req, res, next) => {
  req.body.role = 'user';
  next();
};

router.post('/register', forceUserRole, registerRules, validate, controller.register);
router.post('/login', loginRules, validate, controller.login);

router.get('/me', authenticate, controller.getMe);
router.get('/', authenticate, authorizeRoles('admin'), controller.getAllUsers);
router.get('/:id', authenticate, controller.getUserById);
router.patch('/:id/block', authenticate, controller.blockUser);

module.exports = router;
