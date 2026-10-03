const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      id: Number(req.params.id)
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product."
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Product created successfully.",
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product.",
      error: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        id: Number(req.params.id)
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json({
      message: "Product updated successfully.",
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product.",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      id: Number(req.params.id)
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json({
      message: "Product deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product.",
      error: error.message
    });
  }
});

module.exports = router;