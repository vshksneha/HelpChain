const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["NGO", "Donor", "Volunteer"],
      required: [true, "Role is required"],
    },
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      unique: true,
      match: [/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum address"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    // NGO specific fields
    organizationName: {
      type: String,
      required: function () {
        return this.role === "NGO"
      },
    },
    registrationNumber: {
      type: String,
      required: function () {
        return this.role === "NGO"
      },
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // Contact information
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    // Activity tracking
    totalDonations: {
      type: Number,
      default: 0,
    },
    totalAidPackages: {
      type: Number,
      default: 0,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    // Blockchain integration
    isRegisteredOnChain: {
      type: Boolean,
      default: false,
    },
    registrationTxHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ walletAddress: 1 })
userSchema.index({ role: 1 })

// Virtual for user's full address
userSchema.virtual("fullAddress").get(function () {
  if (!this.address) return null
  const { street, city, state, country, zipCode } = this.address
  return [street, city, state, country, zipCode].filter(Boolean).join(", ")
})

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.__v
  return userObject
}

module.exports = mongoose.model("User", userSchema)
