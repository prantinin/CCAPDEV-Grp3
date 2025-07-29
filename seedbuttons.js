// seed.js
const mongoose = require('mongoose');
const SeatSchema = require('./models/Seats');
const LabSchema = require('./models/Labs');

const seatsdata = require('./data/seatsdata.json');
const labsdata = require('./data/labsdata.json');

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');

    await SeatSchema.deleteMany();
    await LabSchema.deleteMany();

    await SeatSchema.insertMany(seatsdata);
    await LabSchema.insertMany(labsdata);

    console.log('Seats and labs seeded!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
