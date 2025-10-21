const mongoose = require("mongoose")

const donationSchema = new mongoose.Schema(
  {
    // Blockchain reference
    blockchainId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // Basic information
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor ID is required"],
    },
    aidPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AidPackage",
      required: [true, "Aid package ID is required"],
    },

    // Donation details
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [0, "Donation amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "ETH",
      enum: ["ETH", "MATIC", "USD"],
    },

    // Transaction information
    transactionHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      unique: true,
    },
    blockNumber: {
      type: Number,
      required: [true, "Block number is required"],
    },
    gasUsed: {
      type: Number,
      default: null,
    },
    gasPrice: {
      type: Number,
      default: null,
    },

    // Status tracking
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Failed"],
      default: "Pending",
    },
    confirmations: {
      type: Number,
      default: 0,
    },

    // Donor information (optional, for anonymous donations)
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    donorMessage: {
      type: String,
      maxlength: [500, "Donor message cannot exceed 500 characters"],
      default: null,
    },

    // Receipt and tax information
    receiptGenerated: {
      type: Boolean,
      default: false,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    taxDeductible: {
      type: Boolean,
      default: true,
    },

    // Metadata
    donationSource: {
      type: String,
      enum: ["Web", "Mobile", "API"],
      default: "Web",
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
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

// Indexes for better query performance
donationSchema.index({ donorId: 1 })
donationSchema.index({ aidPackageId: 1 })
donationSchema.index({ transactionHash: 1 })
donationSchema.index({ status: 1 })
donationSchema.index({ createdAt: -1 })
donationSchema.index({ amount: -1 })

// Virtual for formatted amount
donationSchema.virtual("formattedAmount").get(function () {
  return `${this.amount} ${this.currency}`
})

// Virtual for blockchain explorer URL
donationSchema.virtual("explorerUrl").get(function () {
  const baseUrl =
    process.env.NODE_ENV === "production" ? "https://polygonscan.com/tx/" : "https://mumbai.polygonscan.com/tx/"
  return `${baseUrl}${this.transactionHash}`
})

// Static method to get total donations for a package
donationSchema.statics.getTotalForPackage = async function (aidPackageId) {
  const result = await this.aggregate([
    { $match: { aidPackageId: mongoose.Types.ObjectId(aidPackageId), status: "Confirmed" } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ])

  return result.length > 0 ? result[0] : { total: 0, count: 0 }
}

// Static method to get donor statistics
donationSchema.statics.getDonorStats = async function (donorId) {
  const result = await this.aggregate([
    { $match: { donorId: mongoose.Types.ObjectId(donorId), status: "Confirmed" } },
    {
      $group: {
        _id: null,
        totalDonated: { $sum: "$amount" },
        donationCount: { $sum: 1 },
        avgDonation: { $avg: "$amount" },
      },
    },
  ])

  return result.length > 0 ? result[0] : { totalDonated: 0, donationCount: 0, avgDonation: 0 }
}

// Method to generate receipt
donationSchema.methods.generateReceipt = async function () {
  // Implementation for receipt generation
  // This would typically integrate with a PDF generation service
  return {
    receiptId: `RCP-${this._id}`,
    donationId: this._id,
    amount: this.amount,
    currency: this.currency,
    date: this.createdAt,
    transactionHash: this.transactionHash,
  }
}

module.exports = mongoose.model("Donation", donationSchema)
