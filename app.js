const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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



// Handlebars setup (.handlebars ext)
app.engine('handlebars', exphbs.engine({
  extname: 'handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));



// Routes
app.get('/login', (req, res) => {
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
    title: 'Labubuddies | Reserve'
  });
});

app.get('/reserveiframe', (req, res) => {
  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    labs: labs,
    areas: areas
  });
}); 

app.get('/viewprofile', (req, res) => {
  res.render('viewprofile', {
    title: 'Labubuddies | View Profile',
  });
}); 

app.get('/searchusers', (req, res) => {
  res.render('searchusers', {
    title: 'Labubuddies | Search Users',
  });
}); 

//view reservs - student
app.get('/viewreservs', async (req, res) => {
  try {
    const rawReservations = await ReserveSchema.find().lean();

    const formattedReservations = rawReservations.map(r => {
      const [labName, seatCode] = r.slotName.split(', seat ');

      return {
        id: r._id,
        lab: labName.trim(),
        seat: seatCode.trim(),
        reservDate: new Date(r.reservDate).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        startTime: r.startTime,
        endTime: r.endTime,
        reqMade: new Date(r.reqMade).toLocaleString('en-PH', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    });

    res.render('viewreservs', {
      title: 'Labubuddies | View Reservations',
      reservations: formattedReservations
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.render('error', {
      title: 'Error',
      message: 'Could not load reservations. Please try again later.'
    });
  }
});

//view reservs -technician
app.get('/viewreservs', async (req, res) => {
  const { lab, date, time } = req.query;
  const filter = {};

  if (lab) filter.lab = lab;
  if (date) filter.reservDate = new Date(date);
  if (time) filter.timeSlot = time;

  try {
    const reservations = await Reserve.find(filter)
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .lean();

    const formatted = reservations.map(r => ({
      id: r._id,
      name: r.userID ? `${r.userID.fName} ${r.userID.lName}` : null,
      email: r.userID ? r.userID.email : null,
      anonymous: r.isAnon,
      lab: r.lab.labName,
      seat: r.seat.seatCode,
      date: new Date(r.reservDate).toLocaleDateString('en-PH'),
      time: r.timeSlot
    }));

    const availableSeats = 40 - reservations.length; // placeholder logic

    res.render('viewreservs', {
      title: 'Labubuddies | Filtered Reservations',
      filter: { lab, date, time },  // display filter summary
      availableSeats,
      reservations: formatted
    });
  } catch (err) {
    console.error('Error loading filtered reservations:', err);
    res.render('error', {
      title: 'Error',
      message: 'Could not fetch reservation results.'
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
          reqMade: Date.now()
        });

        await newRes.save();
        return res.render('createreserve', {
          title: 'Labubuddies | Reserve',
          success: true
        });
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


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});