/**
 * Фабрика middleware для проверки роли.
 * Использование: authorizeRoles('admin') или authorizeRoles('admin', 'user')
 *
 * Важно: этот middleware должен идти ПОСЛЕ authenticate,
 * потому что берёт роль из req.user, который выставляет authenticate.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authorizeRoles };
