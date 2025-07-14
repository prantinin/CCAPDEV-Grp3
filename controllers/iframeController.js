const ReserveSchema = require('./models/Reservations');
const LabSchema = require('./models/Labs');

// /unavailiframe
exports.getUnavailFrame = (req, res) => {
  res.render('unavailiframe', {
    title: 'Slots Unavailable',
    layout: false
  });
}; 

// /api/reservedSeats
exports.getResSeatsAPI = async (req, res) => {
  const { lab, date, time } = req.query;
  
  const labID = await LabSchema.findOne({ labName : `Lab ${lab}` }).exec();

  let filter = {};
  if (labID) {
    filter.lab = labID;
  }
  if (date) {
    filter.reservDate = date  ;
  }
  if (time) {
    filter.timeSlot = time;
  }

  try {
    const reservations = await ReserveSchema.find(filter)
      .populate('seat')
      .lean();

    const reservedSeats = reservations.map(r => r.seat?.seatCode);

    res.json(reservedSeats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

// /reserveiframe
exports.getResIframe = async (req, res) => {
  const { lab, date, time } = req.query;

  let reservedSeats = [];
  if (lab && date && time) {
    const labID = await LabSchema.findOne({ labName : lab }).exec();

    reservedSeats = await ReserveSchema.find({
      lab: labID,
      reservDate: new Date(date),
      timeSlot: time
    }).distinct('seat');
  }

  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    areas: areas,
    reservedSeats: reservedSeats.map(s => s.toString())
  });
};