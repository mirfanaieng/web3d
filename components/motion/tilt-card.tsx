"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

/**
 * Frosted card with pointer-tracked 3D tilt and a spotlight that lights both
 * the surface and the border.
 *
 * Everything is driven by motion values written straight into CSS custom
 * properties — the pointer never triggers a React render, so a grid of these
 * costs the same as one.
 */
export function TiltCard({
  children,
  className = "",
  intensity = 8,
  spotlight = true,
  glare = true,
  onMouseEnter,
  onTouchStart,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees at the card's corners. */
  intensity?: number;
  spotlight?: boolean;
  glare?: boolean;
  onMouseEnter?: () => void;
  onTouchStart?: () => void;
}) {
  const reduced = useReducedMotion();

  // Normalised pointer position, -0.5 → 0.5 across the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // Raw pixel position, used for the spotlight origin.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const active = useMotionValue(0);

  const spring = { stiffness: 220, damping: 22, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [intensity, -intensity]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-intensity, intensity]), spring);
  const opacity = useSpring(active, { stiffness: 180, damping: 26 });

  const spotlightBackground = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgba(212,175,55,0.16), transparent 72%)`;
  const borderBackground = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(212,175,55,0.75), transparent 68%)`;
  const glareBackground = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgba(255,255,255,0.09), transparent 60%)`;

  const handleMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    mx.set(localX);
    my.set(localY);
    px.set(localX / rect.width - 0.5);
    py.set(localY / rect.height - 0.5);
  };

  const handleEnter = () => {
    if (!reduced) active.set(1);
    onMouseEnter?.();
  };

  const handleLeave = () => {
    active.set(0);
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      className={`tilt-card ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      whileHover={reduced ? undefined : { z: 24, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={onTouchStart}
    >
      {/* Border highlight: a gradient ring masked to the 1px outline only. */}
      {spotlight ? (
        <motion.span
          className="tilt-card-border"
          aria-hidden="true"
          style={{ background: borderBackground, opacity }}
        />
      ) : null}
      {spotlight ? (
        <motion.span
          className="tilt-card-spotlight"
          aria-hidden="true"
          style={{ background: spotlightBackground, opacity }}
        />
      ) : null}
      {glare ? (
        <motion.span
          className="tilt-card-glare"
          aria-hidden="true"
          style={{ background: glareBackground, opacity }}
        />
      ) : null}
      <div className="tilt-card-body">{children}</div>
    </motion.article>
  );
}
