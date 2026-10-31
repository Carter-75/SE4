const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const appointmentSchema = new mongoose.Schema({
  // Fields used by the application
  title: { // Title of the appointment
    type: String,
    required: true
  },
  user: { // Customer who booked the appointment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    default: null
  },
  provider: { // Provider who created the appointment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  startTime: { // Time appointment starts
    type: Date,
    required: true
  },
  endTime: { // Time appointment ends
    type: Date,
    required: true
  },
  category: { // Type of service the appointment offers
    type: String,
    enum: ['beauty', 'fitness', 'medical'],
    required: true
  },
  status: { // Status of the appointment
    type: String,
    enum: ['active', 'booked', 'cancelled'],
    required: true,
    default: 'active'
  },
  description: { // Full appointment description
    type: String
  },
  createdAt: { // Date and time appointment was created
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema,'appointment');
