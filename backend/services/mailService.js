const nodemailer = require("nodemailer");

const mailTransporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

mailTransporter.verify((error) => {
  if (error) {
    console.error("BREVO SMTP ERROR:", error);
  } else {
    console.log("BREVO SMTP CONNECTION SUCCESSFUL.");
  }
});

module.exports = mailTransporter;