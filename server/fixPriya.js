require('dotenv').config();
const mongoose = require('mongoose');
const Intern = require('./models/Intern');
const User = require('./models/User');
const Doc = require('./models/Document');
const DailyUpdate = require('./models/DailyUpdate');
const Attendance = require('./models/Attendance');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');
const Counter = require('./models/Counter');

(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  // Fix Priya
  const priya = await Intern.findOne({ email: /priya/i });
  if (priya) {
    const oldId = priya.id;

    // Is there someone else at IN001?
    const occupant = await Intern.findOne({ id: 'IN001' });
    if (occupant && occupant.email !== priya.email) {
      console.log('IN001 is occupied by', occupant.name, 'assigning them a new ID.');
      occupant.id = 'IN999'; // temporary
      await occupant.save();
    }

    priya.id = 'IN001';
    await priya.save();
    console.log(`Changed Priya from ${oldId} to IN001`);

    // Update References for Priya
    await User.updateOne({ email: priya.email }, { $set: { id: 'IN001' } });
    await Attendance.updateMany({ internId: oldId }, { $set: { internId: 'IN001' } });
    await DailyUpdate.updateMany({ internId: oldId }, { $set: { internId: 'IN001' } });
    
    // Arrays
    const allDocs = await Doc.find({ assignedTo: oldId });
    for (const d of allDocs) {
      d.assignedTo = d.assignedTo.map(x => x === oldId ? 'IN001' : x);
      await d.save();
    }
    const allTasks = await Task.find({ assignedTo: oldId });
    for (const t of allTasks) {
      t.assignedTo = t.assignedTo.map(x => x === oldId ? 'IN001' : x);
      await t.save();
    }
    const allMeetings = await Meeting.find({ assignedTo: oldId });
    for (const m of allMeetings) {
      m.assignedTo = m.assignedTo.map(x => x === oldId ? 'IN001' : x);
      await m.save();
    }
  } else {
    console.log('Could not find Priya');
  }

  // Initialize Counter to strictly at least 6 based on user instruction
  let highest = 6;
  const interns = await Intern.find();
  for (const i of interns) {
    if (i.id && i.id.startsWith('IN')) {
      const num = parseInt(i.id.replace('IN', ''), 10);
      if (num > highest) highest = num;
    }
  }

  let counter = await Counter.findOne({ id: 'internId' });
  if (!counter) {
    counter = new Counter({ id: 'internId', seq: highest });
    await counter.save();
  } else {
    if (counter.seq < highest) {
      counter.seq = highest;
      await counter.save();
    }
  }
  console.log('Initialized Counter seq to', counter.seq);
  process.exit(0);
})();
