const mongoose = require('mongoose');

const reservSchema = new mongoose.Schema({
    reservID: {
        type: Number,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAnon: {
        type: Boolean,
        required: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
    },
    reservStart: {
        type: Number,
        required: true
    },
    reservEnd: {
        type: Number,
        required: true
    },
    reservDate: {
        type: Date,
        required: true
    },
    reqTime: {
        type: Number,
        required: true
    },
    reqDate: {
        type: Date,
        required: true
    }
});

const User = mongoose.model('User', userSchema);
const Reserv = mongoose.model('Reserv', reservSchema);
const Seat = mongoose.model('Seat', seatSchema);

module.exports = { User, Reserv, Seat };