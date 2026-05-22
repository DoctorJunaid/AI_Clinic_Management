const express = require('express');
const { getAppointments, createAppointment, updateAppointmentStatus, getAvailableSlots } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

// Get dynamically calculated availability slots for a doctor/date
router.get('/slots', getAvailableSlots);

router
  .route('/')
  .get(getAppointments)
  .post(authorize('patient', 'receptionist', 'admin', 'doctor'), validateBody(schemas.createAppointment), createAppointment);

router
  .route('/:id/status')
  .put(authorize('doctor', 'receptionist', 'admin'), updateAppointmentStatus);

module.exports = router;
