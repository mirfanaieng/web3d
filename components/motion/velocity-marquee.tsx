"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useRef } from "react";

/**
 * Marquee whose speed and direction are driven by scroll velocity: it idles at
 * a constant drift, accelerates as the page moves, and flips direction when the
 * user scrolls back up.
 *
 * The row is duplicated and the offset wrapped over a single copy's width, so
 * the loop is seamless at any speed without measuring anything at runtime.
 */
export function VelocityMarquee({
  items,
  baseVelocity = 2.4,
  className = "",
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 320,
  });
  // Clamped so a trackpad fling cannot smear the type into an unreadable blur.
  const velocityFactor = useTransform(smoothVelocity, [-1600, 0, 1600], [-4, 0, 4], {
    clamp: true,
  });

  const directionRef = useRef(1);
  // Two copies are rendered; wrapping over -50% → 0% keeps the seam invisible.
  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = directionRef.current * baseVelocity * (delta / 1000);

    const factor = velocityFactor.get();
    if (factor < 0) directionRef.current = -1;
    else if (factor > 0) directionRef.current = 1;

    moveBy += directionRef.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const row = (
    <>
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {item}
          <i aria-hidden="true">✦</i>
        </span>
      ))}
    </>
  );

  return (
    <div className={`velocity-marquee ${className}`} aria-hidden="true">
      <motion.div className="velocity-track" style={{ x }}>
        {row}
        {row}
      </motion.div>
    </div>
  );
}
