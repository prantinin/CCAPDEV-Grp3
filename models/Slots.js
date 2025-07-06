const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    labName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    seatCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true
    },
    slotTime: {
        type: Number,   // index in timeLabels String array
        required: true
    },
    slotDate: {
        type: Date,
        requried: true
    }
})

module.exports = mongoose.model('Slot', slotSchema);