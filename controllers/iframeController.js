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

// /reserveiframe
exports.getResIframe = async (req, res) => {
  const { date, start, end, lab } = req.query;
  console.log('Query params:', req.query);
  let reservedSeats = [];
  let labID;

  try {
    // Find Lab by name

    labID = await LabSchema.findOne({ labName: `Lab ${lab}` }).exec();
    console.log(`Lab ${lab}`);
    if (!labID) {
      console.error(`Lab not found for query: ${lab}`);
      return res.render('reserveiframe', {
        title: 'Invalid Lab',
        layout: false,
        areas,
        reservedSeats: []
      });
    }

    // Find reservations with same param
    // Find all overlapping reservations once
    const allReservations = await ReserveSchema.find({
      lab: labID._id,
      reservDate: new Date(date),
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).populate('seat').lean();

    // Extract all reserved seat codes
    allReservations.forEach(r => {
      if (r.seat?.seatCode) reservedSeats.push(r.seat.seatCode);
    });

    console.log('All reservations found for given slot:', allReservations);


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