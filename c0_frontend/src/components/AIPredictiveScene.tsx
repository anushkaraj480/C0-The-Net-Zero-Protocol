import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import { useRef, useMemo, Suspense, useState } from "react";
import * as THREE from "three";

const EARTH_RADIUS = 2.5;
const TOTAL_DURATION = 15;

// --- Neural Network Nodes ---
function NeuralNetwork() {
  const nodeCount = 400;
  
  const { positions, targets, connections } = useMemo(() => {
    const pos = new Float32Array(nodeCount * 3);
    const tar = new Float32Array(nodeCount * 3);
    const conn = [];

    for (let i = 0; i < nodeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      tar[i * 3] = EARTH_RADIUS * 1.05 * Math.sin(phi) * Math.cos(theta);
      tar[i * 3 + 1] = EARTH_RADIUS * 1.05 * Math.sin(phi) * Math.sin(theta);
      tar[i * 3 + 2] = EARTH_RADIUS * 1.05 * Math.cos(phi);
    }

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() > 0.98) {
          conn.push(i, j);
        }
      }
    }

    return { positions: pos, targets: tar, connections: conn };
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !linesRef.current) return;
    const globalTime = Math.min(clock.getElapsedTime(), TOTAL_DURATION);
    
    const assembleProgress = Math.min(1, Math.max(0, (globalTime - 2) / 2));
    const easeProgress = 1 - Math.pow(1 - assembleProgress, 3);

    const currentPos = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const sparkDelay = (i / nodeCount) * 2;
      const opacity = globalTime > sparkDelay ? 1 : 0;
      
      currentPos[i * 3] = THREE.MathUtils.lerp(positions[i * 3], targets[i * 3], easeProgress);
      currentPos[i * 3 + 1] = THREE.MathUtils.lerp(positions[i * 3 + 1], targets[i * 3 + 1], easeProgress);
      currentPos[i * 3 + 2] = THREE.MathUtils.lerp(positions[i * 3 + 2], targets[i * 3 + 2], easeProgress);
    }
    
    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
    
    const linePos = new Float32Array(connections.length * 2 * 3);
    let lineIdx = 0;
    for (let i = 0; i < connections.length; i += 2) {
      const idx1 = connections[i];
      const idx2 = connections[i + 1];
      linePos[lineIdx++] = currentPos[idx1 * 3];
      linePos[lineIdx++] = currentPos[idx1 * 3 + 1];
      linePos[lineIdx++] = currentPos[idx1 * 3 + 2];
      linePos[lineIdx++] = currentPos[idx2 * 3];
      linePos[lineIdx++] = currentPos[idx2 * 3 + 1];
      linePos[lineIdx++] = currentPos[idx2 * 3 + 2];
    }
    linesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = Math.min(1, globalTime * 2);
    
    const lineMat = linesRef.current.material as THREE.LineBasicMaterial;
    lineMat.opacity = Math.min(0.3, Math.max(0, globalTime - 1) * 0.3);
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial color="#FAC775" size={0.05} transparent opacity={0} sizeAttenuation={true} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#BA7517" transparent opacity={0} />
      </lineSegments>
    </group>
  );
}

// --- Transparent Earth ---
function TransparentEarth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const globalTime = Math.min(clock.getElapsedTime(), TOTAL_DURATION);
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = Math.min(0.2, Math.max(0, (globalTime - 3) / 2) * 0.2);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshPhysicalMaterial 
        color="#FAC775" 
        transparent 
        opacity={0} 
        roughness={0.1}
        metalness={0.8}
        transmission={0.9}
        ior={1.5}
      />
    </mesh>
  );
}

