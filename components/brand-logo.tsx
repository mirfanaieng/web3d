"use client";

import { useId } from "react";

/**
 * The Pack Style identity — an isometric rigid box (lid lifted, product
 * inside) plus a letterspaced wordmark. Drawn as vectors rather than the old
 * JPEG so it stays crisp at any size and sits on the dark UI without the
 * white plate the bitmap logo carried around with it.
 */

export function BrandMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  const gold = `${id}-gold`;
  const goldSoft = `${id}-gold-soft`;

  return (
    <svg
      className={`brand-mark ${className}`}
      width={(size * 40) / 50}
      height={size}
      viewBox="0 0 40 50"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0dcae" />
          <stop offset="50%" stopColor="#c9a55a" />
          <stop offset="100%" stopColor="#8f7132" />
        </linearGradient>
        <linearGradient id={goldSoft} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b08f4a" />
          <stop offset="100%" stopColor="#6f5726" />
        </linearGradient>
      </defs>

      {/* Lifted lid */}
      <path d="M20 2 36 9.5 20 17 4 9.5Z" fill={`url(#${gold})`} />
      <path d="M4 9.5v2.6L20 19.6V17Z" fill={`url(#${goldSoft})`} />
      <path d="M36 9.5v2.6L20 19.6V17Z" fill="#a8873f" />

      {/* Open mouth of the box */}
      <path d="M20 21 36 28.5 20 36 4 28.5Z" fill="#151317" />
      {/* Product inside — the red accent from the original mark */}
      <circle cx="20" cy="28.4" r="2.7" fill="#c11f3c" />

      {/* Tray */}
      <path d="M4 28.5v9.9L20 46V36Z" fill={`url(#${goldSoft})`} />
      <path d="M36 28.5v9.9L20 46V36Z" fill={`url(#${gold})`} />
    </svg>
  );
}

export function BrandLogo({
  size = 32,
  withTagline = false,
  className = "",
}: {
  size?: number;
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`brand-logo ${className}`}>
      <BrandMark size={size} />
      <span className="brand-logo-word">
        <span className="brand-logo-name">
          The Pack Style
          <i className="brand-logo-dot" aria-hidden="true" />
        </span>
        {withTagline ? <span className="brand-logo-tag">Packaging &amp; Print · UAE</span> : null}
      </span>
    </span>
  );
}
