const express = require("express");

const net = require("net");
const Product = require("./models/Product");


const cors = require("cors");

const mongoose = require("mongoose");

require("dotenv").config();

const productRoutes =
  require("./routes/products");

const {
  startStockNotificationScheduler,
} = require("./services/stockNotificationScheduler.js");


const preOrderRoutes =
  require("./routes/preorders");

const orderRoutes =
  require("./routes/orders");

const authRoutes =
  require("./routes/auth");

const userRoutes =
  require("./routes/user");

const adminRoutes =
  require("./routes/admin");

const announcementRoutes =
  require("./routes/announcement");

const storeSettingsRoutes = require("./routes/storeSettings");

const reviewRoutes =
  require("./routes/reviews");

const interestRoutes =
  require("./routes/interests");

const contactRoutes = require("./routes/contact");


const path =
  require("path");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

const {
  startReviewEmailScheduler,
} = require("./services/reviewEmailScheduler.js");

const {
  startEmailRetryScheduler,
} = require("./schedulers/emailRetryScheduler.js");

startEmailRetryScheduler();

startReviewEmailScheduler();

app.use("/api/store-settings", storeSettingsRoutes);

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/preorders",
  preOrderRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/user",
  userRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/announcement",
  announcementRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/interests",
  interestRoutes
);

app.use("/api/contact", contactRoutes);

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      message:
        "Just Diecast Minis backend is alive."
    });
  }
);

const PORT =
  process.env.PORT || 5000;


app.get("/sitemap.xml", async (req, res) => {
  try {
    const products = await Product.find(
      {},
      "id updatedAt"
    ).lean();

    const baseUrl = "https://justdiecastminis.com";

    const escapeXml = (value) =>
      String(value).replace(/[<>&'"]/g, (char) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char]);

    const urls = [
      {
        loc: `${baseUrl}/`,
        lastmod: null,
      },
      ...products.map((product) => ({
        loc: `${baseUrl}/product/${encodeURIComponent(product.id)}`,
        lastmod: product.updatedAt
          ? new Date(product.updatedAt).toISOString()
          : null,
      })),
    ];

    const entries = urls.map(({ loc, lastmod }) => `
  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>`;

    res.status(200).type("application/xml").send(xml);
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    res.status(500).type("text/plain").send(
      "Unable to generate sitemap."
    );
  }
});

mongoose
  .connect(
    process.env.MONGODB_URI
  )
  .then(() => {

    console.log(
      "MongoDB connected successfully."
    );

    console.log(
  "MongoDB database:",
  mongoose.connection.name
);

    startStockNotificationScheduler();

    

    app.listen(
      PORT,
      () => {
        console.log(
          `JDM backend running on port ${PORT}`
        );
      }
    );

    // Clean up expired unpaid
    // payment reservations every minute.

    const cleanupExpiredPaymentOrders =
      orderRoutes.cleanupExpiredPaymentOrders;

    if (
      typeof cleanupExpiredPaymentOrders ===
      "function"
    ) {

      cleanupExpiredPaymentOrders()
        .catch((error) => {

          console.error(
            "Initial expired payment cleanup failed:",
            error.message
          );

        });

      setInterval(
        () => {

          cleanupExpiredPaymentOrders()
            .catch((error) => {

              console.error(
                "Expired payment cleanup failed:",
                error.message
              );

            });

        },
        60 * 1000
      );

    }

  })
  .catch((error) => {

    console.error(
      "MongoDB connection failed:",
      error.message
    );

  });
