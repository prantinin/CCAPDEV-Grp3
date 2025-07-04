const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const { labs, areas } = require('./data/areas');
const User = require('./models/User');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.log('Could not connect to MongoDB...', err));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'superSecretSessionKey',
  resave: false,
  saveUninitialized: false
}));

// Handlebars setup (with .handlebars extension)
app.engine('handlebars', exphbs.engine({
  extname: 'handlebars',                                  // ✅ Allow .handlebars file extensions
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');

// Static files (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/createreserve', (req, res) => {
  // Only allow access if user is logged in
  if (!req.session.user) return res.redirect('/login');

  res.render('createreserve', {
    title: 'Labubuddies | Reserve',
    user: req.session.user  // ← lets you access user info in Handlebars
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

// POST: Register
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
      userID: Date.now(),
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


// POST: Login
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

    // Save user session
    req.session.user = {
      id: user.userID,
      fName: user.fName,
      lName: user.lName,
      isTech: user.isTech
    };

    // ✅ Redirect to createreserve after successful login
    res.redirect('/createreserve');
  } catch (err) {
    console.error(err);
    res.send('Login failed');
  }
});

app.post('/submit-reservation', (req, res) => {
  const { slot, date, startTime, endTime, anonymous } = req.body;

  console.log('Reservation received:', { slot, date, startTime, endTime, anonymous });

  // TODO: Save to DB
  res.send('Reservation submitted!'); // or redirect to a success page
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
