"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/data/products";
import { cx } from "@/lib/format";

type Props = {
  shape: Product["shape"];
  color?: string;
  view?: number;
  className?: string;
};

const VIEW_ROTATIONS: [number, number, number][] = [
  [0, 0, 0], // Front
  [0, Math.PI / 2, 0], // Side
  [-Math.PI / 2, 0, 0], // Top
  [0, 0, 0], // Scale with hand
];

function ShapeMesh({ shape, color }: { shape: Product["shape"]; color: string }) {
  const material = <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />;

  switch (shape) {
    case "vase":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.7, 1.7, 32]} />
          {material}
        </mesh>
      );
    case "cup":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.55, 1.1, 32]} />
          {material}
        </mesh>
      );
    case "planter":
      return (
        <RoundedBox args={[1.3, 0.9, 1.3]} radius={0.1} smoothness={4} castShadow receiveShadow>
          {material}
        </RoundedBox>
      );
    case "organizer":
      return (
        <RoundedBox args={[1.5, 0.55, 1]} radius={0.08} smoothness={4} castShadow receiveShadow>
          {material}
        </RoundedBox>
      );
    case "riser":
      return (
        <RoundedBox args={[1.7, 0.4, 1]} radius={0.08} smoothness={4} castShadow receiveShadow>
          {material}
        </RoundedBox>
      );
    case "stand":
      return (
        <group rotation={[0, 0, -0.18]}>
          <RoundedBox args={[1.1, 0.9, 0.6]} radius={0.08} smoothness={4} castShadow receiveShadow>
            {material}
          </RoundedBox>
        </group>
      );
    case "lamp":
      return (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.85, 32, 32]} />
          {material}
        </mesh>
      );
    case "coaster":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.12, 48]} />
          {material}
        </mesh>
      );
    case "plate":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.0, 0.15, 48]} />
          {material}
        </mesh>
      );
    case "lid":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.12, 48]} />
          {material}
        </mesh>
      );
    case "keychain":
      return (
        <group>
          <RoundedBox args={[0.55, 0.85, 0.15]} radius={0.1} smoothness={4} position={[0, -0.15, 0]} castShadow receiveShadow>
            {material}
          </RoundedBox>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <torusGeometry args={[0.18, 0.045, 16, 48]} />
            {material}
          </mesh>
        </group>
      );
    case "bookmark":
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.35, 1.5, 0.06]} />
          {material}
        </mesh>
      );
    case "tag":
      return (
        <RoundedBox args={[0.75, 0.75, 0.1]} radius={0.15} smoothness={4} castShadow receiveShadow>
          {material}
        </RoundedBox>
      );
    case "dragon":
    case "elephant":
    case "ganesha":
    case "octopus":
      return (
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[0.85, 1]} />
          {material}
        </mesh>
      );
    case "hook":
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]} castShadow receiveShadow>
            <torusGeometry args={[0.35, 0.1, 16, 48, Math.PI]} />
            {material}
          </mesh>
          <RoundedBox args={[0.3, 0.4, 0.15]} radius={0.05} smoothness={4} position={[0, -0.1, 0]} castShadow receiveShadow>
            {material}
          </RoundedBox>
        </group>
      );
    case "gear":
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.25, 12]} />
          {material}
        </mesh>
      );
    case "pull":
      return (
        <RoundedBox args={[1.0, 0.35, 0.3]} radius={0.08} smoothness={4} castShadow receiveShadow>
          {material}
        </RoundedBox>
      );
    case "part":
    default:
      return (
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[0.85, 0]} />
          {material}
        </mesh>
      );
  }
}

function HandReference() {
  const skin = "#e4b896";
  return (
    <group position={[1.7, -0.6, 0]} rotation={[0, 0.3, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.9, 0.18]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {[-0.18, -0.06, 0.06, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function RotatingGroup({ shape, color, view }: { shape: Product["shape"]; color: string; view: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Euler(...(VIEW_ROTATIONS[view] ?? [0, 0, 0])), [view]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.x += (target.x - g.rotation.x) * 0.08;
    g.rotation.y += (target.y - g.rotation.y) * 0.08;
    g.rotation.z += (target.z - g.rotation.z) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <ShapeMesh shape={shape} color={color} />
      {view === 3 && <HandReference />}
    </group>
  );
}

export function Product3DViewer({ shape, color = "#C2693C", view = 0, className }: Props) {
  return (
    <div className={cx("relative overflow-hidden bg-art-tile", className)}>
      <Canvas shadows camera={{ position: [2.2, 1.6, 2.8], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
        <directionalLight position={[-3, 1, -2]} intensity={0.35} />
        <Suspense fallback={null}>
          <RotatingGroup shape={shape} color={color} view={view} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-chip bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-text-muted">
        3D preview
      </span>
    </div>
  );
}
