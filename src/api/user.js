const API_URL = `${import.meta.env.VITE_API_URL}/api/user`;
const AUTH_API_URL =
  `${import.meta.env.VITE_API_URL}/api/auth`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("jdm_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

export const getUserData = async () => {
  const response = await fetch(`${API_URL}/data`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data.");
  }

  return response.json();
};

export const saveCart = async (cart) => {
  const response = await fetch(`${API_URL}/cart`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      cart
    })
  });

  if (!response.ok) {
    throw new Error("Failed to save cart.");
  }

  return response.json();
};

export const saveWishlist = async (wishlist) => {
  const response = await fetch(`${API_URL}/wishlist`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      wishlist
    })
  });

  if (!response.ok) {
    throw new Error("Failed to save wishlist.");
  }

  return response.json();
};

export const saveAddresses = async (addresses) => {
  const response = await fetch(`${API_URL}/addresses`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ addresses })
  });

  if (!response.ok) {
    throw new Error("Failed to save addresses.");
  }

  return response.json();
};

export const changePassword = async (
  currentPassword,
  newPassword
) => {
  const response = await fetch(
    `${AUTH_API_URL}/change-password`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword,
        newPassword
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
        "Failed to change password."
    );
  }

  return response.json();
};