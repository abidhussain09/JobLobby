const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes (protected by JWT)
router.route('/profile')
    .get(protect, getUserProfile) 
    .put(protect, updateUserProfile); 

module.exports = router;
