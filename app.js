const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const UserSchema = require('./models/Users');
const ReserveSchema = require('./models/Reservations');
const SlotSchema = require('./models/ReservedSlots');
const SeatSchema = require('./models/Seats');
const LabSchema = require('./models/Labs');
const { labs, areas } = require('./data/areas');

const app = express();
const port = 3000;



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
    const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;

    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();

    const startIndex = timeLabels.indexOf(startTime);
    const endIndex = timeLabels.indexOf(endTime);

    // Checking if the slot already exists  
    let slotsExist = false;
    
    for (i = startIndex; i <= endIndex; i++) {
      slotInstance = await SlotSchema.findOne({
        labName: lab._id,
        seatCode: seat._id,
        slotTime: i,
        slotDate: new Date(resDate)
      });

      if (slotInstance) {
        slotsExist = true;
        break;
      }
    }

    // only makes new reservation if the slot doesn't exist (isn't booked)
    if (!slotsExist) {
        
        // Creating the slots array
        const slotIDs = [];
        for (i = startIndex; i < endIndex; i++) {
          const slotInstance = new SlotSchema({
            labName: lab._id,
            seatCode: seat._id,
            slotTime: i,
            slotDate: new Date(resDate)
          });
          await slotInstance.save();
          slotIDs.push(slotInstance._id);
        }

        // making the reservation/s
        const newRes = new ReserveSchema({
          userID: null,   // null for students page. will fix in session handling
          userIdNum: null,
          isAnon: anonymous,
          slotID: slotIDs,
          slotName: chosenSlot,
          startTime: startTime,
          endTime: endTime,
          reservDate: new Date(resDate),
          reqMade: Date.now()
        });

        await newRes.save();
    } else {

      // In case user reserving a taken slot
      return res.render('error', {
        title: 'Reservation Error',
        message: 'Oops one or more slots you selected are already reserved.'
      });
    }
  } catch (err) {
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
});


// For loading pre-made data
const seedDatabase = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');

  // Clear schema's existing data
  await UserSchema.deleteMany({});
  await ReserveSchema.deleteMany({});
  await SlotSchema.deleteMany({});
  await SeatSchema.deleteMany({});
  await LabSchema.deleteMany({});

  // Load dynamic JSON files
  const reservedata = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/reservedata.json'), 'utf-8'));

  // Load static JSON files
  const usersdata = require('./data/usersdata.json');
  const seatsdata = require('./data/seatsdata.json');
  const labsdata = require('./data/labsdata.json');

  await UserSchema.insertMany(usersdata);
  await SeatSchema.insertMany(seatsdata);
  await LabSchema.insertMany(labsdata);

  // Replacing reservations' null values
  for (const reserve of reservedata) {
    
    // updating userID
    const userSchoolId = reserve.userIdNum;
    const user = await UserSchema.findOne({ idNum : userSchoolId }).exec();

    // making new slots and adding to slot array
    const [ labNamePart, seatCodePart ] = reserve.slotName.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();

    const startIndex = timeLabels.indexOf(reserve.startTime);
    const endIndex = timeLabels.indexOf(reserve.endTime);

    const slotIDs = [];
    for (i = startIndex; i < endIndex; i++) {
      const slotInstance = new SlotSchema({
        labName: lab._id,
        seatCode: seat._id,
        slotTime: i,
        slotDate: reserve.reservDate
      });
      await slotInstance.save();
      slotIDs.push(slotInstance._id);
    }

    const newRes = new ReserveSchema({
      userID: user._id,
      userIdNum: reserve.userIdNum,
      isAnon: reserve.isAnon,
      slotID: slotIDs,
      slotName: reserve.slotName,
      startTime: reserve.startTime,
      endTime: reserve.endTime,
      reservDate: reserve.reservDate,
      reqMade: reserve.reqMade
    });
    await newRes.save();
  }
}

seedDatabase();

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});