import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getUserData,
  saveAddresses,
  changePassword
} from "../api/user";

function Profile() {
  const savedUser =
    localStorage.getItem("jdm_user");

  const user = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [addresses, setAddresses] =
    useState([]);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState({
      address: "",
      city: "",
      state: "",
      pincode: ""
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

  const [showPasswords, setShowPasswords] =
    useState({
      current: false,
      new: false,
      confirm: false
    });

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  useEffect(() => {
  const loadAddresses = async () => {
    try {
      const data = await getUserData();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error(
        "Unable to load saved addresses:",
        error
      );
    }
  };

  if (user) {
    loadAddresses();
  }
}, []);

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <h1>MY ACCOUNT</h1>

          <p>
            Please log in to view your account.
          </p>

          <Link
            to="/login"
            className="profile-button"
          >
            LOGIN
          </Link>
        </div>
      </main>
    );
  }

  const handleAddressChange = (event) => {
    setAddressForm({
      ...addressForm,
      [event.target.name]:
        event.target.value
    });
  };

  const addAddress = async (event) => {
    event.preventDefault();

    const updatedAddresses = [
      ...addresses,
      addressForm
    ];

    try {
      await saveAddresses(
        updatedAddresses
      );

      setAddresses(updatedAddresses);

      const updatedUser = {
        ...user,
        addresses: updatedAddresses
      };

      localStorage.setItem(
        "jdm_user",
        JSON.stringify(updatedUser)
      );

      setAddressForm({
        address: "",
        city: "",
        state: "",
        pincode: ""
      });

      setShowAddressForm(false);
    } catch (error) {
      console.error(
        "Unable to save address:",
        error
      );
    }
  };

  const deleteAddress = async (index) => {
    const updatedAddresses =
      addresses.filter(
        (_, addressIndex) =>
          addressIndex !== index
      );

    try {
      await saveAddresses(
        updatedAddresses
      );

      setAddresses(updatedAddresses);

      const updatedUser = {
        ...user,
        addresses: updatedAddresses
      };

      localStorage.setItem(
        "jdm_user",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error(
        "Unable to delete address:",
        error
      );
    }
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]:
        event.target.value
    });

    setPasswordMessage("");
    setPasswordError("");
  };

  const togglePasswordVisibility = (
    field
  ) => {
    setShowPasswords({
      ...showPasswords,
      [field]:
        !showPasswords[field]
    });
  };

  const handleChangePassword = async (
    event
  ) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordForm;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long."
      );

      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match."
      );

      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setPasswordError(
        "New password must be different from your current password."
      );

      return;
    }

    setChangingPassword(true);

    try {
      const response =
        await changePassword(
          currentPassword,
          newPassword
        );

      setPasswordMessage(
        response.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      setPasswordError(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <span>MY ACCOUNT</span>

          <h1>
            WELCOME,{" "}
            {user.name.toUpperCase()}
          </h1>
        </div>

        <div className="profile-card">

          <div className="profile-section">
            <h2>ACCOUNT DETAILS</h2>

            <div className="profile-detail">
              <span>NAME</span>

              <strong>
                {user.name}
              </strong>
            </div>

            <div className="profile-detail">
              <span>EMAIL</span>

              <strong>
                {user.email}
              </strong>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-header">

              <h2>SAVED ADDRESSES</h2>

              <button
                className="profile-button"
                onClick={() =>
                  setShowAddressForm(
                    !showAddressForm
                  )
                }
              >
                {showAddressForm
                  ? "CANCEL"
                  : "ADD ADDRESS"}
              </button>

            </div>

            {showAddressForm && (
              <form
                className="address-form"
                onSubmit={addAddress}
              >

                <div className="form-group">
  <label htmlFor="address">
    FULL DELIVERY ADDRESS
  </label>

  <textarea
    id="address"
    name="address"
    value={addressForm.address}
    onChange={handleAddressChange}
    placeholder={
      "Flat / House No., Street, Area,\n" +
      "Landmark (if available)"
    }
    rows="4"
    required
  />

  <small className="checkout-field-hint">
    Include your flat or house number, street, area,
    and a nearby landmark if available.
  </small>
</div>

                <div className="form-group">
                  <label htmlFor="city">
                    CITY
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={
                      addressForm.city
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">
                    STATE
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={
                      addressForm.state
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="State"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">
                    PINCODE
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={
                      addressForm.pincode
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="Pincode"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  SAVE ADDRESS
                </button>

              </form>
            )}

            {addresses.length === 0 &&
              !showAddressForm && (
                <p className="no-addresses">
                  NO SAVED ADDRESSES.
                </p>
              )}

            <div className="saved-addresses">

              {addresses.map(
                (
                  savedAddress,
                  index
                ) => (
                  <div
                    className="saved-address"
                    key={index}
                  >

                    <div>
                      <strong>
                        {
                          savedAddress.address
                        }
                      </strong>

                      <p>
                        {savedAddress.city},{" "}
                        {savedAddress.state}{" "}
                        {
                          savedAddress.pincode
                        }
                      </p>
                    </div>

                    <button
                      className="address-delete"
                      onClick={() =>
                        deleteAddress(index)
                      }
                    >
                      DELETE
                    </button>

                  </div>
                )
              )}

            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-header">

              <h2>CHANGE PASSWORD</h2>

            </div>

            <form
              className="address-form password-form"
              onSubmit={
                handleChangePassword
              }
            >

              <div className="form-group">
                <label htmlFor="currentPassword">
                  CURRENT PASSWORD
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={
                      showPasswords.current
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Current password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      togglePasswordVisibility(
                        "current"
                      )
                    }
                  >
                    {showPasswords.current
                      ? "HIDE"
                      : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">
                  NEW PASSWORD
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showPasswords.new
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordForm.newPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="New password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      togglePasswordVisibility(
                        "new"
                      )
                    }
                  >
                    {showPasswords.new
                      ? "HIDE"
                      : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  CONFIRM NEW PASSWORD
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showPasswords.confirm
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Confirm new password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      togglePasswordVisibility(
                        "confirm"
                      )
                    }
                  >
                    {showPasswords.confirm
                      ? "HIDE"
                      : "SHOW"}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="password-error">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p className="password-success">
                  {passwordMessage}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  changingPassword
                }
              >
                {changingPassword
                  ? "CHANGING PASSWORD..."
                  : "CHANGE PASSWORD"}
              </button>

            </form>
          </div>

          <div className="profile-actions">

            <Link
              to="/orders"
              className="profile-button"
            >
              MY ORDERS
            </Link>

            <Link
              to="/shop"
              className="profile-button profile-button-outline"
            >
              CONTINUE SHOPPING
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}

export default Profile;
