"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { FINISH_ORDER, type FinishKey } from "./procedural-box";

/**
 * Page-wide re-theme, driven by the finish switcher.
 *
 * The reference the client sent (the Dove concept) does one thing the box
 * alone can't: selecting a variant re-themes the *entire page* along with the
 * product, so the choice reads as a change of world rather than a change of
 * swatch. That is the move this file implements.
 *
 * Every token below already exists in globals.css. Setting them as inline
 * custom properties on <html> overrides the :root defaults, so nothing in the
 * stylesheet needs to know this is happening — every surface, border and
 * heading follows automatically.
 */

type Theme = {
  scheme: "dark" | "light";
  bg: string;
  bgElevated: string;
  bgCard: string;
  text: string;
  textSecondary: string;
  muted: string;
  ink: string;
  accent: string;
  accentBright: string;
  accentDeep: string;
  /** RGB used to build every translucent surface/border on this theme —
      white over the dark palettes, warm ink over the light ones. */
  surface: [number, number, number];
};

export const PAGE_THEMES: Record<FinishKey, Theme> = {
  // Obsidian and gold — the original identity, kept as the opening state.
  gold: {
    scheme: "dark",
    bg: "#030712",
    bgElevated: "#070c1a",
    bgCard: "#0b1120",
    text: "#e9ecf5",
    textSecondary: "#a2aac0",
    muted: "#6b7488",
    ink: "#fbfcff",
    accent: "#d4af37",
    accentBright: "#e7c765",
    accentDeep: "#a8822f",
    surface: [255, 255, 255],
  },
  // Warm sand — the Obsidian Assembly register: cream, amber, editorial.
  kraft: {
    scheme: "light",
    bg: "#f1e5d4",
    bgElevated: "#e9dac4",
    bgCard: "#f8f0e4",
    text: "#2f2419",
    textSecondary: "#6b5942",
    muted: "#93805f",
    ink: "#1a1310",
    accent: "#9c6f3f",
    accentBright: "#c08b52",
    accentDeep: "#7a5530",
    surface: [58, 42, 26],
  },
  // Cool pearl — the same light treatment on a colder axis.
  silver: {
    scheme: "light",
    bg: "#eef1f5",
    bgElevated: "#e3e8ef",
    bgCard: "#f7f9fc",
    text: "#1e2430",
    textSecondary: "#59637a",
    muted: "#8792a6",
    ink: "#0e131c",
    accent: "#5d6b82",
    accentBright: "#8394ad",
    accentDeep: "#42506a",
    surface: [20, 28, 44],
  },
  // Charcoal — dark again, but neutral rather than blue, so the four options
  // read as two pairs rather than one theme plus three tints.
  matte: {
    scheme: "dark",
    bg: "#121215",
    bgElevated: "#191920",
    bgCard: "#1f1f27",
    text: "#e6e6ea",
    textSecondary: "#a0a0ab",
    muted: "#71717d",
    ink: "#fafafc",
    accent: "#c9c3b4",
    accentBright: "#e2ddd0",
    accentDeep: "#948e7f",
    surface: [255, 255, 255],
  },
};

/* ─── Colour helpers ─── */

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  const c = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/**
 * Every colour token for one theme, resolved to numeric RGB so two themes can
 * be interpolated channel-by-channel rather than cross-faded.
 */
function resolve(theme: Theme) {
  return {
    bg: hexToRgb(theme.bg),
    bgElevated: hexToRgb(theme.bgElevated),
    bgCard: hexToRgb(theme.bgCard),
    text: hexToRgb(theme.text),
    textSecondary: hexToRgb(theme.textSecondary),
    muted: hexToRgb(theme.muted),
    ink: hexToRgb(theme.ink),
    accent: hexToRgb(theme.accent),
    accentBright: hexToRgb(theme.accentBright),
    accentDeep: hexToRgb(theme.accentDeep),
    surface: theme.surface,
  };
}

type Resolved = ReturnType<typeof resolve>;

