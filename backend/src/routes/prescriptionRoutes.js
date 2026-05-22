const express = require('express');
const { getPrescriptions, createPrescription, getPrescription, downloadPrescriptionPDF } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPrescriptions)
  .post(authorize('doctor', 'admin'), validateBody(schemas.createPrescription), createPrescription);

router
  .route('/:id')
  .get(getPrescription);

router
  .route('/:id/pdf')
  .get(downloadPrescriptionPDF);

module.exports = router;
