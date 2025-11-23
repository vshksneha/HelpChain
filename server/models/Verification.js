// server/models/Verification.js
const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    otp: { type: String, default: null }, 
    qrHash: { type: String, default: null }, 
    
    verifiedStatus: { type: Boolean, default: false },
    verificationProofHash: { type: String, default: null }, 
    verificationDate: { type: Date, default: Date.now }
});

const Verification = mongoose.model('Verification', VerificationSchema);
module.exports = Verification;