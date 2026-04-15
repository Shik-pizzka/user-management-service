const express = require('express');
const userRoutes = require('./modules/users/user.routes');

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'ValidationError') {
    status = 422;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(status).json({ success: false, message });
});

module.exports = app;
