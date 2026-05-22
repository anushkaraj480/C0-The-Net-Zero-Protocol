import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Sphere, Torus } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";

// --- Micro-data for block faces ---
const BLOCK_DATA = [
  { coords: "51.5074°N, 0.1278°W", tonnes: "840.2 tCO₂", hash: "0xA3F9...C12B", ts: "2024-03-14 09:22:11Z" },
  { coords: "23.8103°N, 90.4125°E", tonnes: "1,204.7 tCO₂", hash: "0xB7D2...E45A", ts: "2024-03-14 11:07:44Z" },
  { coords: "-3.4653°S, 62.2159°W", tonnes: "3,087.1 tCO₂", hash: "0xC1E8...F903", ts: "2024-03-15 06:14:02Z" },
  { coords: "1.3521°N, 103.8198°E", tonnes: "522.9 tCO₂", hash: "0xD4A7...1B5C", ts: "2024-03-15 14:33:19Z" },
  { coords: "35.6762°N, 139.6503°E", tonnes: "2,441.0 tCO₂", hash: "0xE9F3...7D2A", ts: "2024-03-16 03:58:47Z" },
  { coords: "40.7128°N, 74.0060°W", tonnes: "679.5 tCO₂", hash: "0xF0B1...4E8D", ts: "2024-03-16 17:21:05Z" },
  { coords: "-33.8688°S, 151.2093°E", tonnes: "1,890.3 tCO₂", hash: "0xA8C5...9F1E", ts: "2024-03-17 00:45:33Z" },
];

// --- Shockwave Ring ---
function ShockwaveRing({ position, triggered }: { position: [number, number, number], triggered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!triggered || !meshRef.current) return;
    if (startTime.current === null) startTime.current = clock.getElapsedTime();
    const age = clock.getElapsedTime() - startTime.current;
    const progress = Math.min(age * 1.5, 1);
    meshRef.current.scale.setScalar(1 + progress * 4);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.8;
    meshRef.current.visible = progress < 1;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.38, 32]} />
      <meshBasicMaterial color="#A56EFF" transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- Single Blockchain Block ---
function Block({
  position,
  dataIndex,
  delay,
  globalTime,
}: {
  position: [number, number, number];
  dataIndex: number;
  delay: number;
  globalTime: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [triggered, setTriggered] = useState(false);
  const appeared = globalTime > delay;
  const locked = globalTime > delay + 0.4;

  useFrame(() => {
    if (!groupRef.current) return;
    if (appeared && !triggered) setTriggered(true);
    // Slam effect: starts above, drops and bounces
    if (appeared && !locked) {
      const t = Math.min((globalTime - delay) / 0.4, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      groupRef.current.position.y = position[1] + (1 - ease) * 3;
      groupRef.current.scale.setScalar(ease);
    } else if (locked) {
      groupRef.current.position.y = position[1];
      groupRef.current.scale.setScalar(1);
    }
  });

  const data = BLOCK_DATA[dataIndex % BLOCK_DATA.length];

  return (
    <group ref={groupRef} position={position} scale={0}>
      {/* Main block */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.8, 0.5]} />
        <meshStandardMaterial
          color="#3D0F7C"
          emissive="#3D0F7C"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>

      {/* Edge glow — wireframe overlay */}
      <mesh>
        <boxGeometry args={[1.22, 0.82, 0.52]} />
        <meshBasicMaterial color="#A56EFF" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Micro-data text on front face */}
      {locked && (
        <group position={[0, 0, 0.27]}>
          <Text fontSize={0.07} color="#e0ccff" anchorX="center" anchorY="top" position={[0, 0.25, 0]}>
            {data.coords}
          </Text>
          <Text fontSize={0.07} color="#A56EFF" anchorX="center" anchorY="top" position={[0, 0.12, 0]}>
            {data.tonnes}
          </Text>
          <Text fontSize={0.055} color="#7a5aaa" anchorX="center" anchorY="top" position={[0, 0, 0]}>
            {data.hash}
          </Text>
          <Text fontSize={0.055} color="#5a4a7a" anchorX="center" anchorY="top" position={[0, -0.1, 0]}>
            {data.ts}
          </Text>
        </group>
      )}

      {/* Shockwave on lock */}
      <ShockwaveRing position={[0, 0, 0]} triggered={triggered && locked} />

      {/* Point light per block — dimmer purple glow */}
      {locked && <pointLight color="#A56EFF" intensity={0.3} distance={3} />}
    </group>
  );
}

// --- Chain Link between blocks ---
function ChainLink({ from, to, visible }: { from: [number, number, number], to: [number, number, number], visible: boolean }) {
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  if (!visible) return null;
  return (
    <Torus args={[0.18, 0.04, 8, 16]} position={mid} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#A56EFF" emissive="#A56EFF" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
    </Torus>
  );
}

