const express = require('express');
const { getAppointments, createAppointment, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAppointments)
  .post(authorize('patient', 'receptionist', 'admin'), createAppointment);

router
  .route('/:id/status')
  .put(authorize('doctor', 'receptionist', 'admin'), updateAppointmentStatus);

module.exports = router;
