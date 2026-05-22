import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Sphere, OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";

const EARTH_RADIUS = 2.5;
const TOTAL_DURATION = 15;

// --- Node definitions with real coordinates ---
const NODES = [
  // Global nodes
  { lat: -3.4,  lng: -60.0, label: "Amazon Carbon Sink",        detail: "847t verified",      size: 1.4, activateAt: 0.5, isIndia: false },
  { lat:  0.0,  lng:  25.0, label: "Congo Basin Sink",           detail: "1,204t verified",    size: 1.2, activateAt: 1.5, isIndia: false },
  { lat: 65.0,  lng:  18.0, label: "Scandinavia Protocol",       detail: "423t verified",      size: 0.9, activateAt: 2.8, isIndia: false },
  { lat: 48.0,  lng:-122.0, label: "Pacific Northwest",          detail: "789t verified",      size: 1.1, activateAt: 3.3, isIndia: false },
  { lat: 35.7,  lng: 139.7, label: "Tokyo Corporate Offset",     detail: "1,847t purchased",   size: 1.3, activateAt: 3.8, isIndia: false },
  { lat: 48.0,  lng:  10.0, label: "EU Carbon Exchange",         detail: "3,201t traded",      size: 1.5, activateAt: 4.2, isIndia: false },
  { lat: 40.7,  lng: -74.0, label: "NY Carbon Registry",         detail: "956t registered",    size: 1.2, activateAt: 4.6, isIndia: false },
  // India nodes — activate last as a cascade within India
  { lat: 21.9,  lng:  89.2, label: "Sundarbans Carbon Sink",     detail: "2,847t verified",    size: 1.5, activateAt: 5.2, isIndia: true  },
  { lat: 10.5,  lng:  76.5, label: "Western Ghats Forest",       detail: "1,620t sequestered", size: 1.3, activateAt: 5.6, isIndia: true  },
  { lat: 19.1,  lng:  72.9, label: "Mumbai Carbon Market",       detail: "4,103t traded",      size: 1.6, activateAt: 6.0, isIndia: true  },
  { lat: 28.6,  lng:  77.2, label: "New Delhi — ICM Registry",   detail: "Policy Hub · ICMR",  size: 1.4, activateAt: 6.3, isIndia: true  },
  { lat: 26.9,  lng:  72.0, label: "Rajasthan Solar Credits",    detail: "890t green offset",  size: 1.1, activateAt: 6.7, isIndia: true  },
];

// Arc connections: [from node index, to node index]
const ARC_DEFS = [
  // Global arcs
  [0, 1], [0, 6], [1, 5], [2, 5], [3, 6], [4, 5],
  // India internal arcs (Sundarbans=7, W.Ghats=8, Mumbai=9, Delhi=10, Rajasthan=11)
  [7,  8], [8,  9], [9, 10], [10, 11], [7, 10],
  // India ↔ Global connections
  [9, 4],  // Mumbai → Tokyo
  [10, 5], // Delhi → EU
  [8, 1],  // W.Ghats → Congo
  [11, 5], // Rajasthan → EU
  [7, 0],  // Sundarbans → Amazon
];

// Hero arc: Sundarbans → Mumbai (India showcase)
const HERO_ARC_IDX = 7; // [7,8]

// --- Math helpers ---
function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.cos(theta),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.sin(theta)
  );
}

function buildCurve(fromIdx: number, toIdx: number): THREE.QuadraticBezierCurve3 {
  const a = latLngToVec3(NODES[fromIdx].lat, NODES[fromIdx].lng, EARTH_RADIUS);
  const b = latLngToVec3(NODES[toIdx].lat,   NODES[toIdx].lng,   EARTH_RADIUS);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const lift = a.distanceTo(b) * 0.45;
  const ctrl = mid.clone().normalize().multiplyScalar(EARTH_RADIUS + lift);
  return new THREE.QuadraticBezierCurve3(a, ctrl, b);
}

