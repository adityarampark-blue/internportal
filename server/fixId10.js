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

  const oldId = 'IN010';
  const newId = 'IN0010';

  let changed = false;

  const intern = await Intern.findOne({ id: oldId });
  if (intern) {
    await Intern.updateOne({ _id: intern._id }, { $set: { id: newId } });
    changed = true;
    console.log(`Updated Intern doc ${oldId} -> ${newId}`);
  }

  const user = await User.findOne({ id: oldId });
  if (user) {
    await User.updateOne({ _id: user._id }, { $set: { id: newId } });
    changed = true;
    console.log(`Updated User doc ${oldId} -> ${newId}`);
  }

  const attRes = await Attendance.updateMany({ internId: oldId }, { $set: { internId: newId } });
  if (attRes.modifiedCount > 0) { console.log(`Updated ${attRes.modifiedCount} Attendance records`); changed = true; }

  const dupRes = await DailyUpdate.updateMany({ internId: oldId }, { $set: { internId: newId } });
  if (dupRes.modifiedCount > 0) { console.log(`Updated ${dupRes.modifiedCount} DailyUpdate records`); changed = true; }

  const docs = await Doc.find({ assignedTo: oldId });
  for (const d of docs) {
    const updatedAssigned = d.assignedTo.map(id => id === oldId ? newId : id);
    await Doc.updateOne({ _id: d._id }, { $set: { assignedTo: updatedAssigned } });
    console.log(`Updated Document ${d._id}`);
    changed = true;
  }

  const tasks = await Task.find({ assignedTo: oldId });
  for (const t of tasks) {
    const updatedAssigned = t.assignedTo.map(id => id === oldId ? newId : id);
    await Task.updateOne({ _id: t._id }, { $set: { assignedTo: updatedAssigned } });
    console.log(`Updated Task ${t._id}`);
    changed = true;
  }

  const meetings = await Meeting.find({ assignedTo: oldId });
  for (const m of meetings) {
    const updatedAssigned = m.assignedTo.map(id => id === oldId ? newId : id);
    await Meeting.updateOne({ _id: m._id }, { $set: { assignedTo: updatedAssigned } });
    console.log(`Updated Meeting ${m._id}`);
    changed = true;
  }

  if (changed) {
    console.log(`Completed fixing ${oldId} -> ${newId}`);
  } else {
    console.log(`No records found for ${oldId}`);
  }
  process.exit(0);
}

fix();
