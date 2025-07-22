const UserSchema = require('../models/Users');
const ReserveSchema = require('../models/Reservations');
const SeatSchema = require('../models/Seats');
const LabSchema = require('../models/Labs');
const { labs, areas } = require('../data/areas');

const timeLabels = require('../data/timeLabels');

function formatReservation(r) {
  return {
    id: r._id,
    lab: r.lab.labName,
    seat: r.seat.seatCode,
    reservDate: new Date(r.reservDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: timeLabels[r.timeSlot] || 'Unknown Time Slot',
    startTime: r.timeSlot.split(' to ')[0],
    endTime: r.timeSlot.split(' to ')[1],
    reqMade: new Date(r.reqMade).toLocaleString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    name: r.isAnon ? 'Anonymous' : `${r.userID?.fName} ${r.userID?.lName}`,
    email: r.isAnon ? null : r.userID?.email,
    anonymous: r.isAnon
  };
}

// /createreserve
exports.getCreateResStudent = (req, res) => {
  res.render('createreserve', { 
    title: 'Labubuddy | Reserve',
    roleTitle: 'Student',
    success: req.query.success === 'true',
    labs: labs
  });
};

// /submit-reservation
exports.postResStudent = async (req, res) => {
  try {
    const { chosenSlot, resDate, timeSlot, anonymous } = req.body;

    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    
    reservedSlot = await ReserveSchema.findOne({
      slotName: chosenSlot,
      lab: lab._id,
      seat: seat._id,
      timeSlot: timeSlot,
      reservDate: new Date(resDate),
    });

    // only makes new reservation if it doesn't exist (isn't booked)
    if (!reservedSlot) {
        const newRes = new ReserveSchema({
          userID: null,   // null for students page. will fix in session handling
          userIdNum: null,
          isAnon: anonymous,
          slotName: chosenSlot,
          lab: lab._id,
          seat: seat._id,
          timeSlot: timeSlot,
          reservDate: new Date(resDate),
          reqMade: phTimeNow
        });

        await newRes.save();
        return res.redirect('/createreserve?success=true');
    } else {
      // In case user reserving a taken slot
      return res.render('error', {
        title: 'Reservation Error',
        message: 'Oops! the slot you selected is already reserved.'
      });
    }
  } catch (err) {
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
};

// /Tcreatereserve
exports.getCreateResTech = (req, res) => {
  res.render('Tcreatereserve', { 
    title: 'Labubuddy | TReserve',
    roleTitle: 'Technician',
    success: req.query.success === 'true',
    labs: labs
  });
};

// /Tsubmit-reservation
exports.postResTech = async (req, res) => {
  try {
    const { studentID, chosenSlot, resDate, timeSlot, anonymous } = req.body;

    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const studentUserID = await UserSchema.findOne({ idNum: studentID }).exec();
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    
    reservedSlot = await ReserveSchema.findOne({
      slotName: chosenSlot,
      lab: lab._id,
      seat: seat._id,
      timeSlot: timeSlot,
      reservDate: new Date(resDate),
    }).exec();

    // only makes new reservation if it doesn't exist (isn't booked)
    if (!reservedSlot) {
        const newRes = new ReserveSchema({
          userID: studentUserID._id,
          userIdNum: studentID,
          isAnon: anonymous,
          slotName: chosenSlot,
          lab: lab._id,
          seat: seat._id,
          timeSlot: timeSlot,
          reservDate: new Date(resDate),
          reqMade: phTimeNow
        });

        await newRes.save();
        return res.redirect('/Tcreatereserve?success=true');
    } else {
      // In case user reserving a taken slot
      return res.render('error', {
        title: 'Reservation Error',
        message: 'Oops! the slot you selected is already reserved.'
      });
    }
  } catch (err) {
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
};

// /viewreservs
exports.getViewResStudent = async (req, res) => {   //student view

  const maricarmenIdNum = 12406543;

  try {
    const rawReservations = await ReserveSchema.find({ userIdNum: maricarmenIdNum })
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .lean();

    const formattedReservations = rawReservations.map(formatReservation);

    res.render('viewreservs', {
      title: 'Labubuddy | View Reservations',
      roleTitle: 'Student',
      reservations: formattedReservations
    });
    
  } catch (error) {
    console.error('Student view error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Could not load reservations.'
    });
  }
};

// /tviewreservs
exports.getViewResTech = async (req, res) => {
  const { lab, date, time } = req.query;
  const filter = {};

  if (lab) filter.lab = lab;
  if (date) filter.reservDate = new Date(date);
  if (time) filter.timeSlot = time;

  try {
    const reservations = await ReserveSchema.find(filter)
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .lean();

    const formattedReservations = reservations.map(formatReservation);
    const availableSeats = 40 - reservations.length;
    const isFiltered = lab && date && time; 
    let labName = 'No lab selected';
    if (lab) {
      try {
        const labDoc = await LabSchema.findById(lab).lean();
        labName = labDoc?.labName || 'No lab selected';
      } catch (err) {
        console.error('Lab lookup failed:', err);
        labName = 'No lab selected';
      }
    }


    const formattedFilter = {
      lab: labName,
      date: date
        ? new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : null,
      time
    };

    res.render('tviewreservs', {
    title: 'Labubuddy | Filtered Reservations',
    filter: formattedFilter,
    isFiltered,
    availableSeats,
    reservations: formattedReservations
    });


  } catch (error) {
    console.error('Technician filter error:', error);
    res.render('error', {
      title: 'Error',
      roleTitle: 'Technician',
      message: 'Could not fetch filtered results.'
    });
  }
};

// /tfilterreservs
exports.getFilterResTech = async (req, res) => {
    //const labs = await Lab.find().lean();
    const labs = await LabSchema.find().lean();

    res.render('tfilterreservs', {
      title: 'Labubuddy | Technician Filter',
      roleTitle: 'Technician',
      timeLabels,
      labs
    });
};

exports.deleteReservation = async (req, res) => {
  try {
    await ReserveSchema.findByIdAndDelete(req.params.id);
    res.redirect('/viewreservs');
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).send("Failed to delete reservation.");
  }
};

// GET /editreserve/:id  - render with data
exports.getEditRes = async (req, res) => {
  try {
    const resID = req.params.id;

    const reservation = await ReserveSchema.findById(resID)
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .exec();

    if (!reservation) {
      return res.render('error', {
        title: 'Reservation Not Found',
        message: 'No reservation found with the provided ID.'
      });
    }

    const labsRaw = await LabSchema.find().exec();
    const labs = labsRaw.map(lab => ({
      value: lab._id.toString(),
      name: lab.labName
    }));

    res.render('editreserve', {
      title: 'Labubuddy | Reserve',
      success: req.query.success === 'true',
      reservation,
      labs,
      timeLabels,
      editId: resID, 
    });
  } catch (err) {
    return res.render('error', {
      title: 'Load Error',
      message: 'Something went wrong while retrieving reservation data.'
    });
  }
};



// post for /editreserve - render with data
exports.postEditRes = async (req, res) => {
  try {
    const { editId, studentID, chosenSlot, resDate, timeSlot, anonymous } = req.body;

    const seat = await SeatSchema.findOne({ seatCode: chosenSlot }).exec();
    const studentUser = await UserSchema.findOne({ idNum: studentID }).exec();
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    const existingRes = await ReserveSchema.findById(editId).exec();

    const conflict = await ReserveSchema.findOne({
      lab: existingRes.lab,
      seat: seat._id,
      reservDate: new Date(resDate),
      timeSlot: parseInt(timeSlot),
      _id: { $ne: editId }
    }).exec();

    if (conflict) {
      return res.render('error', {
        title: 'Reservation Conflict',
        message: 'Oops! That slot is already reserved by someone else.'
      });
    }

    await ReserveSchema.findByIdAndUpdate(editId, {
      userID: studentUser._id,
      userIdNum: studentID,
      isAnon: anonymous,
      slotName: `${existingRes.lab.labName}, seat ${seat.seatCode}`,
      seat: seat._id,
      reservDate: new Date(resDate),
      timeSlot: parseInt(timeSlot),
      reqMade: phTimeNow
    });

    return res.redirect(`/editreserve/${editId}?success=true`);
  } catch (err) {
    return res.render('error', {
      title: 'Update Error',
      message: 'Something went wrong while updating the reservation.'
    });
  }
};
