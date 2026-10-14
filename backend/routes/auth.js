const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

// Only return safe user information to the frontend.
function publicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    firstN: user.firstN,
    lastN: user.lastN,
    username: user.username,
    type: user.type,
    active: user.active
  };
}

// --- Local Registration ---
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      firstN,
      lastN,
      username,
      dob,
      type,
      serviceType,
      qualifications
    } = req.body;

    if (
      !email?.trim() ||
      !password ||
      !firstN?.trim() ||
      !lastN?.trim() ||
      !dob
    ) {
      return res.status(400).json({
        message: 'First name, last name, email, password, and date of birth are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFirstN = firstN.trim();
    const normalizedLastN = lastN.trim();

    if (
  typeof dob !== 'string' ||
  !/^\d{4}-\d{2}-\d{2}$/.test(dob)
  ) {
    return res.status(400).json({
    message: 'Please provide a valid date of birth that is not in the future.'
    });
  }

  const [year, month, day] = dob.split('-').map(Number);
  const dobDate = new Date(Date.UTC(year, month - 1, day));

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (
    dobDate.getUTCFullYear() !== year ||
    dobDate.getUTCMonth() !== month - 1 ||
    dobDate.getUTCDate() !== day ||
    dobDate > today
  ) {
    return res.status(400).json({
    message: 'Please provide a valid date of birth that is not in the future.'
    });
  }
    // Only allow customer or provider registration publicly.
    const accountType = type || 'customer';

    if (!['customer', 'provider'].includes(accountType)) {
      return res.status(400).json({
        message: 'Invalid account type.'
      });
    }

    // Providers must supply their service information.
    if (
      accountType === 'provider' &&
      (!serviceType?.trim() || !qualifications?.trim())
    ) {
      return res.status(400).json({
        message: 'Service type and qualifications are required for providers.'
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const normalizedUsername =
      username?.trim() || normalizedEmail.split('@')[0];

    const user = await User.create({
      email: normalizedEmail,
      password,
      username: normalizedUsername,
      type: accountType,
      firstN: normalizedFirstN,
      lastN: normalizedLastN,
      dob: dobDate,
      active: true,
      loggedIn: false,
      serviceType: accountType === 'provider'
        ? serviceType.trim()
        : '',
      qualifications: accountType === 'provider'
        ? qualifications.trim()
        : ''
    });

    req.login(user, (err) => {
      if (err) {
        console.error('Registration login error:', err.message);
        return res.status(500).json({
          message: 'Registration succeeded, but login failed.'
        });
      }

      return res.status(201).json({
        id: user._id.toString(),
        email: user.email,
        firstN: user.firstN,
        lastN: user.lastN,
        username: user.username,
        type: user.type,
        active: user.active
      });
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    console.error('MongoDB error code:', err.code);
    console.dir(err.errInfo, { depth: null });

    return res.status(500).json({
      message: 'Registration failed. Check the backend logs.'
    });
  }
});

// --- Local Login ---
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        message: info?.message || 'Login failed'
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);

      return res.json(publicUser(user));
    });
  })(req, res, next);
});

// --- Current Session ---
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      message: 'Not authenticated'
    });
  }

  return res.json(publicUser(req.user));
});

// --- Logout ---
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    if (req.session) {
      req.session.destroy((err) => {
        if (err) return next(err);

        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out' });
      });
    } else {
      return res.json({ message: 'Logged out' });
    }
  });
});

module.exports = router;