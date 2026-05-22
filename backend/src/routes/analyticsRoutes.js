const express = require('express');
const { getStats, getTrends, getOutbreaks, getDepartmentLoad } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'doctor'));

router.get('/stats', getStats);
router.get('/trends', getTrends);
router.get('/outbreaks', getOutbreaks);
router.get('/department-load', getDepartmentLoad);

module.exports = router;
