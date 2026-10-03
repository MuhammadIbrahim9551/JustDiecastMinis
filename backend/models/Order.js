const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    shippingAddress: {
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: "India",
  },
},

    items: {
      type: [
        {
          productId: {
             type: String,
            required: true,
            min: 1,
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
              validator: Number.isInteger,
              message: "Quantity must be a whole number.",
            },
          },
          image: {
            type: String,
            required: false,
            trim: true,
          },
        },
      ],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) && value.length > 0,
        message: "An order must contain at least one item.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shipping: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      required: true,
      trim: true,
      default: "razorpay",
    },

    paymentStatus: {
  type: String,
  enum: ["pending", "paid", "failed", "refunded"],
  default: "pending"
},

cancellationStatus: {
  type: String,
  enum: [
    "none",
    "requested",
    "cancelled",
    "rejected"
  ],
  default: "none"
},

cancellationReason: {
  type: String,
  trim: true,
  default: null
},

cancelledAt: {
  type: Date,
  default: null
},

refundStatus: {
  type: String,
  enum: [
    "not_required",
    "pending",
    "processed",
    "failed"
  ],
  default: "not_required"
},

razorpayRefundId: {
  type: String,
  default: null
},

    razorpayOrderId: {
      type: String,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
    },

    razorpaySignature: {
      type: String,
      trim: true,
    },

    /*
     * Inventory reserved for this payment.
     *
     * This lets us restore exactly what was reserved
     * if the payment fails or is cancelled.
     */
    reservedItems: {
      type: [
        {
          productId: {
            type: String,
            required: true,
            min: 1,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          type: {
            type: String,
            enum: ["stock", "pre-order"],
            required: true,
          },
        },
      ],
      default: [],
    },

    /*
     * Prevents the same reservation from being
     * released more than once.
     */
    inventoryReleased: {
      type: Boolean,
      default: false,
    },

    /*
     * Time after which an unpaid payment can be
     * considered expired and cleaned up later.
     */
    paymentExpiresAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    shippingCourier: {
      type: String,
      trim: true,
      default: "",
    },

    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },

    trackingUrl: {
      type: String,
      trim: true,
      default: "",
    },

    shippedAt: {
      type: Date,
    },

    deliveredAt: {
  type: Date,
},


    deliveryEmailSentAt: {
      type: Date,
      default: null
    },

    deliveryEmailAttempts: {
      type: Number,
      default: 0
    },

    deliveryEmailLastError: {
      type: String,
      default: null
    },

    deliveryEmailNextRetryAt: {
      type: Date,
      default: null
    },

    dispatchEmailSentAt: {
      type: Date,
      default: null
    },

    dispatchEmailAttempts: {
      type: Number,
      default: 0
    },

    dispatchEmailLastError: {
      type: String,
      default: null
    },

    dispatchEmailNextRetryAt: {
      type: Date,
      default: null
    },

estimatedDeliveryDate: {
  type: Date,
},

reviewEmailScheduledAt: {
  type: Date,
},

reviewEmailSentAt: {
  type: Date,
},

    /*
     * Shiprocket shipment details.
     */
    shiprocketOrderId: {
      type: String,
      trim: true,
      default: "",
    },

    shiprocketShipmentId: {
      type: String,
      trim: true,
      default: "",
    },

    shiprocketStatus: {
      type: String,
      trim: true,
      default: "",
    },

    shiprocketStatusCode: {
      type: Number,
    },

    shiprocketChannelId: {
      type: String,
      trim: true,
      default: "",
    },

    shiprocketCreatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);