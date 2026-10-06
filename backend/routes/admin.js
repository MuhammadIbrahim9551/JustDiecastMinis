const express = require("express");

const Order = require("../models/Order");
const Announcement = require("../models/Announcement");
const Review = require("../models/Review");
const StoreSettings = require("../models/StoreSettings");
const MAX_EMAIL_ATTEMPTS = 5;
const mailTransporter = require("../services/mailService");
const {
  processReviewEmails
} = require("../services/reviewEmailScheduler");

const RETRY_DELAYS = [
  5 * 60 * 1000,        // 5 minutes
  15 * 60 * 1000,       // 15 minutes
  30 * 60 * 1000,       // 30 minutes
  60 * 60 * 1000        // 1 hour
];

function getNextRetryTime(attempts) {
  if (attempts > RETRY_DELAYS.length) {
    return null;
  }

  return new Date(Date.now() + RETRY_DELAYS[attempts - 1]);
}

function recordEmailFailure(order, emailType, errorMessage) {
  const attemptsField = `${emailType}EmailAttempts`;
  const errorField = `${emailType}EmailLastError`;
  const retryField = `${emailType}EmailNextRetryAt`;

  order[attemptsField] += 1;

  order[errorField] = errorMessage;

  if (order[attemptsField] < MAX_EMAIL_ATTEMPTS) {
    order[retryField] = getNextRetryTime(
      order[attemptsField]
    );
  } else {
    order[retryField] = null;
  }
}

function resetEmailFailure(order, emailType) {
  order[`${emailType}EmailLastError`] = null;
  order[`${emailType}EmailNextRetryAt`] = null;
}

const {
  authenticate,
  requireAdmin
} = require("../middleware/auth");

const router = express.Router();


/*
 * Send dispatch / shipping confirmation email.
 *
 * This is sent only after the order has successfully
 * been updated to "shipped".
 */
