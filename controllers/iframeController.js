const ReserveSchema = require('../models/Reservations');
const LabSchema = require('../models/Labs');
const { labs, areas } = require('../data/areas');

// /unavailiframe
exports.getUnavailFrame = (req, res) => {
  res.render('unavailiframe', {
    title: 'Slots Unavailable',
    layout: false
  });
}; 

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