"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Counter } from "../motion/counter";
import { EASE_OUT_EXPO, Reveal } from "../motion/reveal";
import { SpotlightArea } from "../motion/spotlight";
import { TiltCard } from "../motion/tilt-card";
import { bentoTiles } from "../site-data";

/**
 * Bento grid. Each tile is a tilting frosted panel with its own spotlight
 * border; the grid itself sits inside a section-wide cursor light, so tiles
 * brighten as the pointer approaches before it ever reaches them.
 */
export function Bento() {
  return (
    <SpotlightArea id="craft" className="bento-section section-pad" ariaLabelledBy="bento-title">
      <div className="bento-heading">
        <Reveal>
          <span className="section-kicker">Why brands choose us</span>
        </Reveal>
        {/* Headings are character-split and scrubbed by GSAP (see SiteAnimations),
            so they are deliberately not wrapped in a Framer reveal as well. */}
        <h2 id="bento-title" data-split>
          Detail you can hold.
        </h2>
        <Reveal as="p" delay={0.12}>
          Five reasons the work lands — structure, speed, material, range and proximity.
        </Reveal>
      </div>

      <motion.div
        className="bento-grid"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        {bentoTiles.map((tile) => (
          <motion.div
            key={tile.id}
            className={`bento-cell ${tile.span}`}
            variants={{
              hidden: { opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 0.8, ease: EASE_OUT_EXPO },
              },
            }}
          >
            <TiltCard className="bento-card" intensity={6}>
              <div className="bento-card-top">
                <span className="bento-kicker">{tile.kicker}</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </div>

              <h3>{tile.title}</h3>
              <p>{tile.copy}</p>

              <div className="bento-metric">
                <strong>
                  <Counter value={tile.metric.value} suffix={tile.metric.suffix} />
                </strong>
                <span>{tile.metric.label}</span>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </SpotlightArea>
  );
}