const sendDispatchEmail = async (order) => {

    const estimatedDelivery = order.estimatedDeliveryDate
  ? new Date(order.estimatedDeliveryDate).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    )
  : "To be confirmed";
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-weight:700;color:#111111;">
              ${item.name}
            </div>

            <div style="margin-top:4px;font-size:12px;color:#888888;">
              Qty: ${item.quantity}
            </div>
          </td>

          <td style="padding:14px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:700;">
            ₹${(
              item.price * item.quantity
            ).toLocaleString("en-IN")}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!DOCTYPE html>

    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#eeeeee;
          font-family:Arial,Helvetica,sans-serif;
          color:#111111;
        "
      >

        <div
          style="
            max-width:680px;
            margin:30px auto;
            background:#ffffff;
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
          "
        >

          <!-- HEADER -->

          <div
            style="
              background:#111111;
              padding:34px 40px;
              border-bottom:5px solid #df1532;
            "
          >

            <div
              style="
                font-size:11px;
                font-weight:700;
                letter-spacing:3px;
                color:#df1532;
                margin-bottom:10px;
              "
            >
              JUST DIECAST MINIS
            </div>

            <div
              style="
                font-size:30px;
                font-weight:800;
                letter-spacing:1px;
                color:#ffffff;
              "
            >
              YOUR ORDER IS ON ITS WAY
            </div>

            <div
              style="
                margin-top:10px;
                font-size:13px;
                line-height:1.6;
                color:#bbbbbb;
              "
            >
              Some dreams belong on the road.
              Others on your shelf.
            </div>

          </div>


          <!-- CONTENT -->

          <div style="padding:40px;">

            <p
              style="
                margin:0 0 8px;
                font-size:15px;
                color:#666666;
              "
            >
              Hi ${order.customer.name},
            </p>

            <h1
              style="
                margin:0 0 15px;
                font-size:26px;
                line-height:1.2;
                letter-spacing:0.3px;
              "
            >
              Your JDM order has been dispatched.
            </h1>

            <p
              style="
                margin:0;
                font-size:15px;
                line-height:1.7;
                color:#555555;
              "
            >
              Your package has left us and is now on its way
              to you. Here are your tracking details.
            </p>
            <p>
            <strong>Estimated delivery:</strong>
            ${estimatedDelivery}
            </p>


            <!-- ORDER NUMBER -->

            <div
              style="
                margin-top:30px;
                padding:20px;
                background:#f6f6f6;
                border-left:4px solid #df1532;
              "
            >

              <div
                style="
                  font-size:10px;
                  font-weight:700;
                  letter-spacing:2px;
                  color:#888888;
                  margin-bottom:7px;
                "
              >
                ORDER NUMBER
              </div>

              <div
                style="
                  font-size:21px;
                  font-weight:800;
                  letter-spacing:1px;
                "
              >
                ${order.orderId}
              </div>

            </div>


            <!-- TRACKING CARD -->

            <div
              style="
                margin-top:25px;
                padding:25px;
                background:#111111;
                color:#ffffff;
              "
            >

              <div
                style="
                  font-size:10px;
                  font-weight:700;
                  letter-spacing:2px;
                  color:#aaaaaa;
                  margin-bottom:10px;
                "
              >
                DELIVERY PARTNER
              </div>

              <div
                style="
                  font-size:19px;
                  font-weight:700;
                  margin-bottom:20px;
                "
              >
                ${order.shippingCourier}
              </div>


              <div
                style="
                  font-size:10px;
                  font-weight:700;
                  letter-spacing:2px;
                  color:#aaaaaa;
                  margin-bottom:8px;
                "
              >
                TRACKING NUMBER
              </div>

              <div
                style="
                  font-size:18px;
                  font-weight:700;
                  letter-spacing:1px;
                  word-break:break-all;
                "
              >
                ${order.trackingNumber}
              </div>


              <div style="margin-top:25px;">

                <a
                  href="${order.trackingUrl}"
                  style="
                    display:inline-block;
                    padding:14px 24px;
                    background:#df1532;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:12px;
                    font-weight:700;
                    letter-spacing:1.5px;
                  "
                >
                  TRACK SHIPMENT →
                </a>

              </div>

            </div>


            <!-- ORDER SUMMARY -->

            <h2
              style="
                margin:35px 0 15px;
                font-size:15px;
                letter-spacing:1.5px;
              "
            >
              YOUR ORDER
            </h2>

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                border-collapse:collapse;
                font-size:14px;
              "
            >

              <tbody>
                ${itemsHtml}
              </tbody>

            </table>


            <!-- TOTAL -->

            <div
              style="
                margin-top:20px;
                padding-top:15px;
                border-top:2px solid #111111;
                display:flex;
                justify-content:space-between;
                font-size:17px;
                font-weight:800;
              "
            >

              <span>
                TOTAL PAID
              </span>

              <span>
                ₹${order.total.toLocaleString("en-IN")}
              </span>

            </div>


            <!-- SHIPPING ADDRESS -->

            <h2
              style="
                margin:35px 0 15px;
                font-size:15px;
                letter-spacing:1.5px;
              "
            >
              SHIPPING TO
            </h2>

            <div
              style="
                padding:18px;
                background:#f7f7f7;
                font-size:14px;
                line-height:1.7;
                color:#444444;
              "
            >
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}<br>
              ${order.shippingAddress.state}
              -
              ${order.shippingAddress.pincode}
            </div>


            <p
              style="
                margin:30px 0 0;
                font-size:14px;
                line-height:1.7;
                color:#666666;
              "
            >
              We'll keep you updated as your order makes
              its way to you.
            </p>

          </div>


          <!-- FOOTER -->

          <div
            style="
              padding:25px 40px;
              background:#f5f5f5;
              border-top:1px solid #eeeeee;
            "
          >

            <div
              style="
                font-size:12px;
                font-weight:700;
                letter-spacing:1.5px;
                color:#111111;
              "
            >
              JUST DIECAST MINIS
            </div>

            <div
              style="
                margin-top:6px;
                font-size:11px;
                color:#999999;
              "
            >
              Great cars. Just smaller.
            </div>

          </div>

        </div>

      </body>
    </html>
  `;

const text = `
JUST DIECAST MINIS

YOUR ORDER IS ON ITS WAY

Hi ${order.customer.name},

Your JDM order has been dispatched and is now on its way to you.

ESTIMATED DELIVERY

