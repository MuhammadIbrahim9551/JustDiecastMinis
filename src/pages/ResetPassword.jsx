import { useState } from "react";
import { Link, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPasswords, setShowPasswords] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            newPassword
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reset password."
        );
      }

      setMessage(data.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
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
            <span>ACCOUNT RECOVERY</span>

            <h1>
              RESET PASSWORD
            </h1>

            <p>
              Create a new password for
              your JDM account.
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

          {!message && (
            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">
                <label htmlFor="newPassword">
                  NEW PASSWORD
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="newPassword"
                    type={
                      showPasswords
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPasswords(
                        !showPasswords
                      )
                    }
                  >
                    {showPasswords
                      ? "HIDE"
                      : "SHOW"}
                  </button>

                </div>
              </div>


              <div className="form-group">
                <label htmlFor="confirmPassword">
                  CONFIRM PASSWORD
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="confirmPassword"
                    type={
                      showPasswords
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    required
                  />

                </div>
              </div>


              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "RESETTING..."
                  : "RESET PASSWORD"}
              </button>

            </form>
          )}


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
    </main>
  );
}

export default ResetPassword;
