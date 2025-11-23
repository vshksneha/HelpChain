// server/routes/volunteerRoutes.js
const express = require('express');
const { 
    verifyDelivery, 
    getAssignedCampaigns 
} = require('../controllers/volunteerController');
const { protect, role } = require('../middleware/authMiddleware');

// 🛑 Import Multer for file handling
const multer = require('multer'); 

// Configure Multer storage: saves uploaded files temporarily to the 'uploads/' folder
// The file will be cleaned up by the storage utility after being uploaded to Cloudinary.
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// @route   GET /api/volunteers/my-campaigns
// @desc    Volunteer dashboard view: Get campaigns assigned to the authenticated volunteer
// @access  Private (Volunteer)
router.get('/my-campaigns', protect, role(['Volunteer']), getAssignedCampaigns);

// @route   POST /api/volunteers/verify
// @desc    Volunteer action: Submit proof document and verify delivery on blockchain
// @access  Private (Volunteer)
// 🛑 MIDDLEWARE CHAIN: Auth -> Role Check -> File Upload -> Controller Logic
// 'proofDocument' is the field name expected in the form data from the client.
router.post(
    '/verify', 
    protect, 
    role(['Volunteer']), 
    upload.single('proofDocument'), // Process the single file upload
    verifyDelivery
);

module.exports = router;
