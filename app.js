const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');

const User = require('./models/Users');
const Reserve = require('./models/Reservations');
const Slot = require('./models/Slots');
const Seat = require('./models/Seats');
const Lab = require('./models/Labs');
const { labs, areas } = require('./data/areas');

const app = express();

// for logic
const timeLabels = [
    "7:30 AM - 8:00 AM", "8:00 AM - 8:30 AM", "8:30 AM - 9:00 AM",
    "9:00 AM - 9:30 AM", "9:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
    "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM", "1:00 PM - 1:30 PM",
    "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM", "2:30 PM - 3:00 PM",
    "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM", "4:00 PM - 4:30 PM",
    "4:30 PM - 5:00 PM", "5:00 PM - 5:30 PM", "5:30 PM - 6:00 PM",
    "6:00 PM - 6:30 PM", "6:30 PM - 7:00 PM", "7:00 PM - 7:30 PM",
    "7:30 PM - 8:00 PM", "8:00 PM - 8:30 PM", "8:30 PM - 9:00 PM"
  ];


// MongoDB connection
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

app.get('/viewreservs', (req, res) => {
  res.render('viewreservs', {
    title: 'Labubuddies | View Reservations'
  });
}); 



// Post
app.post('/register', async (req, res) => {
  const { fname, lname, email, password, confirmPassword, role, idNum } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('An account with this email already exists');
    }

    const newUser = new User({
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
    const user = await User.findOne({ email });

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
  const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;

  // Searching for slot in database data
  const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

  const lab = await Lab.findOne({ labName : labNamePart }).exec();
  const seat = await Seat.findOne({ seatCode: seatCodePart }).exec();

  const startIndex = timeLabels.indexOf(startTime);
  const endIndex = timeLabels.indexOf(endTime);
  
  for (i = startIndex; i <= endIndex; i++) {
    slotInstance = await Slot.findOne({
      labName: lab._id,
      seatName: seat._id,
      slotTime: i,
      slotDate: new Date(resDate)
    });

    
    // Creating a new reservation
    const newRes = new Reserve({
      userID: null,   // null for students page. will fix in session handling
      userIdNum: null,
      isAnon: anonymous,
      slotID: slotInstance._id,
      slotName: chosenSlot,
      startTime: startTime,
      endTime: endTime,
      reqMade: Date.now()
    });

    await newRes.save();
  }
});


// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});