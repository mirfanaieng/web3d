"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE_OUT_EXPO, Reveal } from "../motion/reveal";
import { process } from "../site-data";

/**
 * The approach timeline. GSAP scrubs the vertical progress rail (it has to be
 * scroll-linked, not viewport-triggered); the rows themselves are Framer.
 */
export function Process() {
  return (
    <section className="process-section" id="approach" aria-labelledby="process-title">
      <div className="process-sticky">
        <div className="process-intro section-pad copy-veil" data-reveal>
          <div>
            <span className="section-kicker section-kicker-light">Our approach</span>
            <h2 id="process-title" data-split data-parallax="0.1">
              Think in layers. Make an impact.
            </h2>
          </div>
          <p data-parallax="0.06">
            A considered process turns a practical object into a reason to choose, keep and share
            your brand.
          </p>
        </div>

        <div className="process-body section-pad">
          <div className="process-list-wrap copy-veil">
            <div className="process-line" aria-hidden="true">
              <div className="process-line-progress" />
            </div>

            <div className="process-list">
              {process.map((item, index) => (
                <motion.article
                  className="process-item"
                  key={item.index}
                  data-parallax="0.08"
                  initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: index * 0.1 }}
                  whileHover={{ x: 8 }}
                >
                  <motion.span
                    className="process-number"
                    whileHover={{ scale: 1.08, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    {item.index}
                  </motion.span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                  <Plus size={21} aria-hidden="true" />
                </motion.article>
              ))}
            </div>
          </div>

          {/* Reserved column: the live 3D box unfolds into its dieline behind
              this space, and the caption tells you that is what you are seeing. */}
          <div className="process-3d-side" data-parallax="-0.12">
            <Reveal className="scene-caption">
              <span className="scene-caption-dot" aria-hidden="true" />
              <div>
                <strong>Dieline view</strong>
                <p>The same box, unfolded — structure, lining and foil as one system.</p>
              </div>
            </Reveal>
          </div>
        </div>

        <motion.div
          className="process-orb orb-one"
          aria-hidden="true"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="process-orb orb-two"
          aria-hidden="true"
          animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.8, 0.5, 0.8] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
