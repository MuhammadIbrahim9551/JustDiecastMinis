const API_URL = `${import.meta.env.VITE_API_URL}/api/preorders`;

export const createPreOrder = async (preOrderData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preOrderData)
  });

  if (!response.ok) {
    throw new Error("Failed to register pre-order interest.");
  }

  return response.json();
};