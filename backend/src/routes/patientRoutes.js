const express = require('express');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient
} = require('../controllers/patientController');

const { protect, authorize } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'doctor', 'receptionist'), getPatients)
  .post(authorize('admin', 'receptionist', 'doctor'), validateBody(schemas.createPatient), createPatient);

router
  .route('/:id')
  .get(getPatient)
  .put(authorize('admin', 'receptionist', 'doctor'), updatePatient);

module.exports = router;
