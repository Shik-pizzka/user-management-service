const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Завершаем процесс с кодом ошибки — без БД работать нет смысла
    process.exit(1);
  }
};

module.exports = connectDB;