// --- Wireframe Earth ---
function WireframeEarth({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  return (
    <Sphere ref={meshRef} args={[4, 24, 24]}>
      <meshBasicMaterial color="#A56EFF" wireframe transparent opacity={opacity * 0.25} />
    </Sphere>
  );
}

// --- Padlock ---
function Padlock({ opacity, pulse }: { opacity: number, pulse: number }) {
  if (opacity <= 0.01) return null;
  const col = new THREE.Color().lerpColors(new THREE.Color("#A56EFF"), new THREE.Color("#FFD700"), pulse);
  return (
    <group>
      {/* Shackle (top arc) */}
      <Torus args={[0.4, 0.1, 12, 24, Math.PI]} position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1 + pulse} metalness={0.9} transparent opacity={opacity} />
      </Torus>
      {/* Body */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.8, 0.7, 0.3]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.8 + pulse} metalness={0.9} transparent opacity={opacity} />
      </mesh>
      {/* Glow light */}
      <pointLight color="#FFD700" intensity={pulse * 5} distance={8} />
    </group>
  );
}

// --- Final chain pulse overlay ---
function ChainPulse({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = active ? Math.abs(Math.sin(t * 3)) * 0.15 : 0;
  });
  return (
    <Sphere ref={meshRef} args={[5, 16, 16]}>
      <meshBasicMaterial color="#3D0F7C" transparent opacity={0} side={THREE.BackSide} />
    </Sphere>
  );
}

// --- Star Field ---
function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 300;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 300;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    return arr;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: '#ccaaff', size: 0.3, sizeAttenuation: true, transparent: true, opacity: 0.5 }), []);
  return <points geometry={geo} material={mat} />;
}

// --- Main Scene Director ---
const BLOCK_SPACING = 1.6;
const TOTAL_BLOCKS = 7;
const CENTER = Math.floor(TOTAL_BLOCKS / 2); // index 3

function BlockchainDirector() {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useFrame(({ clock, camera }) => {
    cameraRef.current = camera as THREE.PerspectiveCamera;
    const t = clock.getElapsedTime() % 15;

    if (t < 5) {
      // Close-up floating inside the chain
      camera.position.x = Math.sin(t * 0.3) * 1.5;
      camera.position.y = Math.cos(t * 0.2) * 0.5;
      camera.position.z = THREE.MathUtils.lerp(6, 8, t / 5);
      camera.lookAt(0, 0, 0);
    } else if (t < 9) {
      // Pull back to reveal Earth — faster
      const p = (t - 5) / 4;
      camera.position.z = THREE.MathUtils.lerp(8, 18, p);
      camera.position.y = THREE.MathUtils.lerp(0, 2, p);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.lookAt(0, 0, 0);
    } else {
      // Final slow orbit
      const angle = (t - 9) * 0.2;
      camera.position.x = Math.sin(angle) * 18;
      camera.position.z = Math.cos(angle) * 18;
      camera.position.y = 2;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

function SceneContent() {
  const [globalTime, setGlobalTime] = useState(0);

  useFrame(({ clock }) => {
    setGlobalTime(clock.getElapsedTime() % 15);
  });

  const t = globalTime;

  // Block positions along X axis
  const blockPositions: [number, number, number][] = Array.from({ length: TOTAL_BLOCKS }, (_, i) => [
    (i - CENTER) * BLOCK_SPACING, 0, 0
  ]);

  // Each block appears faster, tighter delays from center outward
  const blockDelays = Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
    const dist = Math.abs(i - CENTER);
    return 0.3 + dist * 0.7; // faster: was 0.5 + dist * 1.2
  });

  const earthOpacity = t > 5 ? Math.min(1, (t - 5) / 1.5) : 0;   // reveal at t=5, was t=8
  const padlockOpacity = t > 7 ? Math.min(1, (t - 7) / 1.5) : 0; // was t=10
  const padlockPulse = t > 9 ? Math.abs(Math.sin((t - 9) * 4)) : 0; // was t=11.5
  const chainPulseActive = t > 11; // was t=13

  return (
    <group>
      <Stars />
      <BlockchainDirector />
      <WireframeEarth opacity={earthOpacity} />
      <ChainPulse active={chainPulseActive} />

      {blockPositions.map((pos, i) => (
        <group key={i}>
          <Block
            position={pos}
            dataIndex={i}
            delay={blockDelays[i]}
            globalTime={t}
          />
          {/* Chain link between adjacent blocks */}
          {i < TOTAL_BLOCKS - 1 && t > blockDelays[i] + 0.5 && t > blockDelays[i + 1] + 0.5 && (
            <ChainLink
              from={pos}
              to={blockPositions[i + 1]}
              visible={true}
            />
          )}
        </group>
      ))}

      <Padlock opacity={padlockOpacity} pulse={padlockPulse} />

      {/* Scene Lighting */}
      <ambientLight intensity={0.1} color="#3D0F7C" />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#c0a0ff" />
      <pointLight position={[0, 0, 4]} intensity={1} color="#A56EFF" distance={15} />
    </group>
  );
}

export default function BlockchainScene() {
  return (
    <div className="absolute inset-0 z-0 bg-[#05000e]">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
      {/* Deep void vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,0,14,0.9)_100%)] z-10" />
    </div>
  );
}
