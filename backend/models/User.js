const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    vehicleMaker: {
  type: [String],
  default: []
},
    scale: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    type: {
      type: [String],
      default: []
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    series: {
      type: String,
      required: false
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const wishlistItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    vehicleMaker: {
  type: [String],
  default: []
},
    scale: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    type: {
      type: [String],
      default: []
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    series: {
      type: String,
      required: false
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    },
    addresses: {
      type: [addressSchema],
      default: []
    },
    cart: {
      type: [cartItemSchema],
      default: []
    },
    wishlist: {
      type: [wishlistItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
