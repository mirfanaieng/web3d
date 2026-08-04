"use client";

import { Accordion } from "../motion/accordion";
import { Reveal } from "../motion/reveal";
import { faqs } from "../site-data";

export function Faq() {
  return (
    <section className="faq-section section-pad" id="faq" aria-labelledby="faq-title">
      <div className="faq-grid">
        <div className="faq-heading">
          <Reveal>
            <span className="section-kicker">Before you ask</span>
          </Reveal>
          <h2 id="faq-title" data-split>
            The practical part.
          </h2>
          <Reveal as="p" delay={0.12}>
            Quantities, timelines and how we work with an existing identity.
          </Reveal>
        </div>

        <div className="faq-body copy-veil">
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
