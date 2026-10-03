const express = require("express");
const StoreSettings = require("../models/StoreSettings");

const router = express.Router();

// GET store settings
router.get("/", async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({
        ordersEnabled: true,
        youtubeShowcaseUrl: ""
      });
    }

    res.json({
      ordersEnabled: settings.ordersEnabled,
      youtubeShowcaseUrl: settings.youtubeShowcaseUrl || ""
    });
  } catch (error) {
    console.error("Fetch store settings error:", error);

    res.status(500).json({
      message: "Failed to fetch store settings."
    });
  }
});

// PUT order availability
router.put("/orders", async (req, res) => {
  try {
    const { ordersEnabled } = req.body;

    if (typeof ordersEnabled !== "boolean") {
      return res.status(400).json({
        message: "ordersEnabled must be a boolean."
      });
    }

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({
        ordersEnabled,
        youtubeShowcaseUrl: ""
      });
    } else {
      settings.ordersEnabled = ordersEnabled;
      await settings.save();
    }

    res.json({
      message: ordersEnabled
        ? "Orders enabled successfully."
        : "Orders disabled successfully.",
      ordersEnabled: settings.ordersEnabled
    });
  } catch (error) {
    console.error("Update order availability error:", error);

    res.status(500).json({
      message: "Failed to update order availability."
    });
  }
});

// PUT YouTube showcase URL
router.put("/youtube", async (req, res) => {
  try {
    const { youtubeShowcaseUrl } = req.body;

    if (
      typeof youtubeShowcaseUrl !== "string"
    ) {
      return res.status(400).json({
        message: "YouTube URL must be a string."
      });
    }

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create({
        ordersEnabled: true,
        youtubeShowcaseUrl: youtubeShowcaseUrl.trim()
      });
    } else {
      settings.youtubeShowcaseUrl =
        youtubeShowcaseUrl.trim();

      await settings.save();
    }

    res.json({
      message: "YouTube showcase updated successfully.",
      youtubeShowcaseUrl:
        settings.youtubeShowcaseUrl || ""
    });
  } catch (error) {
    console.error(
      "Update YouTube showcase error:",
      error
    );

    res.status(500).json({
      message: "Failed to update YouTube showcase."
    });
  }
});

module.exports = router;