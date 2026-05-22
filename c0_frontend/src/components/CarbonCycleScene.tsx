import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Cylinder, Plane } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";

// --- Configuration ---
const CYCLE_DURATION = 15; // seconds
const LEAF_COUNT = 300;
const CO2_COUNT = 1500;

// --- Helper to get phase and lerp ---
function getTimelineState(time: number) {
  const t = time % CYCLE_DURATION;
  
  let health = 1;
  let seedY = 10;
  let shockwave = 0;
  let co2Direction = 0; // 0 = idle, 1 = up, -1 = down
  let co2Active = false;
  
  if (t < 4) {
    // 0-4s: Withering
    health = 1 - (t / 4);
    co2Direction = 0;
  } else if (t < 7) {
    // 4-7s: Dead, CO2 escaping
    health = 0;
    co2Active = true;
    co2Direction = 1;
  } else if (t < 8) {
    // 7-8s: Pause
    health = 0;
    co2Active = true;
    co2Direction = 0.1;
  } else if (t < 9) {
    // 8-9s: Seed drops
    health = 0;
    co2Active = true;
    co2Direction = 0;
    seedY = 10 - ((t - 8) * 10); // drops from 10 to 0
  } else if (t < 9.5) {
    // 9-9.5s: Impact
    health = 0;
    seedY = 0;
    shockwave = (t - 9) * 2; // 0 to 1
    co2Active = true;
  } else if (t < 12) {
    // 9.5-12s: Explosive Regrowth
    health = (t - 9.5) / 2.5;
    seedY = 0;
    co2Active = true;
    co2Direction = -1; // Sucked back
  } else {
    // 12-15s: Lush
    health = 1;
    co2Active = false;
  }

  // Easing for health (bounce out for regrowth)
  if (t >= 9.5 && t < 12) {
    health = THREE.MathUtils.clamp(health, 0, 1);
    // Simple ease out
    health = 1 - Math.pow(1 - health, 3);
  }

  return { health: THREE.MathUtils.clamp(health, 0, 1), seedY, shockwave, co2Active, co2Direction };
}

// --- Components ---

function Ground({ health }: { health: number }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const lushColor = new THREE.Color("#2d4c1e");
  const deadColor = new THREE.Color("#3a2a18"); // Cracked earth color

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.color.lerpColors(deadColor, lushColor, health);
    }
  });

  return (
    <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial ref={materialRef} roughness={1} metalness={0} />
    </Plane>
  );
}

function Tree({ health }: { health: number }) {
  const trunkMat = useRef<THREE.MeshStandardMaterial>(null);
  const lushTrunk = new THREE.Color("#4a3b2c");
  const deadTrunk = new THREE.Color("#555555");
  
  // Leaves instanced mesh
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  
  // Setup leaves base positions
  const leavesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < LEAF_COUNT; i++) {
      // Cluster around top of trunk (y=2 to 4, radius 1.5)
      const y = 2 + Math.random() * 2;
      const radius = Math.random() * 1.5 * (1 - Math.abs(y - 3) / 2); // spherical cluster
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      data.push({
        baseX: x, baseY: y, baseZ: z,
        rotX: Math.random() * Math.PI, rotY: Math.random() * Math.PI, rotZ: Math.random() * Math.PI,
        fallDelay: Math.random(), // 0 to 1 mapping to health < 0.8
        fallSpeed: 0.05 + Math.random() * 0.05,
        fallRot: Math.random() * 0.2 - 0.1
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lushLeaf = new THREE.Color("#4ade80");
  const deadLeaf = new THREE.Color("#8b7355");
  const leafColor = new THREE.Color();

  useFrame(() => {
    if (trunkMat.current) {
      trunkMat.current.color.lerpColors(deadTrunk, lushTrunk, health);
    }

    if (leavesRef.current) {
      for (let i = 0; i < LEAF_COUNT; i++) {
        const leaf = leavesData[i];
        
        let x = leaf.baseX;
        let y = leaf.baseY;
        let z = leaf.baseZ;
        let scale = 1;
        let rotX = leaf.rotX;
        
        // Falling logic
        // If health goes below 0.8, leaves start falling based on their fallDelay
        const fallThreshold = 0.8 - leaf.fallDelay * 0.5;
        
        if (health < fallThreshold) {
          // It's falling or on ground
          const fallProgress = (fallThreshold - health) / fallThreshold; // 0 to 1
          y = Math.max(0.05, leaf.baseY - (fallProgress * leaf.baseY * 5 * leaf.fallSpeed));
          
          if (y > 0.05) {
            x += Math.sin(fallProgress * 10) * 0.2; // flutter
            rotX += leaf.fallRot;
          } else {
            scale = Math.max(0, 1 - (fallProgress - 0.8) * 5); // shrink away on ground
          }
        }
        
        // Regrowth scale logic
        if (health > 0) {
          scale *= Math.min(1, health * 2); 
        } else {
          scale = 0;
        }

        dummy.position.set(x, y, z);
        dummy.rotation.set(rotX, leaf.rotY, leaf.rotZ);
        dummy.scale.setScalar(0.15 * scale);
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(i, dummy.matrix);
        
        // Color
        leafColor.lerpColors(deadLeaf, lushLeaf, health);
        leavesRef.current.setColorAt(i, leafColor);
      }
      leavesRef.current.instanceMatrix.needsUpdate = true;
      if (leavesRef.current.instanceColor) leavesRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Trunk */}
      <Cylinder args={[0.2, 0.4, 3, 7]} position={[0, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial ref={trunkMat} roughness={0.9} />
      </Cylinder>
      {/* Simple Branches */}
      <Cylinder args={[0.05, 0.15, 1.5, 5]} position={[0.5, 2.5, 0]} rotation={[0, 0, -0.8]} castShadow>
        <meshStandardMaterial ref={trunkMat} roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.05, 0.15, 1.5, 5]} position={[-0.5, 2.2, 0.3]} rotation={[0.4, 0, 0.8]} castShadow>
        <meshStandardMaterial ref={trunkMat} roughness={0.9} />
      </Cylinder>

      {/* Instanced Leaves */}
      <instancedMesh ref={leavesRef} args={[undefined, undefined, LEAF_COUNT]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

function CO2Particles({ active, direction }: { active: boolean, direction: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(CO2_COUNT * 3);
    for (let i = 0; i < CO2_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: '#1a1a1a', size: 0.1, transparent: true, depthWrite: false });
    return { geometry: geo, material: mat };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    material.opacity = active ? 0.6 : 0;
    
    if (active) {
      for (let i = 0; i < CO2_COUNT; i++) {
        const idx = i * 3;
        const arr = positions.array as Float32Array;
        let y = arr[idx + 1];
        if (direction > 0) {
          y += 0.02 + Math.random() * 0.02;
          if (y > 8) y = 0;
          arr[idx] += (Math.random() - 0.5) * 0.02;
          arr[idx + 2] += (Math.random() - 0.5) * 0.02;
        } else if (direction < 0) {
          arr[idx] *= 0.9;
          arr[idx + 2] *= 0.9;
          y -= 0.1;
          if (y < 0) y = 8;
        } else {
          y += Math.sin(Date.now() * 0.001 + i) * 0.005;
        }
        arr[idx + 1] = y;
      }
      positions.needsUpdate = true;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function CinematicDirector() {
  const [timeline, setTimeline] = useState({ health: 1, seedY: 10, shockwave: 0, co2Active: false, co2Direction: 0 });
  const skyColor = useRef(new THREE.Color());
  const lushSky = new THREE.Color("#4aa9ff");
  const deadSky = new THREE.Color("#2a2a2a");
  
  useFrame(({ clock, scene }) => {
    const time = clock.getElapsedTime();
    const state = getTimelineState(time);
    setTimeline(state);
    
    // Update sky background
    skyColor.current.lerpColors(deadSky, lushSky, state.health);
    scene.background = skyColor.current;
    if (scene.fog) scene.fog.color = skyColor.current;
  });

  return (
    <group>
      <Ground health={timeline.health} />
      <Tree health={timeline.health} />
      <CO2Particles active={timeline.co2Active} direction={timeline.co2Direction} />
      
      {/* Seed */}
      {timeline.seedY < 10 && timeline.seedY > 0 && (
        <Sphere args={[0.08, 16, 16]} position={[0, timeline.seedY, 0]}>
          <meshStandardMaterial color="#00ffb2" emissive="#00ffb2" emissiveIntensity={2} />
          <pointLight color="#00ffb2" intensity={2} distance={5} />
        </Sphere>
      )}

      {/* Shockwave */}
      {timeline.shockwave > 0 && timeline.shockwave < 1 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[timeline.shockwave * 5, timeline.shockwave * 5 + 0.2, 32]} />
          <meshBasicMaterial color="#00ffb2" transparent opacity={1 - timeline.shockwave} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Dynamic Lighting */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={timeline.health * 1.5 + 0.2} 
        color="#ffffff" 
        castShadow 
      />
      <ambientLight intensity={timeline.health * 0.4 + 0.1} />
    </group>
  );
}

export default function CarbonCycleScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} shadows>
        <fog attach="fog" args={['#4aa9ff', 10, 30]} />
        <Suspense fallback={null}>
          <CinematicDirector />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
    </div>
  );
}
