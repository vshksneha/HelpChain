const mongoose = require("mongoose")

const deliverySchema = new mongoose.Schema(
  {
    // Blockchain reference
    blockchainId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // Basic information
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Volunteer ID is required"],
    },
    aidPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AidPackage",
      required: [true, "Aid package ID is required"],
    },

    // Delivery status
    status: {
      type: String,
      enum: ["Pledged", "PickedUp", "InTransit", "Delivered", "Failed", "Cancelled"],
      default: "Pledged",
    },

    // Timeline tracking
    pledgedAt: {
      type: Date,
      default: Date.now,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    inTransitAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },

    // Delivery proof and verification
    deliveryProof: {
      type: String,
      default: null, // OTP hash or IPFS CID
    },
    proofType: {
      type: String,
      enum: ["OTP", "GPS", "Photo", "Signature", "Other"],
      default: null,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Location tracking
    pickupLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      timestamp: Date,
    },
    currentLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      timestamp: Date,
      accuracy: Number,
    },
    deliveryLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      timestamp: Date,
    },

    // Route and logistics
    estimatedDeliveryTime: {
      type: Date,
      required: [true, "Estimated delivery time is required"],
    },
    actualDeliveryTime: {
      type: Date,
      default: null,
    },
    transportMethod: {
      type: String,
      enum: ["Car", "Motorcycle", "Bicycle", "Walking", "Public Transport", "Other"],
      required: [true, "Transport method is required"],
    },
    distance: {
      type: Number, // in kilometers
      default: null,
    },

    // Communication
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: null,
    },
    volunteerNotes: {
      type: String,
      maxlength: [500, "Volunteer notes cannot exceed 500 characters"],
      default: null,
    },
    recipientFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        maxlength: [500, "Feedback comment cannot exceed 500 characters"],
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
    },

    // Blockchain transaction hashes
    pledgeTxHash: {
      type: String,
      default: null,
    },
    statusUpdateTxHashes: [
      {
        status: String,
        txHash: String,
        timestamp: Date,
      },
    ],
    deliveryConfirmationTxHash: {
      type: String,
      default: null,
    },

    // Emergency and issues
    issues: [
      {
        type: {
          type: String,
          enum: ["Delay", "Damage", "Lost", "Recipient Not Found", "Other"],
        },
        description: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        resolved: {
          type: Boolean,
          default: false,
        },
        resolution: String,
      },
    ],

    // Photos and documentation
    photos: [
      {
        url: String,
        publicId: String, // Cloudinary public ID
        caption: String,
        timestamp: Date,
        location: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
deliverySchema.index({ volunteerId: 1 })
deliverySchema.index({ aidPackageId: 1 })
deliverySchema.index({ status: 1 })
deliverySchema.index({ pledgedAt: -1 })
deliverySchema.index({ estimatedDeliveryTime: 1 })

// Virtual for delivery duration
deliverySchema.virtual("deliveryDuration").get(function () {
  if (!this.deliveredAt || !this.pledgedAt) return null
  return Math.round((this.deliveredAt - this.pledgedAt) / (1000 * 60 * 60)) // in hours
})

// Virtual for current status duration
deliverySchema.virtual("currentStatusDuration").get(function () {
  const now = new Date()
  let statusStartTime

  switch (this.status) {
    case "Pledged":
      statusStartTime = this.pledgedAt
      break
    case "PickedUp":
      statusStartTime = this.pickedUpAt
      break
    case "InTransit":
      statusStartTime = this.inTransitAt
      break
    case "Delivered":
      statusStartTime = this.deliveredAt
      break
    default:
      return null
  }

  if (!statusStartTime) return null
  return Math.round((now - statusStartTime) / (1000 * 60)) // in minutes
})

// Virtual for is overdue
deliverySchema.virtual("isOverdue").get(function () {
  if (this.status === "Delivered" || !this.estimatedDeliveryTime) return false
  return new Date() > this.estimatedDeliveryTime
})

// Pre-save middleware to update timestamps
deliverySchema.pre("save", function (next) {
  const now = new Date()

  if (this.isModified("status")) {
    switch (this.status) {
      case "PickedUp":
        if (!this.pickedUpAt) this.pickedUpAt = now
        break
      case "InTransit":
        if (!this.inTransitAt) this.inTransitAt = now
        break
      case "Delivered":
        if (!this.deliveredAt) this.deliveredAt = now
        break
    }
  }

  next()
})

// Static method to get volunteer statistics
deliverySchema.statics.getVolunteerStats = async function (volunteerId) {
  const result = await this.aggregate([
    { $match: { volunteerId: mongoose.Types.ObjectId(volunteerId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])

  const stats = {
    total: 0,
    pledged: 0,
    pickedUp: 0,
    inTransit: 0,
    delivered: 0,
    failed: 0,
    cancelled: 0,
  }

  result.forEach((item) => {
    stats.total += item.count
    stats[item._id.toLowerCase()] = item.count
  })

  return stats
}

// Method to generate OTP for verification
deliverySchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  this.verificationCode = otp
  return otp
}

// Method to verify OTP
deliverySchema.methods.verifyOTP = function (inputOTP) {
  return this.verificationCode === inputOTP
}

module.exports = mongoose.model("Delivery", deliverySchema)
