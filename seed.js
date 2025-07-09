const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const UserSchema = require('./models/Users');
const ReserveSchema = require('./models/Reservations');
const SeatSchema = require('./models/Seats');
const LabSchema = require('./models/Labs');

const app = express();
const port = 3000;

// for logic
const timeLabels = [
    "7:30 AM - 8:00 AM", "8:00 AM - 8:30 AM", "8:30 AM - 9:00 AM",
    "9:00 AM - 9:30 AM", "9:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
    "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM", "1:00 PM - 1:30 PM",
    "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM", "2:30 PM - 3:00 PM",
    "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM", "4:00 PM - 4:30 PM",
    "4:30 PM - 5:00 PM", "5:00 PM - 5:30 PM", "5:30 PM - 6:00 PM",
    "6:00 PM - 6:30 PM", "6:30 PM - 7:00 PM", "7:00 PM - 7:30 PM",
    "7:30 PM - 8:00 PM", "8:00 PM - 8:30 PM", "8:30 PM - 9:00 PM"
  ];

// For loading pre-made data
const seedDatabase = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');

  // Clear schema's existing data
  await UserSchema.deleteMany({});
  await ReserveSchema.deleteMany({});
  await SeatSchema.deleteMany({});
  await LabSchema.deleteMany({});

  // Load dynamic JSON files
  const reservedata = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/reservedata.json'), 'utf-8'));

  // Load static JSON files
  const usersdata = require('./data/usersdata.json');
  const seatsdata = require('./data/seatsdata.json');
  const labsdata = require('./data/labsdata.json');

  await UserSchema.insertMany(usersdata);
  await SeatSchema.insertMany(seatsdata);
  await LabSchema.insertMany(labsdata);

  // Replacing reservations' null values
  for (const reserve of reservedata) {
    
    // updating userID
    const userSchoolId = reserve.userIdNum;
    const user = await UserSchema.findOne({ idNum : userSchoolId }).exec();

    // making new slots and adding to slot array
    const [ labNamePart, seatCodePart ] = reserve.slotName.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();

    const slotIDs = [];
    for (i = reserve.startTime; i < reserve.endTime; i++) {
      const slotInstance = new SlotSchema({
        labName: lab._id,
        seatCode: seat._id,
        slotTime: i,
        slotDate: reserve.reservDate
      });
      await slotInstance.save();
      slotIDs.push(slotInstance._id);
    }

    for (let i = startTime; i <= endTime; i++) {
              const slotInstance = new SlotSchema({
                labName: lab._id,
                seatCode: seat._id,
                slotTime: i,
                slotDate: new Date(resDate)
              });
              console.log('Saving slot:', slotInstance);
              await slotInstance.save();
              slotIDs.push(slotInstance._id);
              console.log('Saved slot with _id:', slotInstance._id);
            }

    const newRes = new ReserveSchema({
      userID: user._id,
      userIdNum: reserve.userIdNum,
      isAnon: reserve.isAnon,
      slotID: slotIDs,
      slotName: reserve.slotName,
      startTime: reserve.startTime,
      endTime: reserve.endTime,
      reservDate: reserve.reservDate,
      reqMade: reserve.reqMade
    });
    await newRes.save();
  }
}

(async () => {
  await seedDatabase();
  console.log('Database seeded!');
  process.exit();
})();