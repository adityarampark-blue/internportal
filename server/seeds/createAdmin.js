const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';

const admin = {
  id: 'admin-1',
  email: 'admin@portal.com',
  name: 'Admin User',
  role: 'admin',
  password: 'admin123'
};

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(admin.password, salt);

    const u = new User({ id: admin.id, email: admin.email, name: admin.name, role: admin.role, passwordHash: hash, approved: true });
    await u.save();
    console.log('Admin user created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

run();
