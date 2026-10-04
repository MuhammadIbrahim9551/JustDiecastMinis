const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../models/Order");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");

const {
  createShiprocketOrder,
} = require("../services/shiprocket");

const {
  authenticate
} = require("../middleware/auth");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const mailTransporter = require("../services/mailService");

/*
 * Escape HTML characters before inserting
 * dynamic order/customer data into an email.
 */
const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/*
 * Send order confirmation email.
 *
 * This is sent only after Razorpay payment
 * has been cryptographically verified.
 */
const sendOrderConfirmationEmail = async (
  order
) => {
  const customerName =
    escapeHtml(
      order.customer.name
    );

  const orderNumber =
    escapeHtml(
      order.orderId
    );

  const shippingAddress =
    escapeHtml(
      order.shippingAddress.address
    );

  const shippingCity =
    escapeHtml(
      order.shippingAddress.city
    );

  const shippingState =
    escapeHtml(
      order.shippingAddress.state
    );

  const shippingPincode =
    escapeHtml(
      order.shippingAddress.pincode
    );

  const itemsHtml =
    order.items
      .map(
        (item) => {
          const itemName =
            escapeHtml(
              item.name
            );

          const itemTotal =
            item.price *
            item.quantity;

          return `
            <tr>
              <td
                style="
                  padding:18px 0;
                  border-bottom:1px solid #eeeeee;
                  vertical-align:middle;
                "
              >
                <div
                  style="
                    font-size:14px;
                    font-weight:700;
                    color:#111111;
                    line-height:1.4;
                  "
                >
                  ${itemName}
                </div>

                <div
                  style="
                    margin-top:5px;
                    font-size:12px;
                    color:#888888;
                  "
                >
                  ₹${item.price.toLocaleString("en-IN")} each
                </div>
              </td>

              <td
                style="
                  padding:18px 8px;
                  border-bottom:1px solid #eeeeee;
                  text-align:center;
                  vertical-align:middle;
                  font-size:13px;
                  color:#555555;
                "
              >
                ${item.quantity}
              </td>

              <td
                style="
                  padding:18px 0;
                  border-bottom:1px solid #eeeeee;
                  text-align:right;
                  vertical-align:middle;
                  font-size:14px;
                  font-weight:700;
                  color:#111111;
                  white-space:nowrap;
                "
              >
                ₹${itemTotal.toLocaleString("en-IN")}
              </td>
            </tr>
          `;
        }
      )
      .join("");

  const html = `
    <!DOCTYPE html>

    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <meta
          charset="UTF-8"
        />
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#eeeeee;
          font-family:Arial,Helvetica,sans-serif;
          color:#111111;
        "
      >

        <!-- OUTER WRAPPER -->

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background:#eeeeee;
            padding:30px 15px;
          "
        >
          <tr>
            <td align="center">

              <!-- EMAIL -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width:680px;
                  background:#ffffff;
                "
              >

                <!-- HEADER -->

                <tr>
                  <td
                    style="
                      background:#111111;
                      padding:32px 38px;
                    "
                  >

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>

                        <td
                          style="
                            vertical-align:middle;
                          "
                        >

                          <div
                            style="
                              color:#ffffff;
                              font-size:23px;
                              font-weight:800;
                              letter-spacing:2px;
                            "
                          >
                            JUST DIECAST MINIS
                          </div>

                          <div
                            style="
                              margin-top:7px;
                              color:#aaaaaa;
                              font-size:10px;
                              font-weight:700;
                              letter-spacing:2px;
                            "
                          >
                            GREAT CARS. JUST SMALLER.
                          </div>

                        </td>

                        <td
                          width="42"
                          align="right"
                          style="
                            vertical-align:middle;
                          "
                        >

                          <div
                            style="
                              width:38px;
                              height:38px;
                              line-height:38px;
                              background:#df1532;
                              color:#ffffff;
                              text-align:center;
                              font-size:18px;
                              font-weight:800;
                            "
                          >
                            J
                          </div>

                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>


                <!-- RED ACCENT -->

                <tr>
                  <td
                    style="
                      height:5px;
                      background:#df1532;
                      font-size:0;
                      line-height:0;
                    "
                  >
                    &nbsp;
                  </td>
                </tr>


                <!-- MAIN CONTENT -->

                <tr>
                  <td
                    style="
                      padding:42px 38px;
                    "
                  >

                    <!-- CONFIRMATION -->

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>

                        <td
                          width="52"
                          valign="top"
                        >

                          <div
                            style="
                              width:42px;
                              height:42px;
                              line-height:42px;
                              border-radius:50%;
                              background:#df1532;
                              color:#ffffff;
                              text-align:center;
                              font-size:22px;
                              font-weight:700;
                            "
                          >
                            ✓
                          </div>

                        </td>

                        <td
                          valign="top"
                        >

                          <div
                            style="
                              font-size:11px;
                              font-weight:800;
                              letter-spacing:2px;
                              color:#df1532;
                            "
                          >
                            PAYMENT SUCCESSFUL
                          </div>

                          <div
                            style="
                              margin-top:6px;
                              font-size:30px;
                              line-height:1.15;
                              font-weight:800;
                              letter-spacing:-0.5px;
                              color:#111111;
                            "
                          >
                            ORDER CONFIRMED
                          </div>

                        </td>

                      </tr>
                    </table>


                    <!-- GREETING -->

                    <p
                      style="
                        margin:30px 0 8px;
                        font-size:16px;
                        line-height:1.6;
                        color:#111111;
                      "
                    >
                      Hi ${customerName},
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:14px;
                        line-height:1.7;
                        color:#666666;
                      "
                    >
                      Your payment has been successfully received
                      and your order is officially locked in.
                      Your miniatures are now one step closer
                      to your shelf.
                    </p>


                    <!-- ORDER NUMBER -->

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top:28px;
                        background:#f5f5f5;
                      "
                    >
                      <tr>

                        <td
                          style="
                            padding:20px 22px;
                            border-left:4px solid #df1532;
                          "
                        >

                          <div
                            style="
                              font-size:10px;
                              font-weight:800;
                              letter-spacing:2px;
                              color:#888888;
                            "
                          >
                            ORDER NUMBER
                          </div>

                          <div
                            style="
                              margin-top:7px;
                              font-size:21px;
                              font-weight:800;
                              letter-spacing:1px;
                              color:#111111;
                            "
                          >
                            ${orderNumber}
                          </div>

                        </td>

                      </tr>
                    </table>


                    <!-- ORDER SUMMARY -->

                    <div
                      style="
                        margin-top:38px;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:2px;
                        color:#111111;
                      "
                    >
                      YOUR ORDER
                    </div>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top:14px;
                        border-collapse:collapse;
                      "
                    >

                      <thead>

                        <tr>

                          <th
                            style="
                              padding:11px 0;
                              border-bottom:2px solid #111111;
                              text-align:left;
                              font-size:10px;
                              letter-spacing:1px;
                              color:#555555;
                            "
                          >
                            PRODUCT
                          </th>

                          <th
                            style="
                              padding:11px 8px;
                              border-bottom:2px solid #111111;
                              text-align:center;
                              font-size:10px;
                              letter-spacing:1px;
                              color:#555555;
                            "
                          >
                            QTY
                          </th>

                          <th
                            style="
                              padding:11px 0;
                              border-bottom:2px solid #111111;
                              text-align:right;
                              font-size:10px;
                              letter-spacing:1px;
                              color:#555555;
                            "
                          >
                            TOTAL
                          </th>

                        </tr>

                      </thead>

                      <tbody>
                        ${itemsHtml}
                      </tbody>

                    </table>


                    <!-- TOTALS -->

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top:20px;
                      "
                    >

                      <tr>

                        <td
                          style="
                            padding:6px 0;
                            font-size:13px;
                            color:#777777;
                          "
                        >
                          Subtotal
                        </td>

                        <td
                          align="right"
                          style="
                            padding:6px 0;
                            font-size:13px;
                            color:#111111;
                          "
                        >
                          ₹${order.subtotal.toLocaleString("en-IN")}
                        </td>

                      </tr>

                      <tr>

                        <td
                          style="
                            padding:6px 0;
                            font-size:13px;
                            color:#777777;
                          "
                        >
                          Shipping
                        </td>

                        <td
                          align="right"
                          style="
                            padding:6px 0;
                            font-size:13px;
                            font-weight:700;
                            color:${
                              order.shipping === 0
                                ? "#16803c"
                                : "#111111"
                            };
                          "
                        >
                          ${
                            order.shipping === 0
                              ? "FREE"
                              : `₹${order.shipping.toLocaleString("en-IN")}`
                          }
                        </td>

                      </tr>

                      <tr>

                        <td
                          colspan="2"
                          style="
                            padding-top:16px;
                          "
                        >
                          <div
                            style="
                              border-top:2px solid #111111;
                            "
                          >
                            &nbsp;
                          </div>
                        </td>

                      </tr>

                      <tr>

                        <td
                          style="
                            padding:4px 0;
                            font-size:17px;
                            font-weight:800;
                            color:#111111;
                          "
                        >
                          TOTAL PAID
                        </td>

                        <td
                          align="right"
                          style="
                            padding:4px 0;
                            font-size:20px;
                            font-weight:800;
                            color:#df1532;
                          "
                        >
                          ₹${order.total.toLocaleString("en-IN")}
                        </td>

                      </tr>

                    </table>


                    <!-- SHIPPING -->

                    <div
                      style="
                        margin-top:40px;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:2px;
                        color:#111111;
                      "
                    >
                      SHIPPING TO
                    </div>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top:14px;
                        background:#fafafa;
                        border:1px solid #eeeeee;
                      "
                    >

                      <tr>

                        <td
                          style="
                            padding:20px 22px;
                          "
                        >

                          <div
                            style="
                              font-size:14px;
                              line-height:1.8;
                              color:#444444;
                            "
                          >
                            ${shippingAddress}<br>
                            ${shippingCity}<br>
                            ${shippingState}
                            -
                            ${shippingPincode}
                          </div>

                        </td>

                      </tr>

                    </table>


                    <!-- WHAT HAPPENS NEXT -->

                    <div
                      style="
                        margin-top:40px;
                        padding:24px;
                        background:#111111;
                      "
                    >

                      <div
                        style="
                          font-size:10px;
                          font-weight:800;
                          letter-spacing:2px;
                          color:#df1532;
                        "
                      >
                        WHAT HAPPENS NEXT?
                      </div>

                      <div
                        style="
                          margin-top:10px;
                          font-size:17px;
                          font-weight:700;
                          color:#ffffff;
                        "
                      >
                        Your order is now being prepared.
                      </div>

                      <div
                        style="
                          margin-top:8px;
                          font-size:13px;
                          line-height:1.7;
                          color:#aaaaaa;
                        "
                      >
                        We'll send you another email as soon
                        as your order is dispatched, including
                        your tracking details.
                      </div>

                    </div>


                    <!-- CLOSING -->

                    <p
                      style="
                        margin:35px 0 0;
                        font-size:14px;
                        line-height:1.7;
                        color:#666666;
                      "
                    >
                      Thanks for choosing JDM.
                      Every model deserves a place in a
                      collection worth showing off.
                    </p>

                  </td>
                </tr>


                <!-- FOOTER -->

                <tr>

                  <td
                    style="
                      background:#111111;
                      padding:28px 38px;
                    "
                  >

                    <div
                      style="
                        font-size:13px;
                        font-weight:800;
                        letter-spacing:1.5px;
                        color:#ffffff;
                      "
                    >
                      JUST DIECAST MINIS
                    </div>

                    <div
                      style="
                        margin-top:7px;
                        font-size:10px;
                        letter-spacing:1.5px;
                        color:#777777;
                      "
                    >
                      SOME DREAMS BELONG ON THE ROAD.
                    </div>

                    <div
                      style="
                        font-size:10px;
                        letter-spacing:1.5px;
                        color:#777777;
                      "
                    >
                      OTHERS ON YOUR SHELF.
                    </div>

                    <div
                      style="
                        margin-top:20px;
                        padding-top:15px;
                        border-top:1px solid #333333;
                        font-size:10px;
                        color:#666666;
                      "
                    >
                      This is an automated order confirmation.
                      Please do not reply directly to this email.
                    </div>

                  </td>

                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `;


  const text = `
JUST DIECAST MINIS
GREAT CARS. JUST SMALLER.

PAYMENT SUCCESSFUL
ORDER CONFIRMED

Hi ${order.customer.name},

Your payment has been successfully received and your order is officially confirmed.

ORDER NUMBER
${order.orderId}

YOUR ORDER

${order.items
  .map(
    (item) =>
      `${item.name} x ${item.quantity} - ₹${(
        item.price *
        item.quantity
      ).toLocaleString("en-IN")}`
  )
  .join("\n")}

Subtotal: ₹${order.subtotal.toLocaleString(
    "en-IN"
  )}

Shipping: ${
    order.shipping === 0
      ? "FREE"
      : `₹${order.shipping.toLocaleString(
          "en-IN"
        )}`
  }

TOTAL PAID: ₹${order.total.toLocaleString(
    "en-IN"
  )}

SHIPPING TO

${order.shippingAddress.address}
${order.shippingAddress.city}
${order.shippingAddress.state} - ${order.shippingAddress.pincode}

WHAT HAPPENS NEXT?

Your order is now being prepared.

We'll send you another email as soon as your order is dispatched,
including your tracking details.

Thanks for choosing JDM.
Every model deserves a place in a collection worth showing off.

JUST DIECAST MINIS
Some dreams belong on the road. Others on your shelf.
  `;

  await mailTransporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "JUST DIECAST MINIS"}" <${process.env.MAIL_FROM}>`,
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderId} | JUST DIECAST MINIS`,
    text,
    html
  });
};

async function sendCustomerRefundEmail(order) {
  await mailTransporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "JUST DIECAST MINIS"}" <${process.env.MAIL_FROM}>`,
    to: order.customer.email,
    subject: `Refund Successful — ${order.orderId} | JUST DIECAST MINIS`,
    text: `
Your order ${order.orderId} has been cancelled successfully.

Refund Amount: ₹${order.total}
Razorpay Refund ID: ${order.razorpayRefundId}

The refund has been processed through Razorpay. Depending on your bank/payment provider, it may take some time to appear in your account.

Thank you,
JUST DIECAST MINIS
    `,
    html: `
      <h2>Refund Successful</h2>
      <p>Your order <strong>${order.orderId}</strong> has been cancelled successfully.</p>

      <p><strong>Refund Amount:</strong> ₹${order.total}</p>
      <p><strong>Refund ID:</strong> ${order.razorpayRefundId}</p>

      <p>
        The refund has been processed through Razorpay.
        Depending on your bank/payment provider, it may take some time
        to appear in your account.
      </p>

      <p>Thank you,<br>JUST DIECAST MINIS</p>
    `
  });
}

