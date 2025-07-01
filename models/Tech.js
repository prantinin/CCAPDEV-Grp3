const mongoose = require('mongoose');

const techSchema = new mongoose.Schema({
    techID: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('Tech', techSchema);