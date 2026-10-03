import { useEffect, useRef, useState } from "react";
import "../App.css";
import imageUrl from "../utils/imageUrl";

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;
const PRODUCTS_API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [youtubeShowcaseUrl, setYoutubeShowcaseUrl] = useState("");
const [youtubeShowcaseSaving, setYoutubeShowcaseSaving] = useState(false);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [announcement, setAnnouncement] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [reviews, setReviews] = useState([]);
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewError, setReviewError] = useState("");
const [ordersEnabled, setOrdersEnabled] = useState(true);
const [ordersControlLoading, setOrdersControlLoading] = useState(true);
const [ordersControlSaving, setOrdersControlSaving] = useState(false);

    const [dispatchOrder, setDispatchOrder] =
    useState(null);

  const [shippingCourier, setShippingCourier] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  
  const [reviewEmailScheduledAt, setReviewEmailScheduledAt] = useState("");
  const [dispatchSaving, setDispatchSaving] =
    useState(false);

  const [notification, setNotification] = useState({
    type: [],
    message: ""
  });

  const notificationTimerRef = useRef(null);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [catalogOptions, setCatalogOptions] = useState({
    modelMakers: [
    "Tomica",
    "Mini GT",
    "Kyosho",
    "Bburago",
    "HotWheels",
    "Majorette",
    "M2 Machines",
    "CCA",
    "Massdi",
    "Matchbox",
    "Poster Cars",
    "Para64",
    "LCD Models",
    "Disney",
    "Time Micro",
    "Trends Hobby",
    "Hobby Japan",
    "Pop Race",
    "Others"
  ],
    scales: ["1:64", "1:43", "1:32", "1:24", "1:18"],
    vehicleMakers: ["Toyota", "Nissan", "Honda", "Mazda", "Subaru", "Mitsubishi", "Isuzu", "Suzuki", "Daihatsu", "Lexus", "Acura", "Infiniti", "GR", "BMW", "Porsche", "Ferrari", "Lamborghini", "Lancia", "Alfa Romeo", "Ford", "Chevrolet", "Jeep", "GMC", "Mercedes Benz", "Volkswagen", "Audi", "Jaguar", "Bugatti", "Koenigsegg", "Pagani", "Fiat", "Mini", "Peugeot", "Lotus", "Renault", "Citroen", "Bentley", "Aston Martin", "Maserati", "McLaren", "Pontiac", "Cadillac", "Rolls Royce", "Dodge", "Chrysler", "Plymouth", "Tata", "Mahindra", "Holden", "Saab", "Skoda", "Seat", "Hyundai", "Genesis", "Kia", "Others"],
    types: ["JDM", "GTs", "Coupes", "Hatches", "Sedans", "Estates", "Supercars", "Classics", "Race Cars", "Rally", "Kei Cars", "Vintage", "SUVs", "MPVs", "Trucks", "Vans", "Motorcycles", "Others"]
  });
  const [newCatalogValue, setNewCatalogValue] = useState({
    scales: "",
    modelMakers: "",
    vehicleMakers: "",
    types: ""
  });

  const ITEMS_PER_PAGE = 8;
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const productFormRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    brand: "",
    vehicleMaker: [],
    scale: "1:64",
    category: "new-arrivals",
    type: [],
    series: "",
    about: "",
    price: "",
    stock: 0,
    status: "in-stock",
    preOrderLimitEnabled: false,
    preOrderLimit: "",
    images: []
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const showNotification = (type, message) => {
    setNotification({
      type,
      message
    });

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = setTimeout(() => {
      setNotification({
        type: [],
        message: ""
      });
    }, 4000);
  };

  const clearNotification = () => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    setNotification({
      type: [],
      message: ""
    });
  };

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const savedOptions = localStorage.getItem("jdm_catalog_options");
      if (savedOptions) {
        setCatalogOptions((current) => ({ ...current, ...JSON.parse(savedOptions) }));
      }
    } catch (error) {
      console.error("Unable to load catalog options.", error);
    }
  }, []);

  const addCatalogOption = (optionKey, label) => {
    const value = newCatalogValue[optionKey].trim();
    if (!value) return;

    setCatalogOptions((current) => {
      if (current[optionKey].some((item) => item.toLowerCase() === value.toLowerCase())) {
        return current;
      }

      const updated = { ...current, [optionKey]: [...current[optionKey], value] };
      localStorage.setItem("jdm_catalog_options", JSON.stringify(updated));
      window.dispatchEvent(new Event("jdm-catalog-change"));
      return updated;
    });

    setNewCatalogValue((current) => ({ ...current, [optionKey]: "" }));
    showNotification("success", `${label} added to the catalog options.`);
  };

  const removeCatalogOption = (optionKey, value) => {
    setCatalogOptions((current) => {
      const updated = { ...current, [optionKey]: current[optionKey].filter((item) => item !== value) };
      localStorage.setItem("jdm_catalog_options", JSON.stringify(updated));
      window.dispatchEvent(new Event("jdm-catalog-change"));
      return updated;
    });
  };

  const resetProductForm = () => {
    setNewProduct({
      id: "",
      name: "",
      brand: "",
      vehicleMaker: [],
      scale: "1:64",
      category: "new-arrivals",
      type: [],
      series: "",
      about: "",
      price: "",
      stock: 0,
      status: "in-stock",
      preOrderLimitEnabled: false,
      preOrderLimit: "",
      images: []
    });

    setExistingImages([]);
    setImagePreviews([]);
    setEditingProductId(null);
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("jdm_token");


      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const responseText = await response.text();

let data;

try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    `Server returned non-JSON response (${response.status}).`
  );
}
      setOrders(data);
    } catch (error) {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreSettings = async () => {
  try {
    const token = localStorage.getItem("jdm_token");

    const response = await fetch(
      `${API_URL}/store-settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch store settings.");
    }

    const data = await response.json();

setOrdersEnabled(data.ordersEnabled);
setYoutubeShowcaseUrl(
  data.youtubeShowcaseUrl || ""
);
  } catch (error) {
    showNotification(
      "error",
      "Unable to load store settings."
    );
  } finally {
    setOrdersControlLoading(false);
  }
};

const toggleOrders = async () => {
  try {
    setOrdersControlSaving(true);

    const token = localStorage.getItem("jdm_token");

    const response = await fetch(
      `${API_URL}/store-settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ordersEnabled: !ordersEnabled
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to update store settings."
      );
    }

    setOrdersEnabled(data.ordersEnabled);

    showNotification(
      "success",
      data.ordersEnabled
        ? "Orders have been enabled."
        : "Orders have been disabled."
    );
  } catch (error) {
    showNotification(
      "error",
      error.message ||
      "Unable to update store settings."
    );
  } finally {
    setOrdersControlSaving(false);
  }
};

