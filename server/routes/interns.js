const express = require('express');
const router = express.Router();
const Intern = require('../models/Intern');
const Attendance = require('../models/Attendance');
const DailyUpdate = require('../models/DailyUpdate');

router.get('/', async (req, res) => {
  try {
    const interns = await Intern.find().sort({ createdAt: 1 });
    console.log('All interns in DB:', interns.map(i => ({ id: i.id, _id: i._id, name: i.name })));
    res.json(interns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    console.log('Creating intern with data:', data);
    const existing = await Intern.findOne({ id: data.id });
    if (existing) return res.status(409).json({ error: 'Intern with this id already exists' });
    const intern = new Intern(data);
    await intern.save();
    console.log('Created intern:', intern);
    res.status(201).json(intern);
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    console.log('Updating intern with id:', id, 'data:', data);
    const updated = await Intern.findOneAndUpdate({ id }, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Intern not found' });
    console.log('Updated intern:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Deleting intern with id:', id);
    
    // Try to find intern - first by exact id match
    let removed = await Intern.findOneAndDelete({ id: id });
    
    if (!removed) {
      console.log('Not found by id, trying alternative lookup');
      // Fallback: try _id in case the id field doesn't match
      removed = await Intern.findByIdAndDelete(id);
    }
    
    if (!removed) {
      console.log('Intern not found:', id);
      return res.status(404).json({ error: 'Intern not found' });
    }
    
    console.log('Deleted intern:', removed);
    
    // Delete all attendance records for this intern
    const attendanceDeleted = await Attendance.deleteMany({ internId: id });
    console.log('Attendance records deleted:', attendanceDeleted.deletedCount);
    
    // Also try deleting by the original ID if different
    const attendanceDeleted2 = await Attendance.deleteMany({ internId: removed.id });
    console.log('Attendance records deleted (by removed.id):', attendanceDeleted2.deletedCount);
    
    // Delete all daily updates for this intern
    const updatesDeleted = await DailyUpdate.deleteMany({ internId: id });
    console.log('Daily updates deleted:', updatesDeleted.deletedCount);
    
    // Also try deleting by the original ID if different
    const updatesDeleted2 = await DailyUpdate.deleteMany({ internId: removed.id });
    console.log('Daily updates deleted (by removed.id):', updatesDeleted2.deletedCount);
    
    res.json({ 
      success: true, 
      message: 'Intern and all related records deleted successfully',
      deletedIntern: removed.id,
      attendanceRecordsDeleted: attendanceDeleted.deletedCount + attendanceDeleted2.deletedCount,
      updatesDeleted: updatesDeleted.deletedCount + updatesDeleted2.deletedCount
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
