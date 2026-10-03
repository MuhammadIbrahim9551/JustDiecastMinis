import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { getOrders } from "../api/orders";

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

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <p className="eyebrow">MY ORDERS</p>
          <h1>LOADING ORDERS.</h1>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <p className="eyebrow">MY ORDERS</p>
          <h1>UNABLE TO LOAD ORDERS.</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <p className="eyebrow">MY ORDERS</p>
          <h1>NO ORDERS YET.</h1>
          <p>Your miniature collection is waiting.</p>

          <Link to="/shop" className="orders-shop-btn">
            START SHOPPING
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-header">
        <p className="eyebrow">MY COLLECTION</p>
        <h1>MY ORDERS.</h1>
        <p>
          {orders.length}{" "}
          {orders.length === 1 ? "ORDER" : "ORDERS"}
        </p>
      </section>

      <section className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.orderId}>
            <div className="order-card-header">
              <div>
                <span>ORDER NUMBER</span>
                <strong>{order.orderId}</strong>
              </div>

              <div>
                <span>ORDER DATE</span>
                <strong>
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString("en-IN")}
                </strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong className="order-status">
                  {order.status.toUpperCase()}
                </strong>
              </div>
            </div>

            <div className="order-card-items">
              {order.items.map((item) => (
                <div
                  className="order-item"
                  key={item.productId}
                >
                  <div className="order-item-image">
                    <img
                      src={getImageSrc(item)}
                      alt={item.name}
                    />
                  </div>

                  <div className="order-item-info">
                    <p>JUST DIECAST MINIS</p>
                    <h3>{item.name}</h3>

                    <span>
                      Qty: {item.quantity}
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

            <div className="order-card-footer">
              <div>
                <span>TOTAL</span>
                <strong>
                  ₹{order.total.toLocaleString("en-IN")}
                </strong>
              </div>

              <Link
                to={`/orders/${order.orderId}`}
                className="order-view-btn"
              >
                VIEW ORDER
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Orders;