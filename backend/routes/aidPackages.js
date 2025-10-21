const express = require("express")
const { body, query, validationResult } = require("express-validator")
const AidPackage = require("../models/AidPackage")
const User = require("../models/User")
const auth = require("../middleware/auth")
const roleAuth = require("../middleware/roleAuth")
const blockchainService = require("../services/blockchainService")
const cloudinaryService = require("../services/cloudinaryService")

const router = express.Router()

// @route   POST /api/aid-packages
// @desc    Create a new aid package (NGO only)
// @access  Private (NGO)
router.post(
  "/",
  [
    auth,
    roleAuth(["NGO"]),
    body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),
    body("itemType").isIn(["Food", "Medicine", "Clothing", "Other"]).withMessage("Invalid item type"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
    body("unit").isIn(["kg", "pieces", "boxes", "bottles", "packets", "other"]).withMessage("Invalid unit"),
    body("fundingGoal").isFloat({ min: 0 }).withMessage("Funding goal must be a positive number"),
    body("deliveryLocation.address").trim().isLength({ min: 5 }).withMessage("Delivery address is required"),
    body("deliveryLocation.city").trim().isLength({ min: 2 }).withMessage("City is required"),
    body("deliveryLocation.country").trim().isLength({ min: 2 }).withMessage("Country is required"),
    body("expectedDeliveryDate").isISO8601().withMessage("Invalid delivery date"),
    body("beneficiaryCount").isInt({ min: 1 }).withMessage("Beneficiary count must be a positive integer"),
    body("urgencyLevel").optional().isIn(["Low", "Medium", "High", "Critical"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const {
        title,
        description,
        itemType,
        quantity,
        unit,
        fundingGoal,
        deliveryLocation,
        expectedDeliveryDate,
        beneficiaryCount,
        urgencyLevel,
        tags,
        images,
      } = req.body

      // Create aid package in database
      const aidPackage = new AidPackage({
        title,
        description,
        itemType,
        quantity,
        unit,
        fundingGoal,
        deliveryLocation,
        expectedDeliveryDate,
        beneficiaryCount,
        urgencyLevel: urgencyLevel || "Medium",
        tags: tags || [],
        ngoId: req.user.userId,
      })

      // Handle image uploads if provided
      if (images && images.length > 0) {
        try {
          const uploadedImages = await cloudinaryService.uploadMultiple(images)
          aidPackage.images = uploadedImages
        } catch (uploadError) {
          console.error("Image upload error:", uploadError)
          // Continue without images if upload fails
        }
      }

      await aidPackage.save()

      // Create aid package on blockchain
      try {
        const itemTypeIndex = ["Food", "Medicine", "Clothing", "Other"].indexOf(itemType)
        const fundingGoalWei = blockchainService.ethToWei(fundingGoal)

        const txHash = await blockchainService.createAidPackage(
          req.user.walletAddress,
          description,
          itemTypeIndex,
          quantity,
          fundingGoalWei,
        )

        // Update aid package with blockchain info
        aidPackage.creationTxHash = txHash
        // Note: blockchainId will be updated when we get the event from blockchain
        await aidPackage.save()
      } catch (blockchainError) {
        console.error("Blockchain creation failed:", blockchainError)
        // Continue even if blockchain fails - can retry later
      }

      // Update NGO's aid package count
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { totalAidPackages: 1 },
      })

      // Populate NGO information
      await aidPackage.populate("ngoId", "name organizationName profileImage")

      res.status(201).json({
        success: true,
        message: "Aid package created successfully",
        data: {
          aidPackage,
        },
      })
    } catch (error) {
      console.error("Aid package creation error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during aid package creation",
      })
    }
  },
)

