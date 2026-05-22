import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, useTexture, Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

// Red CO2 Particles rising from the surface
function RedSmokeParticles() {
  const points = useRef<THREE.Points>(null);
  
  const particleCount = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Position particles close to the Earth's surface (radius 2)
      const r = 2.01 + Math.random() * 0.15;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (points.current) {
      // Particles rising effect (expanding outward slightly) and rotating with earth
      const time = clock.getElapsedTime();
      const positionsAttr = points.current.geometry.attributes.position;
      
      for (let i = 0; i < particleCount; i++) {
        // Small radial drift
        const idx = i * 3;
        const x = positions[idx];
        const y = positions[idx + 1];
        const z = positions[idx + 2];
        
        // Calculate normal vector
        const len = Math.sqrt(x*x + y*y + z*z);
        const nx = x/len;
        const ny = y/len;
        const nz = z/len;
        
        // Drift outwards over time, reset when too far
        const drift = (time * 0.1 + (i % 10) * 0.05) % 0.2; 
        
        positionsAttr.array[idx] = x + nx * drift;
        positionsAttr.array[idx + 1] = y + ny * drift;
        positionsAttr.array[idx + 2] = z + nz * drift;
      }
      positionsAttr.needsUpdate = true;

      // Rotate to match Earth's rotation
      points.current.rotation.y = time * 0.05;
    }
  });

  return (
    <Points ref={points} limit={particleCount}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial 
        transparent 
        color="#ff1a1a" 
        size={0.02} 
        sizeAttenuation={true} 
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function DystopianGlobe({ step }: { step: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const [colorMap, normalMap, cloudMap] = useTexture([
    "/textures/earth_daymap.jpg",
    "/textures/earth_normal.jpg",
    "/textures/earth_clouds.jpg"
  ]);

  const customMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughness: 0.8,
      metalness: 0.1,
    });

    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          
          // Dystopian Filter: Dark Charcoal, Ash Grey, and Dark Red
          vec3 texColor = sampledDiffuseColor.rgb;
          
          // Desaturate to get ash grey base
          float luminance = dot(texColor, vec3(0.299, 0.587, 0.114));
          vec3 ashGrey = vec3(luminance) * 0.5; // Darken it
          
          // Identify landmass (luminance > some threshold or specific color)
          // Add a dark red / brown tint to the land
          vec3 landTint = mix(ashGrey, vec3(0.4, 0.1, 0.05), 0.6); // Dark red/brown
          vec3 oceanTint = mix(ashGrey, vec3(0.1, 0.1, 0.12), 0.8); // Charcoal ocean
          
          // Simple ocean mask based on blue channel dominance
          float oceanMask = smoothstep(0.8, 1.2, texColor.b / max(texColor.r + 0.001, 0.001));
          
          vec3 finalColor = mix(landTint, oceanTint, oceanMask);
          
          // Add some burning red spots based on green channel (forests burning)
          float forestMask = smoothstep(0.4, 1.0, texColor.g - texColor.b);
          finalColor = mix(finalColor, vec3(0.8, 0.2, 0.0), forestMask * 0.7);

          sampledDiffuseColor.rgb = finalColor;
          
          diffuseColor *= sampledDiffuseColor;
        #endif
        `
      );
    };
    return mat;
  }, [colorMap, normalMap]);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    
    // Slow rotation
    if (earthRef.current) {
      earthRef.current.rotation.y = t * 0.05;
      earthRef.current.rotation.x = t * 0.02;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = t * 0.055;
      cloudRef.current.rotation.x = t * 0.022;
    }

    // Cinematic Camera Zoom
    // Start far in deep space (z=15), zoom into a brown hazy skyline (z=4)
    let targetZ = 15;
    let targetY = 0;
    
    if (step === 0) {
      // Scene 1: Zooming in from space
      // For the first few seconds, it lerps closer
      targetZ = 3.5;
      targetY = 0.5; // slight angle
    } else if (step === 1) {
      targetZ = 4.5;
      targetY = -0.5;
    } else {
      targetZ = 5;
      targetY = 0;
    }

    // Add mouse parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + mouse.y * 1, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.015); // Slow, cinematic zoom
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <Sphere args={[2, 64, 64]} ref={earthRef}>
        <primitive object={customMaterial} attach="material" />
      </Sphere>

      {/* Smog Clouds (Brown/Grey) */}
      <Sphere args={[2.02, 64, 64]} ref={cloudRef}>
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.6}
          depthWrite={false}
          color="#8b7355" // Brown smog tint
          blending={THREE.NormalBlending}
        />
      </Sphere>
      
      {/* Thicker Atmosphere Smog layer */}
      <Sphere args={[2.04, 32, 32]}>
        <meshBasicMaterial
          color="#3a2e24" // Dark brown/charcoal
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      <RedSmokeParticles />
    </group>
  );
}

export default function CinematicEarth({ currentStep }: { currentStep: number }) {
  return (
    <div className="absolute inset-0 z-0 bg-[#050505]">
      {/* Initial camera positioned far away for the zoom-in effect */}
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <fog attach="fog" args={['#050505', 2, 10]} />
        
        {/* Dim, dramatic lighting */}
        <ambientLight intensity={0.1} color="#ffb0b0" />
        <directionalLight
          position={[5, 3, 5]}
          intensity={1.2}
          color="#ffa07a" // Urgent orange/red directional light
        />
        <pointLight
          position={[-5, -5, -5]}
          intensity={0.5}
          color="#ff0000" // Red underglow
        />

        <Suspense fallback={null}>
          <DystopianGlobe step={currentStep} />
        </Suspense>
      </Canvas>
      
      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />
    </div>
  );
}
