"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { pointerField, subscribePointerField } from "./pointer-field";

/**
 * The hero model: a premium rigid gift box, built in code rather than pulled
 * from a stock GLB so every state the scroll journey needs is riggable —
 * the lid hinges, the four walls unfold flat like a real dieline, the tissue
 * and product lift out, and the whole shell re-materialises in any finish.
 *
 * Construction mirrors how a rigid box is actually made: a board shell with a
 * separate paper lining on every inside face, a tray with real wall thickness
 * (so the interior is hollow when the lid opens), and a lid that drops over
 * the tray on an inner lip.
 */

export type FinishKey = "gold" | "kraft" | "silver" | "matte";

export const FINISHES: Record<
  FinishKey,
  {
    label: string;
    boxColor: string;
    foilColor: string;
    liningColor: string;
    metalness: number;
    roughness: number;
  }
> = {
  gold: {
    label: "Gold Leaf Foil",
    boxColor: "#1d1c20",
    foilColor: "#D4AF37",
    liningColor: "#f3e7cf",
    metalness: 0.08,
    roughness: 0.4,
  },
  kraft: {
    label: "Kraft Eco",
    boxColor: "#a67c47",
    foilColor: "#D4AF37",
    liningColor: "#e6d5b8",
    metalness: 0.04,
    roughness: 0.82,
  },
  silver: {
    label: "Silver Metallic",
    boxColor: "#2a2f38",
    foilColor: "#e2e6eb",
    liningColor: "#eceff4",
    metalness: 0.16,
    roughness: 0.35,
  },
  matte: {
    label: "Matte Minimal",
    boxColor: "#141416",
    foilColor: "#D4AF37",
    liningColor: "#28282c",
    metalness: 0.02,
    roughness: 0.92,
  },
};

export const FINISH_ORDER: FinishKey[] = ["gold", "kraft", "silver", "matte"];

/* ─── Dimensions (in world units) ─── */
const W = 2.0; // tray width
const D = 1.4; // tray depth
const H = 0.9; // tray height
const T = 0.05; // board thickness
const WALL_H = H - T; // walls sit on top of the tray floor
// The side walls stop just short of the front/back walls. Running them the
// full depth put their end faces exactly in the plane of the front/back walls'
// inner faces, and coplanar faces z-fight — the shimmering edges you see when
// the box drifts under the Float.
const SIDE_D = D - T * 2.4;
const LID_H = 0.26;
const LID_OVERHANG = 0.05;
// Gap the closed lid rests at, so the tray's foil rim stays readable and the
// lid's underside never lands in the same plane as the wall tops.
const LID_REST_GAP = 0.014;
// Every "decal" surface (lining panels) is pushed this far off its host face.
// Small enough to read as one surface, large enough to survive the depth
// buffer at the distances the camera works at.
const DECAL = 0.006;
const RIBBON_W = 0.15;
const RIBBON_X = -W * 0.26; // ribbon runs off-centre — reads more couture than a symmetric cross

export type JourneyState = {
  /** 0 = closed, 1 = lid fully hinged open */
  lidOpen: number;
  /** 0 = assembled, 1 = walls unfolded flat into a dieline */
  unfold: number;
  /** 0 = hidden, 1 = orbiting satellite packaging visible */
  satellites: number;
};

