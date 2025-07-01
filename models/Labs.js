const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    labID: {
        type: Number,
        require: true
    },
    labName: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Lab', labSchema);