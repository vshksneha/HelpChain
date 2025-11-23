// server/controllers/donationController.js
const DonationTransaction = require('../models/DonationTransaction');
const Campaign = require('../models/Campaign');

// @desc    Record a confirmed donation transaction from the frontend
// @route   POST /api/donations/record
// @access  Public (Called with txn hash from client)
const recordDonation = async (req, res) => {
    // donorId, amountEth, txnHash are sent from the client after MetaMask confirms the transaction.
    const { campaignId, donorId, amountEth, txnHash } = req.body; 

    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) { return res.status(404).json({ message: 'Campaign not found.' }); }
        
        const existingTxn = await DonationTransaction.findOne({ txnHash });
        if (existingTxn) { return res.status(400).json({ message: 'Transaction already recorded.' }); }

        const donation = await DonationTransaction.create({ donorId, campaignId, amountEth, txnHash });
        
        // Update Campaign raised amount
        campaign.raised += parseFloat(amountEth); 
        await campaign.save();

        res.status(201).json({ message: 'Donation recorded successfully.', donation });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record donation.', error: error.message });
    }
};

// @desc    Get all donations made by the authenticated donor
// @route   GET /api/donations/my-donations
// @access  Private (Donor)
const getDonorDonations = async (req, res) => {
    try {
        const donations = await DonationTransaction.find({ donorId: req.user._id })
            .populate('campaignId', 'title');
        
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch donor donations.' });
    }
};

// @desc    Get all donations for a specific campaign (NGO view)
// @route   GET /api/donations/:campaignId
// @access  Private (NGO/Admin)
const getCampaignDonations = async (req, res) => {
    try {
        const donations = await DonationTransaction.find({ campaignId: req.params.campaignId })
            .populate('donorId', 'name email walletAddress');
            
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch campaign donations.' });
    }
};

module.exports = { recordDonation, getDonorDonations, getCampaignDonations };