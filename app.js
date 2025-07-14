const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');

const UserSchema = require('./models/Users');
const ReserveSchema = require('./models/Reservations');
const SeatSchema = require('./models/Seats');
const LabSchema = require('./models/Labs');
const { labs, areas } = require('./data/areas');

const app = express();
const port = 3000;



// MongoDB connection (put this in a .env)
mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.log('Could not connect to MongoDB...', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// For Login - Remember Function
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Handlebars setup (.handlebars ext)
app.engine('handlebars', exphbs.engine({
  extname: 'handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
  helpers: {
    formatDate: function (date) { 
       if (!date) return '';
       return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
     },
      eq: function (a, b) {
        return a === b;
       }
 }
}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));


// Prevent browser caching for dynamic routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});



// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Labubuddies',
    layout: false
  });
});

app.get('/landingpage', (req, res) => {
  res.render('landingpage', {
    title: 'Labubuddies',
    layout: false
  });
});

app.get('/login', (req, res) => {
  console.log('Remembered Email:', req.cookies.rememberedEmail); // for testing
  res.render('login', {
    title: 'Labubuddies | Login',
    layout: false
  });
});

app.get('/register', (req, res) => {
  res.render('register', {
    title: 'Labubuddies | Register',
    layout: false
  });
});

app.get('/createreserve', (req, res) => {
  res.render('createreserve', { 
    title: 'Labubuddies | Reserve',
    roleTitle: 'Student',
    success: req.query.success === 'true',
    labs: labs
  });
});

app.get('/Tcreatereserve', (req, res) => {
  res.render('Tcreatereserve', { 
    title: 'Labubuddies | TReserve',
    roleTitle: 'Technician',
    success: req.query.success === 'true',
    labs: labs
  });
});

app.get('/reserveiframe', async (req, res) => {
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
});

