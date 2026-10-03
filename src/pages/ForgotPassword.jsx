import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("FORGOT PASSWORD SUBMITTED");

    setMessage("");
    setError("");
    setLoading(true);

    try {
      console.log("SENDING REQUEST TO BACKEND");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email
          })
        }
      );

      console.log(
        "BACKEND RESPONSE STATUS:",
        response.status
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to process password reset request."
        );
      }

      setMessage(data.message);
      setEmail("");
    } catch (error) {
      console.error(
        "FORGOT PASSWORD REQUEST ERROR:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-container">
        <div className="auth-content">

          <div className="auth-header">
            <span>
              ACCOUNT RECOVERY
            </span>

            <h1>
              FORGOT PASSWORD?
            </h1>

            <p>
              Enter your email address
              and we'll help you reset
              your password.
            </p>
          </div>

          {message && (
            <p className="password-success">
              {message}
            </p>
          )}

          {error && (
            <p className="password-error">
              {error}
            </p>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="email">
                EMAIL
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "SENDING..."
                : "SEND RESET LINK"}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Remember your password?
            </span>

            <Link to="/login">
              BACK TO LOGIN
            </Link>
          </div>

        </div>
      </div>

      <div className="auth-image">
        <img
          src="/images/z-spotlight.webp"
          alt="JDM automotive"
        />
      </div>

    </main>
  );
}

export default ForgotPassword;