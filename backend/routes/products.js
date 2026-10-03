const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../models/Product");

const {
  authenticate,
  requireAdmin
} = require("../middleware/auth");

const router = express.Router();

const allowedCategories = [
  "new-arrivals",
  "pre-orders",
  "best-sellers",
  "featured",
  "sale"
];

const allowedStatuses = [
  "in-stock",
  "pre-order",
  "out-of-stock"
];

const uploadDirectory = path.join(
  __dirname,
  "../uploads/products"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg"
    ];

    if (
      !allowedTypes.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed."
        )
      );
    }

    cb(null, true);
  }
});

const deleteUploadedFiles = (files) => {
  if (!files) {
    return;
  }

  files.forEach((file) => {
    fs.unlink(file.path, () => {});
  });
};

const parseType = (value) => {
  try {
    const parsed = JSON.parse(
      value || "[]"
    );

    if (!Array.isArray(parsed)) {
      return null;
    }

    const cleaned = parsed
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : ""
      )
      .filter(Boolean);

    return cleaned.length > 0
      ? cleaned
      : null;
  } catch (error) {
    return null;
  }
};

const parseVehicleMaker = (value) => {
  try {
    const parsed = JSON.parse(
      value || "[]"
    );

    if (!Array.isArray(parsed)) {
      return null;
    }

    const cleaned = parsed
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : ""
      )
      .filter(Boolean);

    return cleaned.length > 0
      ? cleaned
      : null;
  } catch (error) {
    return null;
  }
};

const parseBoolean = (value) => {
  if (
    value === true ||
    value === "true" ||
    value === "1"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === "0"
  ) {
    return false;
  }

  return null;
};

const parseStock = (value) => {
  const stock = Number(value);

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return null;
  }

  return stock;
};

const parsePreOrderLimit = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const limit = Number(value);

  if (
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    return null;
  }

  return limit;
};

const validateProductFields = ({
  id,
  name,
  brand,
  vehicleMaker,
  scale,
  category,
  type,
  price,
  stock,
  preOrderLimitEnabled,
  preOrderLimit,
  preOrderCount = 0,
  status,
  about,
  requireId = true
}) => {
  if (
  requireId &&
  (
    typeof id !== "string" ||
    !id.trim()
  )
) {
  return "Product ID is required.";
}

  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return "Product name is required.";
  }

  if (
    typeof brand !== "string" ||
    !brand.trim()
  ) {
    return "Model maker is required.";
  }

  if (
  !Array.isArray(vehicleMaker) ||
  vehicleMaker.length === 0
) {
  return "At least one vehicle maker is required.";
}

  if (
    typeof scale !== "string" ||
    !scale.trim()
  ) {
    return "Scale is required.";
  }

  if (
    !allowedCategories.includes(
      category
    )
  ) {
    return "Invalid product category.";
  }

  if (
    !Array.isArray(type) ||
    type.length === 0
  ) {
    return "At least one product type is required.";
  }

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return "Price must be a valid non-negative number.";
  }

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return "Stock must be a non-negative whole number.";
  }

  if (
    typeof preOrderLimitEnabled !==
    "boolean"
  ) {
    return "Pre-order limit setting is invalid.";
  }

  if (
    preOrderLimitEnabled &&
    (
      !Number.isInteger(
        preOrderLimit
      ) ||
      preOrderLimit < 1
    )
  ) {
    return "Pre-order limit must be a positive whole number when enabled.";
  }

  if (
    !Number.isInteger(preOrderCount) ||
    preOrderCount < 0
  ) {
    return "Pre-order count must be a non-negative whole number.";
  }

  if (
    preOrderLimitEnabled &&
    preOrderCount > preOrderLimit
  ) {
    return "Pre-order count cannot exceed the pre-order limit.";
  }

  if (
    !allowedStatuses.includes(status)
  ) {
    return "Invalid product status.";
  }

  if (
    typeof about !== "undefined" &&
    (
      typeof about !== "string" ||
      about.length > 2000
    )
  ) {
    return "About text must be 2000 characters or fewer.";
  }

  return null;
};

router.get("/", async (req, res) => {
  try {
    const products =
      await Product.find().sort({
        id: 1
      });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch products."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId =
  req.params.id?.trim();

if (!productId) {
  return res.status(400).json({
    message:
      "Invalid product ID."
  });
}

    const product =
      await Product.findOne({
        id: productId
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found."
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch product."
    });
  }
});

