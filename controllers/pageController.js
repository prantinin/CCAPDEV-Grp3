// '/'
exports.getIndex = (req, res) => {
  res.render('index', {
    title: 'Labubuddies',
    layout: false
  });
};

// '/landingpage'
exports.getLanding = (req, res) => {
  res.render('landingpage', {
    title: 'Labubuddies',
    layout: false
  });
};