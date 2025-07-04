const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');

const User = require('./models/Users');
const Lab = require('./models/Labs');
const Seat = require('./models/Seats');
const Reserve = require('./models/Reservations');
const { labs, areas } = require('./data/areas');

const app = express();


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
    title: 'Login',
    layout: false
  });
});

app.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
    layout: false
  });
});

app.get('/createreserve', (req, res) => {
  console.log('Rendering createreserve page');
  res.render('createreserve', { title: 'Labubuddies | Reserve' });
});


app.get('/reserveiframe', (req, res) => {
  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    labs: labs,
    areas: areas
  });
}); 


// Post
app.post('/register', async (req, res) => {
  const { fname, lname, email, password, confirmPassword, role } = req.body;

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

/* -- Gave up trying to fix this TvT. if you wanna try again, remove login.handlebar's "a href" and turn it back into a button
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
*/

app.post('/submit-reservation', async (req, res) => {
  const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;

  // chosenSlot: "Lab 1, seat A1"
  const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

  // 🔍 Find the Seat (and maybe Lab)
  const seat = await Seat.findOne({ seatCode: seatCodePart }).exec();
  const user = await User.findOne({ email: "test@email.com" }).exec();

  const newRes = new Reserve({
    userEmail: user._id,
    isAnon: anonymous === "on",
    slot: seat,
    reservStart: startTime,
    reservEnd: endTime,
    reservDate: resDate,
    reqMade: Date.now()
  });

  await newRes.save();
  res.send("Reservation submitted!");
});




// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});