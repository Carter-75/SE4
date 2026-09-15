const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// --- Local Auth ---
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = await User.create({ 
      email: email.toLowerCase(), 
      password, 
      firstName, 
      lastName 
    });
    
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(user);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message || 'Login failed' });
    req.login(user, (err) => {
      if (err) return next(err);
      res.json(user);
    });
  })(req, res, next);
});

// --- Google Auth ---


// --- Common ---
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) res.json(req.user);
  else res.status(401).json({ message: 'Not authenticated' });
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
