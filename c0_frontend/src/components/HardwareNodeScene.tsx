import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   HardwareNodeScene — Stage 04
   A sci-fi telemetry scene featuring a rotating 3D holographic 
   terrain transitioning from lush to arid. Glowing hardware nodes
   (CO2, NO2, CH4, etc.) hover and connect via lasers. A satellite 
   blueprint grid sweeps from above.
───────────────────────────────────────────────────────────────── */

export default function HardwareNodeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── 3D Terrain Data ──
    const cols = 22;
    const rows = 22;
    const size = 18; // Grid spacing
    const terrain: number[][] = [];
    
    // Generate static noise map for terrain heights
    for (let x = 0; x < cols; x++) {
      terrain[x] = [];
      for (let z = 0; z < rows; z++) {
        // Complex wave combining sine/cosine for organic bumps
        const h1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 20;
        const h2 = Math.cos(x * 0.1 + z * 0.2) * 40;
        const h3 = Math.sin((x*x + z*z)*0.01) * 15;
        // Taper edges down to make an island
        const distFromCenter = Math.sqrt(Math.pow(x - cols/2, 2) + Math.pow(z - rows/2, 2));
        const edgeMask = Math.max(0, 1 - distFromCenter / (cols/2));
        
        terrain[x][z] = (h1 + h2 + h3) * Math.pow(edgeMask, 1.5) - 30; // Negative pushes it "up"
      }
    }

    // ── Hardware Nodes Data ──
    // Nodes defined in 3D space relative to terrain center
    const hwNodes = [
      { id: 'CO2',      x: -150, y: -200, z: -100, targetX: 3, targetZ: 5, color: '#00e5ff' },
      { id: 'NO2',      x: 100,  y: -180, z: -120, targetX: 16, targetZ: 4, color: '#ff3366' },
      { id: 'CH4',      x: -50,  y: -220, z: 80,   targetX: 8, targetZ: 14, color: '#ffbb00' },
      { id: 'HUMIDITY', x: 180,  y: -150, z: 60,   targetX: 18, targetZ: 15, color: '#00ff66' },
      { id: 'MOISTURE', x: -180, y: -130, z: 120,  targetX: 4, targetZ: 18, color: '#0088ff' },
    ];

    let t = 0;

    // Simple 3D to 2D projection function
    const project = (x: number, y: number, z: number, angle: number, pitch: number, scale: number, cx: number, cy: number) => {
      // 1. Rotate around Y axis (pan)
      const rx = x * Math.cos(angle) - z * Math.sin(angle);
      const rz = x * Math.sin(angle) + z * Math.cos(angle);
      
      // 2. Rotate around X axis (pitch down for isometric view)
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
      const rz2 = y * Math.sin(pitch) + rz * Math.cos(pitch);

      // 3. Simple perspective projection
      const fov = 800;
      const zOffset = 600;
      const factor = fov / (fov + rz2 + zOffset);
      
      return {
        x: cx + rx * scale * factor,
        y: cy + ry * scale * factor,
        scale: factor,
        z: rz2
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── 1. Deep Dark Tech Background (Lightened) ──
      const bgGrad = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, w);
      bgGrad.addColorStop(0, '#102242'); // Lightened tech blue
      bgGrad.addColorStop(1, '#050b14'); // Lighter dark edge
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 2. UI/UX Sci-Fi Telemetry Elements (Background) ──
      ctx.save();
      ctx.translate(w*0.5, h*0.5);
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.05)';
      ctx.lineWidth = 1;
      // Rotating radar rings
      ctx.rotate(t * 0.1);
      ctx.beginPath(); ctx.arc(0, 0, 400, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 420, 0, Math.PI * 1.5); ctx.stroke();
      // Crosshairs
      ctx.beginPath(); ctx.moveTo(-600, 0); ctx.lineTo(600, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -600); ctx.lineTo(0, 600); ctx.stroke();
      ctx.restore();

      // ── Set up 3D Scene Parameters ──
      const scale = 1.8 + (mx - 0.5) * 0.2; // slight zoom on mouse
      const angle = t * 0.2 + (mx - 0.5); // slow auto-rotation + mouse parallax
      const pitch = 0.8 + (my - 0.5) * 0.3; // isometric pitch down
      const cx = w * 0.5;
      const cy = h * 0.6; // Center slightly lower

      // ── 3. Holographic Land Mass (Terrain) ──
      // Calculate terrain vertices in 2D
      const projectedGrid: {x:number, y:number, z:number}[][] = [];
      const widthOffset = (cols * size) / 2;
      const depthOffset = (rows * size) / 2;

      for (let x = 0; x < cols; x++) {
        projectedGrid[x] = [];
        for (let z = 0; z < rows; z++) {
          const worldX = (x * size) - widthOffset;
          const worldZ = (z * size) - depthOffset;
          const worldY = terrain[x][z];
          projectedGrid[x][z] = project(worldX, worldY, worldZ, angle, pitch, scale, cx, cy);
        }
      }

      // Draw terrain polygons (painters algorithm roughly handled by Z iteration, but simple isometric is fine if drawn back to front)
      // We will just draw lines for a wireframe/holographic look, plus filled polygons
      for (let z = 0; z < rows - 1; z++) {
        for (let x = 0; x < cols - 1; x++) {
          const p1 = projectedGrid[x][z];
          const p2 = projectedGrid[x+1][z];
          const p3 = projectedGrid[x+1][z+1];
          const p4 = projectedGrid[x][z+1];

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();

          // Transition color: Left side of data (x index) is lush green, Right side is arid orange
          const vegetationRatio = x / cols; 
          // Lush forest green -> Arid soil orange
          const r = Math.floor(0 + vegetationRatio * 200);
          const g = Math.floor(180 - vegetationRatio * 100);
          const b = Math.floor(80 - vegetationRatio * 60);

          // Darken based on depth to fake lighting
          const depthAlpha = Math.max(0.1, 1 - (p1.z + 200) / 400);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${depthAlpha * 0.6})`;
          ctx.fill();

          // Holographic wireframe grid
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${depthAlpha * 0.9})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Base of the floating island (giving it thickness)
      ctx.beginPath();
      for (let x = 0; x < cols; x++) ctx.lineTo(projectedGrid[x][rows-1].x, projectedGrid[x][rows-1].y);
      for (let x = cols-1; x >= 0; x--) ctx.lineTo(projectedGrid[x][rows-1].x, projectedGrid[x][rows-1].y + 60*scale);
      ctx.fillStyle = 'rgba(10, 20, 30, 0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
      ctx.stroke();

      // ── 4. Satellite View Overlay (Blueprint Grid sweeping) ──
      const sweepZ = (Math.sin(t) * depthOffset); // Sweeps front to back
      const satP = project(0, -350, sweepZ, angle, pitch, scale, cx, cy);
      
      ctx.save();
      ctx.translate(satP.x, satP.y);
      // Squashed ellipse representing the scan plane
      ctx.beginPath();
      ctx.ellipse(0, 0, 250*scale, 80*scale, 0, 0, Math.PI*2);
      const satGrad = ctx.createRadialGradient(0,0,0, 0,0, 250*scale);
      satGrad.addColorStop(0, 'rgba(0, 255, 255, 0.15)');
      satGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = satGrad;
      ctx.fill();
      
      // Scanning line/grid dropping down
      ctx.beginPath();
      ctx.moveTo(-150*scale, 0); ctx.lineTo(150*scale, 0);
      ctx.moveTo(0, -50*scale); ctx.lineTo(0, 50*scale);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Ghost scanning beam down to terrain
      ctx.beginPath();
      ctx.moveTo(-150*scale, 0);
      ctx.lineTo(150*scale, 0);
      // Project the current sweep line on the terrain
      const terrainPLeft = project(-widthOffset, 0, sweepZ, angle, pitch, scale, cx, cy);
      const terrainPRight = project(widthOffset, 0, sweepZ, angle, pitch, scale, cx, cy);
      ctx.lineTo(terrainPRight.x - satP.x, terrainPRight.y - satP.y);
      ctx.lineTo(terrainPLeft.x - satP.x, terrainPLeft.y - satP.y);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.03)';
      ctx.fill();
      ctx.restore();

      // ── 5. Hardware Nodes & Laser Lines ──
      hwNodes.forEach(node => {
        // Float the node slightly
        const floatingY = node.y + Math.sin(t * 2 + node.x) * 15;
        const pNode = project(node.x, floatingY, node.z, angle, pitch, scale, cx, cy);
        
        // Target point on terrain
        const tx = node.targetX;
        const tz = node.targetZ;
        const pTarget = projectedGrid[tx][tz];

        // Laser line connecting node to soil
        ctx.beginPath();
        ctx.moveTo(pNode.x, pNode.y);
        ctx.lineTo(pTarget.x, pTarget.y);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6 + Math.sin(t * 5 + node.z) * 0.4; // Pulsing opacity
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Draw Node UI Box
        ctx.save();
        ctx.translate(pNode.x, pNode.y);
        
        // Tech box
        ctx.fillStyle = 'rgba(5, 15, 25, 0.85)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-35, -15);
        ctx.lineTo(25, -15);
        ctx.lineTo(35, -5);
        ctx.lineTo(35, 15);
        ctx.lineTo(-25, 15);
        ctx.lineTo(-35, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Node Glow
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = node.color;
        ctx.beginPath(); ctx.arc(-20, 0, 3, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;

        // Label Text
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, -10, 0);

        // Data pulsing bars
        const bars = 3;
        for(let b=0; b<bars; b++) {
          const barH = 2 + Math.random() * 6; // rapid random pulse
          ctx.fillStyle = node.color;
          ctx.fillRect(15 + b*4, 5 - barH, 2, barH);
        }
        ctx.restore();

        // Target point impact glow on soil
        ctx.beginPath();
        ctx.ellipse(pTarget.x, pTarget.y, 8, 4, 0, 0, Math.PI*2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      t += 0.015;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#050b14' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Dark gradient overlay at the bottom so text stays perfectly readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[rgba(5,11,20,0.8)] to-transparent opacity-95 pointer-events-none" />
      
      {/* Sci-fi vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[rgba(5,11,20,0.6)] pointer-events-none" />
    </div>
  );
}
