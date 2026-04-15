const { Router } = require('express');
const controller = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { registerRules, loginRules, validate } = require('./user.validator');

const router = Router();

// Middleware, который принудительно выставляет роль 'user' при публичной регистрации.
// Без этого любой желающий мог бы передать role: 'admin' в теле запроса.
// Если нужно создать администратора — используй скрипт scripts/seed-admin.js
// или отдельный защищённый эндпоинт (только для существующих админов).
const forceUserRole = (req, res, next) => {
  req.body.role = 'user';
  next();
};

// --- Публичные маршруты (без токена) ---

// POST /api/users/register
router.post('/register', forceUserRole, registerRules, validate, controller.register);

// POST /api/users/login
router.post('/login', loginRules, validate, controller.login);

// --- Приватные маршруты (требуют JWT) ---

// GET /api/users — только для admin
router.get('/', authenticate, authorizeRoles('admin'), controller.getAllUsers);

// GET /api/users/:id — admin или сам пользователь
// Проверку "admin или сам себя" делаем в сервисе, т.к. нужен доступ к params.id
router.get('/:id', authenticate, controller.getUserById);

// PATCH /api/users/:id/block — admin или сам пользователь
router.patch('/:id/block', authenticate, controller.blockUser);

module.exports = router;