function blend(a: Resolved, b: Resolved, t: number): Resolved {
  return {
    bg: mix(a.bg, b.bg, t),
    bgElevated: mix(a.bgElevated, b.bgElevated, t),
    bgCard: mix(a.bgCard, b.bgCard, t),
    text: mix(a.text, b.text, t),
    textSecondary: mix(a.textSecondary, b.textSecondary, t),
    muted: mix(a.muted, b.muted, t),
    ink: mix(a.ink, b.ink, t),
    accent: mix(a.accent, b.accent, t),
    accentBright: mix(a.accentBright, b.accentBright, t),
    accentDeep: mix(a.accentDeep, b.accentDeep, t),
    surface: mix(a.surface, b.surface, t),
  };
}

/**
 * Writes one blended palette to <html>. The translucent tokens are composed
 * from the blended `surface` RGB at fixed alphas, so glass panels, borders and
 * scrims all invert correctly when the page crosses from a dark theme to a
 * light one — without any of them needing a light-mode rule of their own.
 */
function apply(c: Resolved) {
  const root = document.documentElement.style;
  const s = `${Math.round(c.surface[0])}, ${Math.round(c.surface[1])}, ${Math.round(c.surface[2])}`;
  const bgRgb = `${Math.round(c.bg[0])}, ${Math.round(c.bg[1])}, ${Math.round(c.bg[2])}`;
  const accent = toHex(c.accent);

  root.setProperty("--bg", toHex(c.bg));
  root.setProperty("--bg-elevated", toHex(c.bgElevated));
  root.setProperty("--bg-card", toHex(c.bgCard));
  root.setProperty("--bg-rgb", bgRgb);

  root.setProperty("--text", toHex(c.text));
  root.setProperty("--text-secondary", toHex(c.textSecondary));
  root.setProperty("--muted", toHex(c.muted));
  root.setProperty("--ink", toHex(c.ink));

  // The gold family is the site's single accent channel — every kicker,
  // swatch ring, rule and gradient reads from it.
  root.setProperty("--gold", accent);
  root.setProperty("--gold-bright", toHex(c.accentBright));
  root.setProperty("--gold-deep", toHex(c.accentDeep));
  root.setProperty("--gold-soft", `rgba(${hexToRgb(accent).join(", ")}, 0.12)`);
  root.setProperty("--gold-glow", `rgba(${hexToRgb(accent).join(", ")}, 0.35)`);
  root.setProperty("--border-light", `rgba(${hexToRgb(accent).join(", ")}, 0.2)`);
  root.setProperty("--glass-border", `rgba(${hexToRgb(accent).join(", ")}, 0.16)`);

  root.setProperty("--surface", `rgba(${s}, 0.04)`);
  root.setProperty("--surface-strong", `rgba(${s}, 0.07)`);
  root.setProperty("--border", `rgba(${s}, 0.1)`);
  root.setProperty("--glass", `rgba(${bgRgb}, 0.62)`);
}

/**
 * Listens for the same `finish-select` event the 3D scene consumes and tweens
 * the page palette to match, on the same 0.7s curve the box materials use — so
 * the product and its world land together rather than in sequence.
 */
export function FinishTheme() {
  const current = useRef<Resolved>(resolve(PAGE_THEMES.gold));

  useEffect(() => {
    const handler = (event: Event) => {
      const key = (event as CustomEvent<FinishKey>).detail;
      if (!FINISH_ORDER.includes(key)) return;

      const theme = PAGE_THEMES[key];
      const from = current.current;
      const to = resolve(theme);
      const proxy = { t: 0 };

      // color-scheme flips at the midpoint so form controls, scrollbars and
      // the browser's own UI change over while the page is at its least
      // committed to either palette.
      let flipped = false;

      gsap.to(proxy, {
        t: 1,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => {
          const blended = blend(from, to, proxy.t);
          apply(blended);
          if (!flipped && proxy.t >= 0.5) {
            flipped = true;
            document.documentElement.style.setProperty("color-scheme", theme.scheme);
          }
        },
        onComplete: () => {
          current.current = to;
          apply(to);
          document.documentElement.style.setProperty("color-scheme", theme.scheme);
        },
      });
    };

    window.addEventListener("finish-select", handler);
    return () => window.removeEventListener("finish-select", handler);
  }, []);

  return null;
}
