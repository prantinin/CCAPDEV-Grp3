const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentID: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('Student', studentSchema);