const jwt = require('jsonwebtoken');
const userRepository = require('./user.repository');
const { createError } = require('../../utils/http-error');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const registerUser = async (data) => {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) throw createError('User with this email already exists', 409);

  const user = await userRepository.createUser(data);
  const token = signToken(user);
  return { user, token };
};

const loginUser = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  // одинаковое сообщение для двух случаев намеренно — не раскрываем существование email
  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) throw createError('Your account has been blocked', 403);

  const token = signToken(user);
  return { user, token };
};

const getUserById = async (targetId, requesterId, requesterRole) => {
  if (targetId !== requesterId && requesterRole !== 'admin') {
    throw createError('Access denied', 403);
  }

  const user = await userRepository.findById(targetId);
  if (!user) throw createError('User not found', 404);

  return user;
};

const getAllUsers = () => userRepository.findAll();

const blockUser = async (targetId, requesterId, requesterRole) => {
  if (targetId !== requesterId && requesterRole !== 'admin') {
    throw createError('Access denied', 403);
  }

  const user = await userRepository.findById(targetId);
  if (!user) throw createError('User not found', 404);
  if (!user.isActive) throw createError('User is already blocked', 400);

  return userRepository.updateById(targetId, { isActive: false });
};

module.exports = { registerUser, loginUser, getUserById, getAllUsers, blockUser };
