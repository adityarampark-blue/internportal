// const mongoose = require('mongoose');

// const DocumentSchema = new mongoose.Schema({
//   id: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   type: { type: String },
//   size: { type: String },
//   uploadedAt: { type: String },
//   assignedTo: { type: [String], default: [] },
//   category: { type: String },
//   filePath: { type: String }, // Path to the uploaded file
//   originalName: { type: String }, // Original filename
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Document', DocumentSchema);



const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  size: { type: String },
  uploadedAt: { type: String },
  assignedTo: { type: [String], default: [] },
  category: { type: String },
  groupName: { type: String }, // Added groupName field
  description: { type: String }, // Added description field
  filePath: { type: String },
  originalName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);