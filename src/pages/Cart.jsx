import { Link } from "react-router-dom";
import "../App.css";

function Cart({ cart, setCart }) {
  const updateQuantity = (id, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          const stock = Number.isInteger(item.stock)
            ? item.stock
            : 0;

          const newQuantity =
            item.quantity + change;

          if (change > 0) {
            return {
              ...item,
              quantity: Math.min(
                newQuantity,
                stock
              )
            };
          }

          return {
            ...item,
            quantity: newQuantity
          };
        })
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const removeItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  const getImageSrc = (item) => {
    const image =
      item.images?.[0] || item.image;

    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return `/${image.replace(
      /^public\//,
      ""
    )}`;
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-empty">
          <p className="eyebrow">
            YOUR CART
          </p>

          <h1>YOUR CART IS EMPTY.</h1>

          <p>
            Looks like you haven't found your next
            miniature dream car yet.
          </p>

          <Link
            to="/shop"
            className="cart-shop-btn"
          >
            CONTINUE SHOPPING
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-header">
        <p className="eyebrow">
          YOUR CART
        </p>

        <h1>YOUR COLLECTION.</h1>
      </section>

      <section className="cart-content">
        <div className="cart-items">
          {cart.map((item) => {
            const stock =
              Number.isInteger(item.stock)
                ? item.stock
                : 0;

            const atStockLimit =
              item.quantity >= stock;

            return (
              <div
                className="cart-item"
                key={item.id}
              >
                <Link
                  to={`/product/${item.id}`}
                  className="cart-item-image"
                >
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                  />
                </Link>

                <div className="cart-item-info">
                  <p className="product-maker">
                    {item.brand}
                  </p>

                  <Link
                    to={`/product/${item.id}`}
                    className="cart-item-name"
                  >
                    <h3>{item.name}</h3>
                  </Link>

                  <p>{item.scale}</p>

                  <button
                    className="remove-item"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    REMOVE
                  </button>
                </div>

                <div className="cart-item-right">
                  <strong>
                    ₹{(
                      item.price *
                      item.quantity
                    ).toLocaleString("en-IN")}
                  </strong>

                  <div className="cart-quantity">
                    <button
                      disabled={
                        item.quantity <= 1
                      }
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      disabled={atStockLimit}
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>ORDER SUMMARY</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ₹{subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <span>
              Calculated at checkout
            </span>
          </div>

          <div className="summary-total">
            <span>TOTAL</span>

            <strong>
              ₹{subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <Link
            to="/checkout"
            className="checkout-btn"
          >
            PROCEED TO CHECKOUT
          </Link>

          <Link
            to="/shop"
            className="continue-shopping"
          >
            ← CONTINUE SHOPPING
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default Cart;