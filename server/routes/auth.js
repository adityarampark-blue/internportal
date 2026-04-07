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
    const u = new User({ id, name, email, phone, department, role: 'intern', passwordHash: hash, approved: false });
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
    const { group } = req.body;
    
    const Counter = require('../models/Counter');
    const counter = await Counter.findOneAndUpdate(
      { id: 'internId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const nextId = `IN00${counter.seq}`;

    // Update User record to correctly be marked approved AND sync its ID to IN00X format
    const u = await User.findOneAndUpdate({ id }, { approved: true, id: nextId }, { new: true });
    if (!u) return res.status(404).json({ error: 'User not found' });
    
    // Create Intern record with proper sequential identity
    const Intern = require('../models/Intern');
    const intern = new Intern({
      id: nextId,
      name: u.name,
      email: u.email,
      phone: u.phone,
      department: u.department,
      group: group || '',
      status: 'active'
    });
    await intern.save();
    
    res.json({ id: nextId, email: u.email, name: u.name, approved: true });
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

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password required' });
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const u = await User.findOne({ email });
    if (!u) return res.status(404).json({ error: 'User not found' });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    await User.findOneAndUpdate({ email }, { passwordHash: hash });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
