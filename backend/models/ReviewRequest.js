const mongoose = require("mongoose");

const reviewRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true
    },

    productId: {
  type: String,
  required: true,
  index: true,
  trim: true
},

    productName: {
      type: String,
      required: true,
      trim: true
    },

    customerName: {
      type: String,
      required: true,
      trim: true
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    usedAt: {
      type: Date,
      default: null
    },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null
    }
  },
  {
    timestamps: true
  }
);

reviewRequestSchema.index(
  {
    orderId: 1,
    productId: 1,
    customerEmail: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "ReviewRequest",
  reviewRequestSchema
);