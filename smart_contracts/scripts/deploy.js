// smart_contracts/scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  
  const HelpChain = await hre.ethers.getContractFactory("HelpChain");
  const helpChain = await HelpChain.deploy();

  // ✅ CORRECTED LINE: Use waitForDeployment() for modern Ethers/Hardhat
  await helpChain.waitForDeployment(); 

  // NOTE: You must use the modern getAddress() method here to ensure correct retrieval
  const deployedAddress = await helpChain.getAddress();

  console.log("HelpChain deployed to address:", deployedAddress);
  
  console.log("\n--- ACTION REQUIRED ---");
  console.log(`1. Update root .env with: HELPCHAIN_CONTRACT_ADDRESS=${deployedAddress}`);
  console.log("2. Copy the ABI from artifacts/contracts/HelpChain.sol/HelpChain.json for backend/frontend config.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });