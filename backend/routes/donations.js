const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const auth = require("../middleware/auth")
const roleAuth = require("../middleware/roleAuth")
const Donation = require("../models/Donation")
const AidPackage = require("../models/AidPackage")
const { ethers } = require("ethers")

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

// Smart contract setup
const contractABI = [
  "function donateToPackage(uint256 packageId) external payable",
  "event DonationReceived(uint256 indexed donationId, uint256 indexed packageId, address indexed donor, uint256 amount)",
]
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet)

// @route   POST /api/donations/:packageId
// @desc    Make a donation to an aid package
// @access  Private (Donor only)
router.post(
  "/:packageId",
  [
    auth,
    roleAuth(["donor"]),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("donorAddress").isEthereumAddress().withMessage("Valid Ethereum address required"),
    body("message").optional().isLength({ max: 500 }).withMessage("Message too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { packageId } = req.params
      const { amount, donorAddress, message } = req.body
      const donorId = req.user.id

      // Check if aid package exists
      const aidPackage = await AidPackage.findById(packageId)
      if (!aidPackage) {
        return res.status(404).json({ message: "Aid package not found" })
      }

      if (aidPackage.status === "delivered" || aidPackage.status === "cancelled") {
        return res.status(400).json({ message: "Cannot donate to this package" })
      }

      // Call smart contract donation function
      const tx = await contract.donateToPackage(packageId, {
        value: ethers.parseEther(amount.toString()),
      })
      const receipt = await tx.wait()

      // Create donation record
      const donation = new Donation({
        packageId,
        donorId,
        donorAddress,
        amount: ethers.parseEther(amount.toString()).toString(),
        message,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        status: "completed",
      })

      await donation.save()

      // Update aid package funding
      aidPackage.currentFunding = (BigInt(aidPackage.currentFunding) + BigInt(donation.amount)).toString()

      // Check if funding goal is reached
      if (BigInt(aidPackage.currentFunding) >= BigInt(aidPackage.fundingGoal)) {
        aidPackage.status = "funded"
      }

      await aidPackage.save()

      res.status(201).json({
        message: "Donation successful",
        donation,
        transactionHash: tx.hash,
      })
    } catch (error) {
      console.error("Donation error:", error)
      res.status(500).json({ message: "Server error during donation" })
    }
  },
)

// @route   GET /api/donations/donor/:donorId
// @desc    Get donations by donor
// @access  Private (Donor only)
router.get("/donor/:donorId", [auth, roleAuth(["donor"])], async (req, res) => {
  try {
    const { donorId } = req.params

    // Ensure donor can only see their own donations
    if (req.user.id !== donorId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const donations = await Donation.find({ donorId })
      .populate("packageId", "title description itemType quantity")
      .sort({ createdAt: -1 })

    res.json(donations)
  } catch (error) {
    console.error("Get donor donations error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
