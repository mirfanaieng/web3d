"use client";

import dynamic from "next/dynamic";

const WorldScene = dynamic(
  () => import("./world-scene").then((module) => module.WorldScene),
  {
    ssr: false,
    loading: () => null,
  },
);

export function WorldSceneLoader() {
  return <WorldScene />;
}
