const { ethers } = require("ethers")
const axios = require("axios")

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api"
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL

// Test data
const testUsers = {
  ngo: {
    email: "test-ngo@helpchain.org",
    password: "TestPassword123!",
    role: "ngo",
    organizationName: "Test NGO Foundation",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  },
  donor: {
    email: "test-donor@helpchain.org",
    password: "TestPassword123!",
    role: "donor",
    fullName: "John Donor",
    walletAddress: "0x8ba1f109551bD432803012645Hac136c30C6C87",
  },
  volunteer: {
    email: "test-volunteer@helpchain.org",
    password: "TestPassword123!",
    role: "volunteer",
    fullName: "Jane Volunteer",
    walletAddress: "0x123f109551bD432803012645Hac136c30C6C87",
  },
}

class IntegrationTester {
  constructor() {
    this.tokens = {}
    this.createdPackageId = null
    this.provider = new ethers.JsonRpcProvider(MUMBAI_RPC_URL)
  }

  async log(message, data = null) {
    console.log(`[TEST] ${message}`)
    if (data) {
      console.log(JSON.stringify(data, null, 2))
    }
  }

  async apiCall(method, endpoint, data = null, token = null) {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {},
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (data) {
      config.data = data
      config.headers["Content-Type"] = "application/json"
    }

    try {
      const response = await axios(config)
      return response.data
    } catch (error) {
      throw new Error(`API call failed: ${error.response?.data?.message || error.message}`)
    }
  }

  async testUserRegistration() {
    this.log("=== Testing User Registration ===")

    for (const [role, userData] of Object.entries(testUsers)) {
      try {
        this.log(`Registering ${role}...`)

        const response = await this.apiCall("POST", "/auth/register", userData)

        this.log(`✅ ${role} registered successfully`, {
          userId: response.user.id,
          email: response.user.email,
          role: response.user.role,
        })

        // Store token for later use
        this.tokens[role] = response.token
      } catch (error) {
        this.log(`❌ ${role} registration failed: ${error.message}`)
        throw error
      }
    }
  }

  async testUserLogin() {
    this.log("=== Testing User Login ===")

    for (const [role, userData] of Object.entries(testUsers)) {
      try {
        this.log(`Logging in ${role}...`)

        const response = await this.apiCall("POST", "/auth/login", {
          email: userData.email,
          password: userData.password,
        })

        this.log(`✅ ${role} login successful`)

        // Update token
        this.tokens[role] = response.token
      } catch (error) {
        this.log(`❌ ${role} login failed: ${error.message}`)
        throw error
      }
    }
  }

  async testAidPackageCreation() {
    this.log("=== Testing Aid Package Creation ===")

    const packageData = {
      title: "Emergency Baby Formula Supply",
      description: "Urgent need for 100 packs of baby formula for displaced families",
      itemType: "baby_formula",
      quantity: 100,
      fundingGoal: ethers.parseEther("0.1").toString(), // 0.1 MATIC
      location: "Mumbai, India",
      urgencyLevel: "high",
      beneficiaryCount: 50,
      images: [],
    }

    try {
      this.log("Creating aid package as NGO...")

      const response = await this.apiCall("POST", "/aid-packages", packageData, this.tokens.ngo)

      this.createdPackageId = response.aidPackage._id

      this.log("✅ Aid package created successfully", {
        packageId: this.createdPackageId,
        title: response.aidPackage.title,
        status: response.aidPackage.status,
        transactionHash: response.transactionHash,
      })

      // Verify on blockchain
      if (response.transactionHash) {
        await this.verifyTransaction(response.transactionHash, "Aid Package Creation")
      }
    } catch (error) {
      this.log(`❌ Aid package creation failed: ${error.message}`)
      throw error
    }
  }

  async testDonationFlow() {
    this.log("=== Testing Donation Flow ===")

    if (!this.createdPackageId) {
      throw new Error("No aid package available for donation test")
    }

    const donationAmount = ethers.parseEther("0.05").toString() // 0.05 MATIC

    try {
      this.log("Making donation as donor...")

      const response = await this.apiCall(
        "POST",
        `/donations/${this.createdPackageId}`,
        {
          amount: donationAmount,
          donorAddress: testUsers.donor.walletAddress,
          message: "Hope this helps the families in need",
        },
        this.tokens.donor,
      )

      this.log("✅ Donation successful", {
        donationId: response.donation._id,
        amount: response.donation.amount,
        transactionHash: response.transactionHash,
      })

      // Verify on blockchain
      if (response.transactionHash) {
        await this.verifyTransaction(response.transactionHash, "Donation")
      }

      // Check if package is now funded
      const packageResponse = await this.apiCall("GET", `/aid-packages/${this.createdPackageId}`)
      this.log("Package funding status", {
        currentFunding: packageResponse.currentFunding,
        fundingGoal: packageResponse.fundingGoal,
        status: packageResponse.status,
      })
    } catch (error) {
      this.log(`❌ Donation failed: ${error.message}`)
      throw error
    }
  }