async function sendAdminCancellationNotificationEmail(order) {
  await mailTransporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "JUST DIECAST MINIS"}" <${process.env.MAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Order Cancelled & Refunded — ${order.orderId} | JUST DIECAST MINIS`,
    text: `
Order ${order.orderId} has been cancelled and refunded.

Customer: ${order.customer.name}
Email: ${order.customer.email}

Order Total: ₹${order.total}
Razorpay Payment ID: ${order.razorpayPaymentId}
Razorpay Refund ID: ${order.razorpayRefundId}

Cancellation Reason:
${order.cancellationReason || "Not provided"}

Inventory has been released.
    `,
    html: `
      <h2>Order Cancelled & Refunded</h2>

      <p><strong>Order:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.customer.name}</p>
      <p><strong>Email:</strong> ${order.customer.email}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>

      <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>
      <p><strong>Refund ID:</strong> ${order.razorpayRefundId}</p>

      <p>
        <strong>Cancellation Reason:</strong><br>
        ${order.cancellationReason || "Not provided"}
      </p>

      <p>Inventory has been released.</p>
    `
  });
}


/**
 * Send new order notification to the store admin.
 *
 * This is sent only after Razorpay payment
 * has been cryptographically verified.
 */
const sendAdminOrderNotificationEmail = async (order) => {
  const customerName = escapeHtml(order.customer.name);
  const customerEmail = escapeHtml(order.customer.email);
  const customerPhone = escapeHtml(order.customer.phone);

  const orderNumber = escapeHtml(order.orderId);

  const shippingAddress = escapeHtml(
    order.shippingAddress.address
  );

  const shippingCity = escapeHtml(
    order.shippingAddress.city
  );

  const shippingState = escapeHtml(
    order.shippingAddress.state
  );

  const shippingPincode = escapeHtml(
    order.shippingAddress.pincode
  );

  const itemsHtml = order.items
    .map((item) => {
      const itemName = escapeHtml(item.name);
      const itemTotal = item.price * item.quantity;

      return `
        <tr>
          <td style="
            padding:12px 0;
            border-bottom:1px solid #eeeeee;
            font-size:14px;
            color:#111111;
          ">
            ${itemName}
          </td>

          <td style="
            padding:12px 8px;
            border-bottom:1px solid #eeeeee;
            text-align:center;
            font-size:14px;
            color:#555555;
          ">
            ${item.quantity}
          </td>

          <td style="
            padding:12px 0;
            border-bottom:1px solid #eeeeee;
            text-align:right;
            font-size:14px;
            font-weight:700;
            color:#111111;
          ">
            ₹${itemTotal.toLocaleString("en-IN")}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </head>

      <body style="
        margin:0;
        padding:30px 15px;
        background:#eeeeee;
        font-family:Arial,Helvetica,sans-serif;
        color:#111111;
      ">
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="max-width:680px;margin:auto;background:#ffffff;"
        >
          <tr>
            <td style="
              padding:28px 32px;
              background:#111111;
              color:#ffffff;
            ">
              <div style="
                font-size:22px;
                font-weight:800;
                letter-spacing:1px;
              ">
                JUST DIECAST MINIS
              </div>

              <div style="
                margin-top:8px;
                color:#df1532;
                font-size:12px;
                font-weight:700;
                letter-spacing:1px;
              ">
                NEW PAID ORDER
              </div>
            </td>
          </tr>

          <tr>
            <td style="
              height:5px;
              background:#df1532;
              font-size:0;
            ">
              &nbsp;
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="
                margin:0 0 20px;
                font-size:24px;
                color:#111111;
              ">
                New Order Received
              </h2>

              <div style="
                padding:16px;
                background:#f5f5f5;
                border-left:4px solid #df1532;
              ">
                <div style="
                  font-size:11px;
                  font-weight:700;
                  letter-spacing:1px;
                  color:#777777;
                ">
                  ORDER NUMBER
                </div>

                <div style="
                  margin-top:6px;
                  font-size:22px;
                  font-weight:800;
                  color:#111111;
                ">
                  ${orderNumber}
                </div>
              </div>

              <h3 style="margin-top:30px;">
                Customer Details
              </h3>

              <p style="
                font-size:14px;
                line-height:1.8;
                color:#444444;
              ">
                <strong>Name:</strong> ${customerName}<br>
                <strong>Email:</strong> ${customerEmail}<br>
                <strong>Phone:</strong> ${customerPhone}
              </p>

              <h3 style="margin-top:30px;">
                Order Items
              </h3>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="border-collapse:collapse;"
              >
                <thead>
                  <tr>
                    <th style="
                      padding:10px 0;
                      border-bottom:2px solid #111111;
                      text-align:left;
                      font-size:11px;
                    ">
                      PRODUCT
                    </th>

                    <th style="
                      padding:10px 8px;
                      border-bottom:2px solid #111111;
                      text-align:center;
                      font-size:11px;
                    ">
                      QTY
                    </th>

                    <th style="
                      padding:10px 0;
                      border-bottom:2px solid #111111;
                      text-align:right;
                      font-size:11px;
                    ">
                      TOTAL
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top:20px;"
              >
                <tr>
                  <td style="
                    padding:6px 0;
                    color:#777777;
                  ">
                    Subtotal
                  </td>

                  <td style="
                    padding:6px 0;
                    text-align:right;
                  ">
                    ₹${order.subtotal.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:6px 0;
                    color:#777777;
                  ">
                    Shipping
                  </td>

                  <td style="
                    padding:6px 0;
                    text-align:right;
                  ">
                    ${
                      order.shipping === 0
                        ? "FREE"
                        : `₹${order.shipping.toLocaleString("en-IN")}`
                    }
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding-top:16px;
                    border-top:2px solid #111111;
                    font-size:17px;
                    font-weight:800;
                  ">
                    TOTAL PAID
                  </td>

                  <td style="
                    padding-top:16px;
                    border-top:2px solid #111111;
                    text-align:right;
                    font-size:20px;
                    font-weight:800;
                    color:#df1532;
                  ">
                    ₹${order.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              </table>

              <h3 style="margin-top:32px;">
                Shipping Address
              </h3>

              <p style="
                font-size:14px;
                line-height:1.8;
                color:#444444;
              ">
                ${shippingAddress}<br>
                ${shippingCity}<br>
                ${shippingState} - ${shippingPincode}
              </p>

              <h3 style="margin-top:32px;">
                Payment Details
              </h3>

              <p style="
                font-size:14px;
                line-height:1.8;
                color:#444444;
              ">
                <strong>Payment Status:</strong> PAID<br>
                <strong>Payment Method:</strong> Razorpay<br>
                <strong>Razorpay Payment ID:</strong>
                ${escapeHtml(order.razorpayPaymentId)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="
              padding:24px 32px;
              background:#111111;
              color:#777777;
              font-size:11px;
            ">
              Automated notification from JUST DIECAST MINIS.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
JUST DIECAST MINIS
NEW PAID ORDER

Order Number: ${order.orderId}

CUSTOMER DETAILS
Name: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}

ORDER ITEMS
${order.items
  .map(
    (item) =>
      `${item.name} x ${item.quantity} - ₹${(
        item.price * item.quantity
      ).toLocaleString("en-IN")}`
  )
  .join("\n")}

Subtotal: ₹${order.subtotal.toLocaleString("en-IN")}
Shipping: ${
    order.shipping === 0
      ? "FREE"
      : `₹${order.shipping.toLocaleString("en-IN")}`
  }
TOTAL PAID: ₹${order.total.toLocaleString("en-IN")}

SHIPPING ADDRESS
${order.shippingAddress.address}
${order.shippingAddress.city}
${order.shippingAddress.state} - ${order.shippingAddress.pincode}

PAYMENT STATUS: PAID
PAYMENT METHOD: Razorpay
RAZORPAY PAYMENT ID: ${order.razorpayPaymentId}
  `;

  await mailTransporter.sendMail({
    from: `"${
      process.env.MAIL_FROM_NAME || "JUST DIECAST MINIS"
    }" <${process.env.MAIL_FROM}>`,

    to: process.env.ADMIN_EMAIL,

    subject: `New Paid Order — ${order.orderId} | JUST DIECAST MINIS`,

    text,
    html
  });
};

const generateOrderId = async () => {
  let orderId;

  do {
    orderId =
      `JDM-${crypto
        .randomInt(10000, 100000)
        .toString()}`;
  } while (
    await Order.exists({
      orderId
    })
  );

  return orderId;
};

const createShiprocketOrderForJDM = async (order) => {
  const shiprocketOrderData = {
    order_id: order.orderId,

    order_date: new Date(
      order.createdAt || Date.now()
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),

    pickup_location:
      process.env.SHIPROCKET_PICKUP_LOCATION,

    billing_customer_name: order.customer.name,
    billing_last_name: "",
    billing_address: order.shippingAddress.address,
    billing_address_2: "",
    billing_city: order.shippingAddress.city,
    billing_pincode: Number(
      order.shippingAddress.pincode
    ),
    billing_state: order.shippingAddress.state,
    billing_country: "India",
    billing_email: order.customer.email,
    billing_phone: order.customer.phone,

    shipping_is_billing: true,

    shipping_customer_name: order.customer.name,
    shipping_last_name: "",
    shipping_address: order.shippingAddress.address,
    shipping_address_2: "",
    shipping_city: order.shippingAddress.city,
    shipping_pincode: Number(
      order.shippingAddress.pincode
    ),
    shipping_state: order.shippingAddress.state,
    shipping_country: "India",
    shipping_email: order.customer.email,
    shipping_phone: order.customer.phone,

    order_items: order.items.map((item) => ({
      name: item.name,
      sku: String(item.productId),
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: "",
    })),

    payment_method: "Prepaid",
    shipping_charges: order.shipping,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: order.subtotal,

    // Replace these with your actual package measurements.
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  console.log("Shiprocket address payload:", {
    pickup_location: shiprocketOrderData.pickup_location,
  billing_customer_name: shiprocketOrderData.billing_customer_name,
  billing_address: shiprocketOrderData.billing_address,
  billing_city: shiprocketOrderData.billing_city,
  billing_pincode: shiprocketOrderData.billing_pincode,
  billing_state: shiprocketOrderData.billing_state,
  billing_phone: shiprocketOrderData.billing_phone,

  shipping_customer_name: shiprocketOrderData.shipping_customer_name,
  shipping_address: shiprocketOrderData.shipping_address,
  shipping_city: shiprocketOrderData.shipping_city,
  shipping_pincode: shiprocketOrderData.shipping_pincode,
  shipping_state: shiprocketOrderData.shipping_state,
  shipping_phone: shiprocketOrderData.shipping_phone,
});

  return await createShiprocketOrder(
    shiprocketOrderData
  );
};

/*
 * Release inventory reserved by an unpaid order.
 *
 * Returns true if inventory was actually released.
 * Returns false if it had already been released.
 */
const releaseOrderInventory = async (
  order
) => {
  if (
    order.inventoryReleased ||
    !Array.isArray(order.reservedItems) ||
    order.reservedItems.length === 0
  ) {
    return false;
  }

  for (
    const reservedItem of order.reservedItems
  ) {
    if (
      reservedItem.type ===
      "stock"
    ) {
      await Product.findOneAndUpdate(
        {
          id:
            reservedItem.productId
        },
        {
          $inc: {
            stock:
              reservedItem.quantity
          }
        }
      );

      const restoredProduct =
        await Product.findOne({
          id:
            reservedItem.productId
        });

      if (
        restoredProduct &&
        restoredProduct.stock > 0 &&
        restoredProduct.status ===
          "out-of-stock"
      ) {
        await Product.updateOne(
          {
            id:
              reservedItem.productId,

            status:
              "out-of-stock",

            stock: {
              $gt: 0
            }
          },
          {
            $set: {
              status:
                "in-stock"
            }
          }
        );
      }
    }

    if (
      reservedItem.type ===
      "pre-order"
    ) {
      await Product.findOneAndUpdate(
        {
          id:
            reservedItem.productId,

          preOrderCount: {
            $gte:
              reservedItem.quantity
          }
        },
        {
          $inc: {
            preOrderCount:
              -reservedItem.quantity
          }
        }
      );
    }
  }

  order.inventoryReleased = true;

  await order.save();

  return true;
};

const cleanupExpiredPaymentOrders =
  async () => {
    const now = new Date();

    const expiredOrders =
      await Order.find({
        paymentStatus: "pending",
        status: "pending",
        inventoryReleased: false,
        paymentExpiresAt: {
          $lte: now
        }
      });

    for (const order of expiredOrders) {
      try {
        order.paymentStatus =
          "failed";

        order.status =
          "cancelled";

        await order.save();

        await releaseOrderInventory(
          order
        );

        console.log(
          `Expired payment cleaned up: ${order.orderId}`
        );
      } catch (error) {
        console.error(
          `Expired payment cleanup failed for ${order.orderId}:`,
          error.message
        );
      }
    }

    return expiredOrders.length;
  };

router.post(
  "/",
  authenticate,
  async (req, res) => {
    const reservedItems = [];

    try {
      const storeSettings = await StoreSettings.findOne();

if (storeSettings && !storeSettings.ordersEnabled) {
  return res.status(403).json({
    message:
      "Orders are temporarily unavailable. Please check back soon."
  });
}
      const {
        customer,
        shippingAddress,
        items
      } = req.body;

      if (
        !customer ||
        typeof customer !==
          "object"
      ) {
        return res.status(400).json({
          message:
            "Customer information is required."
        });
      }

      if (
        typeof customer.name !==
          "string" ||
        !customer.name.trim()
      ) {
        return res.status(400).json({
          message:
            "Customer name is required."
        });
      }

      if (
        typeof customer.email !==
          "string" ||
        !customer.email.trim()
      ) {
        return res.status(400).json({
          message:
            "Customer email is required."
        });
      }

      if (
        typeof customer.phone !==
          "string" ||
        !customer.phone.trim()
      ) {
        return res.status(400).json({
          message:
            "Customer phone is required."
        });
      }

      if (
        !shippingAddress ||
        typeof shippingAddress !==
          "object"
      ) {
        return res.status(400).json({
          message:
            "Shipping address is required."
        });
      }

      const requiredAddressFields = [
  "address",
  "city",
  "state",
  "pincode",
  "country"
];

      for (
        const field of
        requiredAddressFields
      ) {
        if (
          typeof shippingAddress[
            field
          ] !== "string" ||
          !shippingAddress[
            field
          ].trim()
        ) {
          return res.status(400).json({
            message:
              `Shipping ${field} is required.`
          });
        }
      }

      if (
  shippingAddress.country.trim().toLowerCase() !==
  "india"
) {
  return res.status(400).json({
    message:
      "International shipping is currently unavailable."
  });
}

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one product is required."
        });
      }

      const requestedItemsMap =
        new Map();

      for (const item of items) {
        const productId =
  String(item.productId).trim();

        const quantity =
          Number(item.quantity);

        if (!productId) {
          return res.status(400).json({
            message:
              "Invalid product ID."
          });
        }

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1
        ) {
          return res.status(400).json({
            message:
              "Product quantity must be a positive whole number."
          });
        }

        const currentQuantity =
          requestedItemsMap.get(
            productId
          ) || 0;

        requestedItemsMap.set(
          productId,
          currentQuantity + quantity
        );
      }

      const requestedItems =
        Array.from(
          requestedItemsMap,
          (
            [productId, quantity]
          ) => ({
            productId,
            quantity
          })
        );

      const productIds =
        requestedItems.map(
          (item) =>
            item.productId
        );

      const products =
        await Product.find({
          id: {
            $in: productIds
          }
        });

      const productMap =
        new Map(
          products.map(
            (product) => [
              product.id,
              product
            ]
          )
        );

      const orderItems = [];

      for (
        const requestedItem
        of requestedItems
      ) {
        const product =
          productMap.get(
            requestedItem.productId
          );

        if (!product) {
          return res.status(400).json({
            message:
              `Product ${requestedItem.productId} was not found.`
          });
        }

        /*
         * PRE-ORDER
         */
        if (
          product.status ===
          "pre-order"
        ) {
          if (
            product.preOrderLimitEnabled
          ) {
            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  id: product.id,

                  status:
                    "pre-order",

                  preOrderLimitEnabled:
                    true,

                  $expr: {
                    $lte: [
                      {
                        $add: [
                          "$preOrderCount",
                          requestedItem.quantity
                        ]
                      },
                      "$preOrderLimit"
                    ]
                  }
                },
                {
                  $inc: {
                    preOrderCount:
                      requestedItem.quantity
                  }
                },
                {
                  new: true
                }
              );

            if (!updatedProduct) {
              throw new Error(
                `PREORDER_LIMIT:${product.name}`
              );
            }
          } else {
            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  id: product.id,

                  status:
                    "pre-order"
                },
                {
                  $inc: {
                    preOrderCount:
                      requestedItem.quantity
                  }
                },
                {
                  new: true
                }
              );

            if (!updatedProduct) {
              throw new Error(
                `PREORDER_CLOSED:${product.name}`
              );
            }
          }

          reservedItems.push({
            productId:
              product.id,

            quantity:
              requestedItem.quantity,

            type:
              "pre-order"
          });
        }

        /*
         * NORMAL PHYSICAL STOCK
         */
        else {
          const updatedProduct =
            await Product.findOneAndUpdate(
              {
                id: product.id,

                status:
                  "in-stock",

                stock: {
                  $gte:
                    requestedItem.quantity
                }
              },
              {
                $inc: {
                  stock:
                    -requestedItem.quantity
                }
              },
              {
                new: true
              }
            );

          if (!updatedProduct) {
            throw new Error(
              `INSUFFICIENT_STOCK:${product.name}`
            );
          }

          /*
           * Automatically close the product
           * when the final physical unit is reserved.
           */
          if (
            updatedProduct.stock ===
            0
          ) {
            await Product.updateOne(
              {
                id: product.id,

                stock: 0,

                status:
                  "in-stock"
              },
              {
                $set: {
                  status:
                    "out-of-stock"
                }
              }
            );
          }

          reservedItems.push({
            productId:
              product.id,

            quantity:
              requestedItem.quantity,

            type:
              "stock"
          });
        }

        orderItems.push({
          productId:
            product.id,

          name:
            product.name,

          price:
            product.price,

          quantity:
            requestedItem.quantity,

          image:
            product.images?.[0] ||
            undefined
        });
      }

      const subtotal =
        orderItems.reduce(
          (total, item) =>
            total +
            item.price *
              item.quantity,
          0
        );

      const shipping =
        subtotal > 3000
          ? 0
          : 150;

      const total =
        subtotal + shipping;

      const orderId =
        await generateOrderId();

      /*
       * Give the unpaid Razorpay order a
       * limited lifetime.
       */
      const paymentExpiresAt =
        new Date(
          Date.now() +
          15 * 60 * 1000
        );

      /*
       * Create the JDM order first.
       * It remains pending until Razorpay
       * payment is successfully verified.
       */
      const order =
        await Order.create({
          userId:
            req.user.userId,

          orderId,

          customer: {
            name:
              customer.name.trim(),

            email:
              customer.email.trim(),

            phone:
              customer.phone.trim()
          },

          shippingAddress: {
  address: shippingAddress.address.trim(),
  city: shippingAddress.city.trim(),
  state: shippingAddress.state.trim(),
  pincode: shippingAddress.pincode.trim(),
  country: shippingAddress.country.trim()
},

          items:
            orderItems,

          subtotal,

          shipping,

          total,

          paymentMethod:
            "razorpay",

          paymentStatus:
            "pending",

          reservedItems,

          inventoryReleased:
            false,

          paymentExpiresAt,

          status:
            "pending"
        });

      /*
       * Create the corresponding Razorpay order.
       * Razorpay expects the amount in paise.
       */
      let razorpayOrder;

      try {
        razorpayOrder =
          await razorpay.orders.create({
            amount:
              Math.round(
                total * 100
              ),

            currency:
              "INR",

            receipt:
              orderId,

            notes: {
              jdmOrderId:
                orderId,

              userId:
                req.user.userId.toString()
            }
          });
      } catch (razorpayError) {
        await Order.deleteOne({
          _id:
            order._id
        });

        throw razorpayError;
      }

      /*
       * Store the Razorpay order ID
       * against the JDM order.
       */
      order.razorpayOrderId =
        razorpayOrder.id;

      await order.save();

      return res.status(201).json({
        message:
          "Payment order created successfully.",

        order,

        razorpay: {
          orderId:
            razorpayOrder.id,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,

          keyId:
            process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      console.error(
        "Create order error:",
        error.message
      );

      /*
       * Roll back any inventory
       * reservations if order/payment
       * order creation fails.
       */
      for (
        const reservedItem
        of reservedItems
      ) {
        try {
          if (
            reservedItem.type ===
            "stock"
          ) {
            await Product.findOneAndUpdate(
              {
                id:
                  reservedItem.productId
              },
              {
                $inc: {
                  stock:
                    reservedItem.quantity
                }
              }
            );

            const restoredProduct =
              await Product.findOne({
                id:
                  reservedItem.productId
              });

            if (
              restoredProduct &&
              restoredProduct.stock > 0 &&
              restoredProduct.status ===
                "out-of-stock"
            ) {
              await Product.updateOne(
                {
                  id:
                    reservedItem.productId,

                  status:
                    "out-of-stock",

                  stock: {
                    $gt: 0
                  }
                },
                {
                  $set: {
                    status:
                      "in-stock"
                  }
                }
              );
            }
          }

          if (
            reservedItem.type ===
            "pre-order"
          ) {
            await Product.findOneAndUpdate(
              {
                id:
                  reservedItem.productId,

                preOrderCount: {
                  $gte:
                    reservedItem.quantity
                }
              },
              {
                $inc: {
                  preOrderCount:
                    -reservedItem.quantity
                }
              }
            );
          }
        } catch (
          rollbackError
        ) {
          console.error(
            "Inventory rollback error:",
            rollbackError.message
          );
        }
      }

      if (
        error.message?.startsWith(
          "INSUFFICIENT_STOCK:"
        )
      ) {
        return res.status(400).json({
          message:
            `${error.message.replace(
              "INSUFFICIENT_STOCK:",
              ""
            )} does not have enough stock available.`
        });
      }

      if (
        error.message?.startsWith(
          "PREORDER_LIMIT:"
        )
      ) {
        return res.status(400).json({
          message:
            `${error.message.replace(
              "PREORDER_LIMIT:",
              ""
            )} has reached its pre-order limit.`
        });
      }

      if (
        error.message?.startsWith(
          "PREORDER_CLOSED:"
        )
      ) {
        return res.status(400).json({
          message:
            `${error.message.replace(
              "PREORDER_CLOSED:",
              ""
            )} is no longer available for pre-order.`
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
            "Invalid order data."
        });
      }

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          message:
            "Unable to generate a unique order ID. Please try again."
        });
      }

      return res.status(500).json({
        message:
          "Failed to create order."
      });
    }
  }
);

