require('dotenv').config();
const mongoose = require('mongoose');

const Intern = require('./models/Intern');
const User = require('./models/User');
const Doc = require('./models/Document');
const DailyUpdate = require('./models/DailyUpdate');
const Attendance = require('./models/Attendance');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');

async function fix() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';
  await mongoose.connect(MONGO_URI);
  console.log('Connected DB');

  const updateMapping = {};

  // First process interns to generate mappings
  const allInterns = await Intern.find();
  for (const i of allInterns) {
    let newId = null;
    const oldId = i.id;
    if (!oldId) continue;
    
    if (i.name === 'ss' && oldId !== 'IN006') {
      newId = 'IN006';
    } else if (oldId === '6' && i.name !== 'ss') {
      newId = 'IN006';
    } else if (!oldId.toUpperCase().startsWith('IN')) {
      const num = parseInt(oldId.replace(/\D/g, ''), 10);
      if (!isNaN(num) && Number.isInteger(num)) {
        newId = `IN${String(num).padStart(3, '0')}`;
      }
    }
    
    if (newId) {
      updateMapping[oldId] = newId;
      console.log(`Intern ID Map: ${oldId} -> ${newId}`);
      await Intern.updateOne({ _id: i._id }, { $set: { id: newId } });
    }
  }

  // Update Users
  const allUsers = await User.find();
  for (const u of allUsers) {
    const oldId = u.id;
    if (updateMapping[oldId]) {
      console.log(`Updating User ${oldId} -> ${updateMapping[oldId]}`);
      await User.updateOne({ _id: u._id }, { $set: { id: updateMapping[oldId] } });
    }
  }

  // Update Attendance
  const allAtt = await Attendance.find();
  for (const a of allAtt) {
    const oldInternId = a.internId;
    if (updateMapping[oldInternId]) {
      await Attendance.updateOne({ _id: a._id }, { $set: { internId: updateMapping[oldInternId] } });
    }
  }

  // Update DailyUpdates
  const allUpdates = await DailyUpdate.find();
  for (const d of allUpdates) {
    const oldInternId = d.internId;
    if (updateMapping[oldInternId]) {
      await DailyUpdate.updateOne({ _id: d._id }, { $set: { internId: updateMapping[oldInternId] } });
    }
  }

  // Update Documents 
  const allDocs = await Doc.find();
  for (const d of allDocs) {
    let assignedTo = d.assignedTo || [];
    let changed = false;
    assignedTo = assignedTo.map(id => {
      if (updateMapping[id]) {
        changed = true;
        return updateMapping[id];
      }
      return id;
    });
    if (changed) {
      await Doc.updateOne({ _id: d._id }, { $set: { assignedTo } });
    }
  }

  // Update Tasks & Meetings
  const allTasks = await Task.find();
  for (const t of allTasks) {
    let assignedTo = t.assignedTo || [];
    let changed = false;
    assignedTo = assignedTo.map(id => {
      if (updateMapping[id]) {
        changed = true;
        return updateMapping[id];
      }
      return id;
    });
    if (changed) {
      await Task.updateOne({ _id: t._id }, { $set: { assignedTo } });
    }
  }

  const allMeetings = await Meeting.find();
  for (const m of allMeetings) {
    let assignedTo = m.assignedTo || [];
    let changed = false;
    assignedTo = assignedTo.map(id => {
      if (updateMapping[id]) {
        changed = true;
        return updateMapping[id];
      }
      return id;
    });
    if (changed) {
      await Meeting.updateOne({ _id: m._id }, { $set: { assignedTo } });
    }
  }

  console.log('Finished migrating IDs across all collections properly.');
  process.exit(0);
}

fix();