  async testDeliveryFlow() {
    this.log("=== Testing Delivery Flow ===")

    if (!this.createdPackageId) {
      throw new Error("No aid package available for delivery test")
    }

    try {
      // Step 1: Pledge delivery
      this.log("Pledging delivery as volunteer...")

      const pledgeResponse = await this.apiCall(
        "POST",
        `/deliveries/pledge/${this.createdPackageId}`,
        {
          volunteerAddress: testUsers.volunteer.walletAddress,
        },
        this.tokens.volunteer,
      )

      this.log("✅ Delivery pledged successfully", {
        deliveryId: pledgeResponse.delivery._id,
        transactionHash: pledgeResponse.transactionHash,
      })

      // Step 2: Update status to picked up
      this.log("Updating status to picked up...")

      const pickupResponse = await this.apiCall(
        "PATCH",
        `/deliveries/status/${this.createdPackageId}`,
        {
          status: "picked_up",
        },
        this.tokens.volunteer,
      )

      this.log("✅ Status updated to picked up", {
        transactionHash: pickupResponse.transactionHash,
      })

      // Step 3: Update status to in transit
      this.log("Updating status to in transit...")

      const transitResponse = await this.apiCall(
        "PATCH",
        `/deliveries/status/${this.createdPackageId}`,
        {
          status: "in_transit",
        },
        this.tokens.volunteer,
      )

      this.log("✅ Status updated to in transit", {
        transactionHash: transitResponse.transactionHash,
      })

      // Step 4: Confirm delivery
      this.log("Confirming delivery...")

      const confirmResponse = await this.apiCall(
        "POST",
        `/deliveries/confirm/${this.createdPackageId}`,
        {
          deliveryProof: "GPS:19.0760,72.8777|OTP:123456",
          beneficiaryConfirmation: "Received by Maria Santos",
        },
        this.tokens.volunteer,
      )

      this.log("✅ Delivery confirmed successfully", {
        transactionHash: confirmResponse.transactionHash,
      })

      // Verify all transactions
      const transactions = [
        pledgeResponse.transactionHash,
        pickupResponse.transactionHash,
        transitResponse.transactionHash,
        confirmResponse.transactionHash,
      ]

      for (const txHash of transactions) {
        if (txHash) {
          await this.verifyTransaction(txHash, "Delivery Flow")
        }
      }
    } catch (error) {
      this.log(`❌ Delivery flow failed: ${error.message}`)
      throw error
    }
  }

  async verifyTransaction(txHash, context) {
    try {
      this.log(`Verifying transaction: ${txHash}`)

      const receipt = await this.provider.getTransactionReceipt(txHash)

      if (receipt) {
        this.log(`✅ Transaction verified on blockchain`, {
          context,
          txHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status === 1 ? "Success" : "Failed",
        })

        // Provide PolygonScan link
        const polygonScanUrl = `https://mumbai.polygonscan.com/tx/${txHash}`
        this.log(`🔗 View on PolygonScan: ${polygonScanUrl}`)

        return receipt
      } else {
        this.log(`⚠️ Transaction not yet mined: ${txHash}`)
        return null
      }
    } catch (error) {
      this.log(`❌ Transaction verification failed: ${error.message}`)
      return null
    }
  }

  async testMetaMaskConnection() {
    this.log("=== MetaMask Connection Guide ===")

    this.log("To connect MetaMask to your frontend:")
    this.log("1. Install MetaMask browser extension")
    this.log("2. Add Mumbai testnet:")
    this.log("   - Network Name: Mumbai Testnet")
    this.log("   - RPC URL: https://rpc-mumbai.maticvigil.com")
    this.log("   - Chain ID: 80001")
    this.log("   - Currency Symbol: MATIC")
    this.log("   - Block Explorer: https://mumbai.polygonscan.com")
    this.log("3. Get test MATIC from faucet: https://faucet.polygon.technology/")
    this.log("4. Import test accounts using private keys")
    this.log("5. Connect wallet in frontend and verify address matches test data")
  }

  async runFullTest() {
    try {
      this.log("🚀 Starting HelpChain Integration Test Suite")

      // Test user management
      await this.testUserRegistration()
      await this.testUserLogin()

      // Test core flows
      await this.testAidPackageCreation()
      await this.testDonationFlow()
      await this.testDeliveryFlow()

      // MetaMask guide
      await this.testMetaMaskConnection()

      this.log("🎉 All tests completed successfully!")
      this.log("Your HelpChain application is ready for production deployment.")
    } catch (error) {
      this.log(`💥 Test suite failed: ${error.message}`)
      process.exit(1)
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new IntegrationTester()
  tester.runFullTest()
}

module.exports = IntegrationTester