// --- Data Streams ---
function DataStreams() {
  const streamCount = 50;
  
  const curves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < streamCount; i++) {
      const startRadius = 15 + Math.random() * 5;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      
      const start = new THREE.Vector3(
        startRadius * Math.sin(phi) * Math.cos(theta),
        startRadius * Math.sin(phi) * Math.sin(theta),
        startRadius * Math.cos(phi)
      );
      
      const end = new THREE.Vector3(
        EARTH_RADIUS * 1.1 * Math.sin(phi) * Math.cos(theta),
        EARTH_RADIUS * 1.1 * Math.sin(phi) * Math.sin(theta),
        EARTH_RADIUS * 1.1 * Math.cos(phi)
      );
      
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.add(new THREE.Vector3((Math.random()-0.5)*5, (Math.random()-0.5)*5, (Math.random()-0.5)*5));
      
      arr.push(new THREE.QuadraticBezierCurve3(start, mid, end));
    }
    return arr;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const globalTime = Math.min(clock.getElapsedTime(), TOTAL_DURATION);
    
    const progress = Math.max(0, (globalTime - 5) / 3);
    const isActive = globalTime > 5 && globalTime < 10;
    
    groupRef.current.children.forEach((child, i) => {
      const line = child as THREE.Line;
      const mat = line.material as THREE.LineBasicMaterial;
      if (isActive) {
        mat.opacity = Math.sin(progress * Math.PI) * 0.5 * Math.random();
      } else {
        mat.opacity = 0;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {curves.map((curve, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry" {...{ setFromPoints: [curve.getPoints(20)] } as any} />
          <lineBasicMaterial color="#FAC775" transparent opacity={0} />
        </line>
      ))}
    </group>
  );
}

// --- Timeline Rings ---
function TimelineRings() {
  const rings = [
    { year: "2025", radius: EARTH_RADIUS + 0.8, delay: 7 },
    { year: "2030", radius: EARTH_RADIUS + 1.6, delay: 8 },
    { year: "2040", radius: EARTH_RADIUS + 2.4, delay: 9 },
    { year: "2050", radius: EARTH_RADIUS + 3.2, delay: 10 }
  ];

  return (
    <group rotation={[Math.PI / 8, 0, 0]}>
      {rings.map((ring, i) => (
        <TimelineRing key={i} {...ring} />
      ))}
    </group>
  );
}

function TimelineRing({ year, radius, delay }: { year: string, radius: number, delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current || !textRef.current) return;
    const globalTime = Math.min(clock.getElapsedTime(), TOTAL_DURATION);
    
    const progress = Math.max(0, Math.min(1, globalTime - delay));
    const opacity = progress * 0.8;
    
    let color = new THREE.Color("#D9534F"); // amber-red
    if (globalTime > 11) {
      const shiftProg = Math.min(1, (globalTime - 11) / 2);
      if (shiftProg < 0.5) {
        color.lerp(new THREE.Color("#BA7517"), shiftProg * 2);
      } else {
        color = new THREE.Color("#BA7517");
        color.lerp(new THREE.Color("#FDF5E6"), (shiftProg - 0.5) * 2);
      }
    }
    
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity;
    mat.color = color;
    
    textRef.current.color = color;
    textRef.current.fillOpacity = opacity;
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius, radius + 0.02, 64]} />
        <meshBasicMaterial color="#D9534F" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      <Text
        ref={textRef}
        position={[radius + 0.2, 0, 0]}
        fontSize={0.2}
        color="#D9534F"
        anchorX="left"
        anchorY="middle"
        fillOpacity={0}
      >
        {year}
      </Text>
    </group>
  );
}

// --- Forecast Curves ---
function ForecastCurves() {
  const curveCount = 8;
  const groupRef = useRef<THREE.Group>(null);
  
  const curves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < curveCount; i++) {
      const start = new THREE.Vector3((i - curveCount/2) * 1, 2, 0);
      const end = new THREE.Vector3((i - curveCount/2) * 1, -2, 4);
      const mid = new THREE.Vector3((i - curveCount/2) * 1, 1, 2);
      arr.push(new THREE.QuadraticBezierCurve3(start, mid, end));
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const globalTime = Math.min(clock.getElapsedTime(), TOTAL_DURATION);
    const progress = Math.max(0, Math.min(1, (globalTime - 12) / 2));
    
    groupRef.current.children.forEach((child, i) => {
      const line = child as THREE.Line;
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = progress * 0.6;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, EARTH_RADIUS + 1]} rotation={[Math.PI / 8, 0, 0]}>
      {curves.map((curve, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry" {...{ setFromPoints: [curve.getPoints(20)] } as any} />
          <lineBasicMaterial color="#FDF5E6" transparent opacity={0} />
        </line>
      ))}
    </group>
  );
}

// --- Camera Director ---
function CameraDirector() {
  const [animDone, setAnimDone] = useState(false);

  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime();
    if (time >= TOTAL_DURATION) {
      if (!animDone) setAnimDone(true);
      return;
    }
    
    const globalTime = Math.min(time, TOTAL_DURATION);
    
    if (globalTime < 13) {
      const pullBackProg = globalTime / 13;
      camera.position.z = THREE.MathUtils.lerp(6, 12, pullBackProg);
      camera.position.y = THREE.MathUtils.lerp(0, 3, pullBackProg);
      camera.lookAt(0, 0, 0);
    } else {
      const orbitProg = (globalTime - 13) / 2;
      const radius = 12;
      const angle = orbitProg * Math.PI * 0.2;
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.lookAt(0, 0, 0);
    }
  });

  return animDone ? (
    <OrbitControls
      enableZoom={true}
      enablePan={false}
      enableRotate={true}
      autoRotate={true}
      autoRotateSpeed={0.5}
      minDistance={6}
      maxDistance={20}
      makeDefault
    />
  ) : null;
}

export default function AIPredictiveScene() {
  return (
    <div className="absolute inset-0 z-0 bg-[#0A0500]">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Suspense fallback={null}>
          <NeuralNetwork />
          <TransparentEarth />
          <DataStreams />
          <TimelineRings />
          <ForecastCurves />
          <CameraDirector />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,0,0.95)_100%)] z-10" />
    </div>
  );
}
