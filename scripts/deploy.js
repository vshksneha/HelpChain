const { ethers } = require("hardhat")
const hre = require("hardhat")

async function main() {
  console.log("Starting HelpChain deployment...")

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)

  // Check account balance
  const balance = await deployer.provider.getBalance(deployer.address)
  console.log("Account balance:", ethers.formatEther(balance), "ETH")

  // Deploy the HelpChain contract
  console.log("Deploying HelpChain contract...")
  const HelpChain = await ethers.getContractFactory("HelpChain")

  // Deploy with constructor parameters if needed
  const helpChain = await HelpChain.deploy()

  // Wait for deployment to complete
  await helpChain.waitForDeployment()

  const contractAddress = await helpChain.getAddress()
  console.log("HelpChain deployed to:", contractAddress)

  // Register some initial NGOs and volunteers for testing
  console.log("Setting up initial roles...")

  // Example NGO addresses (replace with actual addresses)
  const testNGOAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"
  const testVolunteerAddress = "0x8ba1f109551bD432803012645Hac136c30C6756M"

  try {
    // Register test NGO
    const registerNGOTx = await helpChain.registerNGO(testNGOAddress)
    await registerNGOTx.wait()
    console.log("Test NGO registered:", testNGOAddress)

    // Register test volunteer
    const registerVolunteerTx = await helpChain.registerVolunteer(testVolunteerAddress)
    await registerVolunteerTx.wait()
    console.log("Test volunteer registered:", testVolunteerAddress)
  } catch (error) {
    console.log("Note: Test role registration failed (expected if addresses are invalid)")
  }

  // Verify contract on Etherscan/Polygonscan
  const network = await ethers.provider.getNetwork()
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...")
    await helpChain.deploymentTransaction().wait(6)

    console.log("Verifying contract on Etherscan...")
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      })
      console.log("Contract verified successfully")
    } catch (error) {
      console.log("Contract verification failed:", error.message)
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  }

  console.log("\n=== Deployment Summary ===")
  console.log("Network:", deploymentInfo.network)
  console.log("Contract Address:", deploymentInfo.contractAddress)
  console.log("Deployer:", deploymentInfo.deployer)
  console.log("Block Number:", deploymentInfo.blockNumber)
  console.log("Deployment Time:", deploymentInfo.deploymentTime)

  // Save to file for frontend integration
  const fs = require("fs")
  const path = require("path")

  const deploymentPath = path.join(__dirname, "../deployments")
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true })
  }

  fs.writeFileSync(path.join(deploymentPath, `${network.name}.json`), JSON.stringify(deploymentInfo, null, 2))

  console.log(`Deployment info saved to deployments/${network.name}.json`)
  console.log("Deployment completed successfully!")
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error)
    process.exit(1)
  })
