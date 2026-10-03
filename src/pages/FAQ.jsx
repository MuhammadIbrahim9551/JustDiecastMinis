import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "What scale models do you sell?",
      answer:
        "We currently focus primarily on 1:64 scale diecast models, with a selection of other scales planned for the future."
    },
    {
      question: "Which model makers do you stock?",
      answer:
        "Our collection includes makers such as Matchbox, Mini GT, CCA, Hot Wheels, Bburago, Majorette and more. Our selection will continue to grow."
    },
    {
      question: "Are all models brand new?",
      answer:
        "Unless specifically mentioned otherwise, our models are supplied as new collectibles. Product listings will clearly indicate the condition of each model."
    },
    {
      question: "What does PRE-ORDER mean?",
      answer:
        "A pre-order model is not currently available in stock. Register your interest through the pre-order form and we'll contact you when the model becomes available."
    },
    {
      question: "Can I cancel an order?",
      answer:
        "Cancellation requests can be made before an order is dispatched. Contact us as soon as possible with your order number and we'll let you know what can be done."
    },
    {
      question: "Do you ship across India?",
      answer:
        "Yes. We aim to make our miniature collection available to collectors across India. Shipping availability and charges are shown during checkout."
    },
    {
      question: "How long does it take for you to dispatch an order?",
      answer:
        "We usually take 1-2 days to dispatch from the day of confirmation."
    },
    {
      question: "Will my models be packed safely?",
      answer:
        "Absolutely. Diecast models are collectibles, so we take care to package orders securely to reduce the risk of damage during transit."
    },
    {
      question: "Can I request a particular model?",
      answer:
        "Yes. If there's a model you're looking for, get in touch with us. While we can't guarantee availability, we'll be happy to see whether we can source it."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(
      openQuestion === index ? null : index
    );
  };

  return (
  <main className="faq-page">
  <section className="faq-header">
    <p className="eyebrow">HELP</p>
    <h1>FAQ.</h1>
    <p>
      Everything you need to know before
      adding another miniature to the shelf.
    </p>
  </section>
    

    <section className="faq-list">
        {faqs.map((faq, index) => (
          <div
            className={`faq-item ${
              openQuestion === index
                ? "faq-item-open"
                : ""
            }`}
            key={faq.question}
          >
            <button
              className="faq-question"
              onClick={() => toggleQuestion(index)}
              aria-expanded={openQuestion === index}
            >
              <span>{faq.question}</span>
              <span className="faq-icon">
                {openQuestion === index
                  ? "−"
                  : "+"}
              </span>
            </button>

            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="faq-bottom">
        <p className="eyebrow">STILL CURIOUS?</p>
        <h2>Can't find what you're looking for?</h2>
        <Link
          to="/contact"
          className="faq-contact-button"
        >
          CONTACT JDM
        </Link>
      </section>
    </main>
  );
}

export default FAQ;