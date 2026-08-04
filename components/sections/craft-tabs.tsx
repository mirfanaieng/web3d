"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Counter } from "../motion/counter";
import { EASE_OUT_EXPO, Reveal } from "../motion/reveal";
import { SpotlightArea } from "../motion/spotlight";
import { craftTabs } from "../site-data";

/**
 * Tabbed detail section. The active pill is a single `layoutId` element that
 * springs between tabs rather than four backgrounds fading, and the panel
 * cross-fades with a directional slide so switching reads as movement along a
 * row instead of a swap.
 */
export function CraftTabs() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();
  const tab = craftTabs[active];

  const select = (index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? (active + 1) % craftTabs.length
        : (active - 1 + craftTabs.length) % craftTabs.length;
    select(next);
    document.getElementById(`craft-tab-${craftTabs[next].id}`)?.focus();
  };

  return (
    <SpotlightArea
      className="craft-section section-pad"
      ariaLabelledBy="craft-title"
      color="rgba(193, 31, 60, 0.10)"
    >
      <div className="craft-heading">
        <Reveal>
          <span className="section-kicker">Inside the work</span>
        </Reveal>
        <h2 id="craft-title" data-split>
          Four decisions that make a box feel expensive.
        </h2>
      </div>

      <div className="craft-shell glass-panel">
        <div
          className="craft-tablist"
          role="tablist"
          aria-label="Craft detail"
          onKeyDown={onKeyDown}
        >
          {craftTabs.map((item, index) => {
            const isActive = index === active;
            return (
              <button
                key={item.id}
                id={`craft-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`craft-panel-${item.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`craft-tab ${isActive ? "is-active" : ""}`}
                onClick={() => select(index)}
              >
                {isActive ? (
                  <motion.span
                    className="craft-tab-bg"
                    layoutId="craft-tab-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="craft-tab-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="craft-body">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={tab.id}
              id={`craft-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`craft-tab-${tab.id}`}
              className="craft-panel"
              custom={direction}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 28, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -28, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <h3>{tab.title}</h3>
              <p>{tab.copy}</p>

              <div className="craft-stats">
                {tab.stats.map((stat) => (
                  <div key={stat.label}>
                    <strong>
                      <Counter value={stat.value} suffix={stat.suffix} duration={1.2} />
                    </strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <CraftDiagram variant={tab.id} />
        </div>
      </div>
    </SpotlightArea>
  );
}

/**
 * Animated line diagram beside the panel. Each variant redraws itself with
 * `pathLength`, so switching tabs looks like the drawing is being plotted
 * rather than swapped — and it is four paths of SVG, not another 3D canvas.
 */
function CraftDiagram({ variant }: { variant: (typeof craftTabs)[number]["id"] }) {
  const reduced = useReducedMotion();

  const paths: Record<string, string[]> = {
    foil: [
      "M40 150 L120 70 L200 150 L120 230 Z",
      "M120 70 L120 230",
      "M40 150 L200 150",
      "M75 110 L165 190",
    ],
    material: [
      "M35 95 H205 V205 H35 Z",
      "M35 95 L120 45 L205 95",
      "M35 135 H205",
      "M35 170 H205",
    ],
    structure: [
      "M60 60 H180 V180 H60 Z",
      "M60 60 L30 90 V150 L60 180",
      "M180 60 L210 90 V150 L180 180",
      "M95 100 H145 V140 H95 Z",
    ],
    finish: [
      "M40 200 C 80 120, 160 120, 200 200",
      "M40 160 C 80 80, 160 80, 200 160",
      "M120 60 V110",
      "M90 90 L120 60 L150 90",
    ],
  };

  return (
    <div className="craft-diagram" aria-hidden="true">
      <motion.div
        className="craft-diagram-glow"
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1.06, 0.92] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 240 260" role="presentation" focusable="false">
        <defs>
          <linearGradient id="craft-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <AnimatePresence mode="wait">
          <motion.g key={variant}>
            {paths[variant].map((d, index) => (
              <motion.path
                key={`${variant}-${index}`}
                d={d}
                fill="none"
                stroke="url(#craft-stroke)"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut", delay: index * 0.12 }}
              />
            ))}
          </motion.g>
        </AnimatePresence>
      </svg>
    </div>
  );
}
