"use client";

/**
 * Normalised pointer position (-1 → 1 on both axes, origin at viewport centre),
 * shared by everything in the 3D scene that reacts to the mouse.
 *
 * A module-level object rather than context or state on purpose: this is read
 * inside `useFrame` at 60–120Hz by several components, and routing it through
 * React would mean a full render per pointer move while WebGL is drawing.
 * One listener writes, many frames read.
 */
export const pointerField = { x: 0, y: 0, active: false };

let listeners = 0;
let detach: (() => void) | null = null;

/**
 * Reference-counted global listener. Returns an unsubscribe; the underlying
 * listener is removed only when the last consumer releases it.
 */
export function subscribePointerField(): () => void {
  if (typeof window === "undefined") return () => {};

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (coarse || reduced) return () => {};

  listeners += 1;

  if (!detach) {
    const onMove = (event: PointerEvent) => {
      pointerField.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerField.y = (event.clientY / window.innerHeight) * 2 - 1;
      pointerField.active = true;
    };
    const onLeave = () => {
      pointerField.x = 0;
      pointerField.y = 0;
      pointerField.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    detach = () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      pointerField.x = 0;
      pointerField.y = 0;
      pointerField.active = false;
    };
  }

  return () => {
    listeners -= 1;
    if (listeners <= 0 && detach) {
      detach();
      detach = null;
      listeners = 0;
    }
  };
}