${estimatedDelivery}

ORDER NUMBER

${order.orderId}

DELIVERY PARTNER

${order.shippingCourier}

TRACKING NUMBER

${order.trackingNumber}

TRACK YOUR SHIPMENT

${order.trackingUrl}

YOUR ORDER

${order.items
  .map(
    (item) =>
      `${item.name} x ${item.quantity} - ₹${(
        item.price * item.quantity
      ).toLocaleString("en-IN")}`
  )
  .join("\n")}

TOTAL PAID

₹${order.total.toLocaleString("en-IN")}

SHIPPING TO

${order.shippingAddress.address}
${order.shippingAddress.city}
${order.shippingAddress.state} - ${order.shippingAddress.pincode}

We'll keep you updated as your order makes its way to you.

JUST DIECAST MINIS

Great cars. Just smaller.
`;

  await mailTransporter.sendMail({
    from: `"JUST DIECAST MINIS" <orders@justdiecastminis.com>`,
    to: order.customer.email,
    subject: `Your JDM Order Is On Its Way — ${order.orderId}`,
    text,
    html
  });
};

/*
 * Send delivery confirmation email.
 * This is sent only when an order is marked as delivered.
 */
const sendDeliveryEmail = async (order) => {
  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-weight:700;color:#111111;">
              ${item.name}
            </div>

            <div style="margin-top:4px;font-size:12px;color:#888888;">
              Qty: ${item.quantity}
            </div>
          </td>

          <td style="padding:14px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:700;">
            ₹${(item.price * item.quantity).toLocaleString("en-IN")}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#eeeeee;
          font-family:Arial,Helvetica,sans-serif;
          color:#111111;
        "
      >
        <div
          style="
            max-width:680px;
            margin:30px auto;
            background:#ffffff;
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
          "
        >
          <!-- HEADER -->
          <div
            style="
              background:#111111;
              padding:34px 40px;
              border-bottom:5px solid #df1532;
            "
          >
            <div
              style="
                font-size:11px;
                font-weight:700;
                letter-spacing:3px;
                color:#df1532;
                margin-bottom:10px;
              "
            >
              JUST DIECAST MINIS
            </div>

            <div
              style="
                font-size:30px;
                font-weight:800;
                letter-spacing:1px;
                color:#ffffff;
              "
            >
              YOUR ORDER HAS ARRIVED
            </div>

            <div
              style="
                margin-top:10px;
                font-size:13px;
                line-height:1.6;
                color:#bbbbbb;
              "
            >
              Some dreams belong on the road.
              Others on your shelf.
            </div>
          </div>

          <!-- CONTENT -->
          <div style="padding:40px;">
            <p style="margin:0 0 8px;font-size:15px;color:#666666;">
              Hi ${order.customer.name},
            </p>

            <h1 style="margin:0 0 15px;font-size:26px;line-height:1.2;">
              Your JDM order has been delivered!
            </h1>

            <p style="font-size:15px;line-height:1.7;color:#555555;">
              Your package was marked as delivered on
              <strong>${deliveredDate}</strong>.
              We hope your new miniature finds a special place on your shelf.
            </p>

            <!-- ORDER NUMBER -->
            <div
              style="
                margin-top:30px;
                padding:20px;
                background:#f6f6f6;
                border-left:4px solid #df1532;
              "
            >
              <div
                style="
                  font-size:10px;
                  font-weight:700;
                  letter-spacing:2px;
                  color:#888888;
                  margin-bottom:7px;
                "
              >
                ORDER NUMBER
              </div>

              <div
                style="
                  font-size:21px;
                  font-weight:800;
                  letter-spacing:1px;
                "
              >
                ${order.orderId}
              </div>
            </div>

            <!-- ORDER SUMMARY -->
            <h2
              style="
                margin:35px 0 15px;
                font-size:15px;
                letter-spacing:1.5px;
              "
            >
              YOUR ORDER
            </h2>

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="border-collapse:collapse;font-size:14px;"
            >
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- TOTAL -->
            <div
              style="
                margin-top:20px;
                padding-top:15px;
                border-top:2px solid #111111;
                font-size:17px;
                font-weight:800;
              "
            >
              TOTAL PAID:
              ₹${order.total.toLocaleString("en-IN")}
            </div>

            <p
              style="
                margin:35px 0 0;
                font-size:14px;
                line-height:1.7;
                color:#666666;
              "
            >
              Thank you for choosing Just Diecast Minis.
              We hope to see you again soon!
            </p>
          </div>

          <!-- FOOTER -->
          <div
            style="
              padding:25px 40px;
              background:#f5f5f5;
              border-top:1px solid #eeeeee;
            "
          >
            <div
              style="
                font-size:12px;
                font-weight:700;
                letter-spacing:1.5px;
                color:#111111;
              "
            >
              JUST DIECAST MINIS
            </div>

            <div
              style="
                margin-top:6px;
                font-size:11px;
                color:#999999;
              "
            >
              Great cars. Just smaller.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
JUST DIECAST MINIS

YOUR ORDER HAS ARRIVED

Hi ${order.customer.name},

Your JDM order has been delivered!

Your package was marked as delivered on ${deliveredDate}.

ORDER NUMBER
${order.orderId}

YOUR ORDER
${order.items
  .map(
    (item) =>
      `${item.name} x ${item.quantity} - ₹${(
        item.price * item.quantity
      ).toLocaleString("en-IN")}`
  )
  .join("\n")}

TOTAL PAID
₹${order.total.toLocaleString("en-IN")}

Thank you for choosing Just Diecast Minis.
We hope to see you again soon!
`;

  await mailTransporter.sendMail({
    from: `"JUST DIECAST MINIS" <orders@justdiecastminis.com>`,
    to: order.customer.email,
    subject: `Your JDM Order Has Been Delivered — ${order.orderId}`,
    text,
    html
  });
};

