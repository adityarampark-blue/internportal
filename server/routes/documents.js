const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

router.get('/', async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const existing = await Document.findOne({ id: data.id });
    if (existing) return res.status(409).json({ error: 'Document with this id already exists' });
    const doc = new Document(data);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updated = await Document.findOneAndUpdate({ id }, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Document not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
