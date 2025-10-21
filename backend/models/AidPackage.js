const mongoose = require("mongoose")

const aidPackageSchema = new mongoose.Schema(
  {
    // Blockchain reference
    blockchainId: {
      type: Number,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },

    // Basic information
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    // Item details
    itemType: {
      type: String,
      enum: ["Food", "Medicine", "Clothing", "Other"],
      required: [true, "Item type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["kg", "pieces", "boxes", "bottles", "packets", "other"],
    },

    // Funding information
    fundingGoal: {
      type: Number,
      required: [true, "Funding goal is required"],
      min: [0, "Funding goal cannot be negative"],
    },
    currentFunding: {
      type: Number,
      default: 0,
      min: [0, "Current funding cannot be negative"],
    },

    // Status tracking
    status: {
      type: String,
      enum: ["Active", "Funded", "InDelivery", "Delivered", "Cancelled"],
      default: "Active",
    },
    isFunded: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },

    // Relationships
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "NGO ID is required"],
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Location information
    deliveryLocation: {
      address: {
        type: String,
        required: [true, "Delivery address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: String,
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Media
    images: [
      {
        url: String,
        publicId: String, // Cloudinary public ID
        caption: String,
      },
    ],

    // Urgency and priority
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    expectedDeliveryDate: {
      type: Date,
      required: [true, "Expected delivery date is required"],
    },

    // Blockchain transaction hashes
    creationTxHash: {
      type: String,
      default: null,
    },
    fundingTxHashes: [
      {
        type: String,
      },
    ],
    deliveryTxHash: {
      type: String,
      default: null,
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },

    // Additional metadata
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    beneficiaryCount: {
      type: Number,
      min: [1, "Beneficiary count must be at least 1"],
      required: [true, "Beneficiary count is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
aidPackageSchema.index({ ngoId: 1 })
aidPackageSchema.index({ status: 1 })
aidPackageSchema.index({ itemType: 1 })
aidPackageSchema.index({ urgencyLevel: 1 })
aidPackageSchema.index({ createdAt: -1 })
aidPackageSchema.index({ "deliveryLocation.city": 1 })

// Virtual for funding percentage
aidPackageSchema.virtual("fundingPercentage").get(function () {
  if (this.fundingGoal === 0) return 0
  return Math.round((this.currentFunding / this.fundingGoal) * 100)
})

// Virtual for days remaining
aidPackageSchema.virtual("daysRemaining").get(function () {
  const today = new Date()
  const deliveryDate = new Date(this.expectedDeliveryDate)
  const diffTime = deliveryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Pre-save middleware to update status based on funding
aidPackageSchema.pre("save", function (next) {
  if (this.currentFunding >= this.fundingGoal && !this.isFunded) {
    this.isFunded = true
    this.status = "Funded"
  }
  next()
})

// Static method to get packages by location
aidPackageSchema.statics.findByLocation = function (city, state, country) {
  const query = {}
  if (city) query["deliveryLocation.city"] = new RegExp(city, "i")
  if (state) query["deliveryLocation.state"] = new RegExp(state, "i")
  if (country) query["deliveryLocation.country"] = new RegExp(country, "i")

  return this.find(query)
}

// Method to check if package can be funded
aidPackageSchema.methods.canBeFunded = function () {
  return this.status === "Active" && !this.isFunded && !this.isDelivered
}

// Method to check if package can be delivered
aidPackageSchema.methods.canBeDelivered = function () {
  return this.isFunded && !this.isDelivered && this.status !== "Cancelled"
}

module.exports = mongoose.model("AidPackage", aidPackageSchema)
