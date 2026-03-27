const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const itemsRouter = require('./routes/items');
const internsRouter = require('./routes/interns');
const tasksRouter = require('./routes/tasks');
const meetingsRouter = require('./routes/meetings');
const documentsRouter = require('./routes/documents');
const attendanceRouter = require('./routes/attendance');
const updatesRouter = require('./routes/updates');
const authRouter = require('./routes/auth');

app.use('/api/items', itemsRouter);
app.use('/api/interns', internsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/updates', updatesRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internhub';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
