// server/routes/donationRoutes.js
const express = require('express');
const { 
    recordDonation, 
    getDonorDonations, 
    getCampaignDonations 
} = require('../controllers/donationController');
const { protect, role } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: Records donation after blockchain confirmation
router.post('/record', recordDonation); 

// Protected routes
router.get('/my-donations', protect, role(['Donor']), getDonorDonations);
router.get('/:campaignId', protect, role(['NGO', 'Admin']), getCampaignDonations);

module.exports = router;