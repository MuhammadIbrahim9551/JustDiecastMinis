import { useState, useEffect } from "react";
import useScrollReveal from "../hooks/useScrollReveal";
import Reveal from "../components/Reveal";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import imageUrl from "../utils/imageUrl";

function ProductSection({
  title,
  eyebrow = "THE COLLECTION",
  products,
  cart,
  setCart,
  addToCart,
  loading,
  error,
  viewAllTo,
  emptyMessage = "NO MODELS YET.",
  sectionClass = "featured",
  sectionRef,
}) {
  return (
    <section
      ref={sectionRef}
      className={sectionClass}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>

        {viewAllTo && (
          <Link to={viewAllTo} className="view-all-link">
            VIEW ALL →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="shop-loading">LOADING MODELS...</div>
      ) : error ? (
        <div className="shop-loading">{error}</div>
      ) : products.length === 0 ? (
        <div className="shop-loading">{emptyMessage}</div>
      ) : (
        <div className="product-grid product-carousel-mobile">
          {products.map((product) => {
            const stock = Number.isInteger(product.stock)
              ? product.stock
              : 0;

            const cartItem = cart.find(
              (item) => item.id === product.id
            );

            const cartQuantity = cartItem
              ? cartItem.quantity
              : 0;

            const cartLimitReached =
              product.status === "in-stock" &&
              stock > 0 &&
              cartQuantity >= stock;

            const outOfStock =
              product.status === "out-of-stock" ||
              (product.status === "in-stock" && stock === 0);

            return (
              <div className="product-card" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="product-card-link"
                >
                  <div className="product-image">
                    <img
                      src={imageUrl(product.images?.[0])}
                      alt={product.name}
                    />
                  </div>

                  <div className="product-info">
                    <p className="maker">{product.brand}</p>
                    <h3>{product.name}</h3>

                    <div className="product-meta">
                      <span>{product.scale}</span>
                      <strong>{product.price}</strong>
                    </div>
                  </div>
                </Link>

                {product.status === "in-stock" ? (
                  <button
                    className={`cart-btn ${
                      outOfStock || cartLimitReached
                        ? "cart-disabled"
                        : ""
                    }`}
                    disabled={outOfStock || cartLimitReached}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!outOfStock && !cartLimitReached) {
                        addToCart(product);
                      }
                    }}
                  >
                    {outOfStock
                      ? "OUT OF STOCK"
                      : cartLimitReached
                      ? "ALREADY IN CART"
                      : "ADD TO CART"}
                  </button>
                ) : product.status === "pre-order" ? (
                  <button
                    className="cart-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/product/${product.id}`;
                    }}
                  >
                    PRE-ORDER
                  </button>
                ) : (
                  <button
                    className="cart-btn"
                    disabled
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    OUT OF STOCK
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Home({ cart, setCart }) {
  const [featuredRef, featuredVisible] = useScrollReveal();
  const [bannerRef, bannerVisible] = useScrollReveal();
  const [brandsRef, brandsVisible] = useScrollReveal();
  const [faqRef, faqVisible] = useScrollReveal();
  const [contactRef, contactVisible] = useScrollReveal();

  const [announcement, setAnnouncement] = useState("");
  const [youtubeShowcaseUrl, setYoutubeShowcaseUrl] =
  useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
  const fetchYoutubeShowcase = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/store-settings`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setYoutubeShowcaseUrl(
        data.youtubeShowcaseUrl || ""
      );
    } catch (error) {
      setYoutubeShowcaseUrl("");
    }
  };

  fetchYoutubeShowcase();
}, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/announcement`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setAnnouncement(data.text || "");
      } catch (error) {
        setAnnouncement("");
      }
    };

    fetchAnnouncement();
  }, []);

  const handleContactSubmit = async (e) => {
    console.log("🔥 CONTACT SUBMIT FIRED");

    e.preventDefault();

    setContactSubmitting(true);
    setContactError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: contactForm.name,
            email: contactForm.email,
            phone: contactForm.phone,
            subject: "Home page enquiry",
            message: contactForm.message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send your message."
        );
      }

      setContactSubmitted(true);

      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setContactError(
        error.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  const addToCart = (product) => {
    if (product.status !== "in-stock") {
      return;
    }

    const stock = Number.isInteger(product.stock)
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

      if (currentQuantity >= stock) {
        return currentCart;
      }

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: currentQuantity + 1,
                stock,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
          stock,
        },
      ];
    });
  };

  // Shuffle without mutating the original products array.
  const shuffleProducts = (items) => {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    return shuffled;
  };

  const newArrivals = shuffleProducts(
  products.filter((product) => {
    const category = String(product.category || "")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-");

  const getYoutubeEmbedUrl = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname === "youtu.be"
    ) {
      const videoId =
        parsedUrl.pathname.slice(1);

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    }

    if (
      parsedUrl.hostname.includes("youtube.com")
    ) {
      const videoId =
        parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (
        parsedUrl.pathname.startsWith("/shorts/")
      ) {
        const videoId =
          parsedUrl.pathname.split("/")[2];

        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : "";
      }

      if (
        parsedUrl.pathname.startsWith("/embed/")
      ) {
        return url;
      }
    }
  } catch {
    return "";
  }

  return "";
};

    return (
      category === "new-arrivals" ||
      category === "new-arrival"
    );
  })
).slice(0, 4);

  const getProductTypes = (product) => {
    let types = product.type;

    // The API normally returns an array, but handle JSON strings too.
    if (typeof types === "string") {
      try {
        types = JSON.parse(types);
      } catch {
        types = [types];
      }
    }

    if (!Array.isArray(types)) {
      return [];
    }

    return types.map((type) =>
      String(type).trim().toLowerCase()
    );
  };

  const featuredProducts = products
  .filter(
    (product) => product.category === "featured"
  )
  .sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
  .slice(0, 4);

  const jdmProducts = products
  .filter((product) =>
    getProductTypes(product).includes("jdm")
  )
  .sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
  .slice(0, 4);

  const euroProducts = products
  .filter((product) =>
    getProductTypes(product).includes("euro")
  )
  .sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
  .slice(0, 4);

  const muscleProducts = products
  .filter((product) =>
    getProductTypes(product).includes("race cars")
  )
  .sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
  .slice(0, 4);

  console.log("HOME SECTION COUNTS:", {
    total: products.length,
    newArrivals: newArrivals.length,
    featured: featuredProducts.length,
    jdm: jdmProducts.length,
    euro: euroProducts.length,
    muscle: muscleProducts.length,
  });

  const getYoutubeEmbedUrl = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.slice(1);

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        const videoId = parsedUrl.pathname.split("/")[2];

        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : "";
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return url;
      }
    }
  } catch {
    return "";
  }

  return "";
};

