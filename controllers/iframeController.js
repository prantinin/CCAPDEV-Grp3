const ReserveSchema = require('../models/Reservations');
const LabSchema = require('../models/Labs');
const { labs, areas } = require('../data/areas');
//new
//const mongoose = require('mongoose');


// /unavailiframe
exports.getUnavailFrame = (req, res) => {
  res.render('unavailiframe', {
    title: 'Slots Unavailable',
    layout: false
  });
}; 

/*
exports.getUnavailIframe = async (req, res) => {
  const labQuery = req.query.lab;
  let labID;

  try {
    if (mongoose.Types.ObjectId.isValid(labQuery)) {
      // If it's a valid ObjectId, use _id
      labID = await LabSchema.findById(labQuery).exec();
    } else {
      // Fallback for older name-based links (if any still exist)
      labID = await LabSchema.findOne({ labName: `Lab ${labQuery}` }).exec();
    }

    if (!labID) {
      console.error(`Lab not found for query: ${labQuery}`);
      return res.status(404).send('Lab not found');
    }

    // Now proceed to render iframe content using labID
    res.render('unavailiframe', {
      lab: labID,
      date: req.query.date,
      time: req.query.time
    });

  } catch (err) {
    console.error('Error loading lab:', err);
    res.status(500).send('Internal server error');
  }
};
*/

/*
// /reserveiframe
exports.getResIframe = async (req, res) => {
  const { lab, date, time } = req.query;

  let reservedSeats = [];

  if (lab && date && time) {
    const labID = await LabSchema.findOne({ labName: `Lab ${lab}` }).exec();

    const reservations = await ReserveSchema.find({
      lab: labID._id,
      reservDate: new Date(date),
      timeSlot: time
    })
    .populate('seat')
    .lean();

    reservedSeats = reservations.map(r => r.seat?.seatCode);
  }

  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    areas: areas,
    reservedSeats
  });
};
*/

exports.getResIframe = async (req, res) => {
  const { lab, date, time } = req.query;

  let reservedSeats = [];

  if (lab && date && time) {
    const labID = await LabSchema.findOne({ labName: `Lab ${lab}` }).exec();

    if (!labID) {
      console.error(`Lab not found for query: Lab ${lab}`);
      return res.render('reserveiframe', {
        title: 'Invalid Lab',
        layout: false,
        areas,
        reservedSeats: []
      });
    }

    const reservations = await ReserveSchema.find({
      lab: labID._id,
      reservDate: new Date(date),
      timeSlot: time
    })
    .populate('seat')
    .lean();

    reservedSeats = reservations.map(r => r.seat?.seatCode);
  }

  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    areas,
    reservedSeats
  });
};
