const UserSchema = require('../models/Users');

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Labubuddy | Login',
    layout: false
  });
};

exports.postLogin = async (req, res) => {
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
};

exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Labubuddy | Register',
    layout: false
  });
};

exports.postRegister = async (req, res) => {
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
};