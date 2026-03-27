const express = require('express');
const router = express.Router();
const DailyUpdate = require('../models/DailyUpdate');

router.get('/', async (req, res) => {
  try {
    const items = await DailyUpdate.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const existing = await DailyUpdate.findOne({ id: data.id });
    if (existing) return res.status(409).json({ error: 'Update with this id already exists' });
    const item = new DailyUpdate(data);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updated = await DailyUpdate.findOneAndUpdate({ id }, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Update not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