app.get('/api/reservedSeats', async (req, res) => {
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

  // testing
  console.log('Filter:', filter);

  try {
    const reservations = await ReserveSchema.find(filter)
      .populate('seat')
      .lean();

    const reservedSeats = reservations.map(r => r.seat?.seatCode);

    // testing
    console.log('Reservations found:', reservations);

    res.json(reservedSeats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.get('/unavailiframe', (req, res) => {
  res.render('unavailiframe', {
    title: 'Slots Unavailable',
    layout: false
  });
}); 

const timeLabels = require('./public/JS/viewprofile.js');
app.get('/viewprofile/:idNum', async (req, res) => {
  try {
    const idNum = parseInt(req.params.idNum);
    const currentUserIdNum = 12406543; // TODO: Replace with session
    
    if (isNaN(idNum)) {
      return res.status(400).render('error', { title: 'Invalid User ID' });
    }

    const [user, reservations] = await Promise.all([
      UserSchema.findOne({ idNum: idNum }).lean(),
      ReserveSchema.find({ userIdNum: idNum }).lean()
    ]);
    
    if (!user) {
      return res.status(404).render('error', { title: 'User Not Found' });
    }
    
    const transformedReservations = reservations.map(reservation => {
      const timeSlotIndex = parseInt(reservation.timeSlot);
      return {
        ...reservation,
        timeSlotDisplay: timeLabels[timeSlotIndex] || 'Invalid time slot'
      };
    });

    const isOwnProfile = idNum === currentUserIdNum;

    res.render('viewprofile', {
      title: 'Labubuddies | View Profile',
      roleTitle: 'Student',
      user: user,
      reservations: transformedReservations,
      isOwnProfile: isOwnProfile
    });

  } catch (error) {
    console.error("View Profile Error:", error);
    res.status(500).render('error', { title: 'Server Error' });
  }
});

app.get('/editprofile/:idNum', async (req, res) => {
  const idNum = parseInt(req.params.idNum);

  try {
    const user = await UserSchema.findOne({ idNum: idNum }).lean();
    
    if (!user) {
      return res.status(404).send("User not found.");
    }
    
    res.render('editprofile', {
      title: 'Labubuddies | Edit Profile',
      roleTitle: 'Student',
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading edit page.");
  }
});

app.post('/editprofile/:idNum', async (req, res) => {
  try {
    const { description } = req.body;
    const idNum = parseInt(req.params.idNum);

    const result = await UserSchema.findOneAndUpdate(
      { idNum: idNum },
      { profDesc: description },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).send("User not found.");
    }

    res.redirect(`/viewprofile/${idNum}`);
    

  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving profile.");
  }
});

app.get('/searchusers', async (req, res) => {
  try {

    const currentUserIdNum = 12406543;
    
    const users = await UserSchema.find({ 
      idNum: { $ne: currentUserIdNum }
    }).lean();
    
    res.render('searchusers', {
      title: 'LABubuddy | Search Users',
      roleTitle: 'Student',
      users: users,
      currentUserIdNum: currentUserIdNum 
    });
  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).render('error', { title: 'Server Error' });
  }
});

app.post('/searchusers', async (req, res) => {
  try {
    const { searchName, roleFilter } = req.body;
    
   
    let searchQuery = {};
    
    
    if (searchName && searchName.trim() !== '') {
      const trimmedSearch = searchName.trim();
      const nameParts = trimmedSearch.split(/\s+/); 
      
      if (nameParts.length === 1) {
       
        searchQuery.$or = [
          { fName: { $regex: nameParts[0], $options: 'i' } },
          { lName: { $regex: nameParts[0], $options: 'i' } }
        ];
      } else if (nameParts.length === 2) {
       
        searchQuery.$and = [
          { fName: { $regex: nameParts[0], $options: 'i' } },
          { lName: { $regex: nameParts[1], $options: 'i' } }
        ];
      } else {
        searchQuery.$or = [
          {
            $and: [
              { fName: { $regex: nameParts[0], $options: 'i' } },
              { lName: { $regex: nameParts.slice(1).join(' '), $options: 'i' } }
            ]
          },
      
          {
            $and: [
              { fName: { $regex: nameParts.slice(0, -1).join(' '), $options: 'i' } },
              { lName: { $regex: nameParts[nameParts.length - 1], $options: 'i' } }
            ]
          },
          
          { fName: { $regex: trimmedSearch, $options: 'i' } },
          { lName: { $regex: trimmedSearch, $options: 'i' } }
        ];
      }
    }
    
   
    if (roleFilter && roleFilter !== 'all') {
      if (roleFilter === 'technician') {
        searchQuery.isTech = true;
      } else if (roleFilter === 'student') {
        searchQuery.isTech = false;
      }
    }
    
   
    const currentUserIdNum = 12406543; // Hardcoded
    searchQuery.idNum = { $ne: currentUserIdNum };
    
    const users = await UserSchema.find(searchQuery).lean();
    
    res.render('searchusers', {
      title: 'LABubuddy | Search Users',
      roleTitle: 'Student',
      users: users,
      searchName: searchName,
      roleFilter: roleFilter
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).render('error', { title: 'Server Error' });
  }
});

function formatReservation(r) {
  return {
    id: r._id,
    lab: r.lab.labName,
    seat: r.seat.seatCode,
    reservDate: new Date(r.reservDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: r.timeSlot,
    startTime: r.timeSlot.split(' to ')[0],
    endTime: r.timeSlot.split(' to ')[1],
    reqMade: new Date(r.reqMade).toLocaleString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    name: r.isAnon ? 'Anonymous' : `${r.userID?.fName} ${r.userID?.lName}`,
    email: r.isAnon ? null : r.userID?.email,
    anonymous: r.isAnon
  };
}

app.get('/viewreservs', async (req, res) => {   //student view
  try {
    const rawReservations = await ReserveSchema.find()
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .lean();

    const formattedReservations = rawReservations.map(formatReservation);

    res.render('viewreservs', {
      title: 'Labubuddies | View Reservations',
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
});


app.get('/tfilterreservs', async (req, res) => {
    //const labs = await Lab.find().lean(); // load all lab options
    const labs = await LabSchema.find().lean(); // ✅ Uses the defined LabSchema

    res.render('tfilterreservs', {
      title: 'Labubuddies | Technician Filter',
      roleTitle: 'Technician',
      labs
    });
});


app.get('/tviewreservs', async (req, res) => {
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

    const formatted = reservations.map(formatReservation);
    const availableSeats = 40 - reservations.length;

    res.render('tviewreservs', {
      title: 'Labubuddies | Filtered Reservations',
      filter: { lab, date, time },
      availableSeats,
      reservations: formatted
    });

  } catch (error) {
    console.error('Technician filter error:', error);
    res.render('error', {
      title: 'Error',
      roleTitle: 'Technician',
      message: 'Could not fetch filtered results.'
    });
  }
});




//[tech] - view profile if clicked
app.get('/profile/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email }).lean();
  if (user) {
    res.render('viewprofile', { user });
  } else {
    res.status(404).render('error', { title: 'User Not Found' });
  }
});



// Post
app.post('/register', async (req, res) => {
  const { fname, lname, email, password, confirmPassword, role, idNum } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  // Validate idNum format
  const idNumPattern = /^1(0[1-9]|1[0-9]|2[0-5])0\d{4}$/; // DLSU id number format

  if (!idNumPattern.test(idNum)) {
    return res.send('Invalid ID Number format. Must be 8 digits, start with 1, and include valid entry year (e.g., 12345678)');
  }

  try {
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.send('An account with this email already exists');
    }

    const newUser = new UserSchema({
      fName: fname,
      lName: lname,
      email, 
      password,
      idNum,
      isTech: role === 'technician',
      profPic: '',
      profDesc: ''
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Registration failed');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserSchema.findOne({ email });

    if (!user) {
      return res.send('User not found');
    }

    if (password !== user.password) {
      return res.send('Incorrect password');
    }

    res.redirect('/createreserve');
  } catch (err) {
    console.error(err);
    res.send('Login failed');
  }
});


app.post('/submit-reservation', async (req, res) => {
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
});

// submit reservation (technician side)
app.post('/Tsubmit-reservation', async (req, res) => {
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
});

//delete reservation
app.post('/deletereservation/:id', async (req, res) => {
  await Reserve.findByIdAndDelete(req.params.id);
  res.redirect('/viewreservs');
});

//EDIT


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
