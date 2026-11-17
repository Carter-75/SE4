const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const Appointment = require('../models/appointment');

function requireLogin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      message: 'Please log in first.'
    });
  }

  next();
}

function formatAppointmentTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

router.get('/', requireLogin, async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { provider: req.user._id }]
    })
      .populate('appointment', 'title startTime endTime status')
      .sort({ timeSent: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.post('/read-all', requireLogin, async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ user: req.user._id }, { provider: req.user._id }],
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/read', requireLogin, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { provider: req.user._id }]
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found.'
      });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    next(error);
  }
});

router.get('/reminders/run', async (req, res, next) => {
  try {
    if (
      process.env.CRON_SECRET &&
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const appointments = await Appointment.find({
      status: 'booked',
      user: { $ne: null },
      startTime: { $gt: now, $lte: cutoff }
    });

    let created = 0;

    for (const appointment of appointments) {
      const message = `Reminder: "${appointment.title}" is coming up on ${formatAppointmentTime(appointment.startTime)}.`;

      const customerReminder = await Notification.findOne({
        appointment: appointment._id,
        kind: 'reminder',
        user: appointment.user
      });

      if (!customerReminder) {
        await Notification.create({
          user: appointment.user,
          appointment: appointment._id,
          kind: 'reminder',
          message
        });
        created += 1;
      }

      const providerReminder = await Notification.findOne({
        appointment: appointment._id,
        kind: 'reminder',
        provider: appointment.provider
      });

      if (!providerReminder) {
        await Notification.create({
          provider: appointment.provider,
          appointment: appointment._id,
          kind: 'reminder',
          message
        });
        created += 1;
      }
    }

    res.json({ created });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
