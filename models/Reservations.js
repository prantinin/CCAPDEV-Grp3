const mongoose = require('mongoose');

const reservSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false     // will change to true once sessionhandling is taught
    },
    userIdNum: {
        type: Number,
        required: false     // will change to true once sessionhandling is taught
    },
    isAnon: {
        type: Boolean,
        required: false
    },
    slotID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: false
    }],
    slotName: {
        type: String,
        required: true
    },
    startTime: {
        type: String,   // String in timeLabels array
        required: true
    },
    endTime: {
        type: String,   // String in timeLabels array
        required: true
    },
    reservDate: {
        type: Date,
        required: true
    },
    reqMade: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Reserve', reservSchema);