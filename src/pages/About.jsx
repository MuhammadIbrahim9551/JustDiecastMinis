import { useEffect } from "react";
import "../App.css";
import Reveal from "../components/Reveal";

function About() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto"
    });
  }, []);

  return (
    <main className="about-page">
      <section className="about-hero">
        <Reveal>
          <p className="eyebrow">ABOUT JDM</p>
        </Reveal>

        <Reveal className="reveal-delay-1">
          <h1>
            GREAT CARS.
            <br />
            <span>JUST SMALLER.</span>
          </h1>
        </Reveal>

        <Reveal className="reveal-delay-2">
          <p className="about-intro">
            Just Diecast Minis is built for those who appreciate cars in every form.
            From legendary classics to modern icons, and everything in between.
            Curated by enthusiasts, for enthusiasts who know that car culture is
            about more than four wheels.
          </p>
        </Reveal>
      </section>

      <section className="about-story">
        <Reveal>
          <div className="about-story-image">
            <img src="public/images/supra_skyline.jpg" alt="Diecast model" />
          </div>
        </Reveal>

        <Reveal className="reveal-delay-1">
          <div className="about-story-text">
            <p className="eyebrow">THE IDEA</p>

            <h2>
              SOME DREAMS
              <br />
              BELONG ON THE ROAD.
            </h2>

            <p>
              Others belong on your shelf.
            </p>

            <p>
              We created Just Diecast Minis to bring together miniature
              automobiles that deserve more than just a place in a toy box.
              Every model represents something bigger — a design, a machine,
              a memory, or simply a car we've always wanted.
            </p>

            <p>
              Our collection focuses primarily on 1:64 scale, bringing together
              models from established manufacturers and giving collectors a
              place to discover their next miniature obsession.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="about-values">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WHAT WE BELIEVE</p>
            <h2>MORE THAN MINIATURES.</h2>
          </div>
        </div>

        <div className="about-values-grid">
          <div>
            <span>01</span>
            <h3>AUTHENTICITY</h3>
            <p>
              The details matter. We care about the cars, the manufacturers,
              and the miniature versions that faithfully represent them.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>PASSION</h3>
            <p>
              This isn't just another catalogue of toys. It's a collection
              built around a genuine love for automobiles.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>DISCOVERY</h3>
            <p>
              From familiar icons to cars you may never have heard of,
              there's always another miniature worth discovering.
            </p>
          </div>
        </div>
      </section>

      <section className="about-quote">
        <p>
          “The world's greatest automobiles.
          <br />
          Only in miniature.”
        </p>
      </section>
    </main>
  );
}

export default About;