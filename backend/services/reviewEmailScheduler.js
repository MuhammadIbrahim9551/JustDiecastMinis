
const cron = require("node-cron");

const Order = require("../models/Order");
const ReviewRequest = require("../models/ReviewRequest");

const {
  generateReviewToken,
  hashReviewToken
} = require("../utils/reviewToken");

const mailTransporter = require("./mailService");

async function createReviewRequests(order) {
  const reviewLinks = [];
  const createdRequests = [];

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  for (const item of order.items) {
    const existingRequest = await ReviewRequest.findOne({
      orderId: order.orderId,
      productId: item.productId,
      customerEmail: order.customer.email
    });

    if (existingRequest) {
      throw new Error(
        `Review request already exists for product ${item.productId} in order ${order.orderId}.`
      );
    }

    const rawToken = generateReviewToken();
    const tokenHash = hashReviewToken(rawToken);

    const reviewRequest = await ReviewRequest.create({
      orderId: order.orderId,
      productId: item.productId,
      productName: item.name,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      tokenHash,
      expiresAt
    });

    createdRequests.push(reviewRequest._id);

    const reviewUrl = new URL(
      `/review/${encodeURIComponent(order.orderId)}`,
      process.env.FRONTEND_URL
    );

    reviewUrl.searchParams.set("productId", item.productId);
    reviewUrl.searchParams.set("token", rawToken);

    reviewLinks.push({
      productName: item.name,
      reviewUrl: reviewUrl.toString()
    });
  }

  return {
    reviewLinks,
    createdRequests
  };
}

async function sendReviewEmail(order, reviewLinks) {
  const reviewLinksText = reviewLinks
    .map(
      (item) =>
        `${item.productName}\n${item.reviewUrl}`
    )
    .join("\n\n");

  const reviewLinksHtml = reviewLinks
    .map(
      (item) => `
        <div style="margin: 20px 0;">
          <h3>${item.productName}</h3>

          <a
            href="${item.reviewUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #df1532;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
            "
          >
            REVIEW THIS PRODUCT →
          </a>
        </div>
      `
    )
    .join("");

  const mailResult = await mailTransporter.sendMail({
    from: `"Just Diecast Minis" <orders@justdiecastminis.com>`,
    to: order.customer.email,
    subject: `How was your JDM order? — ${order.orderId}`,

    text: `Hi ${order.customer.name},

We hope you received your JDM order safely!

We would love to hear what you think about your purchases.

Leave your reviews here:

${reviewLinksText}

Thank you for supporting Just Diecast Minis!

Great cars. Just smaller.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>JUST DIECAST MINIS</h2>

        <h1>HOW WAS YOUR ORDER?</h1>

        <p>Hi ${order.customer.name},</p>

        <p>
          We hope your JDM order arrived safely!
          We would love to hear what you think about your purchases.
        </p>

        ${reviewLinksHtml}

        <p>
          Thank you for supporting Just Diecast Minis!
        </p>

        <strong>Great cars. Just smaller.</strong>
      </div>
    `
  });

  console.log("Review email delivery details:", {
    messageId: mailResult.messageId,
    accepted: mailResult.accepted,
    rejected: mailResult.rejected,
    response: mailResult.response
  });
}

async function processReviewEmails() {
  const now = new Date();

  // Only process orders delivered at least 2 days ago.
  const reviewEligibleDate = new Date(
    now.getTime() - 2 * 24 * 60 * 60 * 1000
  );

  const orders = await Order.find({
    paymentStatus: "paid",
    status: "delivered",

    deliveredAt: {
      $lte: reviewEligibleDate,
      $ne: null
    },

    reviewEmailSentAt: null
  });

  for (const order of orders) {
    let createdRequests = [];

    try {
      const result = await createReviewRequests(order);

      createdRequests = result.createdRequests;

      await sendReviewEmail(
        order,
        result.reviewLinks
      );

      order.reviewEmailSentAt = new Date();

      await order.save();

      console.log(
        `Review email sent: ${order.orderId}`
      );
    } catch (error) {
      if (createdRequests.length > 0) {
        await ReviewRequest.deleteMany({
          _id: {
            $in: createdRequests
          }
        });
      }

      console.error(
        `Review email failed for ${order.orderId}:`,
        error.message
      );
    }
  }
}

function startReviewEmailScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log(
      "Checking for scheduled review emails..."
    );

    try {
      await processReviewEmails();
    } catch (error) {
      console.error(
        "Review email scheduler failed:",
        error.message
      );
    }
  });

  console.log(
    "Review email scheduler started."
  );
}

module.exports = {
  sendReviewEmail,
  processReviewEmails,
  startReviewEmailScheduler
};