"use client";

import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProceduralBox, SatelliteProps, type FinishKey, type JourneyState } from "./procedural-box";
import { pointerField, subscribePointerField } from "./pointer-field";
import { useClientFlag } from "./use-client-flag";

gsap.registerPlugin(ScrollTrigger);

/**
 * ONE continuous 3D world for the whole page: one camera, one rigid box, five
 * waypoints. Camera position/look-at AND the box's own state — lid hinge,
 * dieline unfold, satellite packaging — are all interpolated from the same
 * scroll journey, so the page reads as a single directed shot rather than
 * five disconnected widgets.
 *
 * Every section puts its copy in the left column, so on desktop the canvas is
 * inset to the right (see .world-canvas) and the camera simply aims at the box.
 */

/**
 * Aspect the waypoint distances below were framed against — the desktop canvas
 * is roughly 68vw x 100vh. A phone is far narrower, and because fov is
 * vertical, a narrow viewport shows LESS horizontally, so the same distance
 * would leave the box overflowing the screen. Every waypoint is pushed back
 * along its own view axis to compensate.
 */
const DESIGN_ASPECT = 1.1;
const MAX_PULLBACK = 2.4;

/**
 * How far the camera drifts with the pointer, in world units at the extremes of
 * the viewport. Deliberately small: this should read as the object having
 * presence, not as a joystick.
 */
const POINTER_SWAY_X = 0.85;
const POINTER_SWAY_Y = 0.45;

type Waypoint = {
  selector: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  lidOpen: number;
  unfold: number;
  satellites: number;
};

const WAYPOINTS: Waypoint[] = [
  // Hero — three-quarter view of single open box, positioned slightly higher up and shifted left-center to balance copy
  {
    selector: ".hero",
    position: [2.0, 2.3, 7.2],
    lookAt: [-0.2, 0.4, 0],
    lidOpen: 0.42,
    unfold: 0,
    satellites: 0,
  },
  // Intro — push in close on the lid, ribbon and foil; the box closes.
  {
    selector: ".intro",
    position: [2.1, 1.9, 5.8],
    lookAt: [0, 0.4, 0],
    lidOpen: 0.5,
    unfold: 0,
    satellites: 0,
  },
  // Services — aim well above the box so it settles low, under the card track.
  {
    selector: "#services",
    position: [0.8, 3.0, 9.5],
    lookAt: [0, 2.0, 0],
    lidOpen: 0.85,
    unfold: 0,
    satellites: 0,
  },
  // Approach — high angle as the box unfolds into its dieline.
  // "Think in layers", literally.
  {
    selector: ".process-section",
    position: [1.6, 5.2, 7.6],
    lookAt: [0, 1.4, 0],
    lidOpen: 1,
    unfold: 1,
    satellites: 0,
  },
  // Contact — reassembled, with the secondary packaging drifting in around it.
  {
    selector: ".contact-section",
    position: [2.0, 2.2, 10.5],
    lookAt: [0, 0.7, 0],
    lidOpen: 0.18,
    unfold: 0,
    satellites: 1,
  },
];

