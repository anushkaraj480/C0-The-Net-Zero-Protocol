import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";

function SwirlingParticles({ onAssemble }: { onAssemble: () => void }) {
  const points = useRef<THREE.Points>(null);
  const particleCount = 4000;
  
  // Start positions (scattered) and target positions (C0 shape)
  const [positions, targetPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const target = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random scattered in deep space
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      // Target: Rough "C0" shape
      // C shape
      let tx, ty, tz;
      if (i < particleCount / 2) {
        const angle = Math.random() * Math.PI * 1.5 + Math.PI * 0.25;
        const radius = 1.5 + Math.random() * 0.2;
        tx = -2 + Math.cos(angle) * radius;
        ty = Math.sin(angle) * radius * 1.5;
        tz = (Math.random() - 0.5) * 0.5;
      } else {
        // 0 shape
        const angle = Math.random() * Math.PI * 2;
        const radiusX = 1.2 + Math.random() * 0.2;
        const radiusY = 2 + Math.random() * 0.2;
        tx = 2 + Math.cos(angle) * radiusX;
        ty = Math.sin(angle) * radiusY;
        tz = (Math.random() - 0.5) * 0.5;
      }
      
      target[i * 3] = tx;
      target[i * 3 + 1] = ty;
      target[i * 3 + 2] = tz;
    }
    return [pos, target];
  }, []);

  const [assembled, setAssembled] = useState(false);
  const assembledRef = useRef(false); // ref for use inside useFrame

  useFrame(({ clock }) => {
    if (!points.current) return;
    const time = clock.getElapsedTime();
    const positionsAttr = points.current.geometry.attributes.position;
    
    let allClose = true;

    // Dynamically adjust particle brightness:
    // bright while flying in, dim once settled
    const targetOpacity = assembledRef.current ? 0.35 : 0.75;
    material.opacity += (targetOpacity - material.opacity) * 0.05; // smooth lerp

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const px = positionsAttr.array[idx];
      const py = positionsAttr.array[idx + 1];
      const pz = positionsAttr.array[idx + 2];
      
      const tx = targetPositions[idx];
      const ty = targetPositions[idx + 1];
      const tz = targetPositions[idx + 2];
      
      const dx = tx - px;
      const dy = ty - py;
      const dz = tz - pz;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (dist > 0.5) {
        allClose = false;
      }
      
      if (!assembled) {
        // Smooth, gentle pull — increases slowly over time
        const pull = Math.min(0.06, 0.01 + time * 0.01);
        // Swirl decays as particle approaches target
        const noise = Math.min(1, dist * 0.15);
        const swirlX = Math.sin(time * 1.2 + py) * 0.3 * noise;
        const swirlY = Math.cos(time * 1.2 + px) * 0.3 * noise;
        
        positionsAttr.array[idx]     += dx * pull + swirlX * 0.03;
        positionsAttr.array[idx + 1] += dy * pull + swirlY * 0.03;
        positionsAttr.array[idx + 2] += dz * pull;
      } else {
        positionsAttr.array[idx] = tx + Math.sin(time * 2 + i) * 0.05;
        positionsAttr.array[idx + 1] = ty + Math.cos(time * 2 + i) * 0.05;
        positionsAttr.array[idx + 2] = tz + Math.sin(time * 3 + i) * 0.05;
      }
    }
    
    positionsAttr.needsUpdate = true;
    points.current.rotation.y = Math.sin(time * 0.2) * 0.2;
    points.current.rotation.x = Math.cos(time * 0.2) * 0.1;

    // Force assembly if all close or 5 seconds have passed
    if (!assembledRef.current && (allClose || time > 5)) {
      assembledRef.current = true;
      setAssembled(true);
      onAssemble();
    }
  });

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: '#00ffb2',
      size: 0.03,            // Much smaller particles
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,         // Semi-transparent
      depthWrite: false,
      blending: THREE.AdditiveBlending, // Soft glowing blend
    });
    return { geometry: geo, material: mat };
  }, [positions]);

  return <points ref={points} geometry={geometry} material={material} />;
}

function GlowingLogo({ assembled }: { assembled: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!group.current || !assembled) return;
    const time = clock.getElapsedTime();
    
    // Float
    group.current.position.y = Math.sin(time) * 0.2;
    
    // Orbit camera indirectly by rotating the group slowly
    group.current.rotation.y = time * 0.2;
    
    // Pulse light with lower intensity
    if (lightRef.current) {
      // Soft burst on assembly, then soft pulse
      lightRef.current.intensity = Math.max(1, Math.sin(time * 3) * 0.5 + 1.5);
    }
  });

  return (
    <group ref={group}>
      {assembled && (
        <>
          <pointLight ref={lightRef} color="#00ffb2" distance={10} intensity={1.5} decay={2} />
          
          <Text
            fontSize={0.8}
            letterSpacing={0.1}
            color="#00ffb2"
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.25}
            outlineWidth={0.005}
            outlineColor="#00ffb2"
            outlineOpacity={0.15}
          >
            C0
            <meshStandardMaterial 
              color="#00ffb2" 
              emissive="#00ffb2" 
              emissiveIntensity={0.3} 
              transparent 
              opacity={0.25} 
            />
          </Text>
        </>
      )}
    </group>
  );
}

export default function LogoAssemblyScene() {
  const [assembled, setAssembled] = useState(false);

  return (
    <div className="absolute inset-0 z-0 bg-[#020202]">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <fog attach="fog" args={['#020202', 5, 30]} />
        
        {/* Deep black with faint star field */}
        <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.1} />
        
        <Suspense fallback={null}>
          <SwirlingParticles onAssemble={() => setAssembled(true)} />
          <GlowingLogo assembled={assembled} />
        </Suspense>
      </Canvas>
      
      {/* Light Burst Overlay on DOM level for extra impact */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          assembled ? 'bg-[radial-gradient(circle_at_center,rgba(0,255,178,0.08)_0%,transparent_40%)]' : 'bg-transparent'
        }`} 
      />
    </div>
  );
}
