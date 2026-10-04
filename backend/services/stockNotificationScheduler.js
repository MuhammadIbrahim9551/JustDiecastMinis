const cron = require("node-cron");
const User = require("../models/User");
const Product = require("../models/Product");
const Interest = require("../models/Interest");

const mailTransporter = require("./mailService");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/$/, "");

const senderEmail =
  process.env.MAIL_FROM || process.env.BREVO_SMTP_USER;
const senderName =
  process.env.MAIL_FROM_NAME || "Just Diecast Minis";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sendBackInStockEmail = async (interest, product) => {
  const productUrl = `${FRONTEND_URL}/product/${product.id}`;
  const safeName = escapeHtml(interest.customerName);
  const safeProductName = escapeHtml(product.name);

  await mailTransporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: interest.customerEmail,
    subject: `Back in stock! — ${product.name}`,
    text: `
Hi ${interest.customerName},

Good news — ${product.name} is back in stock at Just Diecast Minis.

View the model here:
${productUrl}

Some Dreams Belong on the Road.
Others on Your Shelf.

Great cars. Just smaller.
    `.trim(),
    html: `
      <div style="margin:0;padding:30px 15px;background-color:#f2f2f2;font-family:Arial,sans-serif;line-height:1.6;color:#222222;">
        <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #dddddd;">
          <div style="padding:25px 30px;background-color:#111111;color:#ffffff;border-bottom:5px solid #df1532;">
            <h2 style="margin:0;font-size:22px;letter-spacing:1px;">JUST DIECAST MINIS</h2>
            <p style="margin:8px 0 0;color:#dddddd;font-size:13px;">GREAT CARS. JUST SMALLER.</p>
          </div>
          <div style="padding:30px;">
            <p style="margin:0 0 8px;color:#df1532;font-size:12px;font-weight:bold;letter-spacing:1px;">BACK IN STOCK</p>
            <h1 style="margin:0 0 20px;font-size:28px;color:#111111;">Your model is back.</h1>
            <p>Hi ${safeName},</p>
            <p><strong>${safeProductName}</strong> is back in stock at Just Diecast Minis.</p>
            <div style="margin:25px 0;padding:20px;background-color:#f8f8f8;border-left:4px solid #df1532;">
              <h3 style="margin:0 0 10px;color:#111111;font-size:18px;">${safeProductName}</h3>
              <p style="margin:0;color:#777777;">Product ID: ${product.id}</p>
            </div>
            <p style="text-align:center;margin:30px 0;">
              <a href="${productUrl}" style="display:inline-block;padding:14px 24px;background-color:#df1532;color:#ffffff;text-decoration:none;font-weight:bold;">VIEW MODEL</a>
            </p>
            <p>We hope you get to add this one to your collection.</p>
            <p style="margin-top:25px;font-weight:bold;color:#111111;">Great cars. Just smaller.</p>
          </div>
          <div style="padding:20px 30px;background-color:#111111;color:#ffffff;text-align:center;font-size:13px;">
            <strong>Just Diecast Minis</strong><br />
            Some Dreams Belong on the Road. Others on Your Shelf.
          </div>
        </div>
      </div>
    `
  });
};

