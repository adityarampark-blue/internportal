const express = require('express');
const router = express.Router();
const Intern = require('../models/Intern');

router.get('/', async (req, res) => {
  try {
    const interns = await Intern.find().sort({ createdAt: 1 });
    res.json(interns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const existing = await Intern.findOne({ id: data.id });
    if (existing) return res.status(409).json({ error: 'Intern with this id already exists' });
    const intern = new Intern(data);
    await intern.save();
    res.status(201).json(intern);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updated = await Intern.findOneAndUpdate({ id }, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Intern not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Intern.findOneAndDelete({ id });
    if (!removed) return res.status(404).json({ error: 'Intern not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
