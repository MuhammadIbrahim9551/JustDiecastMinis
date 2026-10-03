import { Link } from "react-router-dom";
import "../App.css";

function Shipping() {
  return (
    <main className="shipping-page">
      <section className="shipping-header">
        <p className="eyebrow">HELP</p>
        <h1>SHIPPING<br />& RETURNS.</h1>
        <p>
          Everything you need to know about getting
          your miniatures safely from us to your shelf.
        </p>
      </section>

      <section className="shipping-sections">
        <article className="shipping-section">
          <div className="shipping-section-number">01</div>
          <div>
            <h2>SHIPPING</h2>
            <p>
              We currently ship miniature models across India.
              Shipping availability and charges will be shown
              during checkout.
            </p>
            <p>
              Every order is carefully packed with the
              collectible nature of diecast models in mind,
              helping keep your models protected during transit.
            </p>
          </div>
        </article>

        <article className="shipping-section">
          <div className="shipping-section-number">02</div>
          <div>
            <h2>PROCESSING</h2>
            <p>
              Orders are prepared for dispatch after payment
              has been confirmed. Processing and delivery times
              may vary depending on product availability and
              your location.
            </p>
          </div>
        </article>

        <article className="shipping-section">
          <div className="shipping-section-number">03</div>
          <div>
            <h2>PRE-ORDERS</h2>
            <p>
              Pre-order models are not currently held in stock.
              Registering your interest does not guarantee
              availability, but we'll contact you when the model
              becomes available.
            </p>
          </div>
        </article>

        <article className="shipping-section">
          <div className="shipping-section-number">04</div>
          <div>
            <h2>RETURNS</h2>
            <p>
              If your model arrives damaged or there is an issue
              with your order, please contact us as soon as
              possible with your order details and photographs
              of the package and model.
            </p>
            <p>
              Returns and replacements are subject to inspection
              and availability.
            </p>
          </div>
        </article>

        <article className="shipping-section">
          <div className="shipping-section-number">05</div>
          <div>
            <h2>BEFORE YOU RETURN</h2>
            <p>
              Please keep the original packaging and all
              accessories until your issue has been resolved.
              Collectible models should be returned in the same
              condition in which they were received.
            </p>
          </div>
        </article>
      </section>

      <section className="shipping-bottom">
        <p className="eyebrow">NEED HELP?</p>
        <h2>Something went wrong with your order?</h2>
        <p>
          Get in touch and we'll help you sort it out.
        </p>

        <Link
          to="/contact"
          className="shipping-contact-button"
        >
          CONTACT JDM
        </Link>
      </section>
    </main>
  );
}

export default Shipping;