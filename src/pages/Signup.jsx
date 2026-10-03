import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

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

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT IMAGE */}
      <div className="auth-image">
        <img
          src="/images/z-pair.webp"
          alt="Just Diecast Minis"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-container">
        <div className="auth-content">

          <p className="auth-eyebrow">
            JUST DIECAST MINIS
          </p>

          <h1>
            CREATE YOUR ACCOUNT
          </h1>

          <p className="auth-subtitle">
            Join JDM and keep your collection close.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="name">
                NAME
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

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
                placeholder="At least 8 characters"
                minLength="8"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                minLength="8"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">
              LOG IN
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Signup;