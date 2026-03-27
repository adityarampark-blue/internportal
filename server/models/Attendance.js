const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  internId: { type: String, required: true },
  date: { type: String },
  status: { type: String, enum: ['present', 'absent'] },
  checkIn: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
