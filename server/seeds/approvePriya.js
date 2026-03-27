const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const u = await User.findOneAndUpdate({ email: 'priya@example.com' }, { approved: true }, { new: true });
    if (!u) {
      console.log('Priya not found in User collection, creating her...');
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('intern123', salt);
      const newUser = new User({
        id: '1',
        email: 'priya@example.com',
        name: 'Priya Sharma',
        role: 'intern',
        passwordHash: hash,
        approved: true
      });
      await newUser.save();
      console.log('Priya created and approved:', newUser.email);
    } else {
      console.log('Priya updated and approved:', u.email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
}

run();