const youtubeEmbedUrl =
  getYoutubeEmbedUrl(youtubeShowcaseUrl);

console.log("YouTube Showcase:", {
  youtubeShowcaseUrl,
  youtubeEmbedUrl
});

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .product-carousel-mobile {
            display: flex !important;
            overflow-x: auto;
            overflow-y: hidden;
            gap: 16px;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 10px;
            scrollbar-width: none;
          }

          .product-carousel-mobile::-webkit-scrollbar {
            display: none;
          }

          .product-carousel-mobile .product-card {
            flex: 0 0 78%;
            max-width: 78%;
            scroll-snap-align: start;
          }
        }
      `}</style>

      <main>
        {announcement && (
          <div className="announcement-ribbon">
            <div className="announcement-track">
              <span>{announcement}</span>
              <span>{announcement}</span>
              <span>{announcement}</span>
              <span>{announcement}</span>
            </div>
          </div>
        )}

        <section className="hero">
          <div className="hero-placeholder">
            <div className="placeholder-car">
              <img
                src="/images/dream_banner.png"
                alt="Just Diecast Minis"
              />
            </div>
          </div>

          <div className="hero-content">
            <Reveal>
              <p className="eyebrow">
                WELCOME TO JDM
              </p>
            </Reveal>

            <div className="hero-main">
              <div className="hero-text">
                <Reveal className="reveal-delay-1">
                  <h1>
                    SMALL SCALE.
                    <br />
                    <span>
                      ENDLESS DETAIL.
                    </span>
                  </h1>
                </Reveal>

                <Reveal className="reveal-delay-2">
                  <p className="hero-description">
                    Diecast models for enthusiasts who know
                    their cars. Discover iconic automobiles,
                    beautifully recreated in miniature.
                  </p>
                </Reveal>

                <Reveal className="reveal-delay-3">
                  <Link
                    to="/shop"
                    className="primary-btn"
                  >
                    EXPLORE THE COLLECTION
                  </Link>
                </Reveal>
              </div>

              <img
                className="hero-icon"
                src="/images/ae86.png"
                alt=""
              />
            </div>
          </div>
        </section>

        <ProductSection
  title="NEW ARRIVALS"
  eyebrow="THE COLLECTION"
  products={newArrivals}
  cart={cart}
  setCart={setCart}
  addToCart={addToCart}
  loading={loading}
  error={error}
  viewAllTo="/shop?category=new-arrivals"
  emptyMessage="NO NEW ARRIVALS YET."
  sectionClass={`featured ${
    featuredVisible ? "reveal-visible" : ""
  }`}
  sectionRef={featuredRef}
/>

        <section
          ref={bannerRef}
          className={`red-banner ${
            bannerVisible ? "reveal-visible" : ""
          }`}
        >
          <Reveal>
            <p className="eyebrow">
              BUILT FOR COLLECTORS
            </p>
          </Reveal>

          <Reveal className="reveal-delay-1">
            <h2>
              YOUR GARAGE.
              <br />
              <span>
                JUST SMALLER.
              </span>
            </h2>
          </Reveal>

          <Reveal className="reveal-delay-2">
            <Link
              to="/shop?scale=1:64"
              className="dark-btn"
            >
              SHOP 1:64
            </Link>
          </Reveal>
        </section>

        <ProductSection
          title="FEATURED"
          eyebrow="HANDPICKED FOR YOU"
          products={featuredProducts}
          cart={cart}
          setCart={setCart}
          addToCart={addToCart}
          loading={loading}
          error={error}
          viewAllTo="/shop?category=featured"
          emptyMessage="NO FEATURED MODELS YET."
          sectionClass="featured reveal-visible"
        />

        <section
          ref={brandsRef}
          className={`brands-section ${
            brandsVisible ? "reveal-visible" : ""
          }`}
          id="brands"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                THE MAKERS
              </p>

              <h2>
                BRANDS WE CATER TO
              </h2>
            </div>
          </div>

          <div className="brands-content">
            <div className="brands-image">
              <img
                src="/images/180sx.jpg"
                alt="Diecast models"
              />
            </div>

            <div className="brands-list">
              <div className="brand-item">
                <img
                  src="/images/matchbox-cars-1750227728719.webp"
                  alt="Matchbox"
                />

                <h3>MATCHBOX</h3>

                <p>
                  Diecasts which are a tad-bit better than those from Hot Wheels.
                </p>
              </div>

              <div className="brand-item">
                <img
                  src="/images/mini-gt.webp"
                  alt="Mini GT"
                />

                <h3>MINI GT</h3>

                <p>
                  Detailed scale models made for serious collectors.
                </p>
              </div>

              <div className="brand-item">
                <img
                  src="/images/hotwheels.webp"
                  alt="HotWheels"
                />

                <h3>HOT WHEELS</h3>

                <p>
                  The Mattel sub brand we all know and love. A diecast for everyone's taste!
                </p>
              </div>

              <div className="brand-item">
                <img
                  src="/images/majorette.webp"
                  alt="Majorette"
                />

                <h3>MAJORETTE</h3>

                <p>
                  Iconic cars with a little more character. City cars to racing machines!
                </p>
              </div>

              <div className="brand-item">
                <img
                  src="/images/cca.webp"
                  alt="CCA"
                />

                <h3>CCA</h3>

                <p>
                  Detailed scale models with a focus on character
                  and affordability.
                </p>
              </div>

              <div className="brand-item">
                <img
                  src="/images/tomica.webp"
                  alt="Tomica"
                />

                <h3>TOMICA</h3>

                <p>
                  Japanese diecast classics and everyday icons.
                </p>
              </div>

              <div className="brand-item">
                <h3>AND MORE</h3>

                <p>
                  More brands. More models. More to discover.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ProductSection
          title="JDM SELECTION"
          eyebrow="JAPANESE ICONS"
          products={jdmProducts}
          cart={cart}
          setCart={setCart}
          addToCart={addToCart}
          loading={loading}
          error={error}
          viewAllTo="/shop?type=JDM"
          emptyMessage="NO JDM MODELS YET."
          sectionClass="featured reveal-visible"
        />

        <ProductSection
          title="EURO EXOTICS"
          eyebrow="EUROPEAN LEGENDS"
          products={euroProducts}
          cart={cart}
          setCart={setCart}
          addToCart={addToCart}
          loading={loading}
          error={error}
          viewAllTo="/shop?type=Euro"
          emptyMessage="NO EURO MODELS YET."
          sectionClass="featured reveal-visible"
        />

        <ProductSection
          title="RACING HEROS"
          eyebrow="MOTORSPORT DNA"
          products={muscleProducts}
          cart={cart}
          setCart={setCart}
          addToCart={addToCart}
          loading={loading}
          error={error}
          viewAllTo="/shop?type=Race%20Cars"
          emptyMessage="NO RACING MODELS YET."
          sectionClass="featured reveal-visible"
        />

{youtubeEmbedUrl && (
  <section className="youtube-showcase">
    <div className="youtube-showcase-inner">

      <div className="youtube-showcase-video">
        <div className="youtube-video-wrapper">
          <iframe
            src={youtubeEmbedUrl}
            title="Just Diecast Minis YouTube Showcase"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      <div className="youtube-showcase-content">
        <p className="eyebrow">
          FROM OUR GARAGE
        </p>

        <h2>
          WATCH IT IN
          <br />
          <span>MINIATURE.</span>
        </h2>
      </div>

    </div>
  </section>
)}

        <section
          ref={faqRef}
          className={`faq-section ${
            faqVisible ? "reveal-visible" : ""
          }`}
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                NEED TO KNOW?
              </p>

              <h2>
                FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>
          </div>

          <div className="faq-content">
            <div className="faq-list">
              <div className="faq-item">
                <h3>
                  What scale models do you sell?
                </h3>

                <p>
                  We currently focus primarily on 1:64 scale
                  models, with more scales planned as the collection grows.
                </p>
              </div>

              <div className="faq-item">
                <h3>
                  How long does it take for you to dispatch an order?
                </h3>

                <p>
                  We usually take 1-2 days to dispatch
                  from the day of confirmation.
                </p>
              </div>

              <div className="faq-item">
                <h3>
                  Are all models brand new?
                </h3>

                <p>
                  Product condition will always be clearly
                  mentioned on the individual product page.
                </p>
              </div>

              <div className="faq-item">
                <h3>
                  Can I request a specific model?
                </h3>

                <p>
                  If you are looking for something specific,
                  get in touch with us and we'll see what we can source.
                </p>
              </div>
            </div>

            <div className="faq-image">
              <img
                src="/images/photo_2023-02-01_13-15-46.jpg"
                alt="Diecast models"
              />
            </div>
          </div>
        </section>

        <section
          ref={contactRef}
          className={`contact-section ${
            contactVisible ? "reveal-visible" : ""
          }`}
          id="contact"
        >
          <div className="contact-content">
            <div>
              <p className="eyebrow">
                GET IN TOUCH
              </p>

              <h2>
                HAVE A MODEL
                <br />
                IN MIND?
              </h2>

              <p>
                Looking for something specific? Want to know when
                a model arrives? Drop us a message.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="contact-success">
                <p className="eyebrow">
                  MESSAGE SENT
                </p>

                <h3>
                  Thanks for reaching out.
                </h3>

                <p>
                  We have received your message and will get back
                  to you as soon as possible.
                </p>

                <button
                  type="button"
                  className="dark-btn"
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactError("");
                  }}
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={handleContactSubmit}
              >
                {contactError && (
                  <div
                    className="contact-error"
                    role="alert"
                  >
                    {contactError}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="YOUR NAME"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm((current) => ({
                      ...current,
                      email: e.target.value,
                    }))
                  }
                  required
                />

                <input
                  type="tel"
                  placeholder="YOUR PHONE"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm((current) => ({
                      ...current,
                      phone: e.target.value,
                    }))
                  }
                  required
                />

                <textarea
                  placeholder="YOUR MESSAGE"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm((current) => ({
                      ...current,
                      message: e.target.value,
                    }))
                  }
                  required
                />

                <button
                  type="submit"
                  className="dark-btn"
                  disabled={contactSubmitting}
                >
                  {contactSubmitting
                    ? "SENDING..."
                    : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
