import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import Particles from "./Particles";

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, cloudMap] = useTexture([
    "/textures/earth_daymap.jpg",
    "/textures/earth_normal.jpg",
    "/textures/earth_clouds.jpg"
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
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          
          // Smooth the ocean transition based on blue channel dominance
          float oceanBlend = smoothstep(0.8, 1.2, sampledDiffuseColor.b / max(sampledDiffuseColor.r + 0.001, 0.001));

          // Barren Tint (Left Half) - Reduce green, boost red/orange
          vec3 dryColor = sampledDiffuseColor.rgb;
          dryColor.r = min(1.0, dryColor.r * 1.5);
          dryColor.g = dryColor.g * 0.85;
          dryColor.b = dryColor.b * 0.6;
          
          // Lush Tint (Right Half) - Boost green significantly
          vec3 lushColor = sampledDiffuseColor.rgb;
          lushColor.r = lushColor.r * 0.7;
          lushColor.g = min(1.0, lushColor.g * 1.7);
          lushColor.b = lushColor.b * 0.7;
          
          // Mix based on X coordinate in UV space (0 to 1)
          float sideBlend = smoothstep(0.48, 0.52, vMapUv.x);
          
          vec3 landColor = mix(dryColor, lushColor, sideBlend);
          
          // Apply land color only where it's not ocean
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

    // Smooth rotation
    const rotationY = t * 0.08;
    const rotationX = mouse.y * 0.2;

    if (earthRef.current) {
      earthRef.current.rotation.y = rotationY;
      earthRef.current.rotation.x = rotationX;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = rotationY * 1.05;
      cloudRef.current.rotation.x = rotationX;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = rotationY;
      wireframeRef.current.rotation.x = rotationX;
    }
  });

  return (
    <group>
      {/* Main Sphere */}
      <Sphere args={[2, 64, 64]} ref={earthRef}>
        <primitive object={customMaterial} attach="material" />
      </Sphere>

      {/* Cloud Overlay */}
      <Sphere args={[2.02, 64, 64]} ref={cloudRef}>
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>

      {/* Wireframe Overlay */}
      <Sphere args={[2.04, 32, 32]} ref={wireframeRef}>
        <meshStandardMaterial
          color="#00ffb2"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Atmosphere Glow */}
      <Sphere args={[2.12, 32, 32]}>
        <meshBasicMaterial
          color="#00cfff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}

export default function Earth3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>

        {/* Lights */}
        <ambientLight intensity={0.25} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          color="#ffffff"
        />

        <pointLight
          position={[-5, -5, -5]}
          intensity={1}
          color="#00ffb2"
        />

        {/* Components */}
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <Particles />

        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}