export function ProceduralBox({
  journeyRef,
  finish,
}: {
  journeyRef: MutableRefObject<JourneyState>;
  finish: FinishKey;
}) {
  const lidPivot = useRef<THREE.Group>(null);
  const frontWall = useRef<THREE.Group>(null);
  const backWall = useRef<THREE.Group>(null);
  const leftWall = useRef<THREE.Group>(null);
  const rightWall = useRef<THREE.Group>(null);
  const contents = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const mounted = useRef(false);

  // The box turns a few degrees towards the pointer on top of the camera's own
  // sway, so the two read as one object with weight rather than a moving camera.
  useEffect(() => subscribePointerField(), []);

  // One material instance per surface type, shared across every mesh that uses
  // it, so a finish change is a single tween rather than dozens.
  const materials = useMemo(() => {
    const f = FINISHES[finish];
    return {
      // Physical rather than standard: the clearcoat is what sells a laminated
      // rigid box — a tight specular highlight riding over a matte body.
      shell: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(f.boxColor),
        metalness: f.metalness,
        roughness: f.roughness,
        clearcoat: 0.65,
        clearcoatRoughness: 0.24,
      }),
      // Lining panels are decals laid over the board. polygonOffset biases
      // them towards the camera in the depth buffer so they can never trade
      // places with the surface they sit on as the box moves.
      lining: new THREE.MeshStandardMaterial({
        color: new THREE.Color(f.liningColor),
        roughness: 0.95,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      foil: new THREE.MeshStandardMaterial({
        color: new THREE.Color(f.foilColor),
        metalness: 0.94,
        roughness: 0.16,
      }),
      // Separate from `lining` so the finish tween can treat it independently.
      // Opaque on purpose: it lives inside a closed box, so there is nothing to
      // fade, and a transparent mesh here only bought transparency-sort flicker.
      tissue: new THREE.MeshStandardMaterial({
        color: new THREE.Color(f.liningColor),
        roughness: 0.98,
        metalness: 0,
        flatShading: true,
      }),
      seam: new THREE.MeshStandardMaterial({ color: "#08080a", roughness: 0.7, metalness: 0.15 }),
    };
    // Intentionally created once — subsequent finishes are tweened, not rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const list = Object.values(materials);
    return () => list.forEach((m) => m.dispose());
  }, [materials]);

  useEffect(() => {
    const f = FINISHES[finish];
    if (!mounted.current) {
      mounted.current = true;
      return; // first paint already carries the right finish
    }

    const tween = (mat: THREE.MeshStandardMaterial, hex: string, extra?: gsap.TweenVars) => {
      const target = new THREE.Color(hex);
      gsap.to(mat.color, { r: target.r, g: target.g, b: target.b, duration: 0.7, ease: "power2.out" });
      if (extra) gsap.to(mat, { ...extra, duration: 0.7, ease: "power2.out" });
    };

    tween(materials.shell, f.boxColor, { metalness: f.metalness, roughness: f.roughness });
    tween(materials.lining, f.liningColor);
    tween(materials.tissue, f.liningColor);
    tween(materials.foil, f.foilColor);
  }, [finish, materials]);

  useFrame((_, delta) => {
    const s = journeyRef.current;
    // Frame-rate independent smoothing — the same visual damping at 60 and 120fps.
    const k = 1 - Math.pow(0.001, delta);

    if (root.current) {
      // Slower damping than the rig above (0.08 vs 0.001) so the turn trails the
      // camera slightly — the lag is what sells it as mass.
      const pk = 1 - Math.pow(0.08, delta);
      // Faded out during the unfold: a dieline reads as a flat plan view, and
      // tilting it towards the pointer only makes it harder to parse.
      const damp = 1 - s.unfold;
      root.current.rotation.y = THREE.MathUtils.lerp(
        root.current.rotation.y,
        pointerField.x * 0.2 * damp,
        pk,
      );
      root.current.rotation.x = THREE.MathUtils.lerp(
        root.current.rotation.x,
        pointerField.y * 0.09 * damp,
        pk,
      );
    }

    if (lidPivot.current) {
      // Hinged open by lidOpen, but the unfold pulls it back towards flat: an
      // exploded dieline should show the lid's foil-stamped top face, not the
      // underside of a lid still swung open on its hinge.
      const angle = -THREE.MathUtils.degToRad(118) * s.lidOpen * (1 - s.unfold * 0.86);
      lidPivot.current.rotation.x = THREE.MathUtils.lerp(lidPivot.current.rotation.x, angle, k);
      // It floats clear of the tray as the box unfolds — but only just, so it
      // still reads as the lid rather than a stray slab.
      const lift = H / 2 + LID_REST_GAP + s.unfold * 0.9 + s.lidOpen * 0.06;
      lidPivot.current.position.y = THREE.MathUtils.lerp(lidPivot.current.position.y, lift, k);
    }

    // Walls fold outward around the bottom edge where they meet the tray floor.
    const fold = THREE.MathUtils.degToRad(90) * s.unfold;
    if (frontWall.current) frontWall.current.rotation.x = THREE.MathUtils.lerp(frontWall.current.rotation.x, fold, k);
    if (backWall.current) backWall.current.rotation.x = THREE.MathUtils.lerp(backWall.current.rotation.x, -fold, k);
    if (leftWall.current) leftWall.current.rotation.z = THREE.MathUtils.lerp(leftWall.current.rotation.z, fold, k);
    if (rightWall.current) rightWall.current.rotation.z = THREE.MathUtils.lerp(rightWall.current.rotation.z, -fold, k);

    if (contents.current) {
      // Tissue + product rise as the lid opens, then drift up during the unfold.
      const y = s.lidOpen * 0.12 + s.unfold * 0.55;
      contents.current.position.y = THREE.MathUtils.lerp(contents.current.position.y, y, k);
      contents.current.rotation.y += delta * (0.12 + s.unfold * 0.5);
      const scale = THREE.MathUtils.lerp(contents.current.scale.x, 1 - s.unfold * 0.25, k);
      contents.current.scale.setScalar(scale);
    }

  });

  const liningInset = T * 2;

  return (
    <group ref={root}>
      {/* ── Tray floor ── */}
      <mesh position={[0, -H / 2 + T / 2, 0]} castShadow receiveShadow material={materials.shell}>
        <boxGeometry args={[W, T, D]} />
      </mesh>
      <mesh position={[0, -H / 2 + T + DECAL, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.lining}>
        <planeGeometry args={[W - liningInset, D - liningInset]} />
      </mesh>

      {/* ── Four tray walls, each hinged at its base so it can unfold flat ──
          The foil rim caps straddle each wall's top edge rather than sitting
          flush with it: a cap ending exactly at WALL_H shares a plane with the
          wall's own top face, and the resulting z-fight reads as a flickering
          black outline. */}
      <group ref={frontWall} position={[0, -H / 2 + T, D / 2 - T / 2]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow receiveShadow material={materials.shell}>
          <boxGeometry args={[W, WALL_H, T]} />
        </mesh>
        <mesh position={[0, WALL_H / 2, -T / 2 - DECAL]} rotation={[0, Math.PI, 0]} material={materials.lining}>
          <planeGeometry args={[W - liningInset, WALL_H - T]} />
        </mesh>
        <mesh position={[0, WALL_H - 0.006, 0]} material={materials.foil}>
          <boxGeometry args={[W + 0.014, 0.02, T + 0.014]} />
        </mesh>
      </group>

      <group ref={backWall} position={[0, -H / 2 + T, -(D / 2 - T / 2)]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow receiveShadow material={materials.shell}>
          <boxGeometry args={[W, WALL_H, T]} />
        </mesh>
        <mesh position={[0, WALL_H / 2, T / 2 + DECAL]} material={materials.lining}>
          <planeGeometry args={[W - liningInset, WALL_H - T]} />
        </mesh>
        <mesh position={[0, WALL_H - 0.006, 0]} material={materials.foil}>
          <boxGeometry args={[W + 0.014, 0.02, T + 0.014]} />
        </mesh>
      </group>

      <group ref={leftWall} position={[-(W / 2 - T / 2), -H / 2 + T, 0]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow receiveShadow material={materials.shell}>
          <boxGeometry args={[T, WALL_H, SIDE_D]} />
        </mesh>
        <mesh
          position={[T / 2 + DECAL, WALL_H / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.lining}
        >
          <planeGeometry args={[SIDE_D - T * 2, WALL_H - T]} />
        </mesh>
        <mesh position={[0, WALL_H - 0.006, 0]} material={materials.foil}>
          <boxGeometry args={[T + 0.014, 0.02, SIDE_D + 0.014]} />
        </mesh>
      </group>

      <group ref={rightWall} position={[W / 2 - T / 2, -H / 2 + T, 0]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow receiveShadow material={materials.shell}>
          <boxGeometry args={[T, WALL_H, SIDE_D]} />
        </mesh>
        <mesh
          position={[-T / 2 - DECAL, WALL_H / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={materials.lining}
        >
          <planeGeometry args={[SIDE_D - T * 2, WALL_H - T]} />
        </mesh>
        <mesh position={[0, WALL_H - 0.006, 0]} material={materials.foil}>
          <boxGeometry args={[T + 0.014, 0.02, SIDE_D + 0.014]} />
        </mesh>
      </group>

      {/* ── Contents: crumpled tissue wrapping a foil-finished product ── */}
      <group ref={contents}>
        <mesh position={[0, -0.08, 0]} rotation={[0.4, 0.6, 0.2]} material={materials.tissue}>
          <icosahedronGeometry args={[0.3, 1]} />
        </mesh>
        <RoundedBox
          args={[0.62, 0.3, 0.42]}
          radius={0.03}
          smoothness={3}
          position={[0, 0.16, 0]}
          castShadow
          material={materials.foil}
        />
      </group>

      {/* ── Lid, hinged at the back-top edge ── */}
      <group ref={lidPivot} position={[0, H / 2, -D / 2]}>
        <group position={[0, 0, D / 2]}>
          <RoundedBox
            args={[W + LID_OVERHANG, LID_H, D + LID_OVERHANG]}
            radius={0.035}
            smoothness={4}
            position={[0, LID_H / 2, 0]}
            castShadow
            receiveShadow
            material={materials.shell}
          />
          {/* Inner lip that locates the lid on the tray. Sits well below the
              lid's underside — at y=0 it shared a plane with both the lid and
              the shadow band, and three coplanar faces flicker badly. */}
          <mesh position={[0, -0.08, 0]} material={materials.lining}>
            <boxGeometry args={[W - liningInset - 0.02, 0.1, D - liningInset - 0.02]} />
          </mesh>
          {/* Recessed shadow line under the lid overhang. Deliberately a touch
              SMALLER than the lid so no sub-pixel sliver of it can poke out
              past the lid's rounded edge and shimmer. */}
          <mesh position={[0, -0.012, 0]} material={materials.seam}>
            <boxGeometry args={[W + LID_OVERHANG - 0.012, 0.02, D + LID_OVERHANG - 0.012]} />
          </mesh>

          {/* Grosgrain ribbon, run off-centre and wrapped over the lid edges */}
          <mesh position={[RIBBON_X, LID_H / 2, 0]} material={materials.foil}>
            <boxGeometry args={[RIBBON_W, LID_H + 0.02, D + LID_OVERHANG + 0.02]} />
          </mesh>

          {/* Bow: two flat loops and a knot, sitting on the ribbon */}
          <group position={[RIBBON_X, LID_H + 0.026, 0.12]}>
            <mesh rotation={[Math.PI / 2, 0, 0.42]} position={[-0.115, 0, 0]} material={materials.foil}>
              <torusGeometry args={[0.1, 0.026, 10, 22]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, -0.42]} position={[0.115, 0, 0]} material={materials.foil}>
              <torusGeometry args={[0.1, 0.026, 10, 22]} />
            </mesh>
            <mesh material={materials.foil}>
              <sphereGeometry args={[0.05, 14, 14]} />
            </mesh>
            <mesh rotation={[0, 0, 0.5]} position={[-0.07, -0.01, 0.16]} material={materials.foil}>
              <boxGeometry args={[0.055, 0.014, 0.26]} />
            </mesh>
            <mesh rotation={[0, 0, -0.5]} position={[0.07, -0.01, 0.16]} material={materials.foil}>
              <boxGeometry args={[0.055, 0.014, 0.26]} />
            </mesh>
          </group>

          {/* Foil-blocked wordmark, set clear of the ribbon */}
          <Text
            position={[W * 0.12, LID_H + 0.009, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.115}
            letterSpacing={0.2}
            color={FINISHES[finish].foilColor}
            anchorX="center"
            anchorY="middle"
          >
            THE PACK STYLE
          </Text>
        </group>
      </group>
    </group>
  );
}

/**
 * Secondary packaging that drifts into frame for the closing section, so the
 * final call to action has the same 3D world behind it as the rest of the page
 * rather than flat colour.
 */
export function SatelliteProps({ journeyRef }: { journeyRef: MutableRefObject<JourneyState> }) {
  const group = useRef<THREE.Group>(null);

  const items = useMemo(
    () => [
      { pos: [2.1, 0.9, -1.3], rot: [0.3, 0.7, 0.15], scale: 0.46, kind: "box" as const },
      { pos: [-2.2, -0.45, -0.8], rot: [-0.2, -0.5, 0.1], scale: 0.36, kind: "box" as const },
      { pos: [1.8, -1.0, 0.9], rot: [0.15, 0.3, -0.2], scale: 0.4, kind: "bag" as const },
      { pos: [-1.9, 1.2, 0.6], rot: [0.1, -0.9, 0.22], scale: 0.33, kind: "bag" as const },
    ],
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const s = journeyRef.current.satellites;
    const k = 1 - Math.pow(0.001, delta);

    g.visible = s > 0.01;
    if (!g.visible) return;

    g.rotation.y += delta * 0.09;
    const t = state.clock.elapsedTime;

    g.children.forEach((child, i) => {
      const mesh = child as THREE.Group;
      mesh.position.y = items[i].pos[1] + Math.sin(t * 0.6 + i * 1.7) * 0.13;
      mesh.rotation.z = items[i].rot[2] + Math.sin(t * 0.45 + i) * 0.07;
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, items[i].scale * s, k));
    });
  });

  return (
    <group ref={group} visible={false}>
      {items.map((item, i) => (
        <group
          key={i}
          position={item.pos as [number, number, number]}
          rotation={item.rot as [number, number, number]}
          scale={0.001}
        >
          {item.kind === "box" ? (
            <>
              <RoundedBox args={[1.5, 0.85, 1.1]} radius={0.04} smoothness={3}>
                <meshStandardMaterial color="#1d1b1e" metalness={0.4} roughness={0.42} />
              </RoundedBox>
              <mesh position={[0, 0.44, 0]}>
                <boxGeometry args={[1.54, 0.03, 1.14]} />
                <meshStandardMaterial color="#c9a55a" metalness={0.9} roughness={0.2} />
              </mesh>
            </>
          ) : (
            <>
              {/* Shopping bag: tapered body plus two handles */}
              <mesh>
                <boxGeometry args={[1.05, 1.35, 0.55]} />
                <meshStandardMaterial color="#2a2427" metalness={0.2} roughness={0.62} />
              </mesh>
              <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.28, 0.028, 8, 20, Math.PI]} />
                <meshStandardMaterial color="#c9a55a" metalness={0.85} roughness={0.25} />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.07, 0.14, 0.57]} />
                <meshStandardMaterial color="#c9a55a" metalness={0.88} roughness={0.22} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
