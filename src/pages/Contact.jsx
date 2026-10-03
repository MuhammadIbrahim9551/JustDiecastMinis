import { useState } from "react";
import "../App.css";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/contact`,
  {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          subject: formData.get("subject"),
          message: formData.get("message")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send your message."
        );
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(
        err.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
      <section className="contact-header">
        <p className="eyebrow">GET IN TOUCH</p>

        <h1>
          CONTACT
          <br />
          JDM.
        </h1>

        <p>
          Looking for a particular model, have a question,
          or just want to talk cars? We'd love to hear from you.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-intro">
          <p className="eyebrow">LET'S TALK</p>

          <h2>What's on your mind?</h2>

          <p>
            Whether you're searching for a specific miniature
            or need help with an order, send us a message and
            we'll get back to you.
          </p>
        </div>

        <div className="contact-form-area">
          {submitted ? (
            <div className="contact-success">
              <p className="eyebrow">MESSAGE SENT</p>

              <h2>Thanks for reaching out.</h2>

              <p>
                We've received your message and will get back
                to you as soon as possible.
              </p>

              <button
                className="contact-reset-button"
                onClick={() => {
                  setSubmitted(false);
                  setError("");
                }}
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="contact-error" role="alert">
                  {error}
                </div>
              )}

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">
                      NAME
                    </label>

                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-email">
                      EMAIL
                    </label>

                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="Your email"
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-phone">
                      PHONE
                    </label>

                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-subject">
                    SUBJECT
                  </label>

                  <select
                    id="contact-subject"
                    name="subject"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>

                    <option value="order">
                      Order enquiry
                    </option>

                    <option value="model">
                      Model request
                    </option>

                    <option value="preorder">
                      Pre-order enquiry
                    </option>

                    <option value="shipping">
                      Shipping & returns
                    </option>

                    <option value="other">
                      Something else
                    </option>
                  </select>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-message">
                    MESSAGE
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows="7"
                    placeholder="Tell us what's on your mind..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="contact-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "SENDING..."
                    : "SEND MESSAGE"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Contact;