const express = require("express");

const router = express.Router();

const mailTransporter = require("../services/mailService");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        message: "Name, email, phone, subject and message are required."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const recipient =
      process.env.CONTACT_RECEIVER_EMAIL ||
      process.env.BREVO_SMTP_USER;

    if (!recipient) {
      return res.status(500).json({
        message: "Contact email recipient is not configured."
      });
    }

    const from =
      process.env.BREVO_FROM_EMAIL ||
      process.env.BREVO_SMTP_USER;

    // Email to JDM
    const ownerMailResult = await mailTransporter.sendMail({
  from: `"JUST DIECAST MINIS" <${from}>`,
  to: recipient,
  replyTo: normalizedEmail,
      subject: `JDM Contact: ${String(subject).trim()}`,
      text: [
        "JUST DIECAST MINIS — CONTACT MESSAGE",
        "",
        `Name: ${String(name).trim()}`,
        `Email: ${normalizedEmail}`,
        `Phone: ${String(phone).trim()}`,
        `Subject: ${String(subject).trim()}`,
        "",
        "Message:",
        String(message).trim()
      ].join("\n")
    });

    console.log("CONTACT OWNER EMAIL SENT:", {
  messageId: ownerMailResult.messageId,
  accepted: ownerMailResult.accepted,
  rejected: ownerMailResult.rejected,
  recipient
});

    // Confirmation email to customer
    await mailTransporter.sendMail({
      from: `"JUST DIECAST MINIS" <${from}>`,
      to: normalizedEmail,
      subject: "We received your message — Just Diecast Minis",
      text: [
        `Hi ${String(name).trim()},`,
        "",
        "Thanks for getting in touch with Just Diecast Minis.",
        "We've received your message and will get back to you as soon as possible.",
        "",
        `Subject: ${String(subject).trim()}`,
        "",
        "— Just Diecast Minis"
      ].join("\n")
    });

    res.json({
      message: "Your message has been sent successfully."
    });

  } catch (error) {
    console.error(
      "Contact form email failed:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to send your message right now. Please try again."
    });
  }
});

module.exports = router;