"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

/**
 * Section-level cursor light. A soft radial spot lags the pointer on a spring,
 * lighting whatever sits under it — the cheap trick that makes a flat dark
 * section feel like a lit stage.
 *
 * Pointer position goes straight into motion values (no state), and the layer
 * is `pointer-events: none`, so it never interferes with the content above it.
 */
export function SpotlightArea({
  children,
  className = "",
  size = 620,
  color = "rgba(212, 175, 55, 0.10)",
  id,
  ariaLabelledBy,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
  color?: string;
  id?: string;
  ariaLabelledBy?: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const opacity = useMotionValue(0);

  const smoothX = useSpring(x, { stiffness: 160, damping: 26, mass: 0.6 });
  const smoothY = useSpring(y, { stiffness: 160, damping: 26, mass: 0.6 });
  const smoothOpacity = useSpring(opacity, { stiffness: 140, damping: 30 });

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${smoothX}px ${smoothY}px, ${color}, transparent 70%)`;

  const handleMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`spotlight-area ${className}`}
      onMouseMove={handleMove}
      onMouseEnter={() => !reduced && opacity.set(1)}
      onMouseLeave={() => opacity.set(0)}
    >
      <motion.div
        className="spotlight-layer"
        aria-hidden="true"
        style={{ background, opacity: smoothOpacity }}
      />
      {children}
    </section>
  );
}
