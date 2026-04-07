require('dotenv').config();
const mongoose = require('mongoose');

const InternSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { strict: false });

const Intern = mongoose.model('Intern', InternSchema);

async function fix() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';
  await mongoose.connect(MONGO_URI);
  console.log('Connected DB');
  
  // Find "ss"
  const ssIntern = await Intern.findOne({ name: 'ss' });
  if (ssIntern) {
    console.log('Found ss intern with id:', ssIntern.id);
    ssIntern.id = 'IN006';
    await ssIntern.save();
    console.log('Updated to IN006 successfully');
  } else {
    console.log('No intern named ss found.');
    // Check if there is one with id '6'
    const ID6 = await Intern.findOne({ id: '6' });
    if (ID6) {
      ID6.id = 'IN006';
      await ID6.save();
      console.log('Updated intern with id 6 to IN006 successfully');
    }
  }

  // Find users and update ID: 1 -> IN001, 2 -> IN002
  const all = await Intern.find();
  for (const i of all) {
      if (!i.id.toUpperCase().startsWith('IN')) {
          const num = parseInt(i.id.replace(/\\D/g, ''), 10);
          if (!isNaN(num) && Number.isInteger(num)) {
             const newId = `IN${String(num).padStart(3, '0')}`;
             console.log(`Updating ${i.id} -> ${newId}`);
             i.id = newId;
             await i.save();
          }
      }
  }
  
  console.log('Finished updating IDs natively in DB.');
  process.exit(0);
}

fix();
