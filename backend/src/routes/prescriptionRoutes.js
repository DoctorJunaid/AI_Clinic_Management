const express = require('express');
const { getPrescriptions, createPrescription, getPrescription, downloadPrescriptionPDF } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPrescriptions)
  .post(authorize('doctor', 'admin'), createPrescription);

router
  .route('/:id')
  .get(getPrescription);

router
  .route('/:id/pdf')
  .get(downloadPrescriptionPDF);

module.exports = router;
