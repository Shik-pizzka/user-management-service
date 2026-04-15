const User = require('./user.model');

// Репозиторий — единственное место, где мы напрямую работаем с Mongoose.
// Сервисы не знают про User.findOne() — они вызывают методы репозитория.
// Это позволяет заменить MongoDB на другую БД, не трогая бизнес-логику.

const createUser = (data) => {
  return User.create(data);
};

const findByEmail = (email) => {
  // Явно запрашиваем пароль, т.к. в схеме стоит select: false
  return User.findOne({ email }).select('+password');
};

const findById = (id) => {
  return User.findById(id);
};

const findAll = () => {
  return User.find();
};

const updateById = (id, data) => {
  // new: true — вернуть обновлённый документ, а не старый
  // runValidators: true — прогнать валидацию схемы при обновлении
  return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAll,
  updateById,
};
