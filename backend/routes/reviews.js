
const express = require("express");
const crypto = require("crypto");

const Review = require("../models/Review");
const ReviewRequest = require("../models/ReviewRequest");

const router = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/reviews"));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}${extension}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    files: 3,
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, and WebP images are allowed.")
      );
    }

    cb(null, true);
  }
});


const hashReviewToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// Get review request details
router.get("/form/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, token } = req.query;

    if (!productId || !token) {
      return res.status(400).json({
        message: "Product ID and review token are required."
      });
    }

    const tokenHash = hashReviewToken(token);

    const reviewRequest = await ReviewRequest.findOne({
      orderId,
      productId: Number(productId),
      tokenHash
    });

    if (!reviewRequest) {
      return res.status(404).json({
        message: "Invalid review link."
      });
    }

    if (reviewRequest.usedAt) {
      return res.status(400).json({
        message: "This review link has already been used."
      });
    }

    if (reviewRequest.expiresAt <= new Date()) {
      return res.status(400).json({
        message: "This review link has expired."
      });
    }

    return res.json({
      orderId: reviewRequest.orderId,
      productId: reviewRequest.productId,
      productName: reviewRequest.productName,
      customerName: reviewRequest.customerName
    });
  } catch (error) {
    console.error(
      "Review form error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to load review form."
    });
  }
});

// Submit a customer review
router.post("/", upload.array("photos", 3), async (req, res) => {
  try {
    const {
      orderId,
      productId,
      token,
      rating,
      comment
    } = req.body;

    if (
      !orderId ||
      !productId ||
      !token ||
      rating === undefined ||
      !comment
    ) {
      return res.status(400).json({
        message: "All review fields are required."
      });
    }

    const numericRating = Number(rating);
    const numericProductId = Number(productId);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5."
      });
    }

    const trimmedComment = String(comment).trim();

    if (
      trimmedComment.length === 0 ||
      trimmedComment.length > 1000
    ) {
      return res.status(400).json({
        message: "Review must contain between 1 and 1000 characters."
      });
    }

    const tokenHash = hashReviewToken(token);

    const reviewRequest = await ReviewRequest.findOne({
      orderId,
      productId: numericProductId,
      tokenHash
    });

    if (!reviewRequest) {
      return res.status(404).json({
        message: "Invalid review link."
      });
    }

    if (reviewRequest.usedAt) {
      return res.status(400).json({
        message: "This review link has already been used."
      });
    }

    if (reviewRequest.expiresAt <= new Date()) {
      return res.status(400).json({
        message: "This review link has expired."
      });
    }

    const photoUrls = (req.files || []).map(
  (file) => `/uploads/reviews/${file.filename}`
);

    const review = await Review.create({
  productId: reviewRequest.productId,
  orderId: reviewRequest.orderId,
  customerName: reviewRequest.customerName,
  customerEmail: reviewRequest.customerEmail,
  rating: numericRating,
  comment: trimmedComment,
  photos: photoUrls,
  status: "pending",
  isVerifiedPurchase: true
});

    const updatedRequest =
      await ReviewRequest.findOneAndUpdate(
        {
          _id: reviewRequest._id,
          usedAt: null
        },
        {
          usedAt: new Date(),
          reviewId: review._id
        },
        {
          new: true
        }
      );

    if (!updatedRequest) {
      await Review.findByIdAndDelete(review._id);

      return res.status(400).json({
        message: "This review link has already been used."
      });
    }

    return res.status(201).json({
      message: "Review submitted for approval.",
      reviewId: review._id
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A review already exists for this product and order."
      });
    }

    console.error(
      "Review submission error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to submit review."
    });
  }
});


/*
 * Get approved reviews for a product.
 */
router.get(
  "/product/:productId",
  async (req, res) => {
    try {
      const productId = Number(
        req.params.productId
      );

      if (
        !Number.isInteger(productId) ||
        productId < 1
      ) {
        return res.status(400).json({
          message: "Invalid product ID."
        });
      }

      const reviews = await Review.find({
        productId,
        status: "approved"
      })
        .select(
  "customerName rating comment photos createdAt isVerifiedPurchase"
)
        .sort({
          createdAt: -1
        })
        .lean();

      return res.json(reviews);
    } catch (error) {
      console.error(
        "Failed to fetch product reviews:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch product reviews."
      });
    }
  }
);
module.exports = router;