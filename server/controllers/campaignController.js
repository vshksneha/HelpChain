// server/controllers/campaignController.js
const Campaign = require('../models/Campaign');
const { createCampaignOnChain, assignVolunteerOnChain } = require('../services/blockchainService');

// @desc    Create a new campaign (NGO/Admin)
// @route   POST /api/campaigns
// @access  Private (NGO/Admin)
const createCampaign = async (req, res) => {
    const { title, description, imageHash, goal, goalEth } = req.body;
    const ngoId = req.user._id;

    if (!title || !description || !goal || !goalEth) {
        return res.status(400).json({ message: 'Please include all required fields.' });
    }

    try {
        // 1. Call blockchain service to create campaign and get contract ID
        const blockchainResult = await createCampaignOnChain(title, goalEth);
        
        // 2. Create MongoDB record
        const createdCampaign = await Campaign.create({
            title, description, imageHash, goal, ngoId,
            blockchainCampaignId: blockchainResult.campaignId,
        });

        res.status(201).json({
            ...createdCampaign._doc,
            txnHash: blockchainResult.txnHash,
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to create campaign.', error: error.message });
    }
};

// @desc    Get all campaigns (public view)
// @route   GET /api/campaigns
// @access  Public
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({}).populate('ngoId', 'name email');
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve campaigns.' });
    }
};

// @desc    Assign volunteer to a campaign (NGO)
// @route   PUT /api/campaigns/:id/assign
// @access  Private (NGO)
const assignVolunteerToCampaign = async (req, res) => {
    const { volunteerId, volunteerAddress } = req.body;
    
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) { return res.status(404).json({ message: 'Campaign not found.' }); }
        
        const volunteer = await req.models.User.findById(volunteerId); // Assuming access to User model
        if (!volunteer || volunteer.role !== 'Volunteer') { return res.status(400).json({ message: 'Invalid Volunteer ID or role.' }); }
        
        // 1. Call blockchain service
        const blockchainResult = await assignVolunteerOnChain(campaign.blockchainCampaignId, volunteerAddress);

        // 2. Update MongoDB record
        campaign.volunteerId = volunteerId;
        campaign.status = 'Funding Met'; // Status change after assignment
        await campaign.save();

        res.status(200).json({ message: 'Volunteer assigned successfully.', txnHash: blockchainResult.txnHash });

    } catch (error) {
        res.status(500).json({ message: 'Failed to assign volunteer.', error: error.message });
    }
};

// @desc    Delete a campaign (NGO/Admin)
// @route   DELETE /api/campaigns/:id
// @access  Private (NGO/Admin)
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) { return res.status(404).json({ message: 'Campaign not found.' }); }

        // Optional: Add logic to ensure only the owning NGO or Admin can delete
        await Campaign.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Campaign deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete campaign.' });
    }
};

module.exports = {
    createCampaign,
    getAllCampaigns,
    assignVolunteerToCampaign,
    deleteCampaign,
};