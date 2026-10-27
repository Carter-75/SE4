const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');

// Make sure the user is logged in
function requireLogin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      message: 'Please log in first.'
    });
  }

  next();
}

// Only providers can create appointment slots
function requireProvider(req, res, next) {
  if (req.user.type !== 'provider') {
    return res.status(403).json({
      message: 'Only providers can create appointment slots.'
    });
  }

  next();
}

function requireBooker(req, res, next) {
  if (req.user.type !== 'customer' && req.user.type !== 'provider') {
    return res.status(403).json({
      message: 'Only customers and providers can book appointments.'
    });
  }

  next();
}

// Create an available appointment slot
router.post(
  '/slots',
  requireLogin,
  requireProvider,
  async (req, res, next) => {
    try {
      const {
        serviceType,
        appointmentTitle,
        date,
        startTime,
        endTime
      } = req.body;

      if (
        !serviceType ||
        !appointmentTitle ||
        !date ||
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          message: 'Please fill in all required fields.'
        });
      }

      const category = serviceType.toLowerCase();

      if (!['beauty', 'medical', 'fitness'].includes(category)) {
        return res.status(400).json({
          message: 'Invalid service type.'
        });
      }

      // Combine the selected date and times.
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(`${date}T${endTime}:00`);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
      ) {
        return res.status(400).json({
          message: 'End time must be later than start time.'
        });
      }

      const appointment = await Appointment.create({
        title: appointmentTitle.trim(),
        provider: req.user._id,
        user: null,
        startTime: start,
        endTime: end,
        category
      });

      res.status(201).json({
        message: 'Appointment slot created successfully.',
        appointment
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all future appointment slots that are available
router.get('/available', requireLogin, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      user: null,
      provider: { $ne: req.user._id },
      startTime: { $gt: new Date() }
    })
      .populate('provider', 'firstN lastN username serviceType')
      .sort({ startTime: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// Book an available appointment slot
router.post(
  '/:id/book',
  requireLogin,
  requireBooker,
  async (req, res, next) => {
    try {
      const ownSlot = await Appointment.findOne({
        _id: req.params.id,
        provider: req.user._id
      });

      if (ownSlot) {
        return res.status(409).json({
          message: 'You cannot book your own appointment slot.'
        });
      }

      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: req.params.id,
          user: null,
          startTime: { $gt: new Date() }
        },
        {
          $set: { user: req.user._id }
        },
        {
          new: true,
          runValidators: true
        }
      ).populate('provider', 'firstN lastN username serviceType');

      if (!appointment) {
        return res.status(409).json({
          message: 'This appointment is no longer available.'
        });
      }

      res.json({
        message: 'Appointment booked successfully.',
        appointment
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;