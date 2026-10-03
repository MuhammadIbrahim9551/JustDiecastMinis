const API_URL =
  `${import.meta.env.VITE_API_URL}/api/orders`;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("jdm_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

export const createOrder = async (
  orderData
) => {
  const response = await fetch(
    API_URL,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    }
  );

  if (!response.ok) {
    const error =
      await response.json().catch(
        () => ({})
      );

    throw new Error(
      error.message ||
      "Failed to create payment order."
    );
  }

  return response.json();
};

export const verifyPayment = async (
  paymentData
) => {
  const response = await fetch(
    `${API_URL}/verify-payment`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    }
  );

  if (!response.ok) {
    const error =
      await response.json().catch(
        () => ({})
      );

    throw new Error(
      error.message ||
      "Payment verification failed."
    );
  }

  return response.json();
};

export const cancelPayment = async (
  orderId
) => {
  const response = await fetch(
    `${API_URL}/cancel-payment`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        orderId
      })
    }
  );

  if (!response.ok) {
    const error =
      await response.json().catch(
        () => ({})
      );

    throw new Error(
      error.message ||
      "Failed to cancel payment."
    );
  }

  return response.json();
};

export const cancelOrder = async (orderId, cancellationReason = "") => {
  const response = await fetch(`${API_URL}/cancel-order`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      orderId,
      cancellationReason
    })
  });

  if (!response.ok) {
    let error = {};

    try {
      error = await response.json();
    } catch {
      // Ignore invalid JSON response
    }

    throw new Error(
      error.message || "Failed to cancel the order."
    );
  }

  return response.json();
};

export const getOrders = async () => {
  const response = await fetch(
    API_URL,
    {
      headers:
        getAuthHeaders()
    }
  );

  if (!response.ok) {
    const error =
      await response.json().catch(
        () => ({})
      );

    throw new Error(
      error.message ||
      "Failed to fetch orders."
    );
  }

  return response.json();
};