const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB')
  .then(() => {
    console.log('Connected to MongoDB...');

    const testSchema = new mongoose.Schema({ msg: String });
    const Test = mongoose.model('Test', testSchema);

    const doc = new Test({ msg: 'Hello, Labubuddies!' });
    return doc.save();
  })
  .then(() => {
    console.log('Test document inserted!');
    mongoose.connection.close();
  })
  .catch(err => console.log('Could not connect to MongoDB...', err));