/*
 * Get store settings.
 */

router.get(
  "/store-settings",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      let storeSettings =
        await StoreSettings.findOne();

      if (!storeSettings) {
        storeSettings =
          await StoreSettings.create({});
      }

      return res.json({
        ordersEnabled:
          storeSettings.ordersEnabled,

        youtubeShowcaseUrl:
          storeSettings.youtubeShowcaseUrl || "",

        catalogOptions:
          storeSettings.catalogOptions
      });
    } catch (error) {
      console.error(
        "Failed to fetch store settings:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch store settings."
      });
    }
  }
);

router.put(
  "/store-settings/catalog-options",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        modelMakers,
        scales,
        vehicleMakers,
        types
      } = req.body;

      if (
        !Array.isArray(modelMakers) ||
        !Array.isArray(scales) ||
        !Array.isArray(vehicleMakers) ||
        !Array.isArray(types)
      ) {
        return res.status(400).json({
          message:
            "All catalog options must be arrays."
        });
      }

      let storeSettings =
        await StoreSettings.findOne();

      if (!storeSettings) {
        storeSettings =
          new StoreSettings();
      }

      storeSettings.catalogOptions = {
        modelMakers,
        scales,
        vehicleMakers,
        types
      };

      await storeSettings.save();

      return res.json({
        message:
          "Catalog options updated successfully.",

        catalogOptions:
          storeSettings.catalogOptions
      });
    } catch (error) {
      console.error(
        "Failed to update catalog options:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update catalog options."
      });
    }
  }
);




/*
 * Update store settings.
 */
router.put(
  "/store-settings",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        ordersEnabled
      } = req.body;

      if (typeof ordersEnabled !== "boolean") {
        return res.status(400).json({
          message:
            "ordersEnabled must be a boolean."
        });
      }

      let storeSettings = await StoreSettings.findOne();

      if (!storeSettings) {
        storeSettings = new StoreSettings();
      }

      storeSettings.ordersEnabled =
        ordersEnabled;

      await storeSettings.save();

      return res.json({
        message:
          "Store settings updated successfully.",
        ordersEnabled:
          storeSettings.ordersEnabled
      });
    } catch (error) {
      console.error(
        "Failed to update store settings:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update store settings."
      });
    }
  }
);

router.get(
  "/orders",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find().sort({
        createdAt: -1
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch orders."
      });
    }
  }
);

/*
 * Get current order availability status.
 */
