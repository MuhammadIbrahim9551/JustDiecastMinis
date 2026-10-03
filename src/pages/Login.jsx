import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import { login } from "../api/auth";

function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {

      const data = await login(formData);

      localStorage.setItem(
        "jdm_token",
        data.token
      );

      localStorage.setItem(
        "jdm_user",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(
        new Event("jdm-auth-change")
      );

      navigate(
        location.state?.from || "/"
      );

    } catch (error) {

      setError(error.message);

    } finally {

      setIsSubmitting(false);

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-image">

        <img
          src="/images/trio2.jpg"
          alt="Just Diecast Minis"
        />

      </div>


      <div className="auth-container">

        <div className="auth-content">

          <p className="auth-eyebrow">
            JUST DIECAST MINIS
          </p>

          <h1>WELCOME BACK</h1>

          <p className="auth-subtitle">
            Log in to access your JDM account.
          </p>


          {error && (

            <div className="auth-error">
              {error}
            </div>

          )}


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="email">
                EMAIL
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="password">
                PASSWORD
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />

              <Link
                to="/forgot-password"
                className="forgot-password-link"
              >
                FORGOT PASSWORD?
              </Link>

            </div>


            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "LOGGING IN..."
                : "LOG IN"}
            </button>

          </form>


          <p className="auth-switch">

            Don't have an account?{" "}

            <Link to="/signup">
              CREATE ONE
            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Login;