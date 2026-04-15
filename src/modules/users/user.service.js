const jwt = require('jsonwebtoken');
const userRepository = require('./user.repository');

// Вспомогательная функция для создания JWT токена.
// Кладём в payload id, email и роль — этого достаточно для авторизации.
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Вспомогательная функция для создания HTTP ошибки.
// Вместо того чтобы писать res.status(404).json(...) в сервисе,
// мы бросаем ошибку — она всплывёт в глобальный обработчик в app.js.
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const registerUser = async (data) => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Пароль хэшируется в pre-save хуке модели — здесь передаём чистый пароль
  const user = await userRepository.createUser(data);
  const token = signToken(user);

  return { user, token };
};

const loginUser = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  // Намеренно одинаковое сообщение для неверного email и пароля —
  // не даём атакующему понять, существует ли такой email в системе
  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Your account has been blocked', 403);
  }

  const token = signToken(user);
  return { user, token };
};

const getUserById = async (targetId, requesterId, requesterRole) => {
  // Доступ разрешён: если запрашивает сам пользователь или админ
  const isSelf = targetId === requesterId;
  const isAdmin = requesterRole === 'admin';

  if (!isSelf && !isAdmin) {
    throw createError('Access denied', 403);
  }

  const user = await userRepository.findById(targetId);
  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

const getAllUsers = async () => {
  return userRepository.findAll();
};

const blockUser = async (targetId, requesterId, requesterRole) => {
  const isSelf = targetId === requesterId;
  const isAdmin = requesterRole === 'admin';

  if (!isSelf && !isAdmin) {
    throw createError('Access denied', 403);
  }

  const user = await userRepository.findById(targetId);
  if (!user) {
    throw createError('User not found', 404);
  }

  if (!user.isActive) {
    throw createError('User is already blocked', 400);
  }

  return userRepository.updateById(targetId, { isActive: false });
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  blockUser,
};
