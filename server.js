require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Сначала подключаемся к БД, потом запускаем сервер.
// Это важно — если БД недоступна, сервер стартовать не должен.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
