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
    anonymous: r.isAnon,
    userId: r.userIdNum || 'No ID' 
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
  const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;

  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    // iterate through each time slot
    for (let i = parseInt(startTime); i <= parseInt(endTime); i++) {
      
      // only makes new reservation if it doesn't exist (isn't booked)
      let reservedSlot = await ReserveSchema.findOne({
        slotName: chosenSlot,
        lab: lab._id,
        seat: seat._id,
        timeSlot: i.toString(),
        reservDate: new Date(resDate),
      });

      if (!reservedSlot) {
          const newRes = new ReserveSchema({
            userID: null,   // null for students page. will fix in session handling
            userIdNum: null,
            isAnon: anonymous,
            slotName: chosenSlot,
            lab: lab._id,
            seat: seat._id,
            timeSlot: i.toString(),
            reservDate: new Date(resDate),
            reqMade: phTimeNow
          });

          await newRes.save();
      } else {
        // In case user reserving a taken slot
        return res.render('error', {
          title: 'Reservation Error',
          message: 'Oops! the slot you selected is already reserved.'
        });
      }
    }

    return res.redirect('/createreserve?success=true');
    
  } catch (err) {
    console.log('Form or request body error');
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


// will get rid of this when session handling is done
// i need url request for the student id to be finished

// /Tsubmit-reservation 
exports.postResTech = async (req, res) => {
  const { studentID, chosenSlot, resDate, startTime, endTime, anonymous } = req.body;
  
  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const studentUserID = await UserSchema.findOne({ idNum: studentID }).exec();
    
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    
    // iterate through each time slot
    for (let i = parseInt(startTime); i <= parseInt(endTime); i++) {
      
      // only makes new reservation if it doesn't exist (isn't booked)
      let reservedSlot = await ReserveSchema.findOne({
        slotName: chosenSlot,
        lab: lab._id,
        seat: seat._id,
        timeSlot: i.toString(),
        reservDate: new Date(resDate),
      }).exec();

      if (!reservedSlot) {
          const newRes = new ReserveSchema({
            userID: studentUserID ? studentUserID._id : null,   // null for students page. will fix in session handling
            userIdNum: studentID,
            isAnon: anonymous,
            slotName: chosenSlot,
            lab: lab._id,
            seat: seat._id,
            timeSlot: i.toString(),
            reservDate: new Date(resDate),
            reqMade: phTimeNow
          });

          await newRes.save();
      } else {
        // In case user reserving a taken slot
        return res.render('error', {
          title: 'Reservation Error',
          message: 'Oops! the slot you selected is already reserved.'
        });
      }
    }
    
    return res.redirect('/Tcreatereserve?success=true');
    
  } catch (err) {
    console.log('Form or request body error');
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
    
    const referer = req.get('Referer') || '/viewreservs';
    res.redirect(referer);
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).send("Failed to delete reservation.");
  }
};

// /editres/:id
exports.getEditRes = async (req, res) => {
  try {
    const reservation = await ReserveSchema.findById(req.params.id)
      .populate('lab seat');

    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    const labs = await LabSchema.find();

        const labsClean = labs.map(lab => ({
  value: lab._id.toString(),
  name: lab.labName
}));


    // Format the reservation date
    const formattedDate = reservation.reservDate.toISOString().split('T')[0];

    res.render('editreserve', {
      lab: reservation.lab.labName,
      labId: reservation.lab._id.toString(),
      seat: reservation.seat?.seatCode,
      time: timeLabels[reservation.timeSlot],
      timeSlot: reservation.timeSlot,
      reservDate: formattedDate,
      editId: reservation._id,
      success: req.query.success === 'true',
      labs: labsClean,
      timeLabels
    });

  } catch (err) {
    console.error('Edit reservation error:', err);
    res.status(500).send('Server error while loading reservation');
  }
};

exports.postEditRes = async (req, res) => {
  const { chosenSlot, resDate, timeSlot, anonymous } = req.body;
  const reservationId = req.params.id;

  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');
    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    if (!lab || !seat) {
      return res.render('error', {
        title: 'Invalid Reservation',
        message: 'The selected lab or seat does not exist.'
      });
    }

    const conflictingRes = await ReserveSchema.findOne({
      _id: { $ne: reservationId },
      slotName: chosenSlot,
      lab: lab._id,
      seat: seat._id,
      timeSlot: timeSlot,
      reservDate: new Date(resDate)
    });

    if (conflictingRes) {
      return res.render('error', {
        title: 'Conflict Detected',
        message: 'Oops! Another reservation is already booked for that slot.'
      });
    }

    const reservationToEdit = await ReserveSchema.findById(reservationId);

    if (!reservationToEdit) {
      return res.render('error', {
        title: 'Reservation Not Found',
        message: 'Cannot find reservation to update.'
      });
    }

    reservationToEdit.slotName = chosenSlot;
    reservationToEdit.lab = lab._id;
    reservationToEdit.seat = seat._id;
    reservationToEdit.timeSlot = timeSlot;
    reservationToEdit.reservDate = new Date(resDate);
    reservationToEdit.isAnon = anonymous;
    reservationToEdit.reqMade = phTimeNow;

    await reservationToEdit.save();

    return res.redirect('/tviewreservs?success=true');
  } catch (err) {
    console.log('Form or request body error:', err);
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
};
