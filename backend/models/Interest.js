const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      index: true
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

    type: {
      type: String,
      enum: ["pre-order", "notify"],
      default: "notify",
      index: true
    }
  },
  {
    timestamps: true
  }
);

interestSchema.index(
  {
    productId: 1,
    customerEmail: 1,
    type: 1
  },
  {
    unique: true
  }
);

module.exports =
  mongoose.model("Interest", interestSchema);