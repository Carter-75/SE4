const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Fields used by the application
  username: { // Unique username that identifies a specific user
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: { // Type of user account
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
    required: true
  },
  firstN: { // User's first name
    type: String,
    required: true
  },
  lastN: { // User's last name
    type: String,
    required: true
  },
  dob: { // User's date of birth
    type: Date,
    default: () => new Date('2000-01-01'),
    required: true
  },
  email: { // Unique email associated with a user account
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { // Password used for authentication
    type: String,
    required: true
  },
  active: { // Identifies whether a user account is active or has been soft deleted
    type: Boolean,
    default: true,
    required: true
  },
  loggedIn: { // Identifies if there is an active login session for the user account
    type: Boolean,
    default: false,
    required: true
  },
  createdAt: { // Day and time the user account was created
    type: Date,
    default: Date.now
  },
  qualifications: { // User's qualifications; only relevant to service providers
    type: String,
    trim: true,
    default: ''
  },
  serviceType: { // The types of service a service provider account can provide
    type: [String],
    enum: ['beauty', 'fitness', 'medical'],
    trim: true,
    default: []
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
