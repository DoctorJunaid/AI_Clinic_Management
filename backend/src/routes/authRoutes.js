const express = require('express');
const { register, login, getMe, getAllUsers, deleteUser, updateSubscription } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/subscription', protect, updateSubscription);
router.get('/users', protect, getAllUsers);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;