const sendCartOutOfStockEmail = async (user, removedItems) => {
  if (!user.email || removedItems.length === 0) {
    return;
  }

  const lines = removedItems.map((item) => {
    const productUrl = `${FRONTEND_URL}/product/${item.id}`;
    return `- ${item.name} (quantity removed: ${item.quantity})\n  ${productUrl}`;
  });

  const htmlItems = removedItems.map((item) => {
    const productUrl = `${FRONTEND_URL}/product/${item.id}`;
    return `
      <li style="margin-bottom:18px;">
        <strong>${escapeHtml(item.name)}</strong><br />
        Quantity removed: ${item.quantity}<br />
        <a href="${productUrl}" style="color:#df1532;">View model</a>
      </li>
    `;
  }).join("");

  await mailTransporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: user.email,
    subject: "An item in your cart is no longer available | JUST DIECAST MINIS",
    text: `
Hi ${user.name},

One or more models in your cart are no longer in stock. We automatically removed them from your cart so you don't accidentally try to purchase unavailable stock.

${lines.join("\n")}

You can continue shopping at Just Diecast Minis.

Some Dreams Belong on the Road.
Others on Your Shelf.

Great cars. Just smaller.
    `.trim(),
    html: `
      <div style="margin:0;padding:30px 15px;background-color:#f2f2f2;font-family:Arial,sans-serif;line-height:1.6;color:#222222;">
        <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #dddddd;">
          <div style="padding:25px 30px;background-color:#111111;color:#ffffff;border-bottom:5px solid #df1532;">
            <h2 style="margin:0;font-size:22px;letter-spacing:1px;">JUST DIECAST MINIS</h2>
            <p style="margin:8px 0 0;color:#dddddd;font-size:13px;">GREAT CARS. JUST SMALLER.</p>
          </div>
          <div style="padding:30px;">
            <p style="margin:0 0 8px;color:#df1532;font-size:12px;font-weight:bold;letter-spacing:1px;">CART UPDATE</p>
            <h1 style="margin:0 0 20px;font-size:28px;color:#111111;">An item is no longer available.</h1>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>One or more models in your cart are no longer in stock. We automatically removed them from your cart so you don't accidentally try to purchase unavailable stock.</p>
            <div style="margin:25px 0;padding:20px;background-color:#f8f8f8;border-left:4px solid #df1532;">
              <ul style="margin:0;padding-left:20px;">${htmlItems}</ul>
            </div>
            <p>You can continue shopping at Just Diecast Minis.</p>
            <p style="text-align:center;margin:30px 0;">
              <a href="${FRONTEND_URL}/shop" style="display:inline-block;padding:14px 24px;background-color:#df1532;color:#ffffff;text-decoration:none;font-weight:bold;">CONTINUE SHOPPING</a>
            </p>
            <p style="margin-top:25px;font-weight:bold;color:#111111;">Great cars. Just smaller.</p>
          </div>
          <div style="padding:20px 30px;background-color:#111111;color:#ffffff;text-align:center;font-size:13px;">
            <strong>Just Diecast Minis</strong><br />
            Some Dreams Belong on the Road. Others on Your Shelf.
          </div>
        </div>
      </div>
    `
  });
};

async function processBackInStockNotifications() {
  const products = await Product.find({
    stock: { $gt: 0 },
    status: "in-stock"
  }).select("id name stock status");

  for (const product of products) {
    const interests = await Interest.find({
  productId: product.id,
  type: {
    $in: ["notify", "pre-order"]
  }
});

    for (const interest of interests) {
      try {
        await sendBackInStockEmail(interest, product);
        await Interest.deleteOne({ _id: interest._id });
        console.log(
          `Back-in-stock email sent to ${interest.customerEmail} for product ${product.id}.`
        );
      } catch (error) {
        console.error(
          `Back-in-stock email failed for ${interest.customerEmail} / product ${product.id}:`,
          error.message
        );
      }
    }
  }
}

async function processCartStockChanges() {
  const users = await User.find({
    "cart.0": { $exists: true }
  });

  for (const user of users) {
    const productIds = user.cart.map(
      (item) => Number(item.id)
    );

    if (productIds.length === 0) {
      continue;
    }

    const products = await Product.find({
      id: { $in: productIds }
    }).select("id name stock status");

    const productMap = new Map(
      products.map((product) => [
        Number(product.id),
        product
      ])
    );

    const removedItems = [];

    for (const item of user.cart) {
      const product = productMap.get(
        Number(item.id)
      );

      if (
        product &&
        (
          Number(product.stock) <= 0 ||
          product.status === "out-of-stock"
        )
      ) {
        removedItems.push({
          id: item.id,
          name: item.name || product.name,
          quantity: item.quantity
        });
      }
    }

    if (removedItems.length === 0) {
      continue;
    }

    await User.updateOne(
      { _id: user._id },
      {
        $pull: {
          cart: {
            id: {
              $in: removedItems.map(
                (item) => Number(item.id)
              )
            }
          }
        }
      }
    );

    try {
      await sendCartOutOfStockEmail(
        user,
        removedItems
      );

      console.log(
        `Cart out-of-stock email sent to ${user.email}.`
      );
    } catch (error) {
      console.error(
        `Cart out-of-stock email failed for ${user.email}:`,
        error.message
      );
    }
  }
}

async function processStockNotifications() {
  await processCartStockChanges();
  await processBackInStockNotifications();
}

function startStockNotificationScheduler() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await processStockNotifications();
    } catch (error) {
      console.error(
        "Stock notification scheduler error:",
        error.message
      );
    }
  });

  processStockNotifications().catch((error) => {
    console.error(
      "Initial stock notification check failed:",
      error.message
    );
  });

  console.log("Stock notification scheduler started.");
}

module.exports = {
  processStockNotifications,
  startStockNotificationScheduler
};
