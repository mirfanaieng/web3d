"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "../motion/reveal";
import { TiltCard } from "../motion/tilt-card";
import { services } from "../site-data";

/**
 * Horizontally-scrubbed card track. GSAP pins the section and drives the x
 * translation (see `SiteAnimations`), dispatching `service-active` as each card
 * passes centre; everything visual inside a card is Framer Motion.
 */
export function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const handler = (event: Event) => setActiveIndex((event as CustomEvent<number>).detail);
    element.addEventListener("service-active", handler);
    return () => element.removeEventListener("service-active", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="services-section"
      id="services"
      data-horizontal-shell
      aria-labelledby="services-title"
    >
      <div className="services-container section-pad">
        <div className="services-sticky-panel">
          <div className="services-heading copy-veil" data-reveal>
            <span className="section-kicker">What we make</span>
            <h2 id="services-title" data-split>
              Every surface is an opportunity.
            </h2>
            <p>
              From structural packaging to printed collateral, we shape tactile experiences that
              feel elevated, refined and unmistakably brand-led.
            </p>

            {/* Track position readout — doubles as the pinned section's progress cue. */}
            <div className="services-ticks" aria-hidden="true">
              {services.map((service, index) => (
                <span key={service.index} className={index === activeIndex ? "is-active" : ""}>
                  {index === activeIndex ? (
                    <motion.i layoutId="service-tick" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="services-track" data-horizontal-track>
          {services.map((service, index) => (
            <TiltCard
              key={service.index}
              className={`service-card service-${service.tone} ${activeIndex === index ? "is-active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onTouchStart={() => setActiveIndex(index)}
            >
              <div className="service-card-top">
                <span>{service.index}</span>
                <motion.span
                  className="service-card-arrow"
                  animate={{ rotate: activeIndex === index ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <ArrowUpRight size={18} aria-hidden="true" />
                </motion.span>
              </div>

              <div className="service-shape" aria-hidden="true">
                {[0, 1, 2].map((bar) => (
                  <motion.span
                    key={bar}
                    animate={{
                      scaleX: activeIndex === index ? 1 : 0.62,
                      opacity: activeIndex === index ? 1 : 0.45,
                    }}
                    transition={{ duration: 0.5, delay: bar * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>

              <div className="service-copy">
                <span className="service-eyebrow">{service.eyebrow}</span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </div>

              <ul>
                {service.notes.map((note) => (
                  <motion.li
                    key={note}
                    whileHover={{ y: -2, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {note}
                  </motion.li>
                ))}
              </ul>
            </TiltCard>
          ))}

          <Reveal className="service-end-card" aria-hidden="true">
            <span>Built around your brand</span>
            <motion.span
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <MoveRight size={28} />
            </motion.span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
