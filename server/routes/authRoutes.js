// server/routes/authRoutes.js
const express = require('express');
const { registerUser, authUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.put('/profile', protect, updateProfile); 

module.exports = router; // <-- Ensure this is exported