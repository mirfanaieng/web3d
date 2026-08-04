"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Magnetic } from "./magnetic";

type Variant = "primary" | "outline" | "ghost";

/**
 * The page's one button. A specular band sweeps across it on hover, the whole
 * control is magnetic, and the press state is a spring rather than a duration
 * so a quick double-tap still feels tactile.
 */
export function ShineButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  magnetic = true,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  magnetic?: boolean;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();

  const content = (
    <>
      <span className="shine-btn-label">{children}</span>
      <span className="shine-btn-sweep" aria-hidden="true" />
      <span className="shine-btn-ring" aria-hidden="true" />
    </>
  );

  const shared = {
    className: `shine-btn shine-btn-${variant} ${className}`,
    whileHover: reduced ? undefined : { y: -2 },
    whileTap: reduced ? undefined : { scale: 0.97, y: 0 },
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
    "aria-label": ariaLabel,
  };

  const element = href ? (
    <motion.a href={href} onClick={onClick} {...shared}>
      {content}
    </motion.a>
  ) : (
    <motion.button type="button" onClick={onClick} {...shared}>
      {content}
    </motion.button>
  );

  return magnetic ? <Magnetic strength={0.28}>{element}</Magnetic> : element;
}
