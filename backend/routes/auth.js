const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

const mailTransporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

mailTransporter.verify((error, success) => {
  if (error) {
    console.error("BREVO SMTP ERROR:", error);
  } else {
    console.log("BREVO SMTP CONNECTION SUCCESSFUL.");
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long."
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists."
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const token = createToken(user);

    res.status(201).json({
      message:
        "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to create account."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required."
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select("+passwordHash");

    if (!user) {
  console.log("LOGIN DEBUG: USER NOT FOUND:", normalizedEmail);

  return res.status(401).json({
    message:
      "Invalid email or password."
  });
}

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password."
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to login."
    });
  }
});

router.put(
  "/change-password",
  authenticate,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required."
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message:
            "New password must be at least 8 characters long."
        });
      }

      const user = await User.findById(
        req.user.userId
      ).select("+passwordHash");

      if (!user) {
        return res.status(404).json({
          message: "User not found."
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );

      if (!passwordMatches) {
        return res.status(401).json({
          message:
            "Current password is incorrect."
        });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      user.passwordHash =
        newPasswordHash;

      await user.save();

      res.json({
        message:
          "Password changed successfully."
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to change password."
      });
    }
  }
);

/* FORGOT PASSWORD */

router.post("/forgot-password", async (req, res) => {
  console.log("FORGOT PASSWORD ROUTE HIT");

  try {
    const { email } = req.body;

    console.log("RESET REQUEST EMAIL:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("NO USER FOUND FOR EMAIL");

      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent."
      });
    }

    console.log("USER FOUND:", user.email);

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    console.log("RESET TOKEN SAVED");

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("RESET LINK CREATED");

    try {
      console.log("SENDING RESET EMAIL...");

      await mailTransporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
        to: user.email,
        subject: "Reset Your JDM Password",
        text:
          `You requested a password reset for your Just Diecast Minis account.\n\n` +
          `Reset your password using this link:\n\n` +
          `${resetLink}\n\n` +
          `This link will expire in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Reset Your JDM Password</h2>

            <p>
              You requested a password reset for your
              Just Diecast Minis account.
            </p>

            <p>
              Click the button below to reset your password.
            </p>

            <p>
              <a
                href="${resetLink}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#111111;
                  color:#ffffff;
                  text-decoration:none;
                  font-weight:bold;
                "
              >
                RESET PASSWORD
              </a>
            </p>

            <p>
              This link will expire in 15 minutes.
            </p>
          </div>
        `
      });

      console.log("RESET EMAIL SENT SUCCESSFULLY");
    } catch (mailError) {
      console.error(
        "RESET EMAIL SEND ERROR:",
        mailError
      );

      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();

      return res.status(500).json({
        message:
          "Failed to send password reset email."
      });
    }

    return res.json({
      message:
        "If an account exists with this email, a password reset link has been sent."
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ROUTE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to process password reset request."
    });
  }
});

/* RESET PASSWORD */

router.put(
  "/reset-password/:token",
  async (req, res) => {
    try {
      const {
        token
      } = req.params;

      const {
        newPassword
      } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          message:
            "New password is required."
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message:
            "New password must be at least 8 characters long."
        });
      }

      const hashedResetToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      const user = await User.findOne({
        passwordResetToken:
          hashedResetToken,
        passwordResetExpires: {
          $gt: new Date()
        }
      }).select(
        "+passwordResetToken +passwordResetExpires +passwordHash"
      );

      if (!user) {
        return res.status(400).json({
          message:
            "Password reset link is invalid or has expired."
        });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      user.passwordHash =
        newPasswordHash;

      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();

      res.json({
        message:
          "Password reset successfully."
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to reset password."
      });
    }
  }
);

router.get(
  "/me",
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found."
        });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses
        }
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch user."
      });
    }
  }
);

module.exports = router;