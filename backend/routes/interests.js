const express = require("express");

const Product = require("../models/Product");
const Interest = require("../models/Interest");

const router = express.Router();

const mailTransporter =
  require("../services/mailService");


router.post("/", async (req, res) => {

  try {

    const {
      productId,
      productName,
      customerName,
      customerEmail
    } = req.body;


    /*
    ==================================================
    PRODUCT ID
    ==================================================

    Product IDs are strings.

    Example:
    tmp-wrx-24
    jdm-001
    1
    2
    */

    const normalizedProductId =
      String(productId || "").trim();


    const trimmedName =
      String(customerName || "").trim();


    const normalizedEmail =
      String(customerEmail || "")
        .trim()
        .toLowerCase();


    if (!normalizedProductId) {

      return res.status(400).json({
        message:
          "Invalid product ID."
      });

    }


    if (!trimmedName) {

      return res.status(400).json({
        message:
          "Name is required."
      });

    }


    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {

      return res.status(400).json({
        message:
          "Please provide a valid email address."
      });

    }


    /*
    ==================================================
    FIND PRODUCT
    ==================================================
    */

    const product =
      await Product.findOne({
        id: normalizedProductId
      });


    if (!product) {

      return res.status(404).json({
        message:
          "Product not found."
      });

    }


    /*
    ==================================================
    DETERMINE INTEREST TYPE
    ==================================================
    */

    const interestType =
      product.status === "pre-order"
        ? "pre-order"
        : "notify";


    /*
    ==================================================
    CHECK FOR EXISTING INTEREST
    ==================================================
    */

    const existingInterest =
      await Interest.findOne({

        productId:
          normalizedProductId,

        customerEmail:
          normalizedEmail,

        type:
          interestType

      });


    if (existingInterest) {

      return res.status(409).json({
        message:
          "You have already registered interest in this model."
      });

    }


    /*
    ==================================================
    CREATE INTEREST
    ==================================================
    */

    const interest =
      await Interest.create({

        productId:
          normalizedProductId,

        productName:
          product.name,

        customerName:
          trimmedName,

        customerEmail:
          normalizedEmail,

        type:
          interestType

      });


    /*
    ==================================================
    EMAIL CONFIGURATION
    ==================================================
    */

    const senderEmail =
      process.env.MAIL_FROM ||
      process.env.BREVO_SMTP_USER;


    const senderName =
      process.env.MAIL_FROM_NAME ||
      "Just Diecast Minis";


    const ownerEmail =
      process.env.ADMIN_EMAIL;


    if (!ownerEmail) {

      console.error(
        "ADMIN_EMAIL is not configured."
      );

      return res.status(500).json({
        message:
          "Email configuration is incomplete."
      });

    }


    /*
    ==================================================
    OWNER NOTIFICATION EMAIL
    ==================================================
    */

    const ownerMailText = `
NEW REGISTER INTEREST

A customer has registered interest in a model from Just Diecast Minis.

INTEREST TYPE
------------
${interestType}

MODEL DETAILS
-------------
Model: ${product.name}
Product ID: ${product.id}

CUSTOMER DETAILS
----------------
Name: ${trimmedName}
Email: ${normalizedEmail}

Registration ID: ${interest._id}

Thank you,
Just Diecast Minis
Great cars. Just smaller.
    `.trim();


    const ownerMailHtml = `
      <div
        style="
          margin: 0;
          padding: 30px 15px;
          background-color: #f2f2f2;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222222;
        "
      >

        <div
          style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #dddddd;
          "
        >

          <div
            style="
              padding: 25px 30px;
              background-color: #111111;
              color: #ffffff;
              border-bottom: 5px solid #df1532;
            "
          >

            <h2
              style="
                margin: 0;
                font-size: 22px;
                letter-spacing: 1px;
              "
            >
              JUST DIECAST MINIS
            </h2>

            <p
              style="
                margin: 8px 0 0;
                color: #dddddd;
                font-size: 13px;
              "
            >
              GREAT CARS. JUST SMALLER.
            </p>

          </div>


          <div
            style="
              padding: 30px;
            "
          >

            <p
              style="
                margin: 0 0 8px;
                color: #df1532;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
              "
            >
              STORE NOTIFICATION
            </p>


            <h1
              style="
                margin: 0 0 20px;
                font-size: 28px;
                color: #111111;
              "
            >
              NEW INTEREST REGISTRATION
            </h1>


            <p>
              A customer has registered interest in a model
              from Just Diecast Minis.
            </p>


            <div
              style="
                margin: 25px 0;
                padding: 20px;
                background-color: #f8f8f8;
                border-left: 4px solid #df1532;
              "
            >

              <h3
                style="
                  margin: 0 0 15px;
                  color: #111111;
                  font-size: 18px;
                "
              >
                MODEL DETAILS
              </h3>


              <p style="margin: 6px 0;">
                <strong>Model:</strong>
                ${product.name}
              </p>


              <p style="margin: 6px 0;">
                <strong>Product ID:</strong>
                ${product.id}
              </p>


              <p style="margin: 6px 0;">
                <strong>Interest Type:</strong>
                ${interestType}
              </p>

            </div>


            <div
              style="
                margin: 25px 0;
                padding: 20px;
                background-color: #f8f8f8;
                border-left: 4px solid #df1532;
              "
            >

              <h3
                style="
                  margin: 0 0 15px;
                  color: #111111;
                  font-size: 18px;
                "
              >
                CUSTOMER DETAILS
              </h3>


              <p style="margin: 6px 0;">
                <strong>Name:</strong>
                ${trimmedName}
              </p>


              <p style="margin: 6px 0;">
                <strong>Email:</strong>
                ${normalizedEmail}
              </p>

            </div>


            <p
              style="
                margin-top: 25px;
                font-size: 12px;
                color: #777777;
              "
            >
              <strong>Registration ID:</strong>
              ${interest._id}
            </p>


            <p
              style="
                margin-top: 30px;
                color: #555555;
              "
            >
              Please follow up with the customer when the
              model becomes available.
            </p>

          </div>


          <div
            style="
              padding: 20px 30px;
              background-color: #111111;
              color: #ffffff;
              text-align: center;
              font-size: 13px;
            "
          >

            <strong>Just Diecast Minis</strong>
            <br />
            Great cars. Just smaller.

          </div>

        </div>

      </div>
    `;


    const ownerMailResult =
      await mailTransporter.sendMail({

        from:
          `"${senderName}" <${senderEmail}>`,

        to:
          ownerEmail,

        subject:
          `New Register Interest: ${product.name}`,

        text:
          ownerMailText,

        html:
          ownerMailHtml

      });


    console.log(
      "Owner interest email delivery details:",
      {
        messageId:
          ownerMailResult.messageId,

        accepted:
          ownerMailResult.accepted,

        rejected:
          ownerMailResult.rejected,

        response:
          ownerMailResult.response
      }
    );


    /*
    ==================================================
    CUSTOMER CONFIRMATION EMAIL
    ==================================================
    */

    const customerMailText = `
Hi ${trimmedName},

YOU'RE ON THE LIST!

Thank you for registering your interest in ${product.name}.

Your interest has been successfully recorded.

We will contact you when this model becomes available.

Thank you for supporting Just Diecast Minis!

Some Dreams Belong on the Road.
Others on Your Shelf.

Great cars. Just smaller.
    `.trim();


    const customerMailHtml = `
      <div
        style="
          margin: 0;
          padding: 30px 15px;
          background-color: #f2f2f2;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222222;
        "
      >

        <div
          style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #dddddd;
          "
        >

          <div
            style="
              padding: 25px 30px;
              background-color: #111111;
              color: #ffffff;
              border-bottom: 5px solid #df1532;
            "
          >

            <h2
              style="
                margin: 0;
                font-size: 22px;
                letter-spacing: 1px;
              "
            >
              JUST DIECAST MINIS
            </h2>

            <p
              style="
                margin: 8px 0 0;
                color: #dddddd;
                font-size: 13px;
              "
            >
              GREAT CARS. JUST SMALLER.
            </p>

          </div>


          <div
            style="
              padding: 30px;
            "
          >

            <p
              style="
                margin: 0 0 8px;
                color: #df1532;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
              "
            >
              REGISTER INTEREST
            </p>


            <h1
              style="
                margin: 0 0 20px;
                font-size: 30px;
                color: #111111;
              "
            >
              YOU'RE ON THE LIST!
            </h1>


            <p>
              Hi ${trimmedName},
            </p>


            <p>
              Thank you for registering your interest in:
            </p>


            <div
              style="
                margin: 25px 0;
                padding: 22px;
                background-color: #f8f8f8;
                border-left: 4px solid #df1532;
              "
            >

              <h2
                style="
                  margin: 0;
                  color: #111111;
                  font-size: 22px;
                "
              >
                ${product.name}
              </h2>


              <p
                style="
                  margin: 8px 0 0;
                  color: #777777;
                  font-size: 13px;
                "
              >
                Product ID: ${product.id}
              </p>

            </div>


            <p>
              Your interest has been registered successfully.
              We will contact you when this model becomes
              available.
            </p>


            <p>
              We appreciate your interest in Just Diecast Minis
              and hope to help you add another dream car to
              your collection.
            </p>


            <div
              style="
                margin: 30px 0;
                padding: 20px;
                background-color: #111111;
                color: #ffffff;
                text-align: center;
              "
            >

              <p
                style="
                  margin: 0;
                  font-size: 16px;
                  font-weight: bold;
                "
              >
                Some Dreams Belong on the Road.
              </p>


              <p
                style="
                  margin: 5px 0 0;
                  font-size: 16px;
                  font-weight: bold;
                  color: #df1532;
                "
              >
                Others on Your Shelf.
              </p>

            </div>


            <p>
              Thank you for supporting Just Diecast Minis!
            </p>


            <p
              style="
                margin-top: 25px;
                font-weight: bold;
                color: #111111;
              "
            >
              Great cars. Just smaller.
            </p>

          </div>


          <div
            style="
              padding: 20px 30px;
              background-color: #111111;
              color: #ffffff;
              text-align: center;
              font-size: 13px;
            "
          >

            <strong>Just Diecast Minis</strong>
            <br />
            Thank you for being part of our collection.

          </div>

        </div>

      </div>
    `;


    const customerMailResult =
      await mailTransporter.sendMail({

        from:
          `"${senderName}" <${senderEmail}>`,

        to:
          normalizedEmail,

        subject:
          `You're on the list! — ${product.name}`,

        text:
          customerMailText,

        html:
          customerMailHtml

      });


    console.log(
      "Customer interest email delivery details:",
      {
        messageId:
          customerMailResult.messageId,

        accepted:
          customerMailResult.accepted,

        rejected:
          customerMailResult.rejected,

        response:
          customerMailResult.response
      }
    );


    return res.status(201).json({

      message:
        "Interest registered successfully.",

      interestId:
        interest._id

    });


  } catch (error) {

    if (
      error.code === 11000
    ) {

      return res.status(409).json({
        message:
          "You have already registered interest in this model."
      });

    }


    console.error(
      "Register interest error:",
      error
    );


    return res.status(500).json({
      message:
        "Unable to register interest right now."
    });

  }

});


module.exports = router;