"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

/**
 * Wraps any interactive element in a magnetic field: the child drifts towards
 * the pointer while it is inside the element's bounds and springs home on exit.
 *
 * Spring-driven rather than a CSS transition so an interrupted move (pointer
 * flicking across several buttons) resolves from the current velocity instead
 * of restarting — that continuity is what makes it read as physical.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 1,
  className = "",
}: {
  children: ReactNode;
  /** 0–1. How far the element travels relative to pointer offset. */
  strength?: number;
  /** Multiplier on the hit area used for the falloff calculation. */
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const handleMove = (event: ReactMouseEvent<HTMLSpanElement>) => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;
    // Falloff keeps the pull gentle at the edges instead of snapping the moment
    // the pointer crosses the boundary.
    const distance = Math.hypot(offsetX, offsetY);
    const reach = (Math.max(bounds.width, bounds.height) / 2) * radius * 2;
    const falloff = Math.max(0, 1 - distance / reach);
    x.set(offsetX * strength * falloff);
    y.set(offsetY * strength * falloff);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={`magnetic-wrap ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.span>
  );
}
