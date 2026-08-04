"use client";

import { motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useClientFlag } from "../use-client-flag";

/**
 * Two-part cursor: a hard dot pinned to the pointer and a soft ring that trails
 * it on a spring and swells over anything interactive.
 *
 * Disabled outright for coarse pointers and reduced-motion users — on a
 * touchscreen there is no cursor to replace, and a lagging ring is precisely
 * the sort of motion people disable it to avoid.
 */
export function Cursor() {
  const enabled = useClientFlag(
    () =>
      !window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    false,
  );
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const interactive = (event.target as HTMLElement | null)?.closest(
        "a, button, [data-cursor-grow], input, summary",
      );
      setActive(Boolean(interactive));
    };

    const onEnter = () => document.documentElement.classList.add("has-custom-cursor");
    const onLeave = () => document.documentElement.classList.remove("has-custom-cursor");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div className="cursor-dot" aria-hidden="true" style={{ x, y }} />
      <motion.div
        className="cursor-ring"
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: active ? 1.55 : 1, opacity: active ? 1 : 0.6 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
    </>
  );
}

/**
 * Gradient rail across the top of the viewport, tied to document scroll.
 * Driven by a motion value rather than state — the bar updates on the
 * compositor without re-rendering the tree on every scroll frame.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });

  return <motion.div className="scroll-progress" aria-hidden="true" style={{ scaleX }} />;
}
