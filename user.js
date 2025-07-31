const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const router = express.Router();
const User = require('../models/User');


function isAuthenticated(role) {
  return function (req, res, next) {
    // Insert checking of session and accessrole logic here, destroy the session and redirect to
    // login screen if it is invalid.
    if (req.session.user && req.session.user.accessrole === role) {
      return next();
    } else {
      req.session.destroy(() => {
        res.redirect('/login');
      });
    }
  }
};


router.get('/login', (req, res) => {
  //res.sendFile(path.join(__dirname, 'public/bootstrapRegistration.html'));
  res.render('partials/login');
});

router.post('/register', async (req, res) => {
  const formData = req.body;
  formData.newsletter = formData.newsletter === 'on';
  const newUser = new User(formData);
  await newUser.save();

  res.render('partials/confirmation', { formData });
});

// DONE!
router.post('/loginProcess', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && await user.comparePassword(password)) {
      req.session.user = {
        id: user._id,
        username: user.username,
        accessrole: user.accessrole
      };

      return res.redirect(`/${user.accessrole}`); // Redirect based on access role
      // include the user profile object in the ssession here
      // use the accessrole as the path of the redirection and do not hard code paths for Student and Administrator
    } else {
      res.status(401).send('Invalid login');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// View all registered users (for testing)
// Complete the code for Authentication
router.get('/Administrator', isAuthenticated('Administrator'), async (req, res) => {
    try {
      const users = await User.find().lean();
      res.render('partials/users', { users });
    } catch (err) {
      res.status(500).send("Error fetching users.");
    }
  });
  
// Complete the code for Authentication
router.get('/Student', isAuthenticated('Student'),async (req, res) => {
  try {
    const users = await User.findOne({ username: req.session.user.username }).lean();
    res.render('partials/oneusers', { users });
  } catch (err) {
    res.status(500).send("Error fetching users.");
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;