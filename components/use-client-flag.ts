"use client";

import { useSyncExternalStore } from "react";

/** Never notifies — these flags are read once and do not change after mount. */
const noopSubscribe = () => () => {};

/**
 * Reads a browser capability (media query, hardware hint) safely across the
 * server/client boundary.
 *
 * The obvious version of this is `useState(false)` plus an effect that
 * measures and calls `setState`, but that renders twice on every mount and
 * trips `react-hooks/set-state-in-effect`. `useSyncExternalStore` gets the real
 * value during the client's first render while still handing the server a
 * fixed snapshot to render against, so there is no cascading render and no
 * hydration mismatch.
 *
 * @param compute     Runs on the client only. Must return a primitive.
 * @param serverValue Rendered on the server and during hydration.
 */
export function useClientFlag(compute: () => boolean, serverValue: boolean): boolean {
  return useSyncExternalStore(noopSubscribe, compute, () => serverValue);
}
