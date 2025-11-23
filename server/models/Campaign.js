// server/models/Campaign.js
const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageHash: { type: String }, 
    goal: { type: Number, required: true }, 
    raised: { type: Number, default: 0 }, 
    
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    
    blockchainCampaignId: { type: Number, required: true, unique: true }, 
    status: { 
        type: String, 
        enum: ['Active', 'Funding Met', 'Delivery Verified', 'Closed'], 
        default: 'Active' 
    },
    
    isBlockchainVerified: { type: Boolean, default: false }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', CampaignSchema);
module.exports = Campaign;