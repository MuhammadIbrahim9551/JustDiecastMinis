import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ cart, wishlist }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [mobileScalesOpen, setMobileScalesOpen] = useState(false);

  const defaultCatalogOptions = {
    scales: ["1:64", "1:43", "1:32", "1:24", "1:18"],
    vehicleMakers: ["Toyota", "Nissan", "Honda", "Mazda", "Subaru", "Mitsubishi", "Isuzu", "Suzuki", "Daihatsu", "Lexus", "Acura", "Infiniti", "GR", "BMW", "Porsche", "Ferrari", "Lamborghini", "Lancia", "Alfa Romeo", "Ford", "Chevrolet", "Jeep", "GMC", "Mercedes Benz", "Volkswagen", "Audi", "Jaguar", "Bugatti", "Koenigsegg", "Pagani", "Fiat", "Mini", "Peugeot", "Lotus", "Renault", "Citroen", "Bentley", "Aston Martin", "Maserati", "McLaren", "Pontiac", "Cadillac", "Rolls Royce", "Dodge", "Chrysler", "Plymouth", "Tata", "Mahindra", "Holden", "Saab", "Skoda", "Seat", "Hyundai", "Genesis", "Kia", "Others"],
    types: ["JDM", "GTs", "Coupes", "Hatches", "Sedans", "Estates", "Supercars", "Classics", "Race Cars", "Rally", "Kei Cars", "Vintage", "SUVs", "MPVs", "Trucks", "Vans", "Motorcycles", "Others"]
  };

  const [catalogOptions, setCatalogOptions] = useState(() => {
    try {
      const saved = localStorage.getItem("jdm_catalog_options");
      return saved ? { ...defaultCatalogOptions, ...JSON.parse(saved) } : defaultCatalogOptions;
    } catch {
      return defaultCatalogOptions;
    }
  });

  useEffect(() => {
    const syncCatalogOptions = () => {
      try {
        const saved = localStorage.getItem("jdm_catalog_options");
        setCatalogOptions(saved ? { ...defaultCatalogOptions, ...JSON.parse(saved) } : defaultCatalogOptions);
      } catch (error) {
        console.error("Unable to sync catalog options.", error);
      }
    };

    window.addEventListener("jdm-catalog-change", syncCatalogOptions);
    window.addEventListener("storage", syncCatalogOptions);

    return () => {
      window.removeEventListener("jdm-catalog-change", syncCatalogOptions);
      window.removeEventListener("storage", syncCatalogOptions);
    };
  }, []);


  const getImageSrc = (item) => {
    const image =
      item.images?.[0] || item.image;

    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `/${image.replace("public/", "")}`;
  };

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("jdm_user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const savedUser = localStorage.getItem("jdm_user");

      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener(
      "jdm-auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "jdm-auth-change",
        handleAuthChange
      );
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileShopOpen(false);
    setMobileBrandsOpen(false);
    setMobileScalesOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("jdm_token");
    localStorage.removeItem("jdm_user");

    window.dispatchEvent(
      new Event("jdm-auth-change")
    );

    setUser(null);
    closeMobileMenu();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* BRAND */}
        <Link
          to="/"
          className="brand"
          onClick={closeMobileMenu}
        >
          <img
            className="brand-icon"
            src="/images/favicon.JPG"
            alt="JDM"
          />

          <div className="brand-text">
            <strong>JUST DIECAST</strong>
            <span>MINIS</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="nav-links">

          <Link to="/about">ABOUT</Link>

          {/* SHOP */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn">
              SHOP <span>+</span>
            </button>

            <div className="mega-menu">

              {/* CATEGORIES */}
              <div className="mega-column">
                <h4>CATEGORIES</h4>

                <Link to="/shop?category=new-arrivals">
                  New Arrivals
                </Link>

                <Link to="/shop?category=pre-orders">
                  Pre-Orders
                </Link>

                <Link to="/shop?category=best-sellers">
                  Best Sellers
                </Link>

                <Link to="/shop?category=featured">
                  Featured
                </Link>

                <Link to="/shop?category=sale">
                  Sale
                </Link>

                <Link to="/shop">
                  All Models
                </Link>
              </div>

              {/* SCALE */}
              <div className="mega-column">
                <h4>SCALE</h4>

                {catalogOptions.scales.map((item) => (
                  <Link key={item} to={`/shop?scale=${encodeURIComponent(item)}`}>
                    {item}
                  </Link>
                ))}
                <Link to="/shop?scale=Others">
  Other Scales
</Link>
              </div>

              {/* VEHICLE MAKERS */}
              <div className="mega-column vehicle-makers-column">
                <h4>VEHICLE MAKERS</h4>

                <div className="vehicle-makers-scroll">
                  {catalogOptions.vehicleMakers
  .filter(
    (maker) =>
      maker.trim().toLowerCase() !== "others"
  )
  .map((maker) => (
    <Link
      key={maker}
      to={`/shop?maker=${encodeURIComponent(maker)}`}
    >
      {maker}
    </Link>
  ))}

<Link to="/shop?maker=Others">
  Others →
</Link>
                </div>
              </div>

              {/* TYPES */}
              <div className="mega-column">
                <h4>TYPES</h4>
                {catalogOptions.types.map((item) => (
                  <Link key={item} to={`/shop?type=${encodeURIComponent(item)}`}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* BRANDS */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn">
              BRANDS <span>+</span>
            </button>

            <div className="simple-dropdown">

              <Link to="/shop?brand=Tomica">
                Tomica
              </Link>

              <Link to="/shop?brand=Mini%20GT">
                Mini GT
              </Link>

              <Link to="/shop?brand=Kyosho">
                Kyosho
              </Link>

              <Link to="/shop?brand=Bburago">
                Bburago
              </Link>

              <div className="nested-dropdown">
                <button className="nested-dropdown-btn">
                  Hot Wheels <span>+</span>
                </button>

                <div className="nested-menu">
                  <Link to="/shop?brand=HotWheels&series=Mainline">
                    Mainline
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=Premium">
                    Premium
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=Elite%2064">
                    Elite 64
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=RLC">
                    RLC
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=Chase">
                    Chase
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=TH%20%2F%20STH">
                    TH / STH
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=Multipacks">
                    Multipacks
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=Sets">
                    Sets
                  </Link>

                  <Link to="/shop?brand=HotWheels&series=Team%20Transport">
                    Team Transport
                  </Link>

                  <Link to="/shop?brand=HotWheels&scale=1:43">
                    1:43
                  </Link>

                  <Link to="/shop?brand=HotWheels">
                    View All Hot Wheels →
                  </Link>
                </div>
              </div>

              <Link to="/shop?brand=Majorette">
                Majorette
              </Link>

              <Link to="/shop?brand=M2%20Machines">
                M2 Machines
              </Link>

              <Link to="/shop?brand=CCA">
                CCA
              </Link>

              <Link to="/shop?brand=Massdi">
                Massdi
              </Link>

              <Link to="/shop?brand=Matchbox">
                Matchbox
              </Link>

              <Link to="/shop?brand=Poster%20Cars">
                Poster Cars
              </Link>

              <Link to="/shop?brand=Para64">
                Para64
              </Link>

              <Link to="/shop?brand=LCD%20Models">
                LCD Models
              </Link>

              <Link
                to="/shop?brand=Pop%20Race"
              >
                Pop Race
              </Link>

              <Link
                to="/shop?brand=Time%20Micro"
              >
                Time Micro
              </Link>


              <Link
                to="/shop?brand=Hobby%20Japan"
              >
                Hobby Japan
              </Link>


              <Link to="/shop">
                View All Brands →
              </Link>
            </div>
          </div>

          {/* SCALES */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn">
              SCALES <span>+</span>
            </button>

            <div className="simple-dropdown">
              {catalogOptions.scales.map((item) => (
                <Link key={item} to={`/shop?scale=${encodeURIComponent(item)}`}>
                  {item}
                </Link>
              ))}
              <Link to="/shop">
                View All Scales →
              </Link>
              <Link to="/shop?scale=Others">
  Other Scales →
</Link>
            </div>
          </div>
        </div>

        {/* NAV ACTIONS */}
        <div className="nav-actions">

          {/* ACCOUNT */}
          {user ? (
            <div className="account-wrapper">
              <Link
                to={
                  user.role === "admin"
                    ? "/admin"
                    : "/profile"
                }
                className="nav-account"
                aria-label="Account"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="nav-icon"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />
                  <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>
              </Link>

              <div className="account-preview">
                <div className="account-preview-header">
                  <strong>
                    {user.role === "admin"
                      ? "ADMIN ACCOUNT"
                      : "YOUR ACCOUNT"}
                  </strong>
                </div>

                <div className="account-preview-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>

                <div className="account-preview-links">
                  {user.role === "admin" ? (
                    <Link to="/admin">
                      ADMIN DASHBOARD
                    </Link>
                  ) : (
                    <>
                      <Link to="/profile">
                        MY ACCOUNT
                      </Link>

                      <Link to="/orders">
                        MY ORDERS
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    LOG OUT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="account-wrapper">
              <Link
                to="/login"
                className="nav-account"
                aria-label="Login"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="nav-icon"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />
                  <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>
              </Link>

              <div className="account-preview">
                <div className="account-preview-header">
                  <strong>YOUR ACCOUNT</strong>
                </div>

                <div className="account-preview-info">
                  <strong>Welcome to JDM</strong>

                  <span>
                    Sign in to access your account.
                  </span>
                </div>

                <div className="account-preview-links">
                  <Link to="/login">
                    LOGIN
                  </Link>

                  <Link to="/signup">
                    CREATE ACCOUNT
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH */}
          <button
            className="nav-search"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              className="nav-icon"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />
              <path d="M16 16l5 5" />
            </svg>
          </button>

          {/* WISHLIST */}
          <div className="wishlist-wrapper">
            <Link
              to="/wishlist"
              className="nav-wishlist"
              aria-label="Wishlist"
            >
              <svg
                viewBox="0 0 24 24"
                className="nav-icon nav-heart"
                aria-hidden="true"
              >
                <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7C3.2 5.9 5.1 4 7.7 4c1.8 0 3.4 1 4.3 2.4C12.9 5 14.5 4 16.3 4c2.6 0 4.5 1.9 4.5 4.7z" />
              </svg>

              {wishlist.length > 0 && (
                <span className="wishlist-count">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <div className="wishlist-preview">
              <div className="wishlist-preview-header">
                <strong>YOUR WISHLIST</strong>

                <span>
                  {wishlist.length}
                </span>
              </div>

              {wishlist.length === 0 ? (
                <div className="wishlist-preview-empty">
                  <p>
                    Your wishlist is empty.
                  </p>

                  <Link to="/shop">
                    EXPLORE MODELS
                  </Link>
                </div>
              ) : (
                <>
                  <div className="wishlist-preview-items">
                    {wishlist
                      .slice(0, 3)
                      .map((item) => (
                        <div
                          className="wishlist-preview-item"
                          key={item.id}
                        >
                          <div className="wishlist-preview-image">
                            <img
                              src={getImageSrc(item)}
                              alt={item.name}
                            />
                          </div>

                          <div className="wishlist-preview-info">
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.brand} · ₹
                              {item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {wishlist.length > 3 && (
                    <p className="wishlist-preview-more">
                      + {wishlist.length - 3} more model
                      {wishlist.length - 3 !== 1
                        ? "s"
                        : ""}
                    </p>
                  )}

                  <Link
                    to="/wishlist"
                    className="wishlist-preview-button"
                  >
                    VIEW WISHLIST
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* CART */}
          <div className="cart-wrapper">
            <Link
              to="/cart"
              className="nav-cart"
              aria-label="Cart"
            >
              <svg
                viewBox="0 0 24 24"
                className="nav-icon"
                aria-hidden="true"
              >
                <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6" />

                <circle
                  cx="9"
                  cy="20"
                  r="1.2"
                />

                <circle
                  cx="18"
                  cy="20"
                  r="1.2"
                />
              </svg>

              {cart.length > 0 && (
                <span className="cart-count">
                  {cart.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              )}
            </Link>

            <div className="cart-preview">
              <div className="cart-preview-header">
                <strong>YOUR CART</strong>

                <span>
                  {cart.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="cart-preview-empty">
                  <p>Your cart is empty.</p>

                  <Link to="/shop">
                    EXPLORE MODELS
                  </Link>
                </div>
              ) : (
                <>
                  <div className="cart-preview-items">
                    {cart
                      .slice(0, 3)
                      .map((item) => (
                        <div
                          className="cart-preview-item"
                          key={item.id}
                        >
                          <div className="cart-preview-image">
                            <img
                              src={getImageSrc(item)}
                              alt={item.name}
                            />
                          </div>

                          <div className="cart-preview-info">
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.quantity} × ₹
                              {item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {cart.length > 3 && (
                    <p className="cart-preview-more">
                      + {cart.length - 3} more model
                      {cart.length - 3 !== 1
                        ? "s"
                        : ""}
                    </p>
                  )}

                  <div className="cart-preview-total">
                    <span>SUBTOTAL</span>

                    <strong>
                      ₹
                      {cart
                        .reduce(
                          (total, item) =>
                            total +
                            item.price *
                              item.quantity,
                          0
                        )
                        .toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <Link
                    to="/cart"
                    className="cart-preview-button"
                  >
                    VIEW CART
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className={`mobile-menu-btn ${
              mobileMenuOpen
                ? "menu-open"
                : ""
            }`}
            aria-label="Menu"
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`mobile-menu ${
          mobileMenuOpen
            ? "mobile-menu-open"
            : ""
        }`}
      >
        <Link
          to="/about"
          onClick={closeMobileMenu}
        >
          ABOUT
        </Link>

        {/* MOBILE ACCOUNT */}
        {user ? (
          <div className="mobile-auth-section">
            <div className="mobile-auth-user">
              <svg
                viewBox="0 0 24 24"
                className="nav-icon"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>

              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            {user.role === "admin" ? (
              <Link
                to="/admin"
                className="mobile-auth-link"
                onClick={closeMobileMenu}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="nav-icon"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                  />

                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>

                <span>
                  ADMIN DASHBOARD
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="mobile-auth-link"
                  onClick={closeMobileMenu}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                    />

                    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                  </svg>

                  <span>
                    MY ACCOUNT
                  </span>
                </Link>

                <Link
                  to="/orders"
                  className="mobile-auth-link"
                  onClick={closeMobileMenu}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    <path d="M6 4h12v16H6z" />
                    <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
                  </svg>

                  <span>
                    MY ORDERS
                  </span>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
            >
              <svg
                viewBox="0 0 24 24"
                className="nav-icon"
                aria-hidden="true"
              >
                <path d="M10 5H5v14h5" />
                <path d="M14 8l4 4-4 4M18 12H9" />
              </svg>

              <span>
                LOG OUT
              </span>
            </button>
          </div>
        ) : (
          <div className="mobile-auth-section">
            <Link
              to="/login"
              className="mobile-auth-link"
              onClick={closeMobileMenu}
            >
              <svg
                viewBox="0 0 24 24"
                className="nav-icon"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>

              <span>LOGIN</span>
            </Link>

            <Link
              to="/signup"
              className="mobile-auth-link"
              onClick={closeMobileMenu}
            >
              <svg
                viewBox="0 0 24 24"
                className="nav-icon"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>

              <span>SIGN UP</span>
            </Link>
          </div>
        )}

        {/* MOBILE SHOP */}
        <div className="mobile-menu-section">
          <button
            onClick={() =>
              setMobileShopOpen(
                !mobileShopOpen
              )
            }
          >
            SHOP

            <span>
              {mobileShopOpen ? "−" : "+"}
            </span>
          </button>

          {mobileShopOpen && (
            <div className="mobile-submenu">

              <Link
                to="/shop?category=new-arrivals"
                onClick={closeMobileMenu}
              >
                New Arrivals
              </Link>

              <Link
                to="/shop?category=pre-orders"
                onClick={closeMobileMenu}
              >
                Pre-Orders
              </Link>

              <Link
                to="/shop?category=best-sellers"
                onClick={closeMobileMenu}
              >
                Best Sellers
              </Link>

              <Link
                to="/shop?category=featured"
                onClick={closeMobileMenu}
              >
                Featured
              </Link>

              <Link
                to="/shop?category=sale"
                onClick={closeMobileMenu}
              >
                Sale
              </Link>

              <Link
                to="/shop"
                onClick={closeMobileMenu}
              >
                All Models
              </Link>

              <div className="mobile-subheading">
                SCALE
              </div>

              <Link
                to="/shop?scale=1:64"
                onClick={closeMobileMenu}
              >
                1:64
              </Link>

              <Link
                to="/shop?scale=1:43"
                onClick={closeMobileMenu}
              >
                1:43
              </Link>

              <Link
                to="/shop?scale=1:32"
                onClick={closeMobileMenu}
              >
                1:32
              </Link>

              <Link
                to="/shop?scale=1:24"
                onClick={closeMobileMenu}
              >
                1:24
              </Link>

              <Link
                to="/shop?scale=1:18"
                onClick={closeMobileMenu}
              >
                1:18
              </Link>

              <div className="mobile-subheading">
                VEHICLE MAKERS
              </div>

              {[
                "Toyota",
                "Nissan",
                "Honda",
                "Mazda",
                "Subaru",
                "Mitsubishi",
                "Isuzu",
                "Suzuki",
                "Daihatsu",
                "Lexus",
                "Acura",
                "Infiniti",
                "GR",
                "BMW",
                "Porsche",
                "Ferrari",
                "Lamborghini",
                "Lancia",
                "Alfa Romeo",
                "Ford",
                "Chevrolet",
                "Jeep",
                "GMC",
                "Shelby",
                "Mercedes Benz",
                "Volkswagen",
                "Audi",
                "Jaguar",
                "Bugatti",
                "Koenigsegg",
                "Pagani",
                "Fiat",
                "Mini",
                "Peugeot",
                "Lotus",
                "Renault",
                "Citroen",
                "Bentley",
                "Aston Martin",
                "Maserati",
                "McLaren",
                "Pontiac",
                "Cadillac",
                "Rolls Royce",
                "Dodge",
                "Chrysler",
                "Plymouth",
                "Tata",
                "Mahindra",
                "Holden",
                "Saab",
                "Skoda",
                "Seat",
                "Hyundai",
                "Genesis",
                "Kia",
                "Others"
              ].map((maker) => (
                <Link
                  key={maker}
                  to={`/shop?maker=${encodeURIComponent(
                    maker
                  )}`}
                  onClick={closeMobileMenu}
                >
                  {maker}
                </Link>
              ))}

              <div className="mobile-subheading">
                TYPES
              </div>

              {[
                "JDM",
                "GTs",
                "Coupes",
                "Hatches",
                "Sedans",
                "Estates",
                "Supercars",
                "Classics",
                "Race Cars",
                "Rally",
                "Kei Cars",
                "Vintage",
                "SUVs",
                "MPVs",
                "Trucks",
                "Vans",
                "Motorcycles",
                "Others"
              ].map((type) => (
                <Link
                  key={type}
                  to={`/shop?type=${encodeURIComponent(
                    type
                  )}`}
                  onClick={closeMobileMenu}
                >
                  {type}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* MOBILE BRANDS */}
        <div className="mobile-menu-section">
          <button
            onClick={() =>
              setMobileBrandsOpen(
                !mobileBrandsOpen
              )
            }
          >
            BRANDS

            <span>
              {mobileBrandsOpen ? "−" : "+"}
            </span>
          </button>

          {mobileBrandsOpen && (
            <div className="mobile-submenu">

              <Link
                to="/shop?brand=Tomica"
                onClick={closeMobileMenu}
              >
                Tomica
              </Link>

              <Link
                to="/shop?brand=Mini%20GT"
                onClick={closeMobileMenu}
              >
                Mini GT
              </Link>

              <Link
                to="/shop?brand=Kyosho"
                onClick={closeMobileMenu}
              >
                Kyosho
              </Link>

              <Link
                to="/shop?brand=Bburago"
                onClick={closeMobileMenu}
              >
                Bburago
              </Link>

              <div className="mobile-subheading">
                HOT WHEELS
              </div>

              <Link
                to="/shop?brand=HotWheels&series=Mainline"
                onClick={closeMobileMenu}
              >
                Mainline
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=Premium"
                onClick={closeMobileMenu}
              >
                Premium
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=Elite%2064"
                onClick={closeMobileMenu}
              >
                Elite 64
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=RLC"
                onClick={closeMobileMenu}
              >
                RLC
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=Chase"
                onClick={closeMobileMenu}
              >
                Chase
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=TH%20%2F%20STH"
                onClick={closeMobileMenu}
              >
                TH / STH
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=Multipacks"
                onClick={closeMobileMenu}
              >
                Multipacks
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=Sets"
                onClick={closeMobileMenu}
              >
                Sets
              </Link>

              <Link
                to="/shop?brand=HotWheels&series=Team%20Transport"
                onClick={closeMobileMenu}
              >
                Team Transport
              </Link>

              <Link
                to="/shop?brand=HotWheels&scale=1:43"
                onClick={closeMobileMenu}
              >
                1:43
              </Link>

              <Link
                to="/shop?brand=HotWheels"
                onClick={closeMobileMenu}
              >
                View All Hot Wheels →
              </Link>

              <Link
                to="/shop?brand=Majorette"
                onClick={closeMobileMenu}
              >
                Majorette
              </Link>

              <Link
                to="/shop?brand=M2%20Machines"
                onClick={closeMobileMenu}
              >
                M2 Machines
              </Link>

              <Link
                to="/shop?brand=CCA"
                onClick={closeMobileMenu}
              >
                CCA
              </Link>

              <Link
                to="/shop?brand=Massdi"
                onClick={closeMobileMenu}
              >
                Massdi
              </Link>

              <Link
                to="/shop?brand=Matchbox"
                onClick={closeMobileMenu}
              >
                Matchbox
              </Link>

              <Link
                to="/shop?brand=Poster%20Cars"
                onClick={closeMobileMenu}
              >
                Poster Cars
              </Link>

              <Link
                to="/shop?brand=Para64"
                onClick={closeMobileMenu}
              >
                Para64
              </Link>

              <Link
                to="/shop?brand=LCD%20Models"
                onClick={closeMobileMenu}
              >
                LCD Models
              </Link>

              <Link
                to="/shop?brand=Disney"
                onClick={closeMobileMenu}
              >
                Disney
              </Link>

              <Link
                to="/shop?brand=Pop%20Race"
                onClick={closeMobileMenu}
              >
                Pop Race
              </Link>

              <Link
                to="/shop?brand=Time%20Micro"
                onClick={closeMobileMenu}
              >
                Time Micro
              </Link>

              <Link
                to="/shop?brand=Trends%20Hobby"
                onClick={closeMobileMenu}
              >
                Trends Hobby
              </Link>

              <Link
                to="/shop?brand=Hobby%20Japan"
                onClick={closeMobileMenu}
              >
                Hobby Japan
              </Link>

              <Link
                to="/shop?brand=Others"
                onClick={closeMobileMenu}
              >
                Others
              </Link>

              <Link
                to="/shop"
                onClick={closeMobileMenu}
              >
                View All Brands →
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE SCALES */}
        <div className="mobile-menu-section">
          <button
            onClick={() =>
              setMobileScalesOpen(
                !mobileScalesOpen
              )
            }
          >
            SCALES

            <span>
              {mobileScalesOpen ? "−" : "+"}
            </span>
          </button>

          {mobileScalesOpen && (
            <div className="mobile-submenu">

              <Link
                to="/shop?scale=1:64"
                onClick={closeMobileMenu}
              >
                1:64
              </Link>

              <Link
                to="/shop?scale=1:43"
                onClick={closeMobileMenu}
              >
                1:43
              </Link>

              <Link
                to="/shop?scale=1:32"
                onClick={closeMobileMenu}
              >
                1:32
              </Link>

              <Link
                to="/shop?scale=1:24"
                onClick={closeMobileMenu}
              >
                1:24
              </Link>

              <Link
                to="/shop?scale=1:18"
                onClick={closeMobileMenu}
              >
                1:18
              </Link>

              <Link
                to="/shop"
                onClick={closeMobileMenu}
              >
                View All Scales →
              </Link>
              <Link
  to="/shop?scale=Others"
  onClick={closeMobileMenu}
>
  Other Scales
</Link>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH POPUP */}
      {searchOpen && (
        <div
          className="search-overlay"
          onClick={() =>
            setSearchOpen(false)
          }
        >
          <div
            className="search-popup"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="search-close"
              onClick={() =>
                setSearchOpen(false)
              }
              aria-label="Close search"
            >
              ×
            </button>

            <p className="eyebrow">
              SEARCH THE COLLECTION
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!search.trim()) {
                  return;
                }

                setSearchOpen(false);

                navigate(
                  `/shop?search=${encodeURIComponent(
                    search.trim()
                  )}`
                );
              }}
            >
              <input
                autoFocus
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <button type="submit">
                SEARCH
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;