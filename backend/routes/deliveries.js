const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const auth = require("../middleware/auth")
const roleAuth = require("../middleware/roleAuth")
const Delivery = require("../models/Delivery")
const AidPackage = require("../models/AidPackage")
const { ethers } = require("ethers")

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

// Smart contract setup
const contractABI = [
  "function pledgeDelivery(uint256 packageId) external",
  "function updateDeliveryStatus(uint256 packageId, uint8 status) external",
  "function confirmDelivery(uint256 packageId, string memory deliveryProof) external",
  "event DeliveryPledged(uint256 indexed deliveryId, uint256 indexed packageId, address indexed volunteer)",
  "event StatusUpdated(uint256 indexed deliveryId, uint256 indexed packageId, uint8 status)",
  "event DeliveryConfirmed(uint256 indexed deliveryId, uint256 indexed packageId, address indexed volunteer, string deliveryProof)",
]
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet)

// @route   POST /api/deliveries/pledge/:packageId
// @desc    Pledge to deliver an aid package
// @access  Private (Volunteer only)
router.post(
  "/pledge/:packageId",
  [
    auth,
    roleAuth(["volunteer"]),
    body("volunteerAddress").isEthereumAddress().withMessage("Valid Ethereum address required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { packageId } = req.params
      const { volunteerAddress } = req.body
      const volunteerId = req.user.id

      // Check if aid package exists and is funded
      const aidPackage = await AidPackage.findById(packageId)
      if (!aidPackage) {
        return res.status(404).json({ message: "Aid package not found" })
      }

      if (aidPackage.status !== "funded") {
        return res.status(400).json({ message: "Aid package must be funded before delivery can be pledged" })
      }

      // Check if delivery already exists
      const existingDelivery = await Delivery.findOne({ packageId, status: { $ne: "cancelled" } })
      if (existingDelivery) {
        return res.status(400).json({ message: "Delivery already pledged for this package" })
      }

      // Call smart contract pledgeDelivery function
      const tx = await contract.pledgeDelivery(packageId)
      const receipt = await tx.wait()

      // Create delivery record
      const delivery = new Delivery({
        packageId,
        volunteerId,
        volunteerAddress,
        status: "pledged",
        pledgeDate: new Date(),
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
      })

      await delivery.save()

      // Update aid package status
      aidPackage.status = "in_delivery"
      aidPackage.deliveryId = delivery._id
      await aidPackage.save()

      res.status(201).json({
        message: "Delivery pledged successfully",
        delivery,
        transactionHash: tx.hash,
      })
    } catch (error) {
      console.error("Pledge delivery error:", error)
      res.status(500).json({ message: "Server error during delivery pledge" })
    }
  },
)

// @route   PATCH /api/deliveries/status/:packageId
// @desc    Update delivery status
// @access  Private (Volunteer only)
router.patch(
  "/status/:packageId",
  [auth, roleAuth(["volunteer"]), body("status").isIn(["picked_up", "in_transit"]).withMessage("Invalid status")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { packageId } = req.params
      const { status } = req.body
      const volunteerId = req.user.id

      // Find delivery record
      const delivery = await Delivery.findOne({ packageId, volunteerId })
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found or not assigned to you" })
      }

      // Update status on blockchain
      const statusMap = { picked_up: 1, in_transit: 2 }
      const tx = await contract.updateDeliveryStatus(packageId, statusMap[status])
      await tx.wait()

      // Update delivery record
      delivery.status = status
      delivery.statusUpdates.push({
        status,
        timestamp: new Date(),
        transactionHash: tx.hash,
      })

      await delivery.save()

      res.json({
        message: "Delivery status updated successfully",
        delivery,
        transactionHash: tx.hash,
      })
    } catch (error) {
      console.error("Update delivery status error:", error)
      res.status(500).json({ message: "Server error during status update" })
    }
  },
)

// @route   POST /api/deliveries/confirm/:packageId
// @desc    Confirm delivery completion
// @access  Private (Volunteer only)
router.post(
  "/confirm/:packageId",
  [
    auth,
    roleAuth(["volunteer"]),
    body("deliveryProof").notEmpty().withMessage("Delivery proof is required"),
    body("beneficiaryConfirmation").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { packageId } = req.params
      const { deliveryProof, beneficiaryConfirmation } = req.body
      const volunteerId = req.user.id

      // Find delivery record
      const delivery = await Delivery.findOne({ packageId, volunteerId })
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found or not assigned to you" })
      }

      if (delivery.status === "delivered") {
        return res.status(400).json({ message: "Delivery already confirmed" })
      }

      // Confirm delivery on blockchain
      const tx = await contract.confirmDelivery(packageId, deliveryProof)
      const receipt = await tx.wait()

      // Update delivery record
      delivery.status = "delivered"
      delivery.deliveryDate = new Date()
      delivery.deliveryProof = deliveryProof
      delivery.beneficiaryConfirmation = beneficiaryConfirmation
      delivery.confirmationTransactionHash = tx.hash
      delivery.confirmationBlockNumber = receipt.blockNumber

      await delivery.save()

      // Update aid package status
      const aidPackage = await AidPackage.findById(packageId)
      if (aidPackage) {
        aidPackage.status = "delivered"
        await aidPackage.save()
      }

      res.json({
        message: "Delivery confirmed successfully",
        delivery,
        transactionHash: tx.hash,
      })
    } catch (error) {
      console.error("Confirm delivery error:", error)
      res.status(500).json({ message: "Server error during delivery confirmation" })
    }
  },
)

// @route   GET /api/deliveries/volunteer/:volunteerId
// @desc    Get deliveries for a volunteer
// @access  Private (Volunteer only)
router.get("/volunteer/:volunteerId", [auth, roleAuth(["volunteer"])], async (req, res) => {
  try {
    const { volunteerId } = req.params

    // Ensure volunteer can only see their own deliveries
    if (req.user.id !== volunteerId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const deliveries = await Delivery.find({ volunteerId })
      .populate("packageId", "title description itemType quantity location")
      .sort({ pledgeDate: -1 })

    res.json(deliveries)
  } catch (error) {
    console.error("Get volunteer deliveries error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/deliveries/available
// @desc    Get available packages for delivery
// @access  Private (Volunteer only)
router.get("/available", [auth, roleAuth(["volunteer"])], async (req, res) => {
  try {
    const availablePackages = await AidPackage.find({
      status: "funded",
      deliveryId: { $exists: false },
    }).populate("ngoId", "organizationName")

    res.json(availablePackages)
  } catch (error) {
    console.error("Get available packages error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
