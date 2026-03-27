const mongoose = require('mongoose');

const InternSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  status: { type: String, enum: ['active', 'completed', 'disabled'], default: 'active' },
  avatar: { type: String, default: '' },
  group: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Intern', InternSchema);
