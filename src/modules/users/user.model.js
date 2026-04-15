const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // MongoDB создаёт индекс — гарантирует уникальность на уровне БД
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      // select: false означает, что пароль НЕ будет возвращаться в запросах по умолчанию.
      // Чтобы получить его явно, нужно написать .select('+password')
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // автоматически добавляет createdAt и updatedAt
  }
);

// Хэшируем пароль перед сохранением.
// Используем pre-save хук — он сработает при create() и save().
// Проверка isModified важна: без неё пароль хэшировался бы повторно
// при каждом обновлении любого поля пользователя.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Метод для сравнения паролей — чтобы логика проверки жила в модели, а не размазывалась по сервисам
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
