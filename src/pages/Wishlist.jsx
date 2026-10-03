import { Link } from "react-router-dom";
import "../App.css";
import imageUrl from "../utils/imageUrl";

function Wishlist({
  wishlist,
  setWishlist,
  setCart
}) {
  const removeFromWishlist = (id) => {
    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (item) => item.id !== id
      )
    );
  };

  const addToCart = (product) => {
    if (product.status !== "in-stock") {
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  };

  if (wishlist.length === 0) {
    return (
      <main className="wishlist-page">
        <section className="wishlist-empty">
          <p className="eyebrow">YOUR WISHLIST</p>

          <h1>NOTHING HERE YET.</h1>

          <p>
            Save the miniature dream cars you don't want
            to lose sight of.
          </p>

          <Link
            to="/shop"
            className="wishlist-shop-btn"
          >
            EXPLORE MODELS
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <section className="wishlist-header">
        <p className="eyebrow">YOUR WISHLIST</p>

        <h1>THE ONES YOU WANT.</h1>

        <p>
          {wishlist.length}{" "}
          {wishlist.length === 1
            ? "model"
            : "models"}{" "}
          saved.
        </p>
      </section>

      <section className="wishlist-content">
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const statusLabel =
              item.status === "in-stock"
                ? "IN STOCK"
                : item.status === "pre-order"
                ? "PRE-ORDER"
                : "OUT OF STOCK";

            return (
              <div
                className="wishlist-card"
                key={item.id}
              >
                <Link
                  to={`/product/${item.id}`}
                  className="wishlist-image"
                >
                  {(item.images?.[0] || item.image) && (
  <img
    src={imageUrl(item.images?.[0] || item.image)}
    alt={item.name}
  />
)}

                  <span
                    className={`wishlist-status wishlist-status-${item.status}`}
                  >
                    {statusLabel}
                  </span>
                </Link>

                <div className="wishlist-info">
                  <p className="product-maker">
                    {item.brand}
                  </p>

                  <h3>{item.name}</h3>

                  <p>{item.scale}</p>

                  <div className="wishlist-bottom">
                    <strong>
                      ₹{item.price.toLocaleString("en-IN")}
                    </strong>

                    {item.status === "in-stock" ? (
                      <button
                        className="wishlist-cart-btn"
                        onClick={() => addToCart(item)}
                      >
                        ADD TO CART
                      </button>
                    ) : item.status === "pre-order" ? (
                      <Link
                        to={`/product/${item.id}`}
                        className="wishlist-cart-btn wishlist-preorder-btn"
                      >
                        PRE-ORDER
                      </Link>
                    ) : (
                      <button
                        className="wishlist-cart-btn wishlist-disabled"
                        disabled
                      >
                        OUT OF STOCK
                      </button>
                    )}
                  </div>

                  <button
                    className="wishlist-remove"
                    onClick={() =>
                      removeFromWishlist(item.id)
                    }
                  >
                    REMOVE FROM WISHLIST
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Wishlist;