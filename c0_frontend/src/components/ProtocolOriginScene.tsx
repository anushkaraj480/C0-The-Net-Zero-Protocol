import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Text, Cylinder } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";

// --- Procedural Earth Shader (no texture files required) ---
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uCrackIntensity;
  uniform float uHealRadius;
  uniform float uPulse;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
  }
  float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }
  float hexGrid(vec2 p) {
    p.x *= 1.1547;
    p.y += mod(floor(p.x), 2.0) * 0.5;
    p = abs(fract(p) - 0.5);
    return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 1.0);
  }

  void main() {
    // Base procedural Earth colors using noise
    vec2 uv = vUv;
    float continents = fbm(uv * 5.0 + 0.5);
    float oceans = fbm(uv * 3.0 + 1.5);
    
    vec3 landColor = mix(vec3(0.13, 0.37, 0.18), vec3(0.55, 0.42, 0.18), continents);
    vec3 oceanColor = mix(vec3(0.05, 0.15, 0.45), vec3(0.07, 0.25, 0.55), oceans);
    vec3 baseEarth = mix(oceanColor, landColor, step(0.52, continents));
    
    // Greyscale broken earth (underexposed)
    float lum = dot(baseEarth, vec3(0.299, 0.587, 0.114));
    vec3 greyEarth = vec3(lum * 0.3);
    
    // Procedural cracks (thin Voronoi-like lines)
    float n1 = noise(uv * 18.0 + uTime * 0.05);
    float n2 = noise(uv * 35.0 + vec2(uTime * 0.02, 0.0));
    float crack = smoothstep(0.47, 0.50, n1) * smoothstep(0.53, 0.50, n1);
    crack *= step(0.3, n2);
    vec3 crackColor = vec3(1.0, 0.08, 0.08) * crack * uCrackIntensity * 8.0;
    vec3 brokenEarth = greyEarth + crackColor;
    
    // Hex protocol grid
    float h = hexGrid(uv * 40.0);
    float hexLine = smoothstep(0.08, 0.03, h);
    vec3 electricBlue = vec3(0.094, 0.373, 0.647);
    
    // Pulse wave along grid
    float dist = length(uv - vec2(0.5, 1.0)) * 3.0; // distance from north pole
    float pulseWave = uPulse * max(0.0, 1.0 - abs(dist - uTime * 3.0) * 2.0);
    vec3 gridColor = electricBlue * hexLine * (2.5 + pulseWave * 4.0);
    
    // Restored warm earth
    vec3 restoredEarth = baseEarth * 1.5 + gridColor;
    
    // Healing wave from North Pole (uv.y goes 0=south to 1=north)
    float distToNorthPole = (1.0 - uv.y) * 3.5;
    float isHealed = smoothstep(uHealRadius + 0.15, uHealRadius - 0.15, distToNorthPole);
    float flashEdge = smoothstep(0.2, 0.0, abs(distToNorthPole - uHealRadius)) * uCrackIntensity;
    vec3 flashColor = vec3(1.0) * flashEdge * 2.0;
    
    // Basic lighting
    float light = max(0.2, dot(vNormal, normalize(vec3(1.0, 0.5, 1.0))));
    
    vec3 finalColor = mix(brokenEarth, restoredEarth, isHealed) + flashColor;
    finalColor *= light;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- Globe Component ---
function OriginGlobe({ crackIntensity, healRadius, pulse }: { 
  crackIntensity: number; healRadius: number; pulse: number 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useRef({
    uTime: { value: 0 },
    uCrackIntensity: { value: 0 },
    uHealRadius: { value: 0 },
    uPulse: { value: 0 },
  });

  useFrame(({ clock }) => {
    uniforms.current.uTime.value = clock.getElapsedTime();
    uniforms.current.uCrackIntensity.value = crackIntensity;
    uniforms.current.uHealRadius.value = healRadius;
    uniforms.current.uPulse.value = pulse;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </Sphere>
  );
}

// --- Atmosphere glow ---
function Atmosphere({ healRadius }: { healRadius: number }) {
  const glowIntensity = 0.3 + healRadius * 0.1;
  return (
    <Sphere args={[2.15, 32, 32]}>
      <meshBasicMaterial
        color={healRadius > 2 ? "#185FA5" : "#330000"}
        transparent
        opacity={glowIntensity * 0.12}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

// --- Floating Red Labels ---
function FloatingLabels({ crackIntensity, healRadius }: { crackIntensity: number; healRadius: number }) {
  const opacity = Math.max(0, crackIntensity - Math.max(0, (healRadius - 0.5) * 2));

  const labels = [
    { text: "UNVERIFIED OFFSETS", pos: [0, 0.5, 2.3] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
    { text: "BROKEN TRUST", pos: [2.3, 0.2, 0] as [number,number,number], rot: [0, Math.PI / 2, 0] as [number,number,number] },
    { text: "NO TRANSPARENCY", pos: [-2.3, -0.3, 0] as [number,number,number], rot: [0, -Math.PI / 2, 0] as [number,number,number] },
    { text: "NO ACCOUNTABILITY", pos: [0, -0.8, 2.2] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  ];

  if (opacity <= 0.01) return null;

  return (
    <>
      {labels.map((l, i) => (
        <Text
          key={i}
          position={l.pos}
          rotation={l.rot}
          fontSize={0.13}
          color="#ff3333"
          anchorX="center"
          anchorY="middle"
          fillOpacity={opacity}
          outlineWidth={0.005}
          outlineColor="#ff0000"
          font="https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff2"
        >
          {l.text}
        </Text>
      ))}
    </>
  );
}

// --- Light Beam ---
function LightBeam({ beamProgress }: { beamProgress: number }) {
  // beamProgress 0 = top, 1 = hit north pole
  if (beamProgress <= 0 || beamProgress >= 1.05) return null;
  const beamTop = 8;
  const beamBottom = 2.1; // North pole Y
  const currentY = beamTop - (beamTop - beamBottom) * beamProgress;
  const beamLength = (beamTop - currentY) * 2;

  return (
    <Cylinder
      args={[0.04, 0.04, beamLength, 8]}
      position={[0, currentY + beamLength / 2, 0]}
    >
      <meshBasicMaterial color="#c8f4ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
    </Cylinder>
  );
}

// --- C0 Logo emerging from grid ---
function C0Logo({ opacity }: { opacity: number }) {
  if (opacity <= 0.01) return null;
  return (
    <group position={[0, 0, 2.5]}>
      <Text
        fontSize={0.9}
        color="#185FA5"
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity}
        outlineWidth={0.03}
        outlineColor="#ffffff"
        outlineOpacity={opacity * 0.8}
      >
        C0
      </Text>
    </group>
  );
}

// --- Star field background ---
function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      arr[i] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.15} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

// --- Main Timeline Director ---
function SceneDirector() {
  const [state, setState] = useState({
    crackIntensity: 0,
    beamProgress: 0,
    healRadius: -0.5,
    pulse: 0,
    logoOpacity: 0,
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % 14;

    let crackIntensity = 0;
    let beamProgress = 0;
    let healRadius = -0.5;
    let pulse = 0;
    let logoOpacity = 0;

    if (t < 4) {
      // Cracks grow
      crackIntensity = t / 4;
    } else if (t < 5) {
      // Beam descends
      crackIntensity = 1;
      beamProgress = (t - 4);
    } else if (t < 9) {
      // Healing wave
      crackIntensity = 1;
      beamProgress = 1.1; // beam has landed, hide it
      healRadius = (t - 5) / 4 * 3.5; // 0 → 3.5
    } else if (t < 10) {
      // Pulse
      crackIntensity = 1;
      healRadius = 3.5;
      pulse = Math.sin((t - 9) * Math.PI);
    } else {
      // Logo assembly
      crackIntensity = 1;
      healRadius = 3.5;
      logoOpacity = Math.min(1, (t - 10) / 1.5);
    }

    setState({ crackIntensity, beamProgress, healRadius, pulse, logoOpacity });
  });

  return (
    <group>
      <Stars />
      <OriginGlobe crackIntensity={state.crackIntensity} healRadius={state.healRadius} pulse={state.pulse} />
      <Atmosphere healRadius={state.healRadius} />
      <FloatingLabels crackIntensity={state.crackIntensity} healRadius={state.healRadius} />
      <LightBeam beamProgress={state.beamProgress} />
      <C0Logo opacity={state.logoOpacity} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 8, 0]} intensity={state.beamProgress > 0.95 ? 8 : 0} color="#c8f4ff" distance={10} />
    </group>
  );
}

export default function ProtocolOriginScene() {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <Suspense fallback={null}>
          <SceneDirector />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] z-10" />
    </div>
  );
}
