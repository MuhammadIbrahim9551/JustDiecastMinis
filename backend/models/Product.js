const mongoose = require("mongoose");

const allowedCategories = [
  "new-arrivals",
  "pre-orders",
  "best-sellers",
  "featured",
  "sale"
];

const productSchema = new mongoose.Schema(
  {
    id: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  minlength: 1,
},

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },

    series: {
      type: String,
      required: false,
      trim: true
    },

    about: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000
    },

    vehicleMaker: {
  type: [String],
  required: true,
  validate: {
    validator: (value) =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0
      ),
    message:
      "At least one vehicle maker is required."
  }
},

    scale: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },

    category: {
      type: String,
      required: true,
      enum: allowedCategories
    },

    type: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0
          ),
        message:
          "At least one valid product type is required."
      }
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) =>
          typeof value === "number" &&
          Number.isFinite(value),
        message:
          "Price must be a valid number."
      }
    },

    status: {
      type: String,
      enum: [
        "in-stock",
        "pre-order",
        "out-of-stock"
      ],
      required: true
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message:
          "Stock must be a whole number."
      }
    },

    preOrderLimitEnabled: {
      type: Boolean,
      required: true,
      default: false
    },

    preOrderLimit: {
      type: Number,
      required: false,
      default: null,
      min: 1,
      validate: {
        validator: function (value) {
          if (
            value === null ||
            value === undefined
          ) {
            return !this.preOrderLimitEnabled;
          }

          return (
            Number.isInteger(value) &&
            value >= 1
          );
        },
        message:
          "Pre-order limit must be a whole number greater than 0."
      }
    },

    preOrderCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message:
          "Pre-order count must be a whole number."
      }
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(
            (image) =>
              typeof image === "string" &&
              image.trim().length > 0
          ),
        message:
          "At least one product image is required."
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);