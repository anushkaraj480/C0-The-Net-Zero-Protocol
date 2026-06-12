import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import { useRef, useMemo, Suspense, Component, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import Particles from "./Particles";

// ─── Top-level Error Boundary (HTML, catches Canvas crashes) ───────────────
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err: Error) {
    return { error: err.message };
  }
  componentDidCatch(err: Error, info: { componentStack: string }) {
    console.error("[Earth3D] Error caught:", err.message, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "rgba(27,67,50,0.08)",
            borderRadius: "12px",
            border: "1px dashed rgba(82,183,136,0.3)",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "32px" }}>🌍</div>
          <div style={{ color: "#2D6A4F", fontWeight: 700, fontSize: "13px" }}>
            3D Globe failed to load
          </div>
          <div
            style={{
              color: "#555",
              fontSize: "11px",
              fontFamily: "monospace",
              background: "rgba(0,0,0,0.05)",
              padding: "8px 12px",
              borderRadius: "6px",
              maxWidth: "320px",
              wordBreak: "break-all",
              textAlign: "center",
            }}
          >
            {this.state.error}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── R3F-level Error Boundary (catches three.js errors inside Canvas) ──────
class EarthErrorBoundary extends Component<
  { children: ReactNode; onError: (msg: string) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (msg: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    this.props.onError(err.message);
  }
  render() {
    if (this.state.hasError) {
      // Render a simple placeholder mesh instead of Earth
      return (
        <mesh>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial color="#1B4332" wireframe />
        </mesh>
      );
    }
    return this.props.children;
  }
}

// ─── Suspense fallback (visible wireframe while textures load) ────────────
function EarthLoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[2, 24, 24]} />
      <meshBasicMaterial color="#52B788" wireframe opacity={0.4} transparent />
    </mesh>
  );
}

// ─── Earth Globe ─────────────────────────────────────────────────────────
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, cloudMap] = useTexture([
    "/textures/earth_daymap.jpg",
    "/textures/earth_normal.jpg",
    "/textures/earth_clouds.jpg",
  ]);

  const customMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughness: 0.7,
      metalness: 0.2,
    });

    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          float oceanBlend = smoothstep(0.8, 1.2, sampledDiffuseColor.b / max(sampledDiffuseColor.r + 0.001, 0.001));
          vec3 dryColor = sampledDiffuseColor.rgb;
          dryColor.r = min(1.0, dryColor.r * 1.5);
          dryColor.g = dryColor.g * 0.85;
          dryColor.b = dryColor.b * 0.6;
          vec3 lushColor = sampledDiffuseColor.rgb;
          lushColor.r = lushColor.r * 0.7;
          lushColor.g = min(1.0, lushColor.g * 1.7);
          lushColor.b = lushColor.b * 0.7;
          float sideBlend = smoothstep(0.48, 0.52, vMapUv.x);
          vec3 landColor = mix(dryColor, lushColor, sideBlend);
          sampledDiffuseColor.rgb = mix(landColor, sampledDiffuseColor.rgb, oceanBlend);
          diffuseColor *= sampledDiffuseColor;
        #endif
        `
      );
    };
    return mat;
  }, [colorMap, normalMap]);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    const rotY = t * 0.08;
    const rotX = mouse.y * 0.2;

    if (earthRef.current) {
      earthRef.current.rotation.y = rotY;
      earthRef.current.rotation.x = rotX;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = rotY * 1.05;
      cloudRef.current.rotation.x = rotX;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = rotY;
      wireframeRef.current.rotation.x = rotX;
    }
  });

  return (
    <group>
      <Sphere args={[2, 64, 64]} ref={earthRef}>
        <primitive object={customMaterial} attach="material" />
      </Sphere>

      <Sphere args={[2.02, 64, 64]} ref={cloudRef}>
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>

      <Sphere args={[2.04, 32, 32]} ref={wireframeRef}>
        <meshStandardMaterial
          color="#52B788"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>

      <Sphere args={[2.12, 32, 32]}>
        <meshBasicMaterial
          color="#00cfff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}

// ─── Canvas Scene (inside Canvas context) ────────────────────────────────
function Scene({ onError }: { onError: (msg: string) => void }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color="#52B788" />

      <EarthErrorBoundary onError={onError}>
        <Suspense fallback={<EarthLoadingFallback />}>
          <Earth />
        </Suspense>
      </EarthErrorBoundary>

      <Particles />

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────
export default function Earth3D({ className = "absolute inset-0 z-0" }: { className?: string }) {
  const [r3fError, setR3fError] = useState<string | null>(null);

  return (
    <CanvasErrorBoundary>
      <div
        className={className}
        style={{ width: "100%", height: "100%", minHeight: "300px" }}
      >
        {r3fError && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              zIndex: 10,
              background: "rgba(27,67,50,0.9)",
              color: "#52B788",
              fontSize: "10px",
              fontFamily: "monospace",
              padding: "6px 10px",
              borderRadius: "6px",
              maxWidth: "260px",
              wordBreak: "break-all",
            }}
          >
            ⚠ Earth error: {r3fError}
          </div>
        )}
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 0, 7], fov: 45 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
          }}
        >
          <Scene onError={setR3fError} />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
