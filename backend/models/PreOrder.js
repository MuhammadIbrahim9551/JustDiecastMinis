const mongoose = require("mongoose");

const preOrderSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "PreOrder",
  preOrderSchema
);