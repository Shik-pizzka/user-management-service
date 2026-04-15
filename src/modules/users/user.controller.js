const userService = require('./user.service');

// убираем пароль из ответа на всякий случай, хотя select: false в схеме уже это делает
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

const register = async (req, res, next) => {
  try {
    const { user, token } = await userService.registerUser(req.body);
    res.status(201).json({ success: true, token, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);
    res.status(200).json({ success: true, token, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, count: users.length, data: users.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await userService.blockUser(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getUserById, getAllUsers, blockUser };
