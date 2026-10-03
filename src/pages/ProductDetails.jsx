import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../App.css";
import {
  getProduct,
  getProducts
} from "../api/products";
import imageUrl from "../utils/imageUrl";

function ProductDetails({
  cart,
  setCart,
  wishlist,
  setWishlist
}) {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [preOrderOpen, setPreOrderOpen] = useState(false);
const [interestType, setInterestType] = useState("pre-order");
  const [interestName, setInterestName] = useState("");
const [interestEmail, setInterestEmail] = useState("");
const [interestLoading, setInterestLoading] = useState(false);
const [interestError, setInterestError] = useState("");
const [interestSubmitted, setInterestSubmitted] = useState(false);

  const [product, setProduct] = useState(null);
const [relatedProducts, setRelatedProducts] = useState([]);
const [reviews, setReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);

        const allProducts = await getProducts();

        const currentId = data.id;

const scoredProducts = allProducts
  .filter(
    (item) => item.id !== currentId
  )
          .map((item) => {
            let score = 0;

           const currentVehicleMakers = Array.isArray(
  data.vehicleMaker
)
  ? data.vehicleMaker
  : data.vehicleMaker
    ? [data.vehicleMaker]
    : [];

const itemVehicleMakers = Array.isArray(
  item.vehicleMaker
)
  ? item.vehicleMaker
  : item.vehicleMaker
    ? [item.vehicleMaker]
    : [];

const hasMatchingVehicleMaker =
  itemVehicleMakers.some((itemMaker) =>
    currentVehicleMakers.some(
      (currentMaker) =>
        itemMaker.toLowerCase() ===
        currentMaker.toLowerCase()
    )
  );

if (hasMatchingVehicleMaker) {
  score += 5;
}

            if (
              item.brand &&
              data.brand &&
              item.brand.toLowerCase() ===
                data.brand.toLowerCase()
            ) {
              score += 3;
            }

            const currentTypes = Array.isArray(
              data.type
            )
              ? data.type
              : [];

            const itemTypes = Array.isArray(
              item.type
            )
              ? item.type
              : [];

            const hasMatchingType =
              itemTypes.some((itemType) =>
                currentTypes.some(
                  (currentType) =>
                    itemType.toLowerCase() ===
                    currentType.toLowerCase()
                )
              );

            if (hasMatchingType) {
              score += 2;
            }

            if (
              item.scale &&
              data.scale &&
              item.scale.toLowerCase() ===
                data.scale.toLowerCase()
            ) {
              score += 1;
            }

           

            return {
              product: item,
              score
            };
          })
          .filter(
            ({ score }) => score > 0
          )
          .sort((a, b) => {
            if (b.score !== a.score) {
              return b.score - a.score;
            }

            return a.product.name.localeCompare(b.product.name);
          })
          .slice(0, 4)
          .map(({ product }) => product);

        setRelatedProducts(scoredProducts);
      } catch (error) {
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load reviews."
          );
        }

        setReviews(
  Array.isArray(data)
    ? data
    : data.reviews || []
);
      } catch (error) {
        console.error("Unable to load reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (
      !product ||
      product.status !== "in-stock"
    ) {
      return;
    }

    const stock = Number.isInteger(
      product.stock
    )
      ? product.stock
      : 0;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (!existingItem) {
        return currentCart;
      }

      if (existingItem.quantity <= stock) {
        return currentCart;
      }

      return currentCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: stock
            }
          : item
      );
    });
  }, [product, setCart]);

  if (loading) {
    return (
      <main className="product-not-found">
        <h1>LOADING MODEL...</h1>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-not-found">
        <h1>MODEL NOT FOUND</h1>

        <p>
          Sorry, we couldn't find that miniature.
        </p>

        <Link to="/shop">
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  const isWishlisted = wishlist.some(
    (item) => item.id === product.id
  );

  const stock = Number.isInteger(
    product.stock
  )
    ? product.stock
    : 0;

  const existingCartItem = cart.find(
    (item) => item.id === product.id
  );

  const existingCartQuantity =
    existingCartItem
      ? existingCartItem.quantity
      : 0;

  const remainingStock = Math.max(
    0,
    stock - existingCartQuantity
  );

  const addToCart = () => {
    if (product.status !== "in-stock") {
      return;
    }

    const stock = Number.isInteger(
      product.stock
    )
      ? product.stock
      : 0;

    if (stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      const currentQuantity = existingItem
        ? existingItem.quantity
        : 0;

      const availableStock = Math.max(
        0,
        stock - currentQuantity
      );

      if (availableStock <= 0) {
        return currentCart;
      }

      const quantityToAdd = Math.min(
        quantity,
        availableStock
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  currentQuantity +
                  quantityToAdd,
                stock
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: quantityToAdd,
          stock
        }
      ];
    });

    setQuantity(1);
  };

  const toggleWishlist = () => {
    setWishlist((currentWishlist) => {
      if (
        currentWishlist.some(
          (item) => item.id === product.id
        )
      ) {
        return currentWishlist.filter(
          (item) => item.id !== product.id
        );
      }

      return [
        ...currentWishlist,
        product
      ];
    });
  };

  const increaseQuantity = () => {
    if (product.status !== "in-stock") {
      return;
    }

    const stock = Number.isInteger(
      product.stock
    )
      ? product.stock
      : 0;

    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    const existingQuantity = existingItem
      ? existingItem.quantity
      : 0;

    const availableStock = Math.max(
      0,
      stock - existingQuantity
    );

    setQuantity((currentQuantity) =>
      Math.min(
        currentQuantity + 1,
        availableStock
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(
        1,
        currentQuantity - 1
      )
    );
  };

  const statusLabel =
    product.status === "in-stock"
      ? stock <= 2
        ? stock === 1
          ? "ONLY 1 LEFT"
          : "ONLY 2 LEFT"
        : "IN STOCK"
      : product.status === "pre-order"
      ? "PRE-ORDER"
      : "OUT OF STOCK";

  const cannotAddMore =
    product.status ===
      "out-of-stock" ||
    stock === 0 ||
    remainingStock === 0;

 const handleInterestSubmit = async (e) => {
  e.preventDefault();

  setInterestLoading(true);
  setInterestError("");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/interests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: product.id,
          customerName: interestName,
          customerEmail: interestEmail,
          type: interestType
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to register interest."
      );
    }

    setInterestSubmitted(true);
    setInterestName("");
    setInterestEmail("");
  } catch (error) {
    setInterestError(error.message);
  } finally {
    setInterestLoading(false);
  }
};

    const getReviewImage = (review) => {
  if (review.image) {
    return review.image;
  }

  if (review.imageUrl) {
    return review.imageUrl;
  }

  if (review.photo) {
    return review.photo;
  }

  if (review.photoUrl) {
    return review.photoUrl;
  }

  if (Array.isArray(review.images) && review.images.length > 0) {
    return review.images[0];
  }

  return null;
};

  return (
    <main className="product-details">

      <div className="product-details-gallery">

        <div className="product-details-image">
          <img
            src={imageUrl(
              product.images[selectedImage]
            )}
            alt={product.name}
          />
        </div>

        <div className="product-thumbnails">
          {product.images.map(
            (image, index) => (
              <button
                key={image}
                className={`product-thumbnail ${
                  selectedImage === index
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedImage(index)
                }
              >
                <img
                  src={imageUrl(image)}
                  alt={`${product.name} ${
                    index + 1
                  }`}
                />
              </button>
            )
          )}
        </div>

      </div>

      <div className="product-details-info">

        <p className="product-details-maker">
          {product.brand}
        </p>

        <h1>{product.name}</h1>

        <div
          className={`product-details-status product-status-${product.status}`}
        >
          {statusLabel}
        </div>

        <p className="product-details-price">
          ₹
          {product.price.toLocaleString(
            "en-IN"
          )}
        </p>

        <div className="product-specs">

          <div>
            <span>Scale</span>
            <strong>
              {product.scale}
            </strong>
          </div>

          <div>
            <span>Vehicle Maker</span>
            <strong>
  {Array.isArray(product.vehicleMaker)
    ? product.vehicleMaker.join(", ")
    : product.vehicleMaker}
</strong>
          </div>

          <div>
            <span>Type</span>
            <strong>
              {product.type.join(", ")}
            </strong>
          </div>

        </div>

        <p className="product-description">
          {product.about ||
            `A detailed ${product.scale} scale model of the ${product.name}, produced by ${product.brand}. A perfect addition to any miniature car collection.`}
        </p>

        <div className="product-actions">

          <div className="quantity-selector">

            <button
              disabled={
                product.status ===
                  "out-of-stock" ||
                quantity <= 1
              }
              onClick={
                decreaseQuantity
              }
            >
              −
            </button>

            <span>
              {quantity}
            </span>

            <button
              disabled={
                product.status !==
                  "in-stock" ||
                quantity >=
                  remainingStock
              }
              onClick={
                increaseQuantity
              }
            >
              +
            </button>

          </div>

          {product.status ===
          "pre-order" ? (
            <button
  className="add-to-cart-large preorder-large"
  onClick={() => {
  setInterestType("pre-order");
  setPreOrderOpen(true);
  setInterestName("");
  setInterestEmail("");
  setInterestError("");
  setInterestLoading(false);
  setInterestSubmitted(false);
}}
>
  PRE-ORDER
</button>
          ) : (
  product.status === "out-of-stock" ||
  stock === 0 ? (
    <button
      className="add-to-cart-large"
      onClick={() => {
        setInterestType("notify");
        setPreOrderOpen(true);
        setInterestName("");
        setInterestEmail("");
        setInterestError("");
        setInterestLoading(false);
        setInterestSubmitted(false);
      }}
    >
      NOTIFY ME
    </button>
  ) : (
    <button
      className={`add-to-cart-large ${
        cannotAddMore
          ? "cart-disabled"
          : ""
      }`}
      disabled={cannotAddMore}
      onClick={addToCart}
    >
      {remainingStock === 0
        ? "ALREADY IN CART"
        : "ADD TO CART"}
    </button>
  )
)}

        </div>

        <button
          className={`wishlist-button ${
            isWishlisted
              ? "wishlisted"
              : ""
          }`}
          onClick={
            toggleWishlist
          }
        >
          {isWishlisted
            ? "♥ WISHLISTED"
            : "♡ ADD TO WISHLIST"}
        </button>

        <Link
          to="/shop"
          className="back-to-shop"
        >
          ← BACK TO SHOP
        </Link>

      </div>

      {preOrderOpen && (
        <div
          className="preorder-overlay"
          onClick={() =>
            setPreOrderOpen(false)
          }
        >
          <div
            className="preorder-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="preorder-close"
              onClick={() =>
                setPreOrderOpen(false)
              }
              aria-label="Close"
            >
              ×
            </button>

{!interestSubmitted ? (
  <>
    <p className="eyebrow">
  {interestType === "notify"
    ? "BACK IN STOCK"
    : "PRE-ORDER"}
</p>

    <h2>
      {product.name}
    </h2>

    <p className="preorder-description">
  {interestType === "notify"
    ? "This model is currently out of stock. Register below and we'll email you when it becomes available again."
    : "This model isn't currently in stock. Register your interest and we'll let you know when it becomes available."}
</p>

    <form
      className="preorder-form"
      onSubmit={handleInterestSubmit}
    >
      <input
        type="text"
        name="name"
        placeholder="Your name"
        value={interestName}
        onChange={(e) => {
          setInterestName(e.target.value);
          setInterestError("");
        }}
        required
        disabled={interestLoading}
      />

      <input
        type="email"
        name="email"
        placeholder="Your email"
        value={interestEmail}
        onChange={(e) => {
          setInterestEmail(e.target.value);
          setInterestError("");
        }}
        required
        disabled={interestLoading}
      />

      {interestError && (
        <p className="preorder-error">
          {interestError}
        </p>
      )}

      <button
        type="submit"
        disabled={interestLoading}
      >
        {interestLoading
  ? "REGISTERING..."
  : interestType === "notify"
  ? "NOTIFY ME"
  : "REGISTER INTEREST"}
      </button>
    </form>
  </>
) : (
  <div className="preorder-success">
    <p className="eyebrow">
  {interestType === "notify"
    ? "NOTIFICATION REGISTERED"
    : "INTEREST REGISTERED"}
</p>

<p className="preorder-description">
  {interestType === "notify"
    ? `We'll email you when ${product.name} is back in stock.`
    : `Thanks for your interest in ${product.name}. We'll contact you when this model becomes available.`}
</p>

    <h2>
      You're on the list.
    </h2>

    <p className="preorder-description">
      Thanks for your interest in{" "}
      {product.name}.
      We'll contact you when this model
      becomes available.
    </p>

    <button
      className="preorder-success-button"
      onClick={() => {
        setPreOrderOpen(false);
        setInterestSubmitted(false);
        setInterestError("");
      }}
    >
      CLOSE
    </button>
  </div>
)}

          </div>
        </div>
      )}

            <section className="product-reviews">

        <div className="product-reviews-header">
          <p className="eyebrow">
            CUSTOMER FEEDBACK
          </p>

          <h2>
            CUSTOMER REVIEWS
          </h2>
        </div>

        {reviewsLoading ? (
          <p className="reviews-message">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p className="reviews-message">
            No reviews yet. Be the first to review this model!
          </p>
        ) : (
          <div className="reviews-list">

            {reviews.map((review) => (
              <article
  key={review._id}
  className="review-card"
>
  <div className="review-card-header">
    <div>
      <h3>
        {review.customerName}
      </h3>

      <p className="review-date">
        {new Date(
          review.createdAt
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })}
      </p>
    </div>

    <div
      className="review-rating"
      aria-label={`${review.rating} out of 5 stars`}
    >
      {"★".repeat(review.rating)}

      <span>
        {"★".repeat(5 - review.rating)}
      </span>
    </div>
  </div>

  <p className="review-comment">
    {review.comment}
  </p>

  {/* Customer Review Photos */}

{Array.isArray(review.photos) && review.photos.length > 0 && (
  <div className="review-images">
    {review.photos.map((photo, index) => (
      <img
        key={`${photo}-${index}`}
        src={imageUrl(photo)}
        alt={`Review by ${review.customerName} - photo ${index + 1}`}
        className="review-image"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    ))}
  </div>
)}

  {review.isVerifiedPurchase && (
    <p className="verified-review">
      ✓ Verified Purchase
    </p>
  )}
</article>
            ))}

          </div>
        )}

      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products">

          <div className="related-products-header">
            <p className="eyebrow">
              DISCOVER MORE
            </p>

            <h2>
              YOU MAY ALSO LIKE
            </h2>
          </div>

          <div className="related-products-grid">

            {relatedProducts.map(
              (relatedProduct) => (
                <Link
  key={relatedProduct.id}
  to={`/product/${relatedProduct.id}`}
  className="related-product-card"
>

                  <div className="related-product-image">
                    <img
                      src={imageUrl(
                        relatedProduct
                          .images?.[0]
                      )}
                      alt={
                        relatedProduct.name
                      }
                    />
                  </div>

                  <div className="related-product-info">

                    <p className="related-product-maker">
                      {relatedProduct.brand}
                    </p>

                    <h3>
                      {relatedProduct.name}
                    </h3>

                    <p className="related-product-price">
                      ₹
                      {Number( 
                        relatedProduct.price
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                </Link>
              )
            )}

          </div>

        </section>
      )}

    </main>
  );
}

export default ProductDetails;
