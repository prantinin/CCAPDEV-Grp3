const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');

const { labs, areas } = require('./data/areas');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.log('Could not connect to MongoDB...', err));

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
  res.render('createreserve', { title: 'Create Reservation' });
});

app.get('/reserveiframe', (req, res) => {
  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    labs: labs,
    areas: areas
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
