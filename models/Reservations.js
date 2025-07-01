const mongoose = require('mongoose');

const reservSchema = new mongoose.Schema({
    reservID: {
        type: Number,
        require: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isAnon: {
        type: Boolean,
        require: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
    },
    reservStart: {
        type: Number,
        require: true
    },
    reservEnd: {
        type: Number,
        require: true
    },
    reservDate: {
        type: String,
        require: true
    },
    reqTime: {
        type: Number,
        require: true
    },
    reqDate: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.model('Seat', seatSchema);

module.exports = mongoose.model('Reserv', reservSchema);