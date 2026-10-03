import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import {
  createOrder,
  verifyPayment,
  cancelPayment
} from "../api/orders";
import { getUserData } from "../api/user";

function Checkout({ cart, setCart }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentError, setPaymentError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });

  const token =
    localStorage.getItem("jdm_token");

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadAddresses = async () => {
      try {
        const data = await getUserData();
        console.log("Saved addresses:", data.addresses);
        setSavedAddresses(data.addresses || []);
      } catch (error) {
        console.error(
          "Unable to load saved addresses:",
          error
        );
      }
    };

    loadAddresses();
  }, [token]);

  useEffect(() => {
    if (window.Razorpay) {
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (
        document.body.contains(script)
      ) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const shipping =
    subtotal > 3000 ? 0 : 150;

  const total =
    subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setPaymentError("");
    setIsSubmitting(true);

    console.log("CART BEING SENT:", cart);

    const newOrder = {
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },

      shippingAddress: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: "India"
      },

      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const result =
        await createOrder(newOrder);

      const razorpayOrder =
        result.razorpay;

      if (!razorpayOrder) {
        throw new Error(
          "Unable to start payment. Please try again."
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Payment system is still loading. Please try again."
        );
      }

      const currentOrderId =
        result.order.orderId;

      let cancellationHandled =
        false;

      const releaseReservation =
        async () => {
          if (cancellationHandled) {
            return;
          }

          cancellationHandled = true;

          try {
            await cancelPayment(
              currentOrderId
            );
          } catch (error) {
            console.error(
              "Unable to release payment reservation:",
              error
            );
          }
        };

      const options = {
        key: razorpayOrder.keyId,

        amount: razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name: "Just Diecast Minis",

        description: "JDM Order",

        order_id:
          razorpayOrder.orderId,

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },

        theme: {
          color: "#df1532"
        },

        handler: async (response) => {
          try {
            const verification =
              await verifyPayment({
                orderId:
                  currentOrderId,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature
              });

            if (!verification) {
              throw new Error(
                "Payment verification failed."
              );
            }

            setOrderId(
              currentOrderId
            );

            setConfirmedTotal(
              result.order.total
            );

            setOrderPlaced(true);
            setCart([]);
            setIsSubmitting(false);
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setPaymentError(
              "Payment verification could not be completed. Please contact support if your payment was deducted."
            );

            setIsSubmitting(false);
          }
        },

        modal: {
          ondismiss: async () => {
            await releaseReservation();

            setPaymentError(
              "Payment was cancelled. Your cart has not been cleared."
            );

            setIsSubmitting(false);
          }
        }
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        async (response) => {
          console.error(
            "Razorpay payment failed:",
            response
          );

          await releaseReservation();

          setPaymentError(
            response.error?.description ||
            "Payment failed. Please try again."
          );

          setIsSubmitting(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Unable to create payment order:",
        error
      );

      setPaymentError(
        error.message ||
        "Unable to start payment. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="eyebrow">
            CHECKOUT
          </p>

          <h1>
            LOGIN REQUIRED.
          </h1>

          <p>
            Please log in to your account
            before proceeding to checkout.
          </p>

          <Link
            to="/login"
            state={{
              from: "/checkout"
            }}
            className="checkout-shop-btn"
            onClick={() => {
              sessionStorage.setItem(
                "jdm_guest_cart",
                JSON.stringify(cart)
              );
            }}
          >
            LOGIN TO CHECKOUT
          </Link>

          <Link
            to="/cart"
            className="checkout-back-cart"
          >
            ← BACK TO CART
          </Link>
        </section>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <section className="order-confirmation">
          <p className="eyebrow">
            ORDER CONFIRMED
          </p>

          <h1>
            THANK YOU.
          </h1>

          <p className="order-confirmation-message">
            Your order has been successfully placed.
          </p>

          <div className="order-confirmation-box">
            <span>
              ORDER NUMBER
            </span>

            <strong>
              {orderId}
            </strong>
          </div>

          <div className="order-confirmation-details">
            <div>
              <span>
                DELIVERING TO
              </span>

              <strong>
                {formData.name}
              </strong>
            </div>

            <div>
              <span>
                EMAIL
              </span>

              <strong>
                {formData.email}
              </strong>
            </div>

            <div>
              <span>
                TOTAL
              </span>

              <strong>
                ₹
                {confirmedTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>

          <p className="order-confirmation-note">
            We'll use the contact details provided
            at checkout for order updates.
          </p>

          <Link
            to="/orders"
            className="order-confirmation-button"
          >
            VIEW MY ORDERS
          </Link>

          <Link
            to="/shop"
            className="order-confirmation-secondary"
          >
            ← CONTINUE SHOPPING
          </Link>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="eyebrow">
            CHECKOUT
          </p>

          <h1>
            YOUR CART IS EMPTY.
          </h1>

          <p>
            Add something to your collection
            before proceeding to checkout.
          </p>

          <Link
            to="/shop"
            className="checkout-shop-btn"
          >
            BACK TO SHOP
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-header">
        <p className="eyebrow">
          YOUR ORDER
        </p>

        <h1>
          CHECKOUT.
        </h1>
      </section>

      <section className="checkout-content">
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <div className="checkout-section">
            <div className="checkout-section-heading">
              <p className="eyebrow">
                01
              </p>

              <h2>
                CONTACT INFORMATION
              </h2>
            </div>

            <div className="checkout-fields">
              <div className="checkout-field">
                <label htmlFor="name">
                  FULL NAME
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="YOUR NAME"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="YOUR EMAIL"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">
                  PHONE NUMBER
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="YOUR PHONE NUMBER"
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-heading">
              <p className="eyebrow">
                02
              </p>

              <h2>
                DELIVERY ADDRESS
              </h2>
            </div>

            {savedAddresses.length > 0 && (
              <div className="checkout-saved-addresses">
                <p className="checkout-saved-title">
                  SAVED ADDRESSES
                </p>

                <div className="checkout-saved-address-list">
                  {savedAddresses.map(
                    (
                      savedAddress,
                      index
                    ) => (
                      <div
                        className="checkout-saved-address"
                        key={index}
                      >
                        <div>
                          <strong>
                            {
                              savedAddress.address
                            }
                          </strong>

                          <p>
                            {
                              savedAddress.city
                            }
                            ,{" "}
                            {
                              savedAddress.state
                            }{" "}
                            {
                              savedAddress.pincode
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(
                              (
                                current
                              ) => ({
                                ...current,
                                address:
                                  savedAddress.address,
                                city:
                                  savedAddress.city,
                                state:
                                  savedAddress.state,
                                pincode:
                                  savedAddress.pincode,
                                country:
                                  "India"
                              })
                            );
                          }}
                        >
                          USE THIS ADDRESS
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="checkout-fields">
              <div className="checkout-field checkout-field-full">
                <label htmlFor="address">
                  FULL DELIVERY ADDRESS
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={
                    "Flat / House No., Street, Area,\n" +
                    "Landmark (if available)"
                  }
                  rows="4"
                  required
                />

                <small className="checkout-field-hint">
                  Include your flat or house number, street, area,
                  and a nearby landmark if available.
                </small>
              </div>

              <div className="checkout-field">
                <label htmlFor="city">
                  CITY
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="CITY"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="state">
                  STATE
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="STATE"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="pincode">
                  PIN CODE
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="PIN CODE"
                  required
                />
              </div>

              <div className="checkout-field checkout-field-full">
                <label htmlFor="country">
                  COUNTRY
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  value="India"
                  readOnly
                />

                <small className="checkout-field-hint">
                  International shipping is currently unavailable.
                </small>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-heading">
              <p className="eyebrow">
                03
              </p>

              <h2>
                PAYMENT
              </h2>
            </div>

            <div className="checkout-payment-placeholder">
              <span>
                RAZORPAY SECURE CHECKOUT
              </span>

              <p>
                You'll be redirected to Razorpay's
                secure payment window after placing
                your order.
              </p>
            </div>

            {paymentError && (
              <p className="checkout-payment-error">
                {paymentError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="checkout-place-order"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "OPENING PAYMENT..."
              : "PAY NOW"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>
            ORDER SUMMARY
          </h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <div
                className="checkout-item"
                key={item.id}
              >
                <div className="checkout-item-image">
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                  />
                </div>

                <div className="checkout-item-info">
                  <p className="product-maker">
                    {item.brand}
                  </p>

                  <h3>
                    {item.name}
                  </h3>

                  <span>
                    Qty: {item.quantity}
                  </span>
                </div>

                <strong>
                  ₹
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-summary-lines">
            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                Shipping
              </span>

              <strong>
                {shipping === 0
                  ? "FREE"
                  : `₹${shipping}`}
              </strong>
            </div>
          </div>

          <div className="checkout-total">
            <span>
              TOTAL
            </span>

            <strong>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <Link
            to="/cart"
            className="checkout-back-cart"
          >
            ← BACK TO CART
          </Link>
        </aside>
      </section>
    </main>
  );
}

const getImageSrc = (item) => {
  const image =
    item.images?.[0] ||
    item.image;

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `/${image.replace(
    "public/",
    ""
  )}`;
};

export default Checkout;