const express = require('express');
const { symptomCheck, explainPrescription } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/symptom-check', authorize('doctor', 'admin', 'receptionist'), symptomCheck);
router.post('/explain-prescription', explainPrescription);

module.exports = router;