router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one product image is required."
        });
      }

      const type = parseType(
        req.body.type
      );

      const vehicleMaker =
  parseVehicleMaker(
    req.body.vehicleMaker
  );
      const price = Number(
        req.body.price
      );

      const stock = parseStock(
        req.body.stock
      );

      const preOrderLimitEnabled =
        parseBoolean(
          req.body.preOrderLimitEnabled
        );

      const preOrderLimit =
        parsePreOrderLimit(
          req.body.preOrderLimit
        );

      if (stock === null) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message:
            "Stock must be a non-negative whole number."
        });
      }

      if (
        preOrderLimitEnabled === null
      ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message:
            "Pre-order limit setting is invalid."
        });
      }

      const validationError =
        validateProductFields({
          id: req.body.id,
          name: req.body.name,
          brand: req.body.brand,
          vehicleMaker,
          scale: req.body.scale,
          category:
            req.body.category,
          type,
          price,
          stock,
          preOrderLimitEnabled,
          preOrderLimit,
          preOrderCount: 0,
          status:
            req.body.status,
          about:
            req.body.about
        });

      if (validationError) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
          message:
            validationError
        });
      }

      const productId =
  req.body.id.trim();

      const existingProduct =
        await Product.findOne({
          id: productId
        });

      if (existingProduct) {
        deleteUploadedFiles(req.files);

        return res.status(409).json({
          message:
            `Product ID ${productId} already exists.`
        });
      }

      let status =
        req.body.status;

      if (
        status !== "pre-order" &&
        stock === 0
      ) {
        status =
          "out-of-stock";
      }

      const uploadedImages =
        req.files.map(
          (file) =>
            `${process.env.BACKEND_URL}/uploads/products/${file.filename}`
        );

      const product =
        await Product.create({
          id: productId,

          name:
            req.body.name.trim(),

          brand:
            req.body.brand.trim(),

          vehicleMaker,

          scale:
            req.body.scale.trim(),

          category:
            req.body.category,

          type,

          series:
            req.body.series
              ? req.body.series.trim()
              : undefined,

          about:
            typeof req.body.about ===
            "string"
              ? req.body.about.trim()
              : undefined,

          price,

          stock,

          preOrderLimitEnabled,

          preOrderLimit,

          preOrderCount: 0,

          status,

          images:
            uploadedImages
        });

      res.status(201).json({
        message:
          "Product created successfully.",
        product
      });
    } catch (error) {
      deleteUploadedFiles(req.files);

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "A product with this ID already exists."
        });
      }

      if (
        error.name ===
        "ValidationError"
      ) {
        const firstError =
          Object.values(
            error.errors
          )[0];

        return res.status(400).json({
          message:
            firstError?.message ||
            "Invalid product data."
        });
      }

      res.status(500).json({
        message:
          "Failed to create product."
      });
    }
  }
);

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const productId =
  req.params.id?.trim();

