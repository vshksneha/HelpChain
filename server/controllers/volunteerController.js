const Campaign = require('../models/Campaign');
const Verification = require('../models/Verification');
const { verifyDeliveryOnChain } = require('../services/blockchainService');
const { uploadFile } = require('../utils/storage'); 
const multer = require('multer'); // Import multer for route logic
const upload = multer({ dest: 'uploads/' }); // Temp storage for proof

// @desc    Volunteer confirms aid delivery using QR/OTP
// @route   POST /api/volunteers/verify
// @access  Private (Volunteer)
const verifyDelivery = async (req, res) => {
    // req.file path would be available if we use multer middleware on the route
    const filePath = req.file ? req.file.path : null; 
    const { campaignId } = req.body; // Removed verificationProofHash since we now upload the file
    const volunteerId = req.user._id;
    const volunteerAddress = req.user.walletAddress; 

    if (!campaignId || !volunteerAddress || !filePath) {
        if (filePath) { try { require('fs').unlinkSync(filePath); } catch (e) { /* ignore */ } }
        return res.status(400).json({ message: 'Missing campaign ID, wallet address, or verification proof file.' });
    }

    try {
        const campaign = await Campaign.findById(campaignId);
        
        if (!campaign) { return res.status(404).json({ message: 'Campaign not found.' }); }
        if (campaign.volunteerId.toString() !== volunteerId.toString()) {
            return res.status(403).json({ message: 'You are not assigned to verify this campaign.' });
        }
        
        // 1. UPLOAD PROOF TO CLOUD STORAGE
        const verificationProofHash = await uploadFile(filePath, 'proofs');

        // 2. Call blockchain service to execute verification
        const blockchainResult = await verifyDeliveryOnChain(campaign.blockchainCampaignId);
        
        // 3. Update MongoDB records
        campaign.isBlockchainVerified = true;
        campaign.status = 'Delivery Verified';
        await campaign.save();

        await Verification.create({
            campaignId,
            volunteerId,
            verifiedStatus: true,
            verificationProofHash // Stored as the Cloudinary URL
        });

        res.status(200).json({ 
            message: 'Delivery verified successfully.',
            txnHash: blockchainResult.txnHash
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Verification failed. Check SC or network.', error: error.message });
    }
};

// ...
module.exports = { verifyDelivery, getAssignedCampaigns: async (req, res) => { /* ... */ } };
