const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

router.post('/', async (req, res) => {
  try {
    const { type, data } = req.body;
    const item = new Item({ type, data });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
