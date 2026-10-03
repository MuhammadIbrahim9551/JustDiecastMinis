const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
      index: true
    },

    orderId: {
      type: String,
      required: true,
      index: true
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    photos: [
  {
    type: String,
    trim: true
  }
],

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected"
      ],
      default: "pending",
      index: true
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index(
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
  "Review",
  reviewSchema
);