const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const appointmentSchema = new mongoose.Schema({
  // Fields used by the application
  title: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to the User model
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  startTime: {
    type: Date,
      required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['beauty', 'fitness', 'medical'],
    required: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