const saveYoutubeShowcase = async (event) => {
  event.preventDefault();

  try {
    setYoutubeShowcaseSaving(true);

    const token = localStorage.getItem("jdm_token");

    const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/store-settings/youtube`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          youtubeShowcaseUrl
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update YouTube showcase."
      );
    }

    setYoutubeShowcaseUrl(
      data.youtubeShowcaseUrl || ""
    );

    showNotification(
      "success",
      "YouTube showcase updated successfully."
    );
  } catch (error) {
    showNotification(
      "error",
      error.message ||
        "Unable to update YouTube showcase."
    );
  } finally {
    setYoutubeShowcaseSaving(false);
  }
};

  const fetchReviews = async () => {
  setReviewLoading(true);
  setReviewError("");

  try {
    const token = localStorage.getItem("jdm_token");

    const response = await fetch(
      `${API_URL}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reviews.");
    }

    const data = await response.json();

    setReviews(data);
  } catch (error) {
    setReviewError("Unable to load reviews.");
  } finally {
    setReviewLoading(false);
  }
};

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showNotification(
        "error",
        "Unable to load products."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcement`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch announcement.");
      }

      const data = await response.json();
      setAnnouncement(data.text || "");
    } catch (error) {
      showNotification(
        "error",
        "Unable to load announcement."
      );
    } finally {
      setAnnouncementLoading(false);
    }
  };

  useEffect(() => {
  fetchOrders();
  fetchProducts();
  fetchAnnouncement();
  fetchReviews();
  fetchStoreSettings();
}, []);

  const saveAnnouncement = async (event) => {
    event.preventDefault();

    try {
      setAnnouncementSaving(true);

      const token = localStorage.getItem("jdm_token");

      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/announcement`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: announcement
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save announcement."
        );
      }

      setAnnouncement(data.text || "");

      showNotification(
        "success",
        "Announcement updated successfully."
      );
    } catch (error) {
      showNotification(
        "error",
        error.message
      );
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("jdm_token");

      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update order status."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === orderId
            ? data.order
            : order
        )
      );

      showNotification(
        "success",
        "Order status updated successfully."
      );
    } catch (error) {
      showNotification(
        "error",
        error.message ||
        "Unable to update order status."
      );
    }
  };

  const getReviewDate = (deliveryDate) => {
  if (!deliveryDate) {
    return "";
  }

  const date = new Date(`${deliveryDate}T12:00:00`);
  date.setDate(date.getDate() + 2);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
};

  const openDispatchModal = (order) => {
  setDispatchOrder(order);
  setShippingCourier("");
  setTrackingNumber("");
  setTrackingUrl("");
  setEstimatedDeliveryDate("");
  setReviewEmailScheduledAt("");
};

const closeDispatchModal = () => {
  setDispatchOrder(null);
  setShippingCourier("");
  setTrackingNumber("");
  setTrackingUrl("");
  setEstimatedDeliveryDate("");
  setReviewEmailScheduledAt("");
};

