const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = Date.now().toString();
    const u = new User({ id, name, email, role: 'intern', passwordHash: hash, approved: false });
    await u.save();
    res.status(201).json({ id: u.id, email: u.email, name: u.name, role: u.role, approved: u.approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    const match = bcrypt.compareSync(password, u.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: u.id, email: u.email, name: u.name, role: u.role, approved: u.approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const pending = await User.find({ role: 'intern', approved: false }).sort({ createdAt: -1 });
    res.json(pending.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, approved: u.approved })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/approve/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const u = await User.findOneAndUpdate({ id }, { approved: true }, { new: true });
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ id: u.id, email: u.email, name: u.name, approved: u.approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const rejectHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const u = await User.findOneAndDelete({ id });
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.delete('/reject/:id', rejectHandler);
router.post('/reject/:id', rejectHandler); // allow POST for clients that don't support DELETE

module.exports = router;
