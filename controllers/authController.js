const User = require('../models/Users');

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Labubuddies | Login', layout: false });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('User not found');
  if (user.password !== password) return res.send('Incorrect password');
  res.redirect('/createreserve');
};

exports.getRegister = (req, res) => {
  res.render('register', { title: 'Labubuddies | Register', layout: false });
};

exports.postRegister = async (req, res) => {
  const { fname, lname, email, password, confirmPassword, role, idNum } = req.body;
  if (password !== confirmPassword) return res.send('Passwords do not match');
  const existing = await User.findOne({ email });
  if (existing) return res.send('User exists');
  const newUser = new User({ fName: fname, lName: lname, email, password, idNum, isTech: role === 'technician' });
  await newUser.save();
  res.redirect('/login');
};