"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "../motion/reveal";
import { ShineButton } from "../motion/shine-button";

/**
 * Closing frame of the 3D journey — the box reassembles behind this section and
 * the secondary packaging drifts in around it. The copy block scales up
 * slightly as it arrives so the ending feels like a push-in, not a stop.
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.4, 1]);

  return (
    <section ref={ref} className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-container section-pad">
        <motion.div className="contact-content copy-veil" style={{ scale, opacity }}>
          <Reveal>
            <span className="section-kicker section-kicker-light">Ready to elevate your brand?</span>
          </Reveal>

          <Reveal as="h2" id="contact-title" delay={0.06}>
            Let&apos;s craft something
            <span>unforgettable together.</span>
          </Reveal>

          <Reveal className="contact-actions" delay={0.12}>
            <ShineButton href="#top" variant="primary">
              Start your project
              <ArrowUpRight size={18} aria-hidden="true" />
            </ShineButton>
          </Reveal>

          <Reveal className="contact-location" delay={0.18}>
            <Globe2 size={16} aria-hidden="true" />
            Serving ambitious brands across the UAE
          </Reveal>
        </motion.div>

        <div className="contact-3d-wrap">
          <Reveal className="scene-caption scene-caption-end">
            <span className="scene-caption-dot" aria-hidden="true" />
            <div>
              <strong>Boxes · Bags · Print</strong>
              <p>One system, produced in-house across the UAE.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
