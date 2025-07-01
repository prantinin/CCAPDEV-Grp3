const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: Number,
        require: true 
    },
    fName: {
        type: String,
        require: true
    },
    lName: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    isTech: {
        type: Boolean,
        require: true
    },
    profPic: String,
    profDesc: String
});

// module.exports = mongoose.model('User', userSchema);

const User = mongoose.model('User', userSchema);

const user1 = new User({
    userID: 12345,
    fName: "Clark",
    lName: "Kent",
    password: "BATMANUNDERRATED",
    isTech: false
})

user1.save();

/*

In other files (e.g., server.js, controller.js, etc.),
import the model with:
    const User = require('./models/User');

    Now you can use User.find(), User.create(), etc., in that file.
*/