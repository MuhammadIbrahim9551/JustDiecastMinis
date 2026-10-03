import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrders, cancelOrder } from "../api/orders";
import "../App.css";

const getImageSrc = (item) => {
  const image = item.images?.[0] || item.image;

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return `/${image.replace(/^public\//, "")}`;
};

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orders = await getOrders();

        const foundOrder = orders.find(
          (item) => item.orderId === orderId
        );

        if (!foundOrder) {
          setError("Order not found.");
          return;
        }

        setOrder(foundOrder);
      } catch (error) {
        setError("Unable to load this order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? A refund will be processed."
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setCancelMessage("");
    setCancelError("");

    try {
      const result = await cancelOrder(
        order.orderId,
        cancellationReason
      );

      setOrder(result.order);

      setCancelMessage(
        "Your order has been cancelled and your refund has been processed."
      );
    } catch (error) {
      setCancelError(
        error.message || "Unable to cancel this order."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <section className="orders-empty">
          <p className="eyebrow">ORDER DETAILS</p>
          <h1>LOADING ORDER.</h1>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <section className="orders-empty">
          <p className="eyebrow">ORDER DETAILS</p>
          <h1>ORDER NOT FOUND.</h1>
          <p>{error}</p>

          <Link
            to="/orders"
            className="orders-shop-btn"
          >
            BACK TO ORDERS
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="order-details-page">
      <section className="order-details-header">
        <p className="eyebrow">ORDER DETAILS</p>

        <h1>{order.orderId}</h1>

        <div className="order-details-meta">
          <span>
            {new Date(
              order.createdAt
            ).toLocaleDateString("en-IN")}
          </span>

          <strong className="order-status">
            {order.status.toUpperCase()}
          </strong>
        </div>

        {order.status !== "cancelled" && (
          <div className="order-tracking">
            <div
              className={`tracking-step ${
                [
                  "pending",
                  "confirmed",
                  "shipped",
                  "delivered"
                ].includes(order.status)
                  ? "active"
                  : ""
              }`}
            >
              <span className="tracking-dot"></span>
              <strong>ORDER PLACED</strong>
            </div>

            <div
              className={`tracking-step ${
                [
                  "confirmed",
                  "shipped",
                  "delivered"
                ].includes(order.status)
                  ? "active"
                  : ""
              }`}
            >
              <span className="tracking-dot"></span>
              <strong>CONFIRMED</strong>
            </div>

            <div
              className={`tracking-step ${
                [
                  "shipped",
                  "delivered"
                ].includes(order.status)
                  ? "active"
                  : ""
              }`}
            >
              <span className="tracking-dot"></span>
              <strong>SHIPPED</strong>
            </div>

            <div
              className={`tracking-step ${
                order.status === "delivered"
                  ? "active"
                  : ""
              }`}
            >
              <span className="tracking-dot"></span>
              <strong>DELIVERED</strong>
            </div>
          </div>
        )}
      </section>

      <section className="order-details-card">
        <div className="order-details-section">
          <h2>ORDER ITEMS</h2>

          <div className="order-details-items">
            {order.items.map((item) => (
              <div
                className="order-details-item"
                key={item.productId}
              >
                <div className="order-details-item-image">
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                  />
                </div>

                <div className="order-details-item-info">
                  <p>JUST DIECAST MINIS</p>

                  <h3>{item.name}</h3>

                  <span>
                    Quantity: {item.quantity}
                  </span>
                </div>

                <strong>
                  ₹{(
                    item.price * item.quantity
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="order-details-section">
          <h2>DELIVERY ADDRESS</h2>

          <div className="order-address">
            <strong>
              {order.customer.name}
            </strong>

            <p>
              {order.shippingAddress.address}
            </p>

            <p>
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
            </p>

            <p>
              {order.customer.phone}
            </p>
          </div>
        </div>

        {["shipped", "delivered"].includes(
          order.status
        ) && (
          <div className="order-details-section">
            <h2>DELIVERY TRACKING</h2>

            <div className="order-tracking-details">
              <div>
                <span>DELIVERY PARTNER</span>
                <strong>
                  {order.shippingCourier || "—"}
                </strong>
              </div>

              <div>
                <span>TRACKING NUMBER</span>
                <strong>
                  {order.trackingNumber || "—"}
                </strong>
              </div>

              {order.shippedAt && (
                <div>
                  <span>DISPATCHED ON</span>
                  <strong>
                    {new Date(
                      order.shippedAt
                    ).toLocaleDateString("en-IN")}
                  </strong>
                </div>
              )}

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-button"
                >
                  TRACK SHIPMENT
                </a>
              )}
            </div>
          </div>
        )}

        <div className="order-details-section">
          <h2>ORDER SUMMARY</h2>

          <div className="order-summary-row">
            <span>SUBTOTAL</span>

            <strong>
              ₹{order.subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="order-summary-row">
            <span>SHIPPING</span>

            <strong>
              ₹{order.shipping.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="order-summary-total">
            <span>TOTAL</span>

            <strong>
              ₹{order.total.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        {order.status === "confirmed" &&
          order.paymentStatus === "paid" &&
          order.cancellationStatus !== "cancelled" && (
            <div className="order-details-section">
              <h2>CANCEL ORDER</h2>

              <p>
                You can cancel this order before it is dispatched.
                Your refund will be processed after cancellation.
              </p>

              <textarea
                value={cancellationReason}
                onChange={(event) =>
                  setCancellationReason(event.target.value)
                }
                placeholder="Cancellation reason (optional)"
                rows={4}
                maxLength={500}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "12px",
                  resize: "vertical"
                }}
              />

              <button
                type="button"
                className="profile-button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  marginTop: "14px",
                  background: "#df1532",
                  border: "1px solid #df1532",
                  cursor: cancelling
                    ? "not-allowed"
                    : "pointer"
                }}
              >
                {cancelling
                  ? "CANCELLING..."
                  : "CANCEL ORDER"}
              </button>

              {cancelMessage && (
                <p style={{ marginTop: "12px" }}>
                  {cancelMessage}
                </p>
              )}

              {cancelError && (
                <p
                  style={{
                    marginTop: "12px",
                    color: "#df1532"
                  }}
                >
                  {cancelError}
                </p>
              )}
            </div>
          )}

        {["shipped", "delivered"].includes(
          order.status
        ) && (
          <div className="order-details-section">
            <h2>NEED HELP WITH THIS ORDER?</h2>

            <p>
              This order has already been {order.status}.
              Please contact us for cancellation or return
              assistance.
            </p>

            <Link
              to="/contact"
              className="profile-button"
            >
              CONTACT SUPPORT
            </Link>
          </div>
        )}

        <div className="order-details-actions">
          <Link
            to="/orders"
            className="profile-button profile-button-outline"
          >
            BACK TO ORDERS
          </Link>

          <Link
            to="/shop"
            className="profile-button"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </section>
    </main>
  );
}

export default OrderDetails;