function CameraJourney({
  progressRef,
  journeyRef,
}: {
  progressRef: MutableRefObject<number>;
  journeyRef: MutableRefObject<JourneyState>;
}) {
  const boundariesRef = useRef<number[]>(WAYPOINTS.map((_, i) => i / (WAYPOINTS.length - 1)));
  const activeWaypointsRef = useRef<Waypoint[]>(WAYPOINTS);
  const lookTarget = useRef(new THREE.Vector3(0, 0.3, 0));

  useEffect(() => {
    // Build waypoint/element pairs directly from WAYPOINTS so the two arrays
    // can never desync (a missing selector simply drops that one waypoint,
    // rather than shifting every later index out of alignment).
    const pairs = WAYPOINTS.map((w) => ({
      waypoint: w,
      el: document.querySelector<HTMLElement>(w.selector),
    })).filter((p): p is { waypoint: Waypoint; el: HTMLElement } => !!p.el);

    if (pairs.length < 2) return;

    activeWaypointsRef.current = pairs.map((p) => p.waypoint);
    const first = pairs[0].el;
    const last = pairs[pairs.length - 1].el;

    // Boundaries come from ScrollTrigger's own `start` values rather than
    // `offsetTop`. The services section is pinned, and a pinned element reports
    // offsetTop 0 while GSAP has it fixed — which silently scrambled the
    // waypoint order and left the camera parked on the wrong shot.
    const markers = pairs.map(({ el }) =>
      ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top" })
    );

    const trigger = ScrollTrigger.create({
      trigger: first,
      start: "top top",
      endTrigger: last,
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    const recompute = () => {
      const span = trigger.end - trigger.start;
      if (span <= 0) return;
      let previous = 0;
      boundariesRef.current = markers.map((marker, i) => {
        const value = i === 0 ? 0 : THREE.MathUtils.clamp((marker.start - trigger.start) / span, 0, 1);
        // Clamp to non-decreasing: the segment lookup below assumes an ordered
        // list, and one bad measurement should not scramble the whole journey.
        previous = Math.max(previous, value);
        return previous;
      });
    };
    recompute();

    // Fonts and images can shift section heights after first paint, so
    // re-measure once things have settled. `refresh` fires after every trigger
    // has recalculated, which is the only point the starts are all valid.
    ScrollTrigger.addEventListener("refresh", recompute);
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());
    const lateRefresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      cancelAnimationFrame(refreshId);
      window.clearTimeout(lateRefresh);
      ScrollTrigger.removeEventListener("refresh", recompute);
      markers.forEach((marker) => marker.kill());
      trigger.kill();
    };
  }, [progressRef]);

  // Smoothed copy of the raw pointer field. Damping it here (rather than at the
  // source) keeps the listener a single assignment and lets the sway ease out
  // naturally when the pointer stops or leaves the window.
  const sway = useRef({ x: 0, y: 0 });
  useEffect(() => subscribePointerField(), []);

  const hasSnapped = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const vecA = useRef(new THREE.Vector3());
  const vecB = useRef(new THREE.Vector3());

  useFrame(({ camera, size }, delta) => {
    const p = progressRef.current;
    const bounds = boundariesRef.current;
    const waypoints = activeWaypointsRef.current;

    let idx = 0;
    for (let i = 0; i < bounds.length - 1; i++) {
      if (p >= bounds[i]) idx = i;
      else break;
    }
    const segStart = bounds[idx];
    const segEnd = bounds[idx + 1] ?? 1;
    const rawT =
      segEnd > segStart ? THREE.MathUtils.clamp((p - segStart) / (segEnd - segStart), 0, 1) : 0;
    // Ease the blend so each transition feels like a directed camera move
    // rather than a raw 1:1 scroll drag — smoothstep gives a gentle
    // accelerate-then-settle motion between waypoints.
    const localT = THREE.MathUtils.smoothstep(rawT, 0, 1);

    const a = waypoints[idx];
    const b = waypoints[Math.min(idx + 1, waypoints.length - 1)];
    if (!a || !b) return;

    targetPos.current.copy(vecA.current.set(...a.position)).lerp(vecB.current.set(...b.position), localT);
    targetLook.current.copy(vecA.current.set(...a.lookAt)).lerp(vecB.current.set(...b.lookAt), localT);

    // Narrow viewport: back the camera off along its own view axis so the box
    // stays inside the frame. Scaling the position alone would swing the shot
    // around; moving relative to the look target keeps the angle intact.
    const aspect = size.height > 0 ? size.width / size.height : DESIGN_ASPECT;
    const pullback = THREE.MathUtils.clamp(DESIGN_ASPECT / aspect, 1, MAX_PULLBACK);
    if (pullback > 1.001) {
      targetPos.current
        .sub(targetLook.current)
        .multiplyScalar(pullback)
        .add(targetLook.current);
    }

    // Pointer sway is applied to the camera position only — the look target is
    // untouched, so the camera orbits the box rather than panning off it.
    const swayK = 1 - Math.pow(0.06, delta);
    sway.current.x = THREE.MathUtils.lerp(sway.current.x, pointerField.x, swayK);
    sway.current.y = THREE.MathUtils.lerp(sway.current.y, pointerField.y, swayK);
    targetPos.current.x += sway.current.x * POINTER_SWAY_X;
    targetPos.current.y -= sway.current.y * POINTER_SWAY_Y;

    const targetLidOpen = THREE.MathUtils.lerp(a.lidOpen, b.lidOpen, localT);
    const targetUnfold = THREE.MathUtils.lerp(a.unfold, b.unfold, localT);
    const targetSatellites = THREE.MathUtils.lerp(a.satellites, b.satellites, localT);

    // First frame: snap exactly to target with no smoothing, so there is
    // never a visible "open then close" flash while ScrollTrigger is still
    // calibrating its very first progress reading.
    if (!hasSnapped.current) {
      hasSnapped.current = true;
      camera.position.copy(targetPos.current);
      lookTarget.current.copy(targetLook.current);
      camera.lookAt(lookTarget.current);
      journeyRef.current.lidOpen = targetLidOpen;
      journeyRef.current.unfold = targetUnfold;
      journeyRef.current.satellites = targetSatellites;
      return;
    }

    // Frame-rate independent damping: identical feel at 60Hz and 120Hz.
    const k = 1 - Math.pow(0.02, delta);
    camera.position.lerp(targetPos.current, k);
    lookTarget.current.lerp(targetLook.current, k);
    camera.lookAt(lookTarget.current);

    const j = journeyRef.current;
    j.lidOpen = THREE.MathUtils.lerp(j.lidOpen, targetLidOpen, k);
    j.unfold = THREE.MathUtils.lerp(j.unfold, targetUnfold, k);
    j.satellites = THREE.MathUtils.lerp(j.satellites, targetSatellites, k);
  });

  return null;
}

/**
 * Coarse split between "desktop GPU" and "phone". Used to trim the parts of the
 * scene that cost the most per frame but read the least on a small screen.
 */
