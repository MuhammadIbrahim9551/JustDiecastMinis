import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faYoutube,
  faWhatsapp
} from "@fortawesome/free-brands-svg-icons";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import About from "./pages/About.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import FAQ from "./pages/FAQ.jsx";
import Shipping from "./pages/Shipping.jsx";
import Contact from "./pages/Contact.jsx";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile.jsx";
import OrderDetails from "./pages/OrderDetails";
import Admin from "./pages/Admin";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ReviewForm from "./pages/ReviewForm";

import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import {
  getUserData,
  saveCart,
  saveWishlist
} from "./api/user";


function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/shop") {
      return;
    }

    window.scrollTo(0, 0);
  }, [location.key, location.pathname]);

  return null;
}


function App() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("jdm_user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const [userDataLoaded, setUserDataLoaded] = useState(false);


  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("jdm_token");

      setUserDataLoaded(false);

      if (!token) {
        setCart([]);
        setWishlist([]);
        return;
      }

      try {
        const data = await getUserData();

        const savedGuestCart =
          sessionStorage.getItem("jdm_guest_cart");

        let finalCart = data.cart || [];

        if (savedGuestCart) {
          const guestCart = JSON.parse(savedGuestCart);

          guestCart.forEach((guestItem) => {
            const existingItem = finalCart.find(
              (item) => item.id === guestItem.id
            );

            if (existingItem) {
              finalCart = finalCart.map((item) =>
                item.id === guestItem.id
                  ? {
                      ...item,
                      quantity:
                        item.quantity +
                        guestItem.quantity
                    }
                  : item
              );
            } else {
              finalCart = [
                ...finalCart,
                guestItem
              ];
            }
          });

          sessionStorage.removeItem(
            "jdm_guest_cart"
          );
        }

        setCart(finalCart);
        setWishlist(data.wishlist || []);
        setUserDataLoaded(true);

      } catch (error) {
        console.error(
          "Unable to load user data:",
          error
        );
      }
    };

    loadUserData();
  }, [user]);


  useEffect(() => {
    const handleAuthChange = () => {
      const savedUser =
        localStorage.getItem("jdm_user");

      setUser(
        savedUser
          ? JSON.parse(savedUser)
          : null
      );
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


  useEffect(() => {
    if (!user || !userDataLoaded) {
      return;
    }

    saveCart(cart).catch((error) => {
      console.error(
        "Unable to save cart:",
        error
      );
    });
  }, [
    cart,
    user,
    userDataLoaded
  ]);


  useEffect(() => {
    if (!user || !userDataLoaded) {
      return;
    }

    saveWishlist(wishlist).catch((error) => {
      console.error(
        "Unable to save wishlist:",
        error
      );
    });
  }, [
    wishlist,
    user,
    userDataLoaded
  ]);


  return (
    <BrowserRouter>

      <ScrollManager />

      <div className="app">

        <AuthLayout
          cart={cart}
          wishlist={wishlist}
        />

        <Routes>

          <Route
            path="/review/:orderId"
            element={<ReviewForm />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          <Route
            path="/"
            element={
              <Home
                cart={cart}
                setCart={setCart}
              />
            }
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/faq"
            element={<FAQ />}
          />

          <Route
            path="/shipping"
            element={<Shipping />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/shop"
            element={
              <Shop
                cart={cart}
                setCart={setCart}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            }
          />

          {/* PRODUCT DETAILS */}
          <Route
            path="/product/:id"
            element={
              <ProductDetails
                cart={cart}
                setCart={setCart}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                setCart={setCart}
              />
            }
          />

          <Route
            path="/wishlist"
            element={
              <Wishlist
                wishlist={wishlist}
                setWishlist={setWishlist}
                setCart={setCart}
              />
            }
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:orderId"
            element={<OrderDetails />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/admin"
            element={<Admin />}
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                setCart={setCart}
              />
            }
          />

        </Routes>

        <FooterLayout />

      </div>

    </BrowserRouter>
  );
}


function AuthLayout({
  cart,
  wishlist
}) {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith(
      "/reset-password/"
    );

  if (isAuthPage) {
    return null;
  }

  return (
    <Navbar
      cart={cart}
      wishlist={wishlist}
    />
  );
}


function FooterLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith(
      "/reset-password/"
    );

  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="site-footer">

      <div className="footer-main">

        <div className="footer-brand">

          <div className="footer-logo">

            <img
              src="/images/favicon.JPG"
              alt="JDM"
            />

            <span>
              JUST DIECAST MINIS
            </span>

          </div>

          <p>
            The world's greatest automobiles.
            <br />
            Only in miniature.
          </p>

        </div>


        <div className="footer-column">

          <h4>SHOP</h4>

          <Link to="/shop?category=new-arrivals">
            New Arrivals
          </Link>

          <Link to="/shop?scale=1:64">
            1:64
          </Link>

          <Link to="/shop?type=JDM">
            JDM
          </Link>

          <Link to="/shop?type=Supercars">
            Supercars
          </Link>

          <Link to="/shop?type=Rally">
            Rally
          </Link>

        </div>


        <div className="footer-column">

          <h4>MODEL MAKERS</h4>

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

          <Link to="/shop?brand=HotWheels">
            HotWheels
          </Link>

        </div>


        <div className="footer-column">

          <h4>HELP</h4>

          <Link to="/about">
            About Us
          </Link>

          <Link to="/faq">
            FAQ
          </Link>

          <Link to="/contact">
            Contact
          </Link>

          <Link to="/shipping">
            Shipping & Returns
          </Link>

        </div>

      </div>

      <div className="footer-column footer-social">
  <h4>SOCIAL</h4>

  <div className="footer-social-links">
    <a
      href="https://www.instagram.com/justdiecastminis/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
    >
      <FontAwesomeIcon icon={faInstagram} />
    </a>


<a
  href="https://www.youtube.com/@R33RB26"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="YouTube"
>
  <FontAwesomeIcon icon={faYoutube} />
</a>

<a
  href="https://chat.whatsapp.com/LnIyml6TqJfI0N7KEdyNpM"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="WhatsApp"
>
  <FontAwesomeIcon icon={faWhatsapp} />
</a>


  </div>
</div>




      <div className="footer-bottom">

        <span>
          © 2026 JUST DIECAST MINIS
        </span>

        <span>
          MADE FOR COLLECTORS.
        </span>

      </div>

    </footer>
  );
}


export default App;