// --- Earth globe ---
const earthVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const earthFragmentShader = `
  uniform float uActivation; // 0 = dark, 1 = globe lit
  varying vec3 vNormal;
  void main() {
    float light = max(0.05, dot(vNormal, normalize(vec3(1.0, 0.5, 1.0))));
    vec3 darkBase = vec3(0.01, 0.04, 0.02);
    vec3 litBase  = vec3(0.01, 0.09, 0.05);
    vec3 col = mix(darkBase, litBase, uActivation) * light;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function EarthGlobe({ activation }: { activation: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useRef({ uActivation: { value: 0 } });

  useFrame(({ clock }) => {
    uniforms.current.uActivation.value = activation;
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.04;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
      <shaderMaterial
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

// --- Single glowing node ---
function NetworkNode({
  nodeIdx,
  globalTime,
  showLabel,
}: {
  nodeIdx: number;
  globalTime: number;
  showLabel: boolean;
}) {
  const node = NODES[nodeIdx];
  const pos = useMemo(() => latLngToVec3(node.lat, node.lng, EARTH_RADIUS), [node]);
  const labelPos = useMemo(() => latLngToVec3(node.lat, node.lng, EARTH_RADIUS + 0.5), [node]);

  const meshRef = useRef<THREE.Mesh>(null);
  const active = globalTime > node.activateAt;
  const age = Math.max(0, globalTime - node.activateAt);

  // Shockwave ref
  const waveRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!active || !waveRef.current) return;
    // Only play shockwave in first 0.8s of activation
    const waveAge = Math.min(age, 0.8);
    const prog = waveAge / 0.8;
    waveRef.current.scale.setScalar(1 + prog * 3 * node.size);
    (waveRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.7;
    
    // Pulse the node itself
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3 + nodeIdx) * 0.15;
      meshRef.current.scale.setScalar(active ? node.size * 0.06 * pulse : 0);
    }
  });

  if (!active) return null;

  const normal = pos.clone().normalize();

  return (
    <group>
      {/* Node sphere */}
      <Sphere ref={meshRef} args={[0.06, 12, 12]} position={pos.toArray() as [number,number,number]}>
        <meshStandardMaterial color="#69F0AE" emissive="#1D9E75" emissiveIntensity={2} />
      </Sphere>

      {/* Shockwave ring — oriented to face outward from sphere */}
      <mesh
        ref={waveRef}
        position={pos.toArray() as [number,number,number]}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)}
      >
        <ringGeometry args={[0.04, 0.055, 24]} />
        <meshBasicMaterial color="#69F0AE" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Node glow point light */}
      <pointLight
        position={pos.toArray() as [number,number,number]}
        color="#1D9E75"
        intensity={node.size * 0.4}
        distance={2}
      />

      {/* Label */}
      {showLabel && (
        <Text
          position={labelPos.toArray() as [number,number,number]}
          fontSize={0.09}
          color="#a0ffcf"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
        >
          {node.label}{"\n"}{node.detail}
        </Text>
      )}
    </group>
  );
}

// --- Arc line + data packets ---
function ArcLine({
  fromIdx,
  toIdx,
  globalTime,
  isHero,
}: {
  fromIdx: number;
  toIdx: number;
  globalTime: number;
  isHero: boolean;
}) {
  const activatesAt = Math.max(NODES[fromIdx].activateAt, NODES[toIdx].activateAt) + 0.3;
  const active = globalTime > activatesAt;

  const curve = useMemo(() => buildCurve(fromIdx, toIdx), [fromIdx, toIdx]);
  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curve, 40, 0.008, 6, false),
    [curve]
  );
  const arcMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isHero ? "#69F0AE" : "#1D9E75",
        transparent: true,
        opacity: isHero ? 0.9 : 0.45,
      }),
    [isHero]
  );

  // Data packet: a small white sphere riding the curve
  const packetRef = useRef<THREE.Mesh>(null);
  const packet2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime();
    // Two packets offset in phase
    const p1 = (t * 0.4 + fromIdx * 0.13) % 1;
    const p2 = (t * 0.4 + fromIdx * 0.13 + 0.5) % 1;
    if (packetRef.current)  packetRef.current.position.copy(curve.getPoint(p1));
    if (packet2Ref.current) packet2Ref.current.position.copy(curve.getPoint(p2));
  });

  if (!active) return null;

  return (
    <group>
      <mesh geometry={tubeGeo} material={arcMat} />
      {/* Packet 1 */}
      <Sphere ref={packetRef} args={[isHero ? 0.022 : 0.014, 6, 6]} position={[0, 0, 0]}>
        <meshBasicMaterial color={isHero ? "#ffffff" : "#a0ffd0"} />
      </Sphere>
      {/* Packet 2 */}
      <Sphere ref={packet2Ref} args={[isHero ? 0.022 : 0.014, 6, 6]} position={[0, 0, 0]}>
        <meshBasicMaterial color={isHero ? "#ffffff" : "#a0ffd0"} />
      </Sphere>
    </group>
  );
}

// Camera director removed — replaced by OrbitControls for free movement


// --- Star field ---
function Stars() {
  const geo = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ color: "#ffffff", size: 0.2, sizeAttenuation: true, transparent: true, opacity: 0.4 }),
    []
  );
  return <points geometry={geo} material={mat} />;
}

function SceneContent() {
  const [globalTime, setGlobalTime] = useState(0);

  useFrame(({ clock }) => {
    setGlobalTime(clock.getElapsedTime() % TOTAL_DURATION);
  });

  const t = globalTime;
  const networkLive = t > NODES[NODES.length - 1].activateAt + 0.5;
  const activation = Math.min(1, Math.max(0, (t - NODES[0].activateAt) / 4));

  return (
    <group>
      <Stars />

      <EarthGlobe activation={activation} />

      {/* All nodes — show label for all India nodes + hero nodes */}
      {NODES.map((node, i) => (
        <NetworkNode
          key={i}
          nodeIdx={i}
          globalTime={t}
          showLabel={networkLive && (node.isIndia || i === 4)}
        />
      ))}

      {/* All arc lines */}
      {ARC_DEFS.map(([from, to], i) => (
        <ArcLine
          key={i}
          fromIdx={from}
          toIdx={to}
          globalTime={t}
          isHero={i === HERO_ARC_IDX}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.05} color="#042C1E" />
      <directionalLight position={[10, 5, 10]} intensity={0.3} color="#a0ffd0" />
    </group>
  );
}

export default function GlobalNetworkScene() {
  return (
    <div className="absolute inset-0 z-0 bg-[#000804]">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 48 }}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
        {/* Free-movement orbit controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={4}
          maxDistance={20}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
          makeDefault
        />
      </Canvas>
      {/* Deep space vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,4,2,0.92)_100%)] z-10" />
      {/* Controls hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-[10px] text-emerald-400/50 font-mono tracking-widest uppercase pointer-events-none">
        drag to rotate  ·  scroll to zoom
      </div>
    </div>
  );
}
