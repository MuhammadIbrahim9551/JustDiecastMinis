const crypto = require("crypto");

const generateReviewToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashReviewToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

module.exports = {
  generateReviewToken,
  hashReviewToken
};