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
  const { fName, lName, password, isTech } = req.body;

  try {
    const hashedPw = await bcrypt.hash(password, 10);
    const newUser = new User({
      userID: Date.now(), // simplistic unique ID
      fName,
      lName,
      password: hashedPw,
      isTech: isTech === 'on',
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
  const { fName, password } = req.body;

  try {
    const user = await User.findOne({ fName });
    if (!user) return res.send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Incorrect password');

    req.session.user = {
      id: user.userID,
      name: user.fName,
      isTech: user.isTech
    };

    res.redirect('/createreserve'); 
  } catch (err) {
    console.error(err);
    res.send('Login failed');
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
