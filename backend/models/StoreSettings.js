const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    ordersEnabled: {
      type: Boolean,
      default: true
    },

    youtubeShowcaseUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "StoreSettings",
  storeSettingsSchema
);