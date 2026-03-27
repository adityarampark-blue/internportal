const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const { mockInterns, mockTasks, mockMeetings, mockDocuments, mockDailyUpdates, mockAttendance, mockUsers } = require('./mockData');

const Intern = require('../models/Intern');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const Document = require('../models/Document');
const DailyUpdate = require('../models/DailyUpdate');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for full seeding');

    // Clear existing
    await Promise.all([
      Intern.deleteMany({}),
      Task.deleteMany({}),
      Meeting.deleteMany({}),
      Document.deleteMany({}),
      DailyUpdate.deleteMany({}),
      Attendance.deleteMany({})
    ]);

    // Insert
    await Intern.insertMany(mockInterns);
    await Task.insertMany(mockTasks);
    await Meeting.insertMany(mockMeetings);
    await Document.insertMany(mockDocuments);
    await DailyUpdate.insertMany(mockDailyUpdates);
    await Attendance.insertMany(mockAttendance);

    // Ensure users (create if not exists) - hash passwords
    for (const u of mockUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(u.password || 'password', salt);
        await new User({ id: u.id, email: u.email, name: u.name, role: u.role, passwordHash: hash, approved: !!u.approved }).save();
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

seed();
