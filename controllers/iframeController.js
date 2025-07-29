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
  let reservedSeats = [];
  let labID;

  try {
    // Find Lab by name
    labID = await LabSchema.findOne({ labName: `Lab ${lab}` }).exec();

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
    for (let i = parseInt(start); i <= parseInt(end); i++) {
      const reservations = await ReserveSchema.find({
        lab: labID._id,
        reservDate: new Date(date),
        timeSlot: i.toString()
      }).populate('seat').lean();

      reservations.forEach(r => {
        if (r.seat?.seatCode) reservedSeats.add(r.seat.seatCode);
      });
    }

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