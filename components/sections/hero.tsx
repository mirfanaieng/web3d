"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { FINISHES, FINISH_ORDER, type FinishKey } from "../procedural-box";
import { EASE_OUT_EXPO } from "../motion/reveal";
import { ShineButton } from "../motion/shine-button";

/* ─── Choreography ───
   One container drives the whole opening: eyebrow, two masked headline lines,
   summary, actions and the finish panel each arrive on the same curve, 90ms
   apart, so the hero resolves as a single move. */

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.25 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

/** Masked line reveal: the line slides up out of its own overflow-hidden box. */
const lineMask: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-gradient hero-gradient-one" aria-hidden="true" />
      <div className="hero-gradient hero-gradient-two" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      {/* Radial spotlights behind the 3D box — the "lit stage" the model sits on. */}
      <div className="hero-3d-ambient-backdrop" aria-hidden="true">
        <motion.div
          className="hero-ambient-outer-glow"
          animate={{ opacity: [0.55, 0.9, 0.55], scale: [0.94, 1.06, 0.94] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-ambient-core-highlight"
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.9, 1.12, 0.9] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </div>

      <motion.div
        className="hero-copy"
        data-hero-copy
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="eyebrow" data-hero-float="1" variants={fadeUp}>
          <span className="eyebrow-dot" />
          Premium packaging &amp; print · UAE
        </motion.div>

        <h1 id="hero-title" data-hero-float="2">
          <span className="hero-line-mask">
            <motion.span className="hero-title-line" variants={lineMask}>
              Packaging, made
            </motion.span>
          </span>
          <span className="hero-line-mask">
            <motion.span className="hero-title-line hero-title-accent" variants={lineMask}>
              unforgettable.
            </motion.span>
          </span>
        </h1>

        <motion.p className="hero-summary" data-hero-float="3" variants={fadeUp}>
          Tactile brand experiences that turn every unboxing into a moment of recognition —
          thoughtful, designed and made to leave a mark.
        </motion.p>

        <motion.div className="hero-actions" data-hero-float="4" variants={fadeUp}>
          <ShineButton href="#services" variant="primary">
            Explore our craft
            <ArrowRight size={17} aria-hidden="true" />
          </ShineButton>

          <motion.a className="text-link" href="#approach" whileHover="hover" initial="initial">
            <span>How we work</span>
            <motion.span
              className="text-link-icon"
              variants={{ initial: { y: 0 }, hover: { y: 4 } }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <ArrowDown size={17} aria-hidden="true" />
            </motion.span>
          </motion.a>
        </motion.div>

        <motion.div className="hero-proof" data-hero-float="5" variants={fadeUp}>
          <Sparkles size={14} aria-hidden="true" />
          <span>Move your cursor — the box responds</span>
        </motion.div>
      </motion.div>

      <div className="hero-finish-panel" data-hero-float="6">
        <FinishSwitcher />
      </div>

      <div className="hero-bottom" aria-hidden="true" data-hero-float="0">
        <span>Scroll to discover</span>
        <span className="scroll-mark">
          <motion.i
            animate={{ y: [-3, 5, -3], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}

/**
 * Live material switcher. Selecting a finish dispatches a window event the 3D
 * scene listens for and tweens to — a DOM event rather than shared state
 * because the canvas is loaded through a dynamic boundary and has no React
 * ancestor in common with this panel.
 */
function FinishSwitcher() {
  const [active, setActive] = useState<FinishKey>("gold");
  const reduced = useReducedMotion();

  const select = (key: FinishKey) => {
    setActive(key);
    window.dispatchEvent(new CustomEvent<FinishKey>("finish-select", { detail: key }));
  };

  return (
    <motion.div
      className="finish-switcher glass-panel"
      initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.9 }}
    >
      <span className="finish-switcher-title">Live finish &amp; foil</span>

      <div className="finish-switcher-list" role="group" aria-label="Box finish">
        {FINISH_ORDER.map((key) => {
          const isActive = active === key;
          return (
            <motion.button
              key={key}
              type="button"
              className={`finish-switcher-item ${isActive ? "is-active" : ""}`}
              onClick={() => select(key)}
              aria-pressed={isActive}
              whileHover={reduced ? undefined : { x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            >
              {/* layoutId gives the active pill a single shared element that
                  springs between rows instead of four cross-fading backgrounds. */}
              {isActive ? (
                <motion.span
                  className="finish-switcher-active"
                  layoutId="finish-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className="finish-swatch"
                style={{ background: FINISHES[key].boxColor, borderColor: FINISHES[key].foilColor }}
                aria-hidden="true"
              />
              <span className="finish-switcher-label">{FINISHES[key].label}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="finish-switcher-note">
        Select a finish — the box and the whole page change with it.
      </p>
    </motion.div>
  );
}
