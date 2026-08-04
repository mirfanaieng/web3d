"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { Counter } from "../motion/counter";
import { Reveal, RevealItem, Stagger } from "../motion/reveal";

/**
 * Statement section. The lede scales and lifts fractionally as the section
 * crosses the viewport — enough to feel like the page has depth, small enough
 * that nobody consciously notices it.
 */
export function Introduction() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.97]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="intro section-pad" aria-labelledby="intro-title">
      <Reveal className="intro-side">
        <span className="section-kicker">The Pack Style</span>
        <span className="section-index">01</span>
      </Reveal>

      <div className="intro-grid-wrap">
        <motion.div className="intro-main copy-veil" style={{ scale }}>
          <Reveal as="p" className="intro-lede" id="intro-title">
            Packaging is not an accessory. It is the first signal of value, taste and intention.
          </Reveal>

          <Reveal className="intro-meta" delay={0.1}>
            <p>
              We design packaging systems that feel considered from the first glance to the final
              unboxing — blending structure, print and tactile detail for brands that want to stand
              out with quiet confidence.
            </p>
            <motion.a
              className="circular-link"
              href="#approach"
              aria-label="Learn about our approach"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <span>See our approach</span>
              <ArrowDown size={18} aria-hidden="true" />
            </motion.a>
          </Reveal>

          <Stagger className="intro-stats" gap={0.1}>
            <RevealItem className="intro-stat">
              <strong>
                <Counter value={24} suffix="+" />
              </strong>
              <span>Packaging formats</span>
            </RevealItem>
            <RevealItem className="intro-stat">
              <strong>UAE</strong>
              <span>Based studio</span>
            </RevealItem>
            <RevealItem className="intro-stat">
              <strong>
                <Counter value={100} suffix="%" />
              </strong>
              <span>Brand-led process</span>
            </RevealItem>
          </Stagger>
        </motion.div>

        <motion.div className="intro-3d-side" style={{ y }} aria-hidden="true" />
      </div>
    </section>
  );
}
