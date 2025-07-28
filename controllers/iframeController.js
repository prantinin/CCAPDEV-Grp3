const ReserveSchema = require('../models/Reservations');
const LabSchema = require('../models/Labs');
const { labs, areas } = require('../data/areas');
const mongoose = require('mongoose');


// /unavailiframe
exports.getUnavailFrame = (req, res) => {
  res.render('unavailiframe', {
    title: 'Slots Unavailable',
    layout: false
  });
};

exports.getResIframe = async (req, res) => {
  const { lab, date, time } = req.query;

  let reservedSeats = [];
  let labID;

  try {
    if (mongoose.Types.ObjectId.isValid(lab)) {
      // ID format
      labID = await LabSchema.findById(lab).exec();
    } else {
      // Name format, e.g. "1" → "Lab 1"
      labID = await LabSchema.findOne({ labName: `Lab ${lab}` }).exec();
    }

    if (!labID) {
      console.error(`Lab not found for query: ${lab}`);
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
    }).populate('seat').lean();

    reservedSeats = reservations.map(r => r.seat?.seatCode);

  } catch (err) {
    console.error('Error loading reservation:', err);
  }

  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    areas,
    reservedSeats
  });
};