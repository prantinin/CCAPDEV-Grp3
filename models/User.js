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

module.exports = mongoose.model('User', userSchema);