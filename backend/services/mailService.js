const https = require("https");

const mailTransporter = {
  sendMail: async (mail) => {
    const payload = JSON.stringify({
      sender: {
        name: "JUST DIECAST MINIS",
        email: "orders@justdiecastminis.com"
      },

      to: Array.isArray(mail.to)
        ? mail.to.map((email) => ({ email }))
        : [{ email: mail.to }],

      subject: mail.subject,

      textContent: mail.text,

      htmlContent: mail.html
    });

    return new Promise((resolve, reject) => {
      const request = https.request(
        {
          hostname: "api.brevo.com",
          path: "/v3/smtp/email",
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "Content-Length": Buffer.byteLength(payload)
          },

          timeout: 30000
        },

        (response) => {
          let body = "";

          response.on("data", (chunk) => {
            body += chunk;
          });

          response.on("end", () => {
            if (
              response.statusCode >= 200 &&
              response.statusCode < 300
            ) {
              console.log(
                `BREVO API EMAIL SENT: ${mail.to}`
              );

              resolve({
                response: body,
                statusCode: response.statusCode
              });
            } else {
              const error = new Error(
                `Brevo API error ${response.statusCode}: ${body}`
              );

              reject(error);
            }
          });
        }
      );

      request.on("timeout", () => {
        request.destroy(
          new Error("Brevo API connection timeout")
        );
      });

      request.on("error", (error) => {
        reject(error);
      });

      request.write(payload);
      request.end();
    });
  }
};

module.exports = mailTransporter;