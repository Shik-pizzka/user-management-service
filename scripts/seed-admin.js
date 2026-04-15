/**
 * Скрипт для создания первого администратора в базе данных.
 *
 * Проблема: при регистрации через API можно передать role: 'admin',
 * что небезопасно в продакшене. Этот скрипт решает вопрос
 * создания первого админа напрямую через БД, минуя API.
 *
 * Запуск: node scripts/seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/users/user.model');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin already exists, skipping.');
      process.exit(0);
    }

    await User.create({
      fullName: 'Super Admin',
      dateOfBirth: new Date('1990-01-01'),
      email: 'admin@example.com',
      password: 'admin123456', // хэшируется автоматически в pre-save хуке
      role: 'admin',
      isActive: true,
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123456');
    console.log('Change the password after first login!');
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
