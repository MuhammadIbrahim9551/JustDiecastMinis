const axios = require("axios");

const SHIPROCKET_API_URL =
  "https://apiv2.shiprocket.in/v1/external";

async function getShiprocketToken() {
  const response = await axios.post(
    `${SHIPROCKET_API_URL}/auth/login`,
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  return response.data.token;
}

async function shiprocketRequest(method, endpoint, data = null) {
  const token = await getShiprocketToken();

  const config = {
    method,
    url: `${SHIPROCKET_API_URL}${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (data !== null) {
    config.data = data;
  }

  const response = await axios(config);

  return response.data;
}

async function createShiprocketOrder(orderData) {
  return await shiprocketRequest(
    "POST",
    "/orders/create/adhoc",
    orderData
  );
}

async function getShiprocketOrderDetails(orderId) {
  return await shiprocketRequest(
    "GET",
    `/orders/show/${orderId}`
  );
}

async function getShipmentDetails(shipmentId) {
  return await shiprocketRequest(
    "GET",
    `/shipments/${shipmentId}`
  );
}

module.exports = {
  getShiprocketToken,
  shiprocketRequest,
  createShiprocketOrder,
  getShiprocketOrderDetails,
  getShipmentDetails,
};