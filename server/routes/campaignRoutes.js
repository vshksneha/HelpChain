const express = require('express');
const { 
    createCampaign, 
    getAllCampaigns, 
    deleteCampaign,
    assignVolunteerToCampaign
} = require('../controllers/campaignController');
const { protect, role } = require('../middleware/authMiddleware');
const multer = require('multer'); // 🛑 REQUIRED IMPORT

// Configure Multer storage: saves uploaded files temporarily to the 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Public read access
router.get('/', getAllCampaigns); 

// NGO/Admin required routes
// 🛑 ADD MULTER MIDDLEWARE: 'campaignImage' is the field name expected from the frontend form
router.post('/', protect, role(['NGO', 'Admin']), upload.single('campaignImage'), createCampaign);
router.delete('/:id', protect, role(['NGO', 'Admin']), deleteCampaign);
router.put('/:id/assign', protect, role(['NGO']), assignVolunteerToCampaign);

module.exports = router;
