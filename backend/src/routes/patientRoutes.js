const express = require('express');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient
} = require('../controllers/patientController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'doctor', 'receptionist'), getPatients)
  .post(authorize('admin', 'receptionist'), createPatient);

router
  .route('/:id')
  .get(getPatient)
  .put(authorize('admin', 'receptionist', 'doctor'), updatePatient);

module.exports = router;
