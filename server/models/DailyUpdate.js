const mongoose = require('mongoose');

const DailyUpdateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  internId: { type: String, required: true },
  date: { type: String },
  content: { type: String },
  hoursWorked: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyUpdate', DailyUpdateSchema);
