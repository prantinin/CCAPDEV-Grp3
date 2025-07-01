const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatID: {
        type: Number,
        require: true
    },
    seatCode: {
        type: String,
        require: true
    },
    labID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab'
    },
    avail: {
        type: Boolean,
        require: true
    }
});

module.exports = mongoose.model('Lab', labSchema);

module.exports = mongoose.model('Seat', seatSchema);