/*
 * Release inventory when the customer
 * cancels/closes the payment window.
 */


/*
 * Customer cancellation for paid orders.
 * This is separate from /cancel-payment, which handles
 * unpaid payment-window cancellation.
 */
router.post(
  "/cancel-order",
  authenticate,
  async (req, res) => {
    try {
      const {
        orderId,
        cancellationReason
      } = req.body;

      if (!orderId) {
        return res.status(400).json({
          message: "Order ID is required."
        });
      }

      /*
       * Atomically claim the cancellation.
       *
       * This prevents duplicate cancellation/refund attempts
       * if the customer clicks the button twice or sends
       * multiple requests at the same time.
       */
      const order = await Order.findOneAndUpdate(
        {
          orderId,
          userId: req.user.userId,
          status: "confirmed",
          paymentStatus: "paid",
          cancellationStatus: "none",
          refundStatus: "not_required"
        },
        {
          $set: {
            cancellationStatus: "requested",
            cancellationReason:
              typeof cancellationReason === "string"
                ? cancellationReason.trim().slice(0, 500)
                : null,
            refundStatus: "pending"
          }
        },
        {
          new: true
        }
      );

      if (!order) {
        const existingOrder = await Order.findOne({
          orderId,
          userId: req.user.userId
        });

        if (!existingOrder) {
          return res.status(404).json({
            message: "Order not found."
          });
        }

        if (existingOrder.status === "shipped") {
          return res.status(400).json({
            message:
              "This order has already been dispatched. Please contact support."
          });
        }

        if (existingOrder.status === "delivered") {
          return res.status(400).json({
            message:
              "Delivered orders cannot be cancelled directly. Please contact support."
          });
        }

        if (existingOrder.status === "cancelled") {
          return res.status(400).json({
            message: "This order has already been cancelled."
          });
        }

        if (existingOrder.cancellationStatus === "requested") {
          return res.status(400).json({
            message:
              "Cancellation is already being processed."
          });
        }

        if (existingOrder.cancellationStatus === "cancelled") {
          return res.status(400).json({
            message:
              "Cancellation has already been processed."
          });
        }

        if (existingOrder.refundStatus === "processed") {
          return res.status(400).json({
            message:
              "A refund has already been processed."
          });
        }

        if (existingOrder.status !== "confirmed") {
          return res.status(400).json({
            message:
              "This order is not eligible for customer cancellation."
          });
        }

        if (existingOrder.paymentStatus !== "paid") {
          return res.status(400).json({
            message:
              "Only paid orders can be cancelled through this route."
          });
        }

        if (!existingOrder.paymentId) {
          return res.status(400).json({
            message:
              "Refund cannot be processed because the payment ID is missing."
          });
        }

        return res.status(400).json({
          message:
            "This order is no longer eligible for customer cancellation."
        });
      }

      /*
       * A payment ID is required before attempting the refund.
       */
      if (!order.razorpayPaymentId) {
        order.refundStatus = "failed";
        order.cancellationStatus = "rejected";

        await order.save();

        return res.status(400).json({
          message:
            "Refund cannot be processed because the payment ID is missing."
        });
      }

      /*
       * Process the Razorpay refund.
       */
      try {
        const refund = await razorpay.payments.refund(
          order.razorpayPaymentId,
          {
            amount: Math.round(order.total * 100)
          }
        );

        order.razorpayRefundId = refund.id;
        order.refundStatus = "processed";
        order.paymentStatus = "refunded";
        order.cancellationStatus = "cancelled";
        order.cancelledAt = new Date();
        order.status = "cancelled";

        await releaseOrderInventory(order);

        await order.save();

        // Send emails AFTER successful cancellation/refund
try {
  await sendCustomerRefundEmail(order);
} catch (emailError) {
  console.error("Customer refund email failed:", emailError);
}

try {
  await sendAdminCancellationNotificationEmail(order);
} catch (emailError) {
  console.error("Admin cancellation email failed:", emailError);
}

        return res.json({
          message:
            "Order cancelled and refund initiated successfully.",
          order
        });
      } catch (refundError) {
        console.error(
          `Refund failed for ${order.orderId}:`,
          refundError.message
        );

        order.refundStatus = "failed";
        order.cancellationStatus = "rejected";

        await order.save();

        return res.status(500).json({
          message:
            "We could not process your refund. Please contact support."
        });
      }
    } catch (error) {
      console.error(
        "Customer cancellation failed:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to cancel the order."
      });
    }
  }
);