function useIsLowPower() {
  return useClientFlag(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 899px)").matches;
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    return coarse || narrow || fewCores;
    // Assume constrained until proven otherwise: the expensive lights and the
    // higher dpr are far cheaper to add on a capable device than to withdraw
    // from a phone that has already dropped frames rendering them.
  }, true);
}

function WorldContents({
  progressRef,
  lowPower,
}: {
  progressRef: MutableRefObject<number>;
  lowPower: boolean;
}) {
  const journeyRef = useRef<JourneyState>({ lidOpen: 0, unfold: 0, satellites: 0 });
  const [finish, setFinish] = useState<FinishKey>("gold");

  useEffect(() => {
    const handler = (e: Event) => {
      setFinish((e as CustomEvent<FinishKey>).detail);
    };
    window.addEventListener("finish-select", handler);
    return () => window.removeEventListener("finish-select", handler);
  }, []);

  return (
    <>
      <ambientLight intensity={0.34} color="#e8ddd0" />
      {/* Key — warm, high and camera-side, so the lid and ribbon catch it. */}
      <directionalLight position={[5, 7, 6]} intensity={2.4} color="#ffecd2" />
      {/* Fill — cool and opposite, to keep the shadow side from going flat. */}
      <directionalLight position={[-6, 2.5, 3]} intensity={0.8} color="#b8c4d4" />
      {/* Camera-side bounce so the faces turned toward the viewer are never
          left as pure silhouette against the page. */}
      <pointLight position={[3.5, 1.5, 6]} intensity={30} color="#fff1dc" distance={18} />
      {/* Rim and accent lights are the two most expensive per fragment and the
          least noticeable on a phone — the first things to go. */}
      {lowPower ? null : (
        <>
          <spotLight
            position={[-3.5, 4, -6]}
            intensity={55}
            angle={0.8}
            penumbra={0.85}
            color="#c9a55a"
            distance={26}
          />
          <pointLight position={[-5, -1, 2]} intensity={8} color="#c11f3c" distance={12} />
        </>
      )}

      {/* A studio softbox rig built from Lightformers rather than a downloaded
          HDRI: the metallic foil needs something to reflect, and this keeps the
          whole scene self-contained instead of depending on a CDN at runtime. */}
      <Environment resolution={lowPower ? 128 : 256} frames={1} environmentIntensity={0.85}>
        <Lightformer intensity={1.1} position={[0, 5, -7]} scale={[12, 7, 1]} color="#ffe9c8" />
        <Lightformer
          intensity={1.5}
          position={[7, 3, 4]}
          rotation-y={-Math.PI / 2}
          scale={[10, 7, 1]}
          color="#fff4e2"
        />
        <Lightformer
          intensity={0.7}
          position={[-7, 2, 3]}
          rotation-y={Math.PI / 2}
          scale={[10, 7, 1]}
          color="#a9bcd8"
        />
        <Lightformer form="ring" intensity={3} position={[3, 3.5, 5]} scale={2.6} color="#c9a55a" />
      </Environment>

      <CameraJourney progressRef={progressRef} journeyRef={journeyRef} />

      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25} floatingRange={[-0.04, 0.04]}>
        <ProceduralBox journeyRef={journeyRef} finish={finish} />
      </Float>

      <SatelliteProps journeyRef={journeyRef} />

      {/* ContactShadows re-renders a depth pass every frame. Worth it on
          desktop, not worth it on a phone where the plate is barely visible. */}
      {lowPower ? null : (
        <ContactShadows position={[0, -0.58, 0]} opacity={0.3} scale={10} blur={2.6} far={4} color="#1a1510" />
      )}
    </>
  );
}

export function WorldScene() {
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);
  const lowPower = useIsLowPower();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    // A frame's delay lets the scroll reset settle before the first render, so
    // the journey never starts mid-page. requestAnimationFrame is throttled to
    // never in a background tab though, so a timer backs it up — otherwise a
    // page opened in an inactive tab would mount without a canvas at all.
    const frame = requestAnimationFrame(() => setReady(true));
    const fallback = window.setTimeout(() => setReady(true), 200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        // Phones ship 3x screens; rendering a full-page WebGL layer at 3x is
        // the difference between 60fps and a slideshow. 1.4 is still crisp.
        dpr={lowPower ? [1, 1.4] : [1, 1.75]}
        // near/far are deliberately tight around the range the journey actually
        // uses (closest waypoint ~4.5 units, furthest geometry ~14). The default
        // 0.1/1000 spreads the depth buffer over a range nothing occupies and
        // leaves too little precision for the box's thin stacked surfaces.
        camera={{ position: [2.6, 2.7, 8.0], fov: 35, near: 1.5, far: 60 }}
        gl={{
          alpha: true,
          // MSAA on a full-viewport canvas is expensive on mobile GPUs; the
          // lower dpr there costs less quality than the antialiasing buys.
          antialias: !lowPower,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#000000"), 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <Suspense fallback={null}>
          <WorldContents progressRef={progressRef} lowPower={lowPower} />
        </Suspense>
      </Canvas>
    </div>
  );
}
