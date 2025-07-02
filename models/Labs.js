const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    labID: {
        type: Number,
        required: true
    },
    labName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Lab', labSchema);