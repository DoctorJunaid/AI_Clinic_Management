const express = require('express');
const { register, login, getMe, getAllUsers, deleteUser, updateSubscription, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validateBody(schemas.register), register);
router.post('/login', validateBody(schemas.login), login);
router.get('/me', protect, getMe);
router.put('/subscription', protect, updateSubscription);
router.put('/update-profile', protect, updateProfile);
router.get('/users', protect, getAllUsers);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;
