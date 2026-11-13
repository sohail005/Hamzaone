"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { Loader2, Box } from "lucide-react";

type Dimensions = { x: number; y: number; z: number };
type Kind = "stl" | "3mf";
type ParsedModel =
  | { kind: "stl"; data: THREE.BufferGeometry }
  | { kind: "3mf"; data: THREE.Group };

function centerAndMeasure(object: THREE.Object3D): Dimensions {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.2 / maxDim;

  // position isn't affected by the object's own scale, so the recentering
  // offset has to be scaled down too — otherwise the object ends up
  // translated by its full (pre-scale) size and lands outside the camera.
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);

  return { x: size.x, y: size.y, z: size.z };
}

function useParsedModel(file: File, kind: Kind) {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; model?: ParsedModel }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    file
      .arrayBuffer()
      .then((buffer) => {
        if (cancelled) return;
        if (kind === "stl") {
          const geometry = new STLLoader().parse(buffer);
          setState({ status: "ready", model: { kind: "stl", data: geometry } });
        } else {
          const group = new ThreeMFLoader().parse(buffer);
          setState({ status: "ready", model: { kind: "3mf", data: group } });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [file, kind]);

  return state;
}

function StlMesh({ geometry, onDimensions }: { geometry: THREE.BufferGeometry; onDimensions: (d: Dimensions) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    onDimensions(centerAndMeasure(mesh));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#C2693C" roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

function ThreeMfGroup({ group, onDimensions }: { group: THREE.Group; onDimensions: (d: Dimensions) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    onDimensions(centerAndMeasure(g));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  return <primitive ref={groupRef} object={group} />;
}

function RotatingGroup({ model, rotation, zoom, onDimensions }: { model: ParsedModel; rotation: number; zoom: number; onDimensions: (d: Dimensions) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = useMemo(() => (rotation * Math.PI) / 180, [rotation]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += (targetY - g.rotation.y) * 0.1;
    g.scale.x += (zoom - g.scale.x) * 0.15;
    g.scale.y += (zoom - g.scale.y) * 0.15;
    g.scale.z += (zoom - g.scale.z) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {model.kind === "stl" ? (
        <StlMesh geometry={model.data} onDimensions={onDimensions} />
      ) : (
        <ThreeMfGroup group={model.data} onDimensions={onDimensions} />
      )}
    </group>
  );
}

export function UnsupportedPreviewMessage() {
  return (
    <div className="text-center text-sm text-text-muted">
      <Box className="mx-auto mb-2 h-10 w-10" />
      Preview unavailable — your file was received and will be reviewed by our team.
    </div>
  );
}

export function ModelPreview({
  file,
  kind,
  rotation,
  zoom,
  onDimensions,
  onStatus,
}: {
  file: File;
  kind: Kind;
  rotation: number;
  zoom: number;
  onDimensions: (dims: Dimensions) => void;
  onStatus: (status: "loading" | "ready" | "error") => void;
}) {
  const { status, model } = useParsedModel(file, kind);

  useEffect(() => {
    onStatus(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  if (status === "error" || !model) {
    return <UnsupportedPreviewMessage />;
  }

  return (
    <Canvas shadows camera={{ position: [2.2, 1.6, 2.8], fov: 40 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 1, -2]} intensity={0.35} />
      <RotatingGroup model={model} rotation={rotation} zoom={zoom} onDimensions={onDimensions} />
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} />
    </Canvas>
  );
}
