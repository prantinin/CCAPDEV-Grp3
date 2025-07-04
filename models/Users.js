const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        require: true
    },
    lName: {
        type: String,
        require: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
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