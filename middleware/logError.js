const ErrorModel = require('../models/Errors');

const logError = async (error) => {
  try {
    const errDoc = new ErrorModel({
      message: error.message,
      //stack: error.stack,
      //location: location || 'Unknown'
    });
    await errDoc.save();
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

module.exports = logError;
