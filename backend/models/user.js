
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Fields used by the application
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
    required: true
  },
  firstN: {
    type: String,
    required: true
  },
  lastN: {
    type: String,
      required: true
  },
  dob: {
    type: Date,
    default: () => new Date('2000-01-01'),
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  loggedIn: {
    type: Boolean,
    default: false,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  qualifications: {
    type: String,
    trim: true,
    default: ''
  },
  serviceType: {
    type: String,
    trim: true,
    default: ''
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