router.get(
  "/store/orders-status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      let storeSettings = await StoreSettings.findOne();

      if (!storeSettings) {
        storeSettings = await StoreSettings.create({
          ordersEnabled: true
        });
      }

      return res.json({
        ordersEnabled:
          storeSettings.ordersEnabled
      });
    } catch (error) {
      console.error(
        "Failed to fetch order availability:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch order availability."
      });
    }
  }
);


/*
 * Toggle whether customers can place new orders.
 *
 * This affects only NEW order creation.
 * Existing orders are not affected.
 */
router.put(
  "/store/orders-status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      let storeSettings = await StoreSettings.findOne();

      if (!storeSettings) {
        storeSettings = await StoreSettings.create({
          ordersEnabled: true
        });
      }

      storeSettings.ordersEnabled =
        !storeSettings.ordersEnabled;

      await storeSettings.save();

      return res.json({
        message: storeSettings.ordersEnabled
          ? "Orders have been enabled."
          : "Orders have been temporarily blocked.",

        ordersEnabled:
          storeSettings.ordersEnabled
      });
    } catch (error) {
      console.error(
        "Failed to toggle order availability:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update order availability."
      });
    }
  }
);


router.put(
  "/orders/:orderId/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
     const {
  status,
  shippingCourier,
  trackingNumber,
  trackingUrl,
  estimatedDeliveryDate,
  reviewEmailScheduledAt
} = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order status."
        });
      }

      const order =
        await Order.findOne({
          orderId:
            req.params.orderId
        });

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found."
        });
      }

      const currentStatus =
        order.status;

      const validTransitions = {
        pending: [
          "confirmed",
          "cancelled"
        ],

        confirmed: [
          "shipped",
          "cancelled"
        ],

        shipped: [
          "delivered"
        ],

        delivered: [],

        cancelled: []
      };

      if (
        currentStatus !== status &&
        !validTransitions[
          currentStatus
        ]?.includes(status)
      ) {
        return res.status(400).json({
          message:
            `Order cannot be changed from ${currentStatus} to ${status}.`
        });
      }

      /*
       * Shipping details are required when dispatching.
       */
      if (
        status === "shipped" &&
        currentStatus !== "shipped"
      ) {
        if (
          !estimatedDeliveryDate ||
          Number.isNaN(Date.parse(estimatedDeliveryDate))
        ) {
          return res.status(400).json({
            message:
              "A valid estimated delivery date is required."
          });
        }

        const deliveryDate = new Date(
          `${estimatedDeliveryDate}T12:00:00`
        );

        if (deliveryDate <= new Date()) {
          return res.status(400).json({
            message:
              "Estimated delivery date must be in the future."
          });
        }

        if (
          typeof shippingCourier !== "string" ||
          !shippingCourier.trim()
        ) {
          return res.status(400).json({
            message:
              "Courier / delivery partner is required."
          });
        }

        if (
          typeof trackingNumber !== "string" ||
          !trackingNumber.trim()
        ) {
          return res.status(400).json({
            message: "Tracking number is required."
          });
        }

        if (
          typeof trackingUrl !== "string" ||
          !trackingUrl.trim()
        ) {
          return res.status(400).json({
            message: "Tracking URL is required."
          });
        }

        try {
          const parsedUrl = new URL(
            trackingUrl.trim()
          );

          if (
            !["http:", "https:"].includes(
              parsedUrl.protocol
            )
          ) {
            throw new Error();
          }
        } catch {
          return res.status(400).json({
            message:
              "Tracking URL must be a valid HTTP or HTTPS URL."
          });
        }

        if (order.paymentStatus !== "paid") {
          return res.status(400).json({
            message:
              "Only paid orders can be dispatched."
          });
        }

        if (
  !reviewEmailScheduledAt ||
  Number.isNaN(Date.parse(reviewEmailScheduledAt))
) {
  return res.status(400).json({
    message: "A valid review email scheduled date is required."
  });
}

const reviewEmailDate = new Date(
  `${reviewEmailScheduledAt}T12:00:00`
);

if (reviewEmailDate < deliveryDate) {
  return res.status(400).json({
    message:
      "Review email date cannot be before the estimated delivery date."
  });
}

        order.shippingCourier =
          shippingCourier.trim();

        order.trackingNumber =
          trackingNumber.trim();

        order.trackingUrl =
          trackingUrl.trim();

        order.estimatedDeliveryDate =
          deliveryDate;

        order.reviewEmailScheduledAt =
  reviewEmailDate;

        order.shippedAt = new Date();
      }
      /*
 * Send delivery email only once.
 */
 
      /*
       * Record delivery details and schedule the review email.
       * The review email will be sent 2 days after actual delivery.
       */
      if (
        status === "delivered" &&
        currentStatus !== "delivered"
      ) {
        const deliveredAt = new Date();

        order.deliveredAt = deliveredAt;

        const reviewEmailDate = new Date(deliveredAt);

        reviewEmailDate.setDate(
          reviewEmailDate.getDate() + 2
        );

        order.reviewEmailScheduledAt = reviewEmailDate;
      }

      order.status = status;

      await order.save();

      /*
       * Send delivery confirmation email only once.
       */
      if (
        status === "delivered" &&
        currentStatus !== "delivered" &&
        !order.deliveryEmailSentAt
      ) {
        try {
          await sendDeliveryEmail(order);

          order.deliveryEmailSentAt = new Date();

resetEmailFailure(order, "delivery");

await order.save();

          console.log(
            `Delivery email sent: ${order.orderId}`
          );
        } catch (emailError) {
  console.error(
    `Delivery email failed for ${order.orderId}:`,
    emailError.message
  );

  recordEmailFailure(
    order,
    "delivery",
    emailError.message
  );

  await order.save();
}
      }

      /*
       * Send dispatch email only once.
       */
      if (
        status === "shipped" &&
        currentStatus !== "shipped" &&
        !order.dispatchEmailSentAt
      ) {
        try {
          await sendDispatchEmail(order);

          order.dispatchEmailSentAt = new Date();

resetEmailFailure(order, "dispatch");

await order.save();

          console.log(
            `Dispatch email sent: ${order.orderId}`
          );
        } catch (emailError) {
  console.error(
    `Dispatch email failed for ${order.orderId}:`,
    emailError.message
  );

  recordEmailFailure(
    order,
    "dispatch",
    emailError.message
  );

  await order.save();
}
      }

      return res.json({
        message:
          "Order status updated successfully.",
        order
      });

    } catch (error) {

      console.error(
        "Order status update failed:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update order status."
      });
    }
  }
);


