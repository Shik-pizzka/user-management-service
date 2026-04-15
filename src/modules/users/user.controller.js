const userService = require('./user.service');

// Контроллер отвечает только за HTTP-слой:
// принять req, вызвать сервис, отдать res.
// Вся логика — в сервисе. Все ошибки летят в глобальный обработчик через next().

const register = async (req, res, next) => {
  try {
    const { user, token } = await userService.registerUser(req.body);
    res.status(201).json({
      success: true,
      token,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);
    res.status(200).json({
      success: true,
      token,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(sanitizeUser),
    });
  } catch (err) {
    next(err);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await userService.blockUser(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// Убираем чувствительные поля перед отправкой клиенту.
// Даже если password случайно попал в объект — он не уйдёт наружу.
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

module.exports = { register, login, getUserById, getAllUsers, blockUser };
