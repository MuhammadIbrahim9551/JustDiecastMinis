
const express = require("express");
const Announcement = require("../models/Announcement");

const router = express.Router();

// GET announcement
router.get("/", async (req, res) => {
  try {
    let announcement = await Announcement.findOne();

    if (!announcement) {
      announcement = await Announcement.create({
        text: ""
      });
    }

    res.json({
      text: announcement.text
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch announcement."
    });
  }
});

// PUT announcement
router.put("/", async (req, res) => {
  try {
    const { text } = req.body;

    let announcement = await Announcement.findOne();

    if (!announcement) {
      announcement = await Announcement.create({
        text: text || ""
      });
    } else {
      announcement.text = text || "";
      await announcement.save();
    }

    res.json({
      message: "Announcement saved successfully.",
      text: announcement.text
    });
  } catch (error) {
    console.error("Save announcement error:", error);

    res.status(500).json({
      message: "Failed to save announcement."
    });
  }
});

module.exports = router;