/*
 * Fetch all reviews for admin management.
 */
router.get(
  "/reviews",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const reviews = await Review.find()
        .sort({
          createdAt: -1
        });

      return res.json(reviews);
    } catch (error) {
      console.error(
        "Failed to fetch reviews:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch reviews."
      });
    }
  }
);


/*
 * Update review approval status.
 */
router.put(
  "/reviews/:reviewId/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        status
      } = req.body;

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid review status."
        });
      }

      const review = await Review.findById(
        req.params.reviewId
      );

      if (!review) {
        return res.status(404).json({
          message: "Review not found."
        });
      }

      review.status = status;

      await review.save();

      return res.json({
        message: `Review ${status} successfully.`,
        review
      });
    } catch (error) {
      console.error(
        "Review status update failed:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to update review status."
      });
    }
  }
);


/*
 * Delete a review.
 */
router.delete(
  "/reviews/:reviewId",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const review = await Review.findByIdAndDelete(
        req.params.reviewId
      );

      if (!review) {
        return res.status(404).json({
          message: "Review not found."
        });
      }

      return res.json({
        message: "Review deleted successfully."
      });
    } catch (error) {
      console.error(
        "Review deletion failed:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to delete review."
      });
    }
  }
);
router.sendDispatchEmail = sendDispatchEmail;
router.sendDeliveryEmail = sendDeliveryEmail;
router.post(
  "/test-review-emails",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      await processReviewEmails();

      return res.json({
        message:
          "Review email processing triggered successfully."
      });
    } catch (error) {
      console.error(
        "Test review email processing failed:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to trigger review email processing."
      });
    }
  }
);

module.exports = router;