// @route   GET /api/aid-packages
// @desc    Get all aid packages with filtering and pagination
// @access  Public
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["Active", "Funded", "InDelivery", "Delivered", "Cancelled"]),
    query("itemType").optional().isIn(["Food", "Medicine", "Clothing", "Other"]),
    query("urgencyLevel").optional().isIn(["Low", "Medium", "High", "Critical"]),
    query("city").optional().trim(),
    query("country").optional().trim(),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "fundingGoal", "currentFunding", "expectedDeliveryDate", "urgencyLevel"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const {
        page = 1,
        limit = 10,
        status,
        itemType,
        urgencyLevel,
        city,
        country,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query

      // Build filter query
      const filter = {}

      if (status) filter.status = status
      if (itemType) filter.itemType = itemType
      if (urgencyLevel) filter.urgencyLevel = urgencyLevel
      if (city) filter["deliveryLocation.city"] = new RegExp(city, "i")
      if (country) filter["deliveryLocation.country"] = new RegExp(country, "i")

      if (search) {
        filter.$or = [
          { title: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
          { tags: { $in: [new RegExp(search, "i")] } },
        ]
      }

      // Build sort object
      const sort = {}
      sort[sortBy] = sortOrder === "asc" ? 1 : -1

      // Execute query with pagination
      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

      const [aidPackages, total] = await Promise.all([
        AidPackage.find(filter)
          .populate("ngoId", "name organizationName profileImage")
          .populate("assignedVolunteer", "name profileImage")
          .sort(sort)
          .skip(skip)
          .limit(Number.parseInt(limit)),
        AidPackage.countDocuments(filter),
      ])

      const totalPages = Math.ceil(total / Number.parseInt(limit))

      res.json({
        success: true,
        data: {
          aidPackages,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: Number.parseInt(limit),
            hasNextPage: Number.parseInt(page) < totalPages,
            hasPrevPage: Number.parseInt(page) > 1,
          },
        },
      })
    } catch (error) {
      console.error("Get aid packages error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/aid-packages/:id
// @desc    Get single aid package by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const aidPackage = await AidPackage.findById(req.params.id)
      .populate("ngoId", "name organizationName profileImage phone address")
      .populate("assignedVolunteer", "name profileImage phone")

    if (!aidPackage) {
      return res.status(404).json({
        success: false,
        message: "Aid package not found",
      })
    }

    // Increment view count
    aidPackage.viewCount += 1
    await aidPackage.save()

    res.json({
      success: true,
      data: {
        aidPackage,
      },
    })
  } catch (error) {
    console.error("Get aid package error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/aid-packages/:id
// @desc    Update aid package (NGO only - own packages)
// @access  Private (NGO)
router.put(
  "/:id",
  [
    auth,
    roleAuth(["NGO"]),
    body("title").optional().trim().isLength({ min: 5, max: 200 }),
    body("description").optional().trim().isLength({ min: 10, max: 1000 }),
    body("expectedDeliveryDate").optional().isISO8601(),
    body("urgencyLevel").optional().isIn(["Low", "Medium", "High", "Critical"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const aidPackage = await AidPackage.findById(req.params.id)

      if (!aidPackage) {
        return res.status(404).json({
          success: false,
          message: "Aid package not found",
        })
      }

      // Check if user owns this aid package
      if (aidPackage.ngoId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this aid package",
        })
      }

      // Check if package can be updated
      if (aidPackage.status === "Delivered" || aidPackage.status === "Cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cannot update delivered or cancelled packages",
        })
      }

      // Update allowed fields
      const allowedUpdates = ["title", "description", "expectedDeliveryDate", "urgencyLevel", "tags"]
      const updates = {}

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field]
        }
      })

      Object.assign(aidPackage, updates)
      await aidPackage.save()

      await aidPackage.populate("ngoId", "name organizationName profileImage")

      res.json({
        success: true,
        message: "Aid package updated successfully",
        data: {
          aidPackage,
        },
      })
    } catch (error) {
      console.error("Aid package update error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   DELETE /api/aid-packages/:id
// @desc    Cancel aid package (NGO only - own packages)
// @access  Private (NGO)
router.delete("/:id", [auth, roleAuth(["NGO"])], async (req, res) => {
  try {
    const aidPackage = await AidPackage.findById(req.params.id)

    if (!aidPackage) {
      return res.status(404).json({
        success: false,
        message: "Aid package not found",
      })
    }

    // Check if user owns this aid package
    if (aidPackage.ngoId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this aid package",
      })
    }

    // Check if package can be cancelled
    if (aidPackage.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel delivered packages",
      })
    }

    if (aidPackage.currentFunding > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel packages with existing donations",
      })
    }

    aidPackage.status = "Cancelled"
    await aidPackage.save()

    res.json({
      success: true,
      message: "Aid package cancelled successfully",
    })
  } catch (error) {
    console.error("Aid package cancellation error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/aid-packages/ngo/:ngoId
// @desc    Get aid packages by NGO
// @access  Public
router.get("/ngo/:ngoId", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const filter = { ngoId: req.params.ngoId }
    if (status) filter.status = status

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const [aidPackages, total] = await Promise.all([
      AidPackage.find(filter)
        .populate("ngoId", "name organizationName profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit)),
      AidPackage.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: {
        aidPackages,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / Number.parseInt(limit)),
          totalItems: total,
        },
      },
    })
  } catch (error) {
    console.error("Get NGO aid packages error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
