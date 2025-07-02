const mongoose = require('mongoose');

const uri = "mongodb+srv://labubuddies:ccapdev2025@cluster0.c6mgfi4.mongodb.net/labubuddiesDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
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
