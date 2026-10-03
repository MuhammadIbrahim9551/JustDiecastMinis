const cron = require("node-cron");

const Order = require("../models/Order");
const adminRouter = require("../routes/admin");

const MAX_EMAIL_ATTEMPTS = 5;

const RETRY_DELAYS = [
  5 * 60 * 1000,      // 5 minutes
  15 * 60 * 1000,     // 15 minutes
  30 * 60 * 1000,     // 30 minutes
  60 * 60 * 1000      // 60 minutes
];

function getNextRetryTime(attempts) {
  if (attempts > RETRY_DELAYS.length) {
    return null;
  }

  return new Date(
    Date.now() + RETRY_DELAYS[attempts - 1]
  );
}

function recordRetryFailure(
  order,
  emailType,
  errorMessage
) {
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

async function processEmailRetries() {
  const now = new Date();

  const orders = await Order.find({
    paymentStatus: "paid",

    $or: [
      {
        status: {
          $in: ["shipped", "delivered"]
        },

        dispatchEmailSentAt: null,

        dispatchEmailNextRetryAt: {
          $lte: now
        },

        dispatchEmailAttempts: {
          $gt: 0,
          $lt: MAX_EMAIL_ATTEMPTS
        }
      },

      {
        status: "delivered",

        deliveryEmailSentAt: null,

        deliveryEmailNextRetryAt: {
          $lte: now
        },

        deliveryEmailAttempts: {
          $gt: 0,
          $lt: MAX_EMAIL_ATTEMPTS
        }
      }
    ]
  });

  for (const order of orders) {
    const isDeliveryRetry =
      order.status === "delivered" &&
      !order.deliveryEmailSentAt;

    const isDispatchRetry =
      ["shipped", "delivered"].includes(order.status) &&
      !order.dispatchEmailSentAt;

    try {
      if (isDeliveryRetry) {
        await adminRouter.sendDeliveryEmail(order);

        order.deliveryEmailSentAt = new Date();
        order.deliveryEmailLastError = null;
        order.deliveryEmailNextRetryAt = null;

        await order.save();

        console.log(
          `Delivery email retry succeeded: ${order.orderId}`
        );
      }

      if (isDispatchRetry) {
        await adminRouter.sendDispatchEmail(order);

        order.dispatchEmailSentAt = new Date();
        order.dispatchEmailLastError = null;
        order.dispatchEmailNextRetryAt = null;

        await order.save();

        console.log(
          `Dispatch email retry succeeded: ${order.orderId}`
        );
      }
    } catch (error) {
      const emailType = isDeliveryRetry
        ? "delivery"
        : "dispatch";

      recordRetryFailure(
        order,
        emailType,
        error.message
      );

      await order.save();

      console.error(
        `Email retry failed for ${order.orderId}:`,
        error.message
      );
    }
  }
}

function startEmailRetryScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      await processEmailRetries();
    } catch (error) {
      console.error(
        "Email retry scheduler error:",
        error.message
      );
    }
  });

  console.log("Email retry scheduler started.");
}

module.exports = {
  processEmailRetries,
  startEmailRetryScheduler
};