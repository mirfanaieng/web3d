"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { EASE_OUT_EXPO, Reveal } from "../motion/reveal";
import { ShineButton } from "../motion/shine-button";
import { capabilities } from "../site-data";

const EMPHASISED = new Set([0, 3, 7]);

export function Capabilities() {
  return (
    <section className="capabilities section-pad" id="capabilities" aria-labelledby="capabilities-title">
      <div className="capabilities-heading">
        <Reveal>
          <span className="section-kicker">Built to flex</span>
        </Reveal>
        <h2 id="capabilities-title" data-split>
          One studio. Many expressions.
        </h2>
      </div>

      <motion.div
        className="capability-wall"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
      >
        {capabilities.map((capability, index) => (
          <motion.span
            key={capability}
            className={EMPHASISED.has(index) ? "is-emphasised" : ""}
            variants={{
              hidden: { opacity: 0, y: 18, scale: 0.94 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
            }}
            whileHover={{ y: -4, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Check size={14} aria-hidden="true" />
            {capability}
          </motion.span>
        ))}
      </motion.div>

      <Reveal className="capability-foot">
        <p>
          Whether you are launching a new product or elevating an existing brand, we help you choose
          the packaging move that makes the biggest impression.
        </p>
        <ShineButton href="#contact" variant="outline">
          Start a conversation
          <ArrowRight size={17} aria-hidden="true" />
        </ShineButton>
      </Reveal>
    </section>
  );
}
