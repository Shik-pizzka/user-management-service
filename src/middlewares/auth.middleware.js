const jwt = require('jsonwebtoken');

/**
 * Middleware проверяет наличие и валидность JWT токена.
 * Если токен корректный — кладёт данные пользователя в req.user и передаёт управление дальше.
 * Если нет — возвращает 401.
 *
 * Токен ожидается в заголовке: Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Кладём payload токена в req.user — контроллеры и следующие middleware будут его использовать
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
