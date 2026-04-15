const express = require('express');
const userRoutes = require('./modules/users/user.routes');

const app = express();

// Парсим JSON тело запроса
app.use(express.json());

// Все маршруты пользователей живут под /api/users
app.use('/api/users', userRoutes);

// Глобальный обработчик ошибок.
// Express опознаёт его по четырём параметрам (err, req, res, next).
// Все ошибки, переданные через next(err), попадают сюда.
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Ошибка дублирования уникального поля в MongoDB (например, email уже занят).
  // Mongoose возвращает код 11000 - переводим в понятный 409.
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = field + ' already exists';
  }

  // Невалидный MongoDB ObjectId в URL параметре (/api/users/abc вместо нормального id).
  // Без этой обработки Mongoose бросает CastError с кодом 500.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 400;
    message = 'Invalid ID format';
  }

  // Ошибки валидации схемы Mongoose (обязательное поле не передано напрямую через БД).
  if (err.name === 'ValidationError') {
    status = 422;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(status).json({ success: false, message });
});

module.exports = app;