const confirmDispatch = async () => {
  if (!dispatchOrder) {
    return;
  }

  setDispatchSaving(true);

  try {
    const response = await fetch(
      `${API_URL}/orders/${dispatchOrder.orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "jdm_token"
          )}`
        },
        body: JSON.stringify({
  status: "shipped",
  shippingCourier,
  trackingNumber,
  trackingUrl,
  estimatedDeliveryDate,
  reviewEmailScheduledAt
})
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to dispatch order."
      );
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderId ===
        dispatchOrder.orderId
          ? data.order
          : order
      )
    );

    closeDispatchModal();

    showNotification(
      "success",
      "Order dispatched successfully."
    );
  } catch (error) {
    showNotification(
      "error",
      error.message ||
        "Unable to dispatch order."
    );
  } finally {
    setDispatchSaving(false);
  }
};

  const getAvailableOrderStatuses = (status) => {
    switch (status) {
      case "pending":
        return [
          {
            value: "pending",
            label: "PENDING"
          },
          {
            value: "confirmed",
            label: "CONFIRMED"
          },
          {
            value: "cancelled",
            label: "CANCELLED"
          }
        ];

      case "confirmed":
        return [
          {
            value: "confirmed",
            label: "CONFIRMED"
          },
          {
            value: "shipped",
            label: "DISPATCHED"
          },
          {
            value: "cancelled",
            label: "CANCELLED"
          }
        ];

      case "shipped":
        return [
          {
            value: "shipped",
            label: "DISPATCHED"
          },
          {
            value: "delivered",
            label: "DELIVERED"
          }
        ];

      case "delivered":
        return [
          {
            value: "delivered",
            label: "DELIVERED"
          }
        ];

      case "cancelled":
        return [
          {
            value: "cancelled",
            label: "CANCELLED"
          }
        ];

      default:
        return [
          {
            value: status,
            label: status.toUpperCase()
          }
        ];
    }
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "PENDING";

      case "confirmed":
        return "CONFIRMED";

      case "shipped":
        return "DISPATCHED";

      case "delivered":
        return "DELIVERED";

      case "cancelled":
        return "CANCELLED";

      default:
        return status.toUpperCase();
    }
  };

  const filteredOrders = orders.filter((order) => {
    const search = orderSearch
      .trim()
      .toLowerCase();

    const matchesSearch =
      !search ||
      (order.orderId || "")
        .toLowerCase()
        .includes(search) ||
      (order.customer?.name || "")
        .toLowerCase()
        .includes(search) ||
      (order.customer?.email || "")
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      orderStatusFilter === "all" ||
      order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedFilteredOrders = [...filteredOrders].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );

  const totalOrderPages = Math.ceil(
    sortedFilteredOrders.length / ITEMS_PER_PAGE
  );

  const paginatedOrders = sortedFilteredOrders.slice(
    (orderPage - 1) * ITEMS_PER_PAGE,
    orderPage * ITEMS_PER_PAGE
  );

  const updateProductStatus = async (
    productId,
    status
  ) => {
    try {
      const token = localStorage.getItem("jdm_token");

      const response = await fetch(
        `${PRODUCTS_API_URL}/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update product availability."
        );
      }

      const data = await response.json();

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? data.product
            : product
        )
      );

      showNotification(
        "success",
        "Product availability updated successfully."
      );
    } catch (error) {
      showNotification(
        "error",
        "Unable to update product availability."
      );
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      setDeletingProduct(true);

      const token = localStorage.getItem("jdm_token");

      const response = await fetch(
        `${PRODUCTS_API_URL}/${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to delete product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product.id !== productToDelete.id
        )
      );

      setProductToDelete(null);

      showNotification(
        "success",
        "Product deleted successfully."
      );
    } catch (error) {
      showNotification(
        "error",
        error.message
      );
    } finally {
      setDeletingProduct(false);
    }
  };

  const toggleProductMultiValue = (field, value) => {
    setNewProduct((currentProduct) => {
      const currentValues = Array.isArray(currentProduct[field])
        ? currentProduct[field]
        : [];

      const exists = currentValues.some(
        (item) => String(item).toLowerCase() === String(value).toLowerCase()
      );

      return {
        ...currentProduct,
        [field]: exists
          ? currentValues.filter(
              (item) => String(item).toLowerCase() !== String(value).toLowerCase()
            )
          : [...currentValues, value]
      };
    });
  };

  const handleProductChange = (event) => {
    const { name, value, type, checked } = event.target;

    setNewProduct((currentProduct) => ({
      ...currentProduct,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    setNewProduct((currentProduct) => ({
      ...currentProduct,
      images: files
    }));

    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview.url);
    });

    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setImagePreviews(previews);
  };

  const removeExistingImage = (index) => {
    setExistingImages((currentImages) =>
      currentImages.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  const removeNewImage = (index) => {
    setNewProduct((currentProduct) => ({
      ...currentProduct,
      images: currentProduct.images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    }));

    setImagePreviews((currentPreviews) => {
      const previewToRemove =
        currentPreviews[index];

      if (previewToRemove) {
        URL.revokeObjectURL(
          previewToRemove.url
        );
      }

      return currentPreviews.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  };

  const addProduct = async (event) => {
    event.preventDefault();

    try {
      const selectedVehicleMakers = Array.isArray(newProduct.vehicleMaker)
        ? newProduct.vehicleMaker.filter(Boolean)
        : [];

      const selectedTypes = Array.isArray(newProduct.type)
        ? newProduct.type.filter(Boolean)
        : [];

      console.log("SELECTED VEHICLE MAKERS:", selectedVehicleMakers);
console.log("SELECTED TYPES:", selectedTypes);

if (selectedVehicleMakers.length === 0) {
  throw new Error("At least one vehicle maker is required.");
}

      if (selectedTypes.length === 0) {
        throw new Error("At least one vehicle type is required.");
      }

      const token = localStorage.getItem("jdm_token");

      const formData = new FormData();

      formData.append(
  "id",
  newProduct.id.trim()
);

      formData.append(
        "name",
        newProduct.name
      );

      formData.append(
        "brand",
        newProduct.brand
      );

      console.log(
  "VEHICLE MAKER STATE:",
  newProduct.vehicleMaker,
  Array.isArray(newProduct.vehicleMaker)
);

console.log(
  "VEHICLE MAKER FORMEDATA:",
  formData.get("vehicleMaker")
);

      formData.append(
        "vehicleMaker",
        JSON.stringify(
          Array.isArray(newProduct.vehicleMaker)
            ? newProduct.vehicleMaker
            : String(newProduct.vehicleMaker || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
        )
      );

      formData.append(
        "scale",
        newProduct.scale
      );

      formData.append(
        "category",
        newProduct.category
      );

      console.log(
  "type being submitted:",
  newProduct.type,
  Array.isArray(newProduct.type)
);

      formData.append(
        "type",
        JSON.stringify(
          Array.isArray(newProduct.type)
          ? newProduct.type
          : String(newProduct.type || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
        )
      );

      formData.append(
        "series",
        newProduct.series || ""
      );

      formData.append(
        "about",
        newProduct.about || ""
      );

      formData.append(
        "price",
        Number(newProduct.price)
      );

      formData.append(
        "stock",
        Number(newProduct.stock)
      );

      formData.append(
        "status",
        newProduct.status
      );

      formData.append(
        "preOrderLimitEnabled",
        newProduct.preOrderLimitEnabled
      );

      if (
        newProduct.preOrderLimitEnabled
      ) {
        formData.append(
          "preOrderLimit",
          Number(newProduct.preOrderLimit)
        );
      }

      newProduct.images.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      const response = await fetch(
        PRODUCTS_API_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message ||
          data.error ||
          "Failed to create product."
        );
      }

      const data = await response.json();

      setProducts((currentProducts) => [
        ...currentProducts,
        data.product
      ]);

      resetProductForm();
      setShowAddProduct(false);

      showNotification(
        "success",
        "Product added successfully."
      );
    } catch (error) {
      showNotification(
        "error",
        error.message
      );
    }
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product.id);

    setNewProduct({
      id: product.id,
      name: product.name,
      brand: product.brand,
      vehicleMaker: Array.isArray(product.vehicleMaker)
        ? product.vehicleMaker
        : product.vehicleMaker
          ? [product.vehicleMaker]
          : [],
      scale: product.scale,
      category: product.category,
      type: Array.isArray(product.type)
        ? product.type
        : product.type
          ? [product.type]
          : [],
      series: product.series || "",
      about: product.about || "",
      price: product.price,
      stock:
        Number.isInteger(product.stock)
          ? product.stock
          : 0,
      status: product.status,
      preOrderLimitEnabled:
        product.preOrderLimitEnabled === true,
      preOrderLimit:
        product.preOrderLimit !== null &&
        product.preOrderLimit !== undefined
          ? product.preOrderLimit
          : "",
      images: []
    });

    setExistingImages(
      product.images || []
    );

    setImagePreviews([]);

    setShowAddProduct(true);

    setTimeout(() => {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  const editProduct = async (event) => {
    event.preventDefault();

    try {
      const selectedVehicleMakers = Array.isArray(newProduct.vehicleMaker)
        ? newProduct.vehicleMaker.filter(Boolean)
        : [];

      const selectedTypes = Array.isArray(newProduct.type)
        ? newProduct.type.filter(Boolean)
        : [];

      if (selectedVehicleMakers.length === 0) {
        throw new Error("At least one vehicle maker is required.");
      }

      if (selectedTypes.length === 0) {
        throw new Error("At least one vehicle type is required.");
      }

      const token = localStorage.getItem("jdm_token");

      const formData = new FormData();

      formData.append(
        "name",
        newProduct.name
      );

      formData.append(
        "brand",
        newProduct.brand
      );

      formData.append(
        "vehicleMaker",
        JSON.stringify(
          Array.isArray(newProduct.vehicleMaker)
            ? newProduct.vehicleMaker
            : String(newProduct.vehicleMaker || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
        )
      );

      formData.append(
        "scale",
        newProduct.scale
      );

      formData.append(
        "category",
        newProduct.category
      );

      formData.append(
        "type",
        JSON.stringify(
          Array.isArray(newProduct.type)
          ? newProduct.type
          : String(newProduct.type || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
        )
      );

      formData.append(
        "series",
        newProduct.series || ""
      );

      formData.append(
        "about",
        newProduct.about || ""
      );

      formData.append(
        "price",
        Number(newProduct.price)
      );

      formData.append(
        "stock",
        Number(newProduct.stock)
      );

      formData.append(
        "status",
        newProduct.status
      );

      formData.append(
        "preOrderLimitEnabled",
        newProduct.preOrderLimitEnabled
      );

      if (
        newProduct.preOrderLimitEnabled
      ) {
        formData.append(
          "preOrderLimit",
          Number(newProduct.preOrderLimit)
        );
      } else {
        formData.append(
          "preOrderLimit",
          ""
        );
      }

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      newProduct.images.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      const response = await fetch(
        `${PRODUCTS_API_URL}/${editingProductId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message ||
          data.error ||
          "Failed to update product."
        );
      }

      const data = await response.json();

      setProducts((currentProducts) =>
        currentProducts.map(
          (currentProduct) =>
            currentProduct.id ===
            editingProductId
              ? data.product
              : currentProduct
        )
      );

      resetProductForm();
      setShowAddProduct(false);

      showNotification(
        "success",
        "Product updated successfully."
      );
    } catch (error) {
      showNotification(
        "error",
        error.message
      );
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
  try {
    const token = localStorage.getItem("jdm_token");

    const response = await fetch(
      `${API_URL}/reviews/${reviewId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update review status.");
    }

    // Only pending reviews are shown in the admin carousel.
    // Once a review is approved or rejected, remove it from the queue.
    setReviews((currentReviews) =>
      currentReviews.filter((review) => review._id !== reviewId)
    );

    setReviewIndex(0);
    alert(`Review ${status} successfully.`);
  } catch (error) {
    alert(error.message || "Unable to update review status.");
  }
};

  const productCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  const filteredProducts =
    products.filter((product) => {
      const search = productSearch.trim().toLowerCase();
      const matchesCategory = productCategoryFilter === "all" || product.category === productCategoryFilter;
      const matchesSearch = !search || (
        String(product.id).toLowerCase().includes(search) ||
        (product.name || "").toLowerCase().includes(search) ||
        (product.brand || "").toLowerCase().includes(search) ||
        (Array.isArray(product.vehicleMaker)
          ? product.vehicleMaker.join(" ")
          : String(product.vehicleMaker || "")
        ).toLowerCase().includes(search)
      );

      return matchesCategory && matchesSearch;
    });

  const sortedFilteredProducts = [...filteredProducts].sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt || 0).getTime() -
      new Date(a.createdAt || a.updatedAt || 0).getTime()
  );

  const totalProductPages = Math.ceil(
    sortedFilteredProducts.length / ITEMS_PER_PAGE
  );

  const paginatedProducts = sortedFilteredProducts.slice(
    (productPage - 1) * ITEMS_PER_PAGE,
    productPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter]);

  useEffect(() => {
    setProductPage(1);
  }, [productSearch, productCategoryFilter]);

  if (loading) {
    return (
      <main className="admin-page">
        <section id="admin-overview" className="admin-header">
          <p className="eyebrow">
            ADMIN DASHBOARD
          </p>

          <h1>ORDERS.</h1>

          <p>
            {orders.length}{" "}
            {orders.length === 1
              ? "ORDER"
              : "ORDERS"}
          </p>
        </section>

        <section className="admin-stats">
          <div className="admin-stat">
            <span>TOTAL ORDERS</span>
            <strong>
              {orders.length}
            </strong>
          </div>

          <div className="admin-stat">
            <span>PENDING</span>
            <strong>
              {orders.filter(
                (order) =>
                  order.status ===
                  "pending"
              ).length}
            </strong>
          </div>

          <div className="admin-stat">
            <span>CONFIRMED</span>
            <strong>
              {orders.filter(
                (order) =>
                  order.status ===
                  "confirmed"
              ).length}
            </strong>
          </div>

          <div className="admin-stat">
            <span>DISPATCHED</span>
            <strong>
              {orders.filter(
                (order) =>
                  order.status ===
                  "shipped"
              ).length}
            </strong>
          </div>

          <div className="admin-stat">
            <span>DELIVERED</span>
            <strong>
              {orders.filter(
                (order) =>
                  order.status ===
                  "delivered"
              ).length}
            </strong>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <section className="admin-header">
          <p className="eyebrow">
            ADMIN DASHBOARD
          </p>

          <h1>
            UNABLE TO LOAD ORDERS.
          </h1>

          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <nav className="admin-navbar" aria-label="Admin sections">
        <a href="#admin-overview">Overview</a>
        <a href="#admin-orders">Orders</a>
        <a href="#admin-products">Products</a>
        <a href="#admin-catalog">Catalog Options</a>
        <a href="#admin-announcement">Announcement</a>
<a href="#admin-youtube">Homepage Video</a>
<a href="#admin-reviews">Reviews</a>
      </nav>

      {notification.message && (
        <div
          className={`admin-notification admin-notification-${notification.type}`}
          role="status"
        >
          <span>
            {notification.message}
          </span>

          <button
            type="button"
            onClick={clearNotification}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <section className="admin-header">
        <p className="eyebrow">
          ADMIN DASHBOARD
        </p>

        <h1>ORDERS.</h1>

        <p>
          {orders.length}{" "}
          {orders.length === 1
            ? "ORDER"
            : "ORDERS"}
        </p>
      </section>

      <section className="admin-order-filters">
        <div className="admin-product-search">
          <div className="admin-product-search-wrapper">
            <input
              type="text"
              value={orderSearch}
              onChange={(event) =>
                setOrderSearch(
                  event.target.value
                )
              }
              placeholder="SEARCH BY ORDER ID, CUSTOMER OR EMAIL"
            />

            {orderSearch && (
              <button
                type="button"
                onClick={() =>
                  setOrderSearch("")
                }
                aria-label="Clear order search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="admin-order-status-filter">
          <label>
            FILTER BY STATUS
          </label>

          <select
            value={orderStatusFilter}
            onChange={(event) =>
              setOrderStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              ALL ORDERS
            </option>

            <option value="pending">
              PENDING
            </option>

            <option value="confirmed">
              CONFIRMED
            </option>

            <option value="shipped">
              DISPATCHED
            </option>

            <option value="delivered">
              DELIVERED
            </option>

            <option value="cancelled">
              CANCELLED
            </option>
          </select>
        </div>
      </section>

      <section className="admin-stats">
        <div className="admin-stat">
          <span>TOTAL ORDERS</span>
          <strong>
            {orders.length}
          </strong>
        </div>

        <div className="admin-stat">
          <span>PENDING</span>
          <strong>
            {orders.filter(
              (order) =>
                order.status ===
                "pending"
            ).length}
          </strong>
        </div>

        <div className="admin-stat">
          <span>CONFIRMED</span>
          <strong>
            {orders.filter(
              (order) =>
                order.status ===
                "confirmed"
            ).length}
          </strong>
        </div>

        <div className="admin-stat">
          <span>DISPATCHED</span>
          <strong>
            {orders.filter(
              (order) =>
                order.status ===
                "shipped"
            ).length}
          </strong>
        </div>

        <div className="admin-stat">
          <span>DELIVERED</span>
          <strong>
            {orders.filter(
              (order) =>
                order.status ===
                "delivered"
            ).length}
          </strong>
        </div>
            </section>

            <section id="admin-announcement" className="admin-announcement">
  <div className="admin-products-header">
    <p className="eyebrow">
      STORE ANNOUNCEMENT
    </p>

    <h2>ANNOUNCEMENT.</h2>

    <p>
      Update the announcement displayed on your store.
    </p>
  </div>

  {announcementLoading ? (
    <p>Loading announcement...</p>
  ) : (
    <form
      className="admin-announcement-form"
      onSubmit={saveAnnouncement}
    >
      <textarea
        value={announcement}
        onChange={(event) =>
          setAnnouncement(event.target.value)
        }
        placeholder="ENTER STORE ANNOUNCEMENT"
        rows="4"
        maxLength={500}
      />

      <div className="admin-announcement-footer">
        <span>
          {announcement.length}/500
        </span>

        <button
          type="submit"
          className="admin-save-announcement-button"
          disabled={announcementSaving}
        >
          {announcementSaving
            ? "SAVING..."
            : "SAVE ANNOUNCEMENT"}
        </button>
      </div>
    </form>
  )}
</section>

<section
  id="admin-youtube"
  className="admin-announcement"
>
  <div className="admin-products-header">
    <p className="eyebrow">
      HOMEPAGE VIDEO
    </p>

    <h2>FROM OUR GARAGE.</h2>

    <p>
      Set the YouTube video displayed on the homepage showcase.
    </p>
  </div>

  <form
    className="admin-announcement-form"
    onSubmit={saveYoutubeShowcase}
  >
    <input
      type="url"
      value={youtubeShowcaseUrl}
      onChange={(event) =>
        setYoutubeShowcaseUrl(event.target.value)
      }
      placeholder="PASTE YOUTUBE VIDEO URL"
    />

    <div className="admin-announcement-footer">
      <span>
        {youtubeShowcaseUrl
          ? "VIDEO URL SET"
          : "NO VIDEO SET"}
      </span>

      <button
        type="submit"
        className="admin-save-announcement-button"
        disabled={youtubeShowcaseSaving}
      >
        {youtubeShowcaseSaving
          ? "SAVING..."
          : "SAVE VIDEO"}
      </button>
    </div>
  </form>
</section>

<section id="admin-store-orders" className="admin-store-orders">
  <div className="admin-products-header">
    <p className="eyebrow">
      STORE ORDERS
    </p>

    <h2>ORDER AVAILABILITY.</h2>

    <p>
      Control whether customers can place new orders.
      Existing orders are not affected.
    </p>
  </div>

  {ordersControlLoading ? (
    <p>Loading order availability...</p>
  ) : (
    <div className="admin-store-orders-control">

      <div>
        <span className="admin-store-orders-status-label">
          CURRENT STATUS
        </span>

        <strong>
          {ordersEnabled
            ? "ORDERS ENABLED"
            : "ORDERS DISABLED"}
        </strong>
      </div>

      <button
        type="button"
        onClick={toggleOrders}
        disabled={ordersControlSaving}
      >
        {ordersControlSaving
          ? "UPDATING..."
          : ordersEnabled
            ? "DISABLE ORDERS"
            : "ENABLE ORDERS"}
      </button>

    </div>
  )}
</section>

      <section id="admin-reviews" className="admin-reviews">
        <div className="admin-products-header">
          <p className="eyebrow">
            REVIEW MANAGEMENT
          </p>

          <h2>CUSTOMER REVIEWS.</h2>

          <p>
            Review customer feedback before it appears publicly
            on your store.
          </p>
        </div>

        {reviewLoading && (
          <p>Loading reviews...</p>
        )}

        {reviewError && (
          <p className="admin-error">
            {reviewError}
          </p>
        )}

        {!reviewLoading &&
          !reviewError &&
          reviews.filter((review) => review.status === "pending").length === 0 && (
            <p>No reviews awaiting approval.</p>
          )}

        {!reviewLoading && !reviewError && reviews.filter((review) => review.status === "pending").length > 0 && (
          <div className="admin-review-carousel">
            {(() => {
              const pendingReviews = reviews.filter(
                (review) => review.status === "pending"
              );

              const safeIndex = Math.min(
                reviewIndex,
                pendingReviews.length - 1
              );

              const review = pendingReviews[safeIndex];

              return (
                <>
                  <article
                    className="admin-review-card"
                    key={review._id}
                  >
                    <div className="admin-review-header">
                      <div>
                        <h3>{review.customerName}</h3>
                        <p>{review.customerEmail}</p>
                      </div>

                      <span className={`review-status ${review.status}`}>
                        {review.status.toUpperCase()}
                      </span>
                    </div>

                    <p>
                      <strong>Product ID:</strong> {review.productId}
                    </p>

                    <p>
                      <strong>Order ID:</strong> {review.orderId}
                    </p>

                    <p>
                      <strong>Rating:</strong>{" "}
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>

                    <p className="admin-review-comment">
                      {review.comment}
                    </p>

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>

                    <div className="admin-review-actions">
                      <button
                        type="button"
                        onClick={() =>
                          updateReviewStatus(review._id, "approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateReviewStatus(review._id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </article>

                  {pendingReviews.length > 1 && (
                    <div className="admin-review-carousel-controls">
                      <button
                        type="button"
                        onClick={() =>
                          setReviewIndex(
                            (safeIndex - 1 + pendingReviews.length) %
                              pendingReviews.length
                          )
                        }
                      >
                        PREVIOUS
                      </button>

                      <span>
                        REVIEW {safeIndex + 1} OF {pendingReviews.length}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setReviewIndex(
                            (safeIndex + 1) % pendingReviews.length
                          )
                        }
                      >
                        NEXT
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </section>

      <section className="admin-products">

      <section id="admin-orders" className="admin-orders">
        {filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <h2>
              NO MATCHING ORDERS.
            </h2>

            <p>
              Try changing the search or
              status filter.
            </p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <article
              className="admin-order-card"
              key={order.orderId}
            >
              <div className="admin-order-header">
                <div>
                  <span>
                    ORDER NUMBER
                  </span>

                  <strong>
                    {order.orderId}
                  </strong>
                </div>

                <div>
                  <span>
                    ORDER DATE
                  </span>

                  <strong>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    CUSTOMER
                  </span>

                  <strong>
                    {order.customer.name}
                  </strong>
                </div>

                <div>
                  <span>TOTAL</span>

                  <strong>
                    ₹
                    {order.total.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-order-body">
                <div>
                  <span>ITEMS</span>

                  {order.items.map(
                    (item) => (
                      <p
                        key={
                          item.productId
                        }
                      >
                        {item.name} ×{" "}
                        {item.quantity}
                      </p>
                    )
                  )}
                </div>

                <div className="admin-order-customer-info">
                  <div>
                    <span>CUSTOMER DETAILS</span>

                    <p>
                      <strong>Name:</strong>{" "}
                      {order.customer?.name || "—"}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {order.customer?.email || "—"}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {order.customer?.phone || "—"}
                    </p>
                  </div>

                  <div>
                    <span>SHIPPING ADDRESS</span>

                    <p>
                      {order.shippingAddress?.address || "—"}
                    </p>

                    <p>
                      {order.shippingAddress?.city || "—"},{" "}
                      {order.shippingAddress?.state || "—"} -{" "}
                      {order.shippingAddress?.pincode || "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <span>STATUS</span>

                  <select
                    value={
                      order.status
                    }
                    onChange={(event) => {
  const nextStatus =
    event.target.value;

  if (
    nextStatus === "shipped" &&
    order.status === "confirmed"
  ) {
    openDispatchModal(order);
    return;
  }

  updateStatus(
    order.orderId,
    nextStatus
  );
}}
                    disabled={
                      order.status ===
                        "delivered" ||
                      order.status ===
                        "cancelled"
                    }
                  >
                    {getAvailableOrderStatuses(
                      order.status
                    ).map((option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))
        )}

        {totalOrderPages > 1 && (
          <div className="pagination-controls">
            <button
              type="button"
              onClick={() =>
                setOrderPage((currentPage) =>
                  Math.max(currentPage - 1, 1)
                )
              }
              disabled={orderPage === 1}
            >
              PREVIOUS
            </button>

            <span>
              PAGE {orderPage} OF {totalOrderPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setOrderPage((currentPage) =>
                  Math.min(
                    currentPage + 1,
                    totalOrderPages
                  )
                )
              }
              disabled={orderPage === totalOrderPages}
            >
              NEXT
            </button>
          </div>
        )}
      </section>

      <section id="admin-catalog" className="admin-catalog">
        <div className="admin-products-header">
          <p className="eyebrow">CATALOG SETTINGS</p>
          <h2>SCALE, MAKERS & TYPES.</h2>
          <p>Manage the options available while adding or editing products. These options are saved in this browser.</p>
        </div>

        <div className="admin-catalog-grid">
          {[
  ["scales", "Scale"],
  ["modelMakers", "Model Brand"],
  ["vehicleMakers", "Vehicle Maker"],
  ["types", "Vehicle Type"]
].map(([key, label]) => (
            <div className="admin-catalog-card" key={key}>
              <h3>{label.toUpperCase()}</h3>
              <div className="admin-catalog-add">
                <input
                  type="text"
                  value={newCatalogValue[key]}
                  onChange={(event) => setNewCatalogValue((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={`ADD ${label.toUpperCase()}`}
                />
                <button type="button" onClick={() => addCatalogOption(key, label)}>ADD</button>
              </div>
              <div className="admin-catalog-tags">
                {catalogOptions[key].map((value) => (
                  <span key={value}>
                    {value}
                    <button type="button" onClick={() => removeCatalogOption(key, value)} aria-label={`Remove ${value}`}>×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="admin-products" className="admin-products">
        <div className="admin-products-header">
          <p className="eyebrow">
            PRODUCT MANAGEMENT
          </p>

          <h2>AVAILABILITY.</h2>

          <p>
            Change the availability of
            products shown in the shop.
          </p>
        </div>

        <button
          className="admin-add-product-button"
          type="button"
          onClick={() => {
            if (showAddProduct) {
              resetProductForm();
            }

            setShowAddProduct(
              (current) => !current
            );
          }}
        >
          {showAddProduct
            ? "CLOSE"
            : "ADD PRODUCT"}
        </button>

        {showAddProduct && (
          <form
            ref={productFormRef}
            className="admin-product-form"
            onSubmit={
              editingProductId !== null
                ? editProduct
                : addProduct
            }
          >
            <div className="admin-form-grid">
              <div>
                <label>
                  PRODUCT ID
                </label>

                <input
  type="text"
  name="id"
  value={newProduct.id}
  onChange={handleProductChange}
  disabled={editingProductId !== null}
  placeholder="e.g. CCA-LAM-STO-001"
  required
/>
              </div>

              <div>
                <label>
                  PRODUCT NAME
                </label>

                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={
                    handleProductChange
                  }
                  required
                />
              </div>

              <div>
                <label>BRAND</label>

                <input
                  type="text"
                  name="brand"
                  value={newProduct.brand}
                  onChange={
                    handleProductChange
                  }
                  required
                />
              </div>

              <div>
                <label>VEHICLE MAKER</label>

                <div className="admin-multi-select-options">
                  {catalogOptions.vehicleMakers.map((maker) => {
                    const selected = Array.isArray(newProduct.vehicleMaker) &&
                      newProduct.vehicleMaker.some(
                        (item) => String(item).toLowerCase() === maker.toLowerCase()
                      );

                    return (
                      <label key={maker} className="admin-multi-select-option">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleProductMultiValue("vehicleMaker", maker)
                          }
                        />
                        <span>{maker}</span>
                      </label>
                    );
                  })}
                </div>

                {Array.isArray(newProduct.vehicleMaker) &&
                  newProduct.vehicleMaker.length > 0 && (
                    <span className="admin-field-hint">
                      SELECTED: {newProduct.vehicleMaker.join(", ")}
                    </span>
                  )}
              </div>

              <div>
                <label>SCALE</label>

                <select
                  name="scale"
                  value={newProduct.scale}
                  onChange={handleProductChange}
                  required
                >
                  {catalogOptions.scales.map((scale) => (
                    <option key={scale} value={scale}>{scale}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>CATEGORY</label>

                <select
                  name="category"
                  value={
                    newProduct.category
                  }
                  onChange={
                    handleProductChange
                  }
                  required
                >
                  <option value="new-arrivals">
                    NEW ARRIVALS
                  </option>

                  <option value="pre-orders">
                    PRE-ORDERS
                  </option>

                  <option value="best-sellers">
                    BEST SELLERS
                  </option>

                  <option value="featured">
                    FEATURED
                  </option>

                  <option value="sale">
                    SALE
                  </option>
                </select>
              </div>

              <div>
                <label>TYPE</label>

                <div className="admin-multi-select-options">
                  {catalogOptions.types.map((type) => {
                    const selected = Array.isArray(newProduct.type) &&
                      newProduct.type.some(
                        (item) => String(item).toLowerCase() === type.toLowerCase()
                      );

                    return (
                      <label key={type} className="admin-multi-select-option">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleProductMultiValue("type", type)
                          }
                        />
                        <span>{type}</span>
                      </label>
                    );
                  })}
                </div>

                {Array.isArray(newProduct.type) &&
                  newProduct.type.length > 0 && (
                    <span className="admin-field-hint">
                      SELECTED: {newProduct.type.join(", ")}
                    </span>
                  )}
              </div>

              <div>
                <label>SERIES</label>

                <input
                  type="text"
                  name="series"
                  value={newProduct.series}
                  onChange={
                    handleProductChange
                  }
                />
              </div>

              <div className="admin-form-full">
                <label>
                  ABOUT THIS MODEL
                </label>

                <textarea
                  name="about"
                  value={newProduct.about}
                  onChange={
                    handleProductChange
                  }
                  placeholder="WRITE A DESCRIPTION FOR THIS MODEL"
                  rows="7"
                  maxLength={2000}
                />

                <span className="admin-field-hint">
                  {newProduct.about.length}/2000
                </span>
              </div>

              <div>
                <label>PRICE</label>

                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={
                    handleProductChange
                  }
                  min="0"
                  required
                />
              </div>

              <div>
                <label>
                  STOCK
                </label>

                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={
                    handleProductChange
                  }
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label>
                  AVAILABILITY
                </label>

                <select
                  name="status"
                  value={
                    newProduct.status
                  }
                  onChange={
                    handleProductChange
                  }
                >
                  <option value="in-stock">
                    IN STOCK
                  </option>

                  <option value="pre-order">
                    PRE-ORDER
                  </option>

                  <option value="out-of-stock">
                    OUT OF STOCK
                  </option>
                </select>
              </div>

              <div className="admin-form-full">
                <label>
                  PRE-ORDER LIMIT
                </label>

                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="preOrderLimitEnabled"
                      checked={
                        newProduct.preOrderLimitEnabled
                      }
                      onChange={
                        handleProductChange
                      }
                    />{" "}
                    ENABLE PRE-ORDER LIMIT
                  </label>
                </div>

                {newProduct.preOrderLimitEnabled && (
                  <div>
                    <input
                      type="number"
                      name="preOrderLimit"
                      value={
                        newProduct.preOrderLimit
                      }
                      onChange={
                        handleProductChange
                      }
                      min="1"
                      step="1"
                      placeholder="MAXIMUM PRE-ORDER QUANTITY"
                      required
                    />
                  </div>
                )}

                {!newProduct.preOrderLimitEnabled && (
                  <span className="admin-field-hint">
                    PRE-ORDERS ARE UNLIMITED
                  </span>
                )}
              </div>

              <div className="admin-form-full">
                <label>
                  PRODUCT IMAGES
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  required={
                    editingProductId === null &&
                    existingImages.length === 0 &&
                    newProduct.images.length === 0
                  }
                />

                {existingImages.length >
                  0 && (
                  <div className="admin-image-preview-grid">
                    {existingImages.map(
                      (image, index) => (
                        <div
                          className="admin-image-preview"
                          key={`${image}-${index}`}
                        >
                          <img
                            src={imageUrl(
                              image
                            )}
                            alt=""
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(
                                index
                              )
                            }
                          >
                            REMOVE
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {imagePreviews.length >
                  0 && (
                  <div className="admin-image-preview-grid">
                    {imagePreviews.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          className="admin-image-preview"
                          key={image.url}
                        >
                          <img
                            src={image.url}
                            alt=""
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeNewImage(
                                index
                              )
                            }
                          >
                            REMOVE
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              className="admin-save-product-button"
              type="submit"
            >
              {editingProductId !== null
                ? "SAVE CHANGES"
                : "ADD PRODUCT"}
            </button>
          </form>
        )}

        {productsLoading ? (
          <div className="admin-empty">
            <h2>
              LOADING PRODUCTS.
            </h2>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <h2>
              NO PRODUCTS.
            </h2>
          </div>
        ) : (
          <>
            <div className="admin-product-search">
              <div className="admin-product-search-wrapper">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(
                      event.target.value
                    )
                  }
                  placeholder="SEARCH PRODUCTS BY ID, NAME, BRAND OR MAKER"
                />

                {productSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setProductSearch("")
                    }
                    aria-label="Clear product search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="admin-product-category-filter">
              <label htmlFor="product-category-filter">FILTER BY CATEGORY</label>
              <select
                id="product-category-filter"
                value={productCategoryFilter}
                onChange={(event) => setProductCategoryFilter(event.target.value)}
              >
                <option value="all">ALL CATEGORIES</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/-/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {filteredProducts.length ===
            0 ? (
              <div className="admin-empty">
                <h2>
                  NO MATCHING PRODUCTS.
                </h2>

                <p>
                  Try searching by product
                  ID, name, brand or vehicle
                  maker.
                </p>
              </div>
            ) : (
              <div className="admin-product-list">
                {paginatedProducts.map(
                  (product) => (
                    <article
                      className="admin-product-card"
                      key={product.id}
                    >
                      <div className="admin-product-info">
                        <span>
                          {product.brand}
                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          ·{" "}
                          {product.scale}
                        </p>

                        <p>
                          {product.status ===
                          "pre-order"
                            ? product.preOrderLimitEnabled
                              ? `${product.preOrderCount || 0}/${product.preOrderLimit} PRE-ORDERED`
                              : `${product.preOrderCount || 0} PRE-ORDERED`
                            : `${Number.isInteger(product.stock) ? product.stock : 0} IN STOCK`}
                        </p>
                      </div>

                      <div className="admin-product-status">
                        <span>
                          AVAILABILITY
                        </span>

                        <select
                          value={
                            product.status
                          }
                          onChange={(event) =>
                            updateProductStatus(
                              product.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="in-stock">
                            IN STOCK
                          </option>

                          <option value="pre-order">
                            PRE-ORDER
                          </option>

                          <option value="out-of-stock">
                            OUT OF STOCK
                          </option>
                        </select>

                        <div className="admin-product-actions">
                          <button
                            type="button"
                            onClick={() => {
                              startEditingProduct(
                                product
                              );
                            }}
                            className="admin-edit-product-button"
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setProductToDelete(
                                product
                              )
                            }
                            className="admin-delete-product-button"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}

                {totalProductPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      type="button"
                      onClick={() =>
                        setProductPage((currentPage) =>
                          Math.max(currentPage - 1, 1)
                        )
                      }
                      disabled={productPage === 1}
                    >
                      PREVIOUS
                    </button>

                    <span>
                      PAGE {productPage} OF {totalProductPages}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setProductPage((currentPage) =>
                          Math.min(
                            currentPage + 1,
                            totalProductPages
                          )
                        )
                      }
                      disabled={productPage === totalProductPages}
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {productToDelete && (
        <div className="admin-confirm-overlay">
          <div className="admin-confirm-modal">
            <p className="eyebrow">
              PERMANENT ACTION
            </p>

            <h2>
              DELETE PRODUCT?
            </h2>

            <p>
              Are you sure you want to
              permanently delete{" "}
              <strong>
                {productToDelete.name}
              </strong>
              ?
            </p>

            <p>
              This action cannot be undone.
            </p>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="admin-cancel-delete-button"
                onClick={() =>
                  setProductToDelete(null)
                }
                disabled={
                  deletingProduct
                }
              >
                CANCEL
              </button>

              <button
                type="button"
                className="admin-confirm-delete-button"
                onClick={deleteProduct}
                disabled={
                  deletingProduct
                }
              >
                {deletingProduct
                  ? "DELETING..."
                  : "DELETE PRODUCT"}
              </button>
            </div>
          </div>
        </div>
      )}
            </section>
      {dispatchOrder && (
  <div className="admin-dispatch-overlay">
    <div className="admin-dispatch-modal">
      <p className="eyebrow">
        ORDER DISPATCH
      </p>

      <h2>
        DISPATCH ORDER.
      </h2>

      <div className="admin-dispatch-form">
        <div className="admin-dispatch-field">
          <label>
            DELIVERY PARTNER
          </label>

          <input
            type="text"
            value={shippingCourier}
            onChange={(event) =>
              setShippingCourier(
                event.target.value
              )
            }
            placeholder="Blue Dart"
          />
        </div>

        <div className="admin-dispatch-field">
          <label>
            TRACKING NUMBER
          </label>

          <input
            type="text"
            value={trackingNumber}
            onChange={(event) =>
              setTrackingNumber(
                event.target.value
              )
            }
            placeholder="BD123456789"
          />
        </div>

        <div className="admin-dispatch-field">
          <label>
            TRACKING URL
          </label>

          <input
            type="url"
            value={trackingUrl}
            onChange={(event) =>
              setTrackingUrl(
                event.target.value
              )
            }
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
  <label htmlFor="estimatedDeliveryDate">
    Estimated Delivery Date
  </label>

  <input
    type="date"
    id="estimatedDeliveryDate"
    value={estimatedDeliveryDate}
    onChange={(e) => {
      const selectedDate = e.target.value;

      setEstimatedDeliveryDate(selectedDate);
      setReviewEmailScheduledAt(
        getReviewDate(selectedDate)
      );
    }}
    min={new Date().toISOString().split("T")[0]}
    required
  />
</div>

<div className="form-group">
  <label htmlFor="reviewEmailScheduledAt">
    Review Email Date
  </label>

  <input
    type="date"
    id="reviewEmailScheduledAt"
    value={reviewEmailScheduledAt}
    onChange={(e) =>
      setReviewEmailScheduledAt(
        e.target.value
      )
    }
    min={
      estimatedDeliveryDate ||
      new Date().toISOString().split("T")[0]
    }
    required
  />

  <small>
    Automatically set to 2 days after estimated
    delivery. You can change it manually.
  </small>
</div>

        <div className="admin-dispatch-actions">
          <button
            type="button"
            className="admin-dispatch-cancel"
            onClick={closeDispatchModal}
            disabled={dispatchSaving}
          >
            CANCEL
          </button>

          <button
            type="button"
            className="admin-dispatch-submit"
            onClick={confirmDispatch}
            disabled={
  dispatchSaving ||
  !shippingCourier.trim() ||
  !trackingNumber.trim() ||
  !trackingUrl.trim() ||
  !estimatedDeliveryDate ||
  !reviewEmailScheduledAt
}
          >
            {dispatchSaving
              ? "DISPATCHING..."
              : "DISPATCH ORDER"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </main>
  );
}

export default Admin;