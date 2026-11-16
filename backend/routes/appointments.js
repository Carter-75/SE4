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
function centralTimeToUTC(date, time) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  const desiredUTC = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });

  let timestamp = desiredUTC;

  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(new Date(timestamp));
    const values = Object.fromEntries(
      parts.map(part => [part.type, part.value])
    );

    const displayedAsUTC = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute)
    );

    timestamp += desiredUTC - displayedAsUTC;
  }

  return new Date(timestamp);
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

      // Verify the provider is creating an appointment for their registered service type.
      const registeredServiceTypes = req.user.serviceType;

      if (
        !Array.isArray(registeredServiceTypes) ||
        !registeredServiceTypes.some(
          type => typeof type === 'string' &&
            type.toLowerCase() === category
        )
      ) {
        return res.status(403).json({
          message: 'You can only create appointments for your registered service type.'
        });
      }
      // Combine the selected date and times.
      const start = centralTimeToUTC(date, startTime);
      const end = centralTimeToUTC(date, endTime);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
      ) {
        return res.status(400).json({
          message: 'End time must be later than start time.'
        });
      }
      const existingAppointment = await Appointment.findOne({
        provider: req.user._id,
        status: { $ne: 'cancelled' },
        startTime: { $lt: end },
        endTime: { $gt: start }
      });

      if (existingAppointment) {
        return res.status(409).json({
          message: 'You already have an appointment during this time.'
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
      status: { $ne: 'cancelled' },
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

      // Find the appointment the user is trying to book.
      const requestedAppointment = await Appointment.findOne({
        _id: req.params.id,
        user: null,
        status: { $ne: 'cancelled' },
        startTime: { $gt: new Date() }
      });

      if (!requestedAppointment) {
        return res.status(409).json({
          message: 'This appointment is no longer available.'
        });
      }

      // Check whether the user already has an overlapping booking.
      const conflictingBooking = await Appointment.findOne({
        user: req.user._id,
        status: { $ne: 'cancelled' },
        startTime: { $lt: requestedAppointment.endTime },
        endTime: { $gt: requestedAppointment.startTime }
      });

      if (conflictingBooking) {
        return res.status(409).json({
          message: 'You already have an appointment during this time.'
        });
      }
      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: req.params.id,
          user: null,
          status: { $ne: 'cancelled' },
          startTime: { $gt: new Date() }
        },
        {
          $set: { user: req.user._id, status: 'booked' }
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