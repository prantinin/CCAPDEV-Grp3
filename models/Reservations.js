const mongoose = require('mongoose');

const reservSchema = new mongoose.Schema({
    userEmail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAnon: {
        type: Boolean,
        required: false
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
    reqMade: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Reserve', reservSchema);