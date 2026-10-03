const express = require("express");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/data", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
  cart: user.cart,
  wishlist: user.wishlist,
  addresses: user.addresses
});
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user data."
    });
  }
});

router.put("/cart", authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        cart: req.body.cart || []
      },
      {
        new: true
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart."
    });
  }
});

router.put("/wishlist", authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        wishlist: req.body.wishlist || []
      },
      {
        new: true
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update wishlist."
    });
  }
});

router.put("/addresses", authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { addresses: req.body.addresses || [] },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update addresses."
    });
  }
});

module.exports = router;