require('dotenv').config({ path: '../.env' }); 

const { config } = require("@nomicfoundation/hardhat-toolbox");


const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL; 
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = { 
    solidity: "0.8.20", 
    networks: {
        hardhat: {
            chainId: 31337,
        },
        
        // TARGET NETWORK: SEPOLIA TESTNET
        sepolia: {
            url: SEPOLIA_RPC_URL, 
            accounts: [PRIVATE_KEY],
            chainId: 11155111, // Sepolia Testnet Chain ID
        },
    },
};
