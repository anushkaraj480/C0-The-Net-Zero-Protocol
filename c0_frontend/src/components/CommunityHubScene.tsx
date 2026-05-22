import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   CommunityHubScene — Stage 03
   A sleek, premium, abstract network visualization. Dots represent
   farmers and landowners connecting across a dark, tech-driven map.
   Lines dynamically form and glow as connections are made.
───────────────────────────────────────────────────────────────── */

export default function CommunityHubScene() {
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

    // ── Nodes (Farmers & Landowners) ──
    const numNodes = Math.floor((w * h) / 15000); // Scale based on screen size
    const nodes = Array.from({ length: numNodes }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1.5,
      isLandowner: Math.random() > 0.8, // 20% are larger landowner hubs
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;

      // ── Premium Dark Background ──
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w);
      bgGrad.addColorStop(0, '#041008'); // Very deep forest green/black
      bgGrad.addColorStop(1, '#020503'); // Pitch black edges
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle grid overlay for tech feel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const gridOffsetX = (mouseRef.current.x - 0.5) * -40;
      const gridOffsetY = (mouseRef.current.y - 0.5) * -40;

      ctx.beginPath();
      for (let x = (gridOffsetX % gridSize) - gridSize; x < w; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = (gridOffsetY % gridSize) - gridSize; y < h; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // ── Update and Draw Nodes & Connections ──
      const maxDistance = 180;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Movement
        node.x += node.vx;
        node.y += node.vy;
        node.pulsePhase += 0.02;

        // Wrap around edges
        if (node.x < 0) node.x = w;
        if (node.x > w) node.x = 0;
        if (node.y < 0) node.y = h;
        if (node.y > h) node.y = 0;

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Draw line
            const alpha = 1 - (dist / maxDistance);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            
            // Connection is brighter if it involves a landowner
            if (node.isLandowner || other.isLandowner) {
              ctx.strokeStyle = `rgba(0, 255, 120, ${alpha * 0.4})`;
              ctx.lineWidth = 1.5;
            } else {
              ctx.strokeStyle = `rgba(0, 200, 80, ${alpha * 0.15})`;
              ctx.lineWidth = 0.8;
            }
            ctx.stroke();
          }
        }

        // Interaction with mouse (repel slightly, glow brightly)
        const mdx = node.x - mx;
        const mdy = node.y - my;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        let hoverGlow = 0;
        
        if (mDist < 150) {
          hoverGlow = 1 - (mDist / 150);
          node.x += (mdx / mDist) * hoverGlow * 0.5; // gentle repel
          node.y += (mdy / mDist) * hoverGlow * 0.5;
          
          // Draw connection to cursor
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(0, 255, 150, ${hoverGlow * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Node
        ctx.beginPath();
        const baseRadius = node.isLandowner ? node.size * 2.5 : node.size;
        const currentRadius = baseRadius + Math.sin(node.pulsePhase) * (node.isLandowner ? 1 : 0.5);
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);

        if (node.isLandowner) {
          // Landowner: Bright cyan/green hub
          ctx.fillStyle = `rgba(0, 255, 150, ${0.8 + hoverGlow})`;
          ctx.shadowColor = '#00ff99';
          ctx.shadowBlur = 15 + hoverGlow * 20;
        } else {
          // Farmer: Standard green node
          ctx.fillStyle = `rgba(0, 200, 80, ${0.5 + hoverGlow * 0.5})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#020503' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Dark gradient overlay at the bottom so text stays perfectly readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020503] via-transparent to-transparent opacity-90 pointer-events-none" />
      
      {/* Top subtle vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#020503] opacity-60 pointer-events-none" />
    </div>
  );
}