if (!productId) {
  deleteUploadedFiles(
    req.files
  );

  return res.status(400).json({
    message:
      "Invalid product ID."
  });
}

      const isStatusOnlyUpdate =
        req.is("application/json") &&
        Object.keys(req.body).length ===
          1 &&
        req.body.status !==
          undefined;

      if (isStatusOnlyUpdate) {
        if (
          !allowedStatuses.includes(
            req.body.status
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid product status."
          });
        }

        const existingProduct =
          await Product.findOne({
            id: productId
          });

        if (!existingProduct) {
          return res.status(404).json({
            message:
              "Product not found."
          });
        }

        let status =
          req.body.status;

        if (
          status === "in-stock" &&
          existingProduct.stock === 0
        ) {
          status =
            "out-of-stock";
        }

        const update = {
          status
        };

        if (
          status ===
          "out-of-stock"
        ) {
          update.stock = 0;
        }

        const product =
          await Product.findOneAndUpdate(
            {
              id: productId
            },
            update,
            {
              new: true,
              runValidators: true
            }
          );

        return res.json({
          message:
            "Product updated successfully.",
          product
        });
      }

      const existingProduct =
        await Product.findOne({
          id: productId
        });

      if (!existingProduct) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(404).json({
          message:
            "Product not found."
        });
      }

      let existingImages = [];

      try {
        existingImages =
          JSON.parse(
            req.body.existingImages ||
              "[]"
          );
      } catch (error) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Invalid existing image data."
        });
      }

      if (
        !Array.isArray(existingImages)
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Invalid existing image data."
        });
      }

      existingImages =
        existingImages.filter(
          (image) =>
            typeof image ===
              "string" &&
            image.trim().length > 0
        );

      const uploadedImages =
        (req.files || []).map(
          (file) =>
            `${process.env.BACKEND_URL}/uploads/products/${file.filename}`
        );

      const finalImages = [
        ...existingImages,
        ...uploadedImages
      ];

      if (
        finalImages.length === 0
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "At least one product image is required."
        });
      }

      const type =
        parseType(req.body.type);

      const vehicleMaker =
  parseVehicleMaker(
    req.body.vehicleMaker
  );

      const price =
        Number(req.body.price);

      const stock =
        parseStock(req.body.stock);

      const preOrderLimitEnabled =
        parseBoolean(
          req.body.preOrderLimitEnabled
        );

      const preOrderLimit =
        parsePreOrderLimit(
          req.body.preOrderLimit
        );

      if (stock === null) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Stock must be a non-negative whole number."
        });
      }

      if (
        preOrderLimitEnabled === null
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            "Pre-order limit setting is invalid."
        });
      }

      const validationError =
        validateProductFields({
          name:
            req.body.name,

          brand:
            req.body.brand,

          vehicleMaker,

          scale:
            req.body.scale,

          category:
            req.body.category,

          type,

          price,

          stock,

          preOrderLimitEnabled,

          preOrderLimit,

          preOrderCount:
            existingProduct.preOrderCount,

          status:
            req.body.status,

          about:
            req.body.about,

          requireId: false
        });

      if (validationError) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          message:
            validationError
        });
      }

      let status =
        req.body.status;

      if (
        status !== "pre-order" &&
        stock === 0
      ) {
        status =
          "out-of-stock";
      }

      const product =
        await Product.findOneAndUpdate(
          {
            id: productId
          },
          {
            name:
              req.body.name.trim(),

            brand:
              req.body.brand.trim(),

            vehicleMaker,

            scale:
              req.body.scale.trim(),

            category:
              req.body.category,

            type,

            series:
              req.body.series
                ? req.body.series.trim()
                : undefined,

            about:
              typeof req.body.about ===
              "string"
                ? req.body.about.trim()
                : undefined,

            price,

            stock,

            preOrderLimitEnabled,

            preOrderLimit,

            preOrderCount:
              existingProduct.preOrderCount,

            status,

            images:
              finalImages
          },
          {
            new: true,
            runValidators: true
          }
        );

      if (!product) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(404).json({
          message:
            "Product not found."
        });
      }

      res.json({
        message:
          "Product updated successfully.",
        product
      });
    } catch (error) {
      deleteUploadedFiles(
        req.files
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        const firstError =
          Object.values(
            error.errors
          )[0];

        return res.status(400).json({
          message:
            firstError?.message ||
            "Invalid product data."
        });
      }

      res.status(500).json({
        message:
          "Failed to update product."
      });
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const productId =
  req.params.id?.trim();

if (!productId) {
  return res.status(400).json({
    message:
      "Invalid product ID."
  });
}

      const product =
        await Product.findOne({
          id: productId
        });

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found."
        });
      }

      const productImages =
        Array.isArray(product.images)
          ? [...product.images]
          : [];

      await Product.deleteOne({
        id: productId
      });

      for (
        const image of productImages
      ) {
        if (
          typeof image !==
            "string" ||
          !image.includes(
            "/uploads/products/"
          )
        ) {
          continue;
        }

        const filename =
          path.basename(image);

        const filePath =
          path.join(
            uploadDirectory,
            filename
          );

        try {
          await fs.promises.unlink(
            filePath
          );
        } catch (error) {
          if (
            error.code !==
            "ENOENT"
          ) {
            console.error(
              `Failed to delete product image ${filename}:`,
              error.message
            );
          }
        }
      }

      return res.json({
        message:
          "Product deleted successfully."
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to delete product."
      });
    }
  }
);

router.use(
  (error, req, res, next) => {
    deleteUploadedFiles(
      req.files
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "Each image must be 10 MB or smaller."
        });
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res.status(400).json({
          message:
            "Too many product images."
        });
      }

      return res.status(400).json({
        message:
          "Invalid image upload."
      });
    }

    if (
      error &&
      error.message ===
        "Only JPG, PNG and WEBP images are allowed."
    ) {
      return res.status(400).json({
        message:
          error.message
      });
    }

    next(error);
  }
);

module.exports = router;