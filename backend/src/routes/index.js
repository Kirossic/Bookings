const express = require('express');
const router = express.Router();

// const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const resourceRoutes = require('./resource.routes.js');
const bookingRoutes = require('./booking.routes.js');
const paymentRoutes = require('./payment.routes.js');
const roleRoutes = require('./role.routes.js');
const logRoutes = require('./log.routes.js');

// router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);

module.exports = router;