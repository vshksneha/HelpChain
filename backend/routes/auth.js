const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")
const blockchainService = require("../services/blockchainService")

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["NGO", "Donor", "Volunteer"]).withMessage("Invalid role"),
    body("walletAddress")
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage("Invalid Ethereum address"),
    body("organizationName").optional().trim().isLength({ min: 2, max: 200 }),
    body("registrationNumber").optional().trim().isLength({ min: 2, max: 100 }),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, password, role, walletAddress, organizationName, registrationNumber, phone, address } =
        req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { walletAddress }],
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or wallet address already exists",
        })
      }

      // Create new user
      const userData = {
        name,
        email,
        password,
        role,
        walletAddress,
        phone,
        address,
      }

      // Add role-specific fields
      if (role === "NGO") {
        if (!organizationName) {
          return res.status(400).json({
            success: false,
            message: "Organization name is required for NGO registration",
          })
        }
        userData.organizationName = organizationName
        userData.registrationNumber = registrationNumber
      }

      const user = new User(userData)
      await user.save()

      // Register user on blockchain (async)
      try {
        const txHash = await blockchainService.registerUser(walletAddress, role)
        user.isRegisteredOnChain = true
        user.registrationTxHash = txHash
        await user.save()
      } catch (blockchainError) {
        console.error("Blockchain registration failed:", blockchainError)
        // Continue with registration even if blockchain fails
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          walletAddress: user.walletAddress,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: user.getPublicProfile(),
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      })
    }
  },
)

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password")
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          walletAddress: user.walletAddress,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: user.getPublicProfile(),
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during login",
      })
    }
  },
)

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    auth,
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("phone")
      .optional()
      .matches(/^\+?[\d\s-()]+$/),
    body("description").optional().isLength({ max: 500 }),
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

      const user = await User.findById(req.user.userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Update allowed fields
      const allowedUpdates = ["name", "phone", "description", "address", "profileImage"]
      const updates = {}

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field]
        }
      })

      Object.assign(user, updates)
      await user.save()

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: user.getPublicProfile(),
        },
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/auth/verify-wallet
// @desc    Verify wallet ownership
// @access  Private
router.post("/verify-wallet", auth, async (req, res) => {
  try {
    const { signature, message } = req.body

    if (!signature || !message) {
      return res.status(400).json({
        success: false,
        message: "Signature and message are required",
      })
    }

    // Verify the signature matches the user's wallet
    const isValid = await blockchainService.verifySignature(message, signature, req.user.walletAddress)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      })
    }

    // Update user verification status
    await User.findByIdAndUpdate(req.user.userId, { isVerified: true })

    res.json({
      success: true,
      message: "Wallet verified successfully",
    })
  } catch (error) {
    console.error("Wallet verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
