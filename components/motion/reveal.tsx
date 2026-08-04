"use client";

import { motion, type Variants } from "framer-motion";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Shared entry choreography. Every section on the page uses the same easing and
 * distance so the whole scroll reads as one system rather than a dozen
 * independently-tuned animations.
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
};

export const staggerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

type RevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  delay?: number;
  once?: boolean;
  amount?: number;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/** A single element that blurs and lifts into place when it enters the viewport. */
export function Reveal<T extends ElementType = "div">({
  as,
  children,
  delay = 0,
  once = true,
  amount = 0.25,
  ...rest
}: RevealProps<T>) {
  const Component = motion[(as ?? "div") as "div"];

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={revealVariants}
      // Restated in full rather than passing `{ delay }` alone: a transition
      // prop replaces the variant's own transition, so passing only a delay
      // would silently drop the shared duration and easing.
      transition={{ duration: 0.75, ease: EASE_OUT_EXPO, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Parent for a group of `RevealItem`s. Children inherit the `hidden`/`show`
 * states, so one viewport trigger drives the whole staggered cascade.
 */
export function Stagger({
  children,
  className = "",
  amount = 0.2,
  gap = 0.08,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  gap?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<typeof motion.div>) {
  return (
    <motion.div className={className} variants={revealVariants} {...rest}>
      {children}
    </motion.div>
  );
}
