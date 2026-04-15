const User = require('./user.model');

const createUser = (data) => User.create(data);

const findByEmail = (email) => User.findOne({ email }).select('+password');

const findById = (id) => User.findById(id);

const findAll = () => User.find();

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

module.exports = { createUser, findByEmail, findById, findAll, updateById };
