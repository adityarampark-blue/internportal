require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Intern = require('./models/Intern');

(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';
  await mongoose.connect(MONGO_URI);
  
  const priyas = await User.find({ email: /priya/i });
  console.log('Users matching priya:', priyas);

  const interns = await Intern.find({ email: /priya/i });
  console.log('Interns matching priya:', interns);

  for (let u of priyas) {
    u.approved = true;
    u.id = 'IN001'; // ensure id matches
    await u.save();
    console.log(`Approved User: ${u.email}`);
  }

  process.exit(0);
})();
