const ethers = require('ethers');
const { HELPCHAIN_ABI, HELPCHAIN_CONTRACT_ADDRESS } = require('../config/web3');

// 1. Setup Provider and Signer (using backend's wallet for administrative transactions)
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); 
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance connected with the backend's signer
const helpchainContract = new ethers.Contract(
    HELPCHAIN_CONTRACT_ADDRESS, 
    HELPCHAIN_ABI, 
    signer 
);

// Helper for converting ETH to Wei
const toWei = (eth) => ethers.utils.parseEther(eth.toString());
// Helper for converting Wei to ETH
const fromWei = (wei) => ethers.utils.formatEther(wei);

/**
 * @dev Executes the createCampaign transaction on the contract (NGO action).
 */
async function createCampaignOnChain(title, targetAmountEth) {
    try {
        const targetAmountWei = toWei(targetAmountEth);
        
        const tx = await helpchainContract.createCampaign(title, targetAmountWei);
        const receipt = await tx.wait(); 
        
        // NOTE: The 'events' property is an array in Ethers v5 (which Hardhat tends to use)
        // If this still causes issues, check Hardhat's artifact structure for emitted events.
        const event = receipt.events.find(e => e.event === 'CampaignCreated');
        const campaignId = event ? event.args.campaignId.toString() : null;

        if (!campaignId) throw new Error("Could not retrieve campaign ID from event.");

        return { txnHash: receipt.transactionHash, campaignId: campaignId };
    } catch (error) {
        throw new Error("BC Error (createCampaign): " + error.message);
    }
}

/**
 * @dev Executes the assignVolunteer transaction (NGO/Admin action).
 */
async function assignVolunteerOnChain(blockchainCampaignId, volunteerAddress) {
    try {
        const tx = await helpchainContract.assignVolunteer(blockchainCampaignId, volunteerAddress);
        const receipt = await tx.wait();
        return { txnHash: receipt.transactionHash };
    } catch (error) {
        throw new Error("BC Error (assignVolunteer): " + error.message);
    }
}

/**
 * @dev Executes the verifyDelivery transaction (Volunteer action).
 */
async function verifyDeliveryOnChain(blockchainCampaignId) {
    try {
        const tx = await helpchainContract.verifyDelivery(blockchainCampaignId);
        const receipt = await tx.wait();
        return { txnHash: receipt.transactionHash };
    } catch (error) {
        throw new Error("BC Error (verifyDelivery): " + error.message);
    }
}

/**
 * @dev Reads campaign details from the contract.
 */
async function getCampaignDetailsOnChain(blockchainCampaignId) {
    try {
        const details = await helpchainContract.getCampaignDetails(blockchainCampaignId);
        
        return {
            ngo: details.ngo,
            title: details.title,
            targetAmount: fromWei(details.target),
            raisedAmount: fromWei(details.raised),
            isVerified: details.isVerified,
            volunteer: details.volunteer
        };
    } catch (error) {
        throw new Error("BC Error (getDetails): " + error.message);
    }
}

module.exports = {
    createCampaignOnChain,
    assignVolunteerOnChain,
    verifyDeliveryOnChain,
    getCampaignDetailsOnChain,
};