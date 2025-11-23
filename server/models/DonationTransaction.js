// server/models/DonationTransaction.js
const mongoose = require('mongoose');

const DonationTransactionSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    
    amountEth: { type: Number, required: true }, 
    amountFiat: { type: Number }, 
    
    txnHash: { type: String, required: true, unique: true }, 
    blockNumber: { type: Number },
    date: { type: Date, default: Date.now }
});

const DonationTransaction = mongoose.model('DonationTransaction', DonationTransactionSchema);
module.exports = DonationTransaction;