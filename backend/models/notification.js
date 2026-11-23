const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Fields used by the application
  user: { // Customer the notification is sent to
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model

  },
  provider: { // Service provider the notification is sent to
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model

  },
  appointment: { // Appointment the notification is associated with
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment', // Reference to the Appointment model
    required: true
  },
  timeSent: { // Time the notification was created and sent to users
    type: Date,
    default: Date.now,
    required: true
  },
  kind: {
    type: String,
    enum: ['booked', 'unbooked', 'cancelled', 'reminder'],
    default: 'booked',
    required: true
  },
  message: { // Message in the notification
    type: String,
    default: ''
  },
  read: { // Indicates if a notification was read by the user
    type: Boolean,
    default: false,
    required: true
  },
  isDisplayed: { // Indicates if a notification is displayed to the user
    type: Boolean,
    default: true,
    required: true
  }
});

module.exports = mongoose.model('Notification', notificationSchema, 'notification');