router.post(
  "/cancel-payment",
  authenticate,
  async (req, res) => {
    try {
      const {
        orderId
      } = req.body;

      if (!orderId) {
        return res.status(400).json({
          message:
            "Order ID is required."
        });
      }

      const order =
        await Order.findOne({
          orderId,
          userId:
            req.user.userId
        });

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found."
        });
      }

      /*
       * A successfully paid order cannot
       * be cancelled through this endpoint.
       */
      if (
        order.paymentStatus ===
        "paid"
      ) {
        return res.status(400).json({
          message:
            "This order has already been paid."
        });
      }

      if (
        order.paymentStatus !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "This payment order is no longer active."
        });
      }

      if (
        order.paymentStatus ===
        "refunded"
      ) {
        return res.status(400).json({
          message:
            "This order has already been refunded."
        });
      }

      await releaseOrderInventory(
        order
      );

      order.paymentStatus =
        "failed";

      order.status =
        "cancelled";

      await order.save();

      return res.status(200).json({
        message:
          "Payment cancelled and inventory released.",

        order
      });
    } catch (error) {
      console.error(
        "Cancel payment error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to cancel payment."
      });
    }
  }
);

router.post(
  "/verify-payment",
  authenticate,
  async (req, res) => {
    try {
      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      if (
        !orderId ||
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          message:
            "Payment verification details are required."
        });
      }

      const order =
        await Order.findOne({
          orderId,
          userId:
            req.user.userId
        });

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found."
        });
      }

      if (
        order.paymentStatus ===
        "paid"
      ) {
        return res.status(200).json({
          message:
            "Payment already verified.",

          order
        });
      }

      if (
        order.paymentStatus !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "This payment order is no longer active."
        });
      }

      if (
        order.inventoryReleased
      ) {
        return res.status(400).json({
          message:
            "This order reservation has already been released."
        });
      }

      if (
        order.razorpayOrderId !==
        razorpay_order_id
      ) {
        return res.status(400).json({
          message:
            "Razorpay order ID does not match."
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      if (
        generatedSignature.length !==
        razorpay_signature.length
      ) {
        order.paymentStatus =
          "failed";

        await order.save();

        return res.status(400).json({
          message:
            "Payment verification failed."
        });
      }

      const signaturesMatch =
        crypto.timingSafeEqual(
          Buffer.from(
            generatedSignature
          ),
          Buffer.from(
            razorpay_signature
          )
        );

      if (!signaturesMatch) {
        order.paymentStatus =
          "failed";

        await order.save();

        return res.status(400).json({
          message:
            "Payment verification failed."
        });
      }

      /*
       * Payment has been cryptographically
       * verified successfully.
       *
       * Keep the reserved inventory.
       */
      order.paymentStatus =
        "paid";

      order.razorpayPaymentId =
        razorpay_payment_id;

      order.razorpaySignature =
        razorpay_signature;

      order.paymentMethod =
        "razorpay";

      order.status =
        "confirmed";

      await order.save();

      try {
  const shiprocketResponse =
    await createShiprocketOrderForJDM(order);

  order.shiprocketOrderId =
    shiprocketResponse.order_id || null;

  order.shiprocketShipmentId =
    shiprocketResponse.shipment_id || null;

  order.shiprocketStatus = "created";

  order.shiprocketStatusCode =
    shiprocketResponse.status_code || null;

  order.shiprocketChannelId =
    shiprocketResponse.channel_id || null;

  order.shiprocketCreatedAt = new Date();

  await order.save();

  console.log(
    `Shiprocket order created: ${order.orderId}`
  );
} catch (shiprocketError) {
  console.error(
    `Shiprocket order creation failed for ${order.orderId}:`,
    shiprocketError.response?.data ||
      shiprocketError.message
  );
}

      /*
       * Send order confirmation email.
       *
       * Email failure must NOT turn a successful
       * payment into a failed order.
       */
      try {
  await sendOrderConfirmationEmail(order);

  console.log(
    `Order confirmation email sent: ${order.orderId}`
  );
} catch (emailError) {
  console.error(
    `Order confirmation email failed for ${order.orderId}:`,
    emailError.message
  );
}

try {
  await sendAdminOrderNotificationEmail(order);

  console.log(
    `Admin order notification sent: ${order.orderId}`
  );
} catch (adminEmailError) {
  console.error(
    `Admin order notification failed for ${order.orderId}:`,
    adminEmailError.message
  );
}

      return res.status(200).json({
        message:
          "Payment verified successfully.",

        order
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to verify payment."
      });
    }
  }
);

router.get(
  "/",
  authenticate,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          userId:
            req.user.userId
        }).sort({
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

module.exports = router;

module.exports.cleanupExpiredPaymentOrders =
  cleanupExpiredPaymentOrders;