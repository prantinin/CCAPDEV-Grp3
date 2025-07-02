const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatID: {
        type: Number,
        required: true
    },
    seatCode: {
        type: String,
        required: true
    },
    labID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab'
    },
    avail: {
        type: Boolean,
        required: true
    }
});

const Lab = mongoose.model('Lab', labSchema);
const Seat = mongoose.model('Seat', seatSchema);

module.exports = { Lab, Seat };