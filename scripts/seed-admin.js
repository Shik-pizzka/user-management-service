require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/modules/users/user.model');

const ADMIN = {
  fullName: 'Super Admin',
  dateOfBirth: new Date('1990-01-01'),
  email: 'admin@example.com',
  password: 'admin123456',
  role: 'admin',
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('Admin already exists, skipping.');
    return;
  }

  await User.create(ADMIN);
  console.log(`Admin created: ${ADMIN.email} / ${ADMIN.password}`);
  console.log('Remember to change the password after first login.');
};

run()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
