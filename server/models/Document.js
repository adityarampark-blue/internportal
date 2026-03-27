const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  size: { type: String },
  uploadedAt: { type: String },
  assignedTo: { type: [String], default: [] },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
