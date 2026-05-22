import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   FarmerCarbonScene  —  Stage 02
   A dark, atmospheric farm landscape at dusk. Slow, dim carbon
   particles rise from the fields. Cursor parallax on layers.
───────────────────────────────────────────────────────────────── */

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function FarmerCarbonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const animRef   = useRef<number>(0);

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

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Slow, dim carbon particles ── */
    type Token = {
      x: number; y: number; baseX: number;
      vy: number; size: number; alpha: number; phase: number; speed: number;
    };
    const tokens: Token[] = Array.from({ length: 40 }, () => ({
      x:     rand(5, 95),
      y:     rand(55, 110),
      baseX: rand(5, 95),
      vy:    rand(0.05, 0.18),          // very slow
      size:  rand(1.5, 3.5),
      alpha: rand(0.08, 0.22),          // very dim
      phase: rand(0, Math.PI * 2),
      speed: rand(0.004, 0.01),
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      /* ══ SKY ══ */
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
      sky.addColorStop(0,   '#050b08');
      sky.addColorStop(0.5, '#071510');
      sky.addColorStop(1,   '#0a1e12');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.62);

      /* Dusk glow on horizon */
      const horizonY = H * 0.58 + (my - 0.5) * -12;
      const hGlow = ctx.createRadialGradient(W * 0.5, horizonY, 0, W * 0.5, horizonY, W * 0.55);
      hGlow.addColorStop(0,   'rgba(0,180,70,0.12)');
      hGlow.addColorStop(0.5, 'rgba(0,100,40,0.05)');
      hGlow.addColorStop(1,   'transparent');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 0, W, H);

      /* Few dim stars */
      ctx.save();
      [[0.12,0.08],[0.28,0.05],[0.45,0.12],[0.61,0.04],[0.74,0.09],[0.88,0.06],[0.35,0.14],[0.82,0.13]].forEach(([sx,sy]) => {
        const px = sx * W + (mx - 0.5) * -20;
        const py = sy * H + (my - 0.5) * -10;
        ctx.beginPath();
        ctx.arc(px, py, rand(0.6, 1.2), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,255,220,0.25)';
        ctx.fill();
      });
      ctx.restore();

      /* ══ DISTANT TREE LINE (parallax layer 1) ══ */
      const treeShiftX = (mx - 0.5) * -35;
      const treeY = H * 0.56 + (my - 0.5) * -8;
      ctx.save();
      ctx.fillStyle = '#040e07';
      // Draw silhouette of uneven tree tops
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, treeY + 10);
      const treePoints = 40;
      for (let i = 0; i <= treePoints; i++) {
        const tx = (i / treePoints) * W + treeShiftX;
        const ty = treeY + Math.sin(i * 0.7 + t * 0.05) * 14 +
                   Math.sin(i * 1.3) * 8 +
                   (i % 5 === 0 ? -18 : 0);            // occasional taller tree
        ctx.lineTo(tx, ty);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      /* ══ GROUND / FIELD ══ */
      const groundY = H * 0.58;
      const ground = ctx.createLinearGradient(0, groundY, 0, H);
      ground.addColorStop(0,   '#071a0d');
      ground.addColorStop(0.3, '#060f08');
      ground.addColorStop(1,   '#030806');
      ctx.fillStyle = ground;
      ctx.fillRect(0, groundY, W, H - groundY);

      /* ══ CROP ROWS (perspective) ══ */
      const rowShiftX = (mx - 0.5) * -20;
      const numRows = 18;
      for (let r = 0; r < numRows; r++) {
        const progress = r / numRows;
        const rowY = groundY + progress * (H - groundY) * 0.92;
        const rowAlpha = 0.08 + progress * 0.14;
        const rowWidth = 4 + progress * 18;

        // Perspective converging lines from horizon point
        const horizonX = W * 0.5 + rowShiftX;
        const spread = (r + 1) * (W / numRows) * 0.85;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(horizonX - spread * 0.1, groundY + 2);
        ctx.lineTo(horizonX - spread, rowY);
        ctx.strokeStyle = `rgba(0,180,70,${rowAlpha})`;
        ctx.lineWidth = 0.8 + progress * 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(horizonX + spread * 0.1, groundY + 2);
        ctx.lineTo(horizonX + spread, rowY);
        ctx.strokeStyle = `rgba(0,180,70,${rowAlpha})`;
        ctx.lineWidth = 0.8 + progress * 1.2;
        ctx.stroke();
        ctx.restore();

        // Horizontal crop row dots
        if (r > 3) {
          const dotCount = Math.floor(4 + progress * 14);
          for (let d = 0; d < dotCount; d++) {
            const dotX = horizonX - spread + (spread * 2 / dotCount) * d + rowShiftX * 0.3;
            const dotH = rowWidth * 0.5;
            ctx.save();
            ctx.fillStyle = `rgba(0,160,60,${rowAlpha * 0.8})`;
            ctx.beginPath();
            // Simple crop tuft
            ctx.ellipse(dotX, rowY - dotH * 0.3, rowWidth * 0.18, dotH * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      /* ══ BARN SILHOUETTE (right side) ══ */
      const barnX = W * 0.78 + (mx - 0.5) * -25;
      const barnY = H * 0.45 + (my - 0.5) * -8;
      const barnW = W * 0.1, barnH = H * 0.14;
      ctx.save();
      ctx.fillStyle = '#030d06';
      // Barn body
      ctx.fillRect(barnX - barnW / 2, barnY, barnW, barnH);
      // Barn roof (triangle)
      ctx.beginPath();
      ctx.moveTo(barnX - barnW / 2 - 8, barnY);
      ctx.lineTo(barnX + barnW / 2 + 8, barnY);
      ctx.lineTo(barnX, barnY - barnH * 0.45);
      ctx.closePath();
      ctx.fill();
      // Barn door (slightly lighter)
      ctx.fillStyle = '#051208';
      ctx.fillRect(barnX - barnW * 0.15, barnY + barnH * 0.45, barnW * 0.3, barnH * 0.55);
      ctx.restore();

      /* ══ WINDMILL SILHOUETTE (left side) ══ */
      const wmX = W * 0.2 + (mx - 0.5) * -18;
      const wmY = H * 0.5 + (my - 0.5) * -6;
      ctx.save();
      ctx.fillStyle = '#040f07';
      // Tower
      ctx.beginPath();
      ctx.moveTo(wmX - 6, wmY + H * 0.1);
      ctx.lineTo(wmX + 6, wmY + H * 0.1);
      ctx.lineTo(wmX + 3, wmY);
      ctx.lineTo(wmX - 3, wmY);
      ctx.closePath();
      ctx.fill();
      // Blades rotating slowly
      ctx.translate(wmX, wmY);
      ctx.rotate(t * 0.2);
      for (let b = 0; b < 4; b++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = '#051408';
        ctx.beginPath();
        ctx.ellipse(0, -22, 3, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      /* ══ SOLAR PANELS (mid-field) ══ */
      const panelShiftX = (mx - 0.5) * -22;
      [0.38, 0.5, 0.62].forEach((fx) => {
        const px2 = W * fx + panelShiftX;
        const py2 = H * 0.6;
        ctx.save();
        ctx.fillStyle = 'rgba(0,80,140,0.35)';
        ctx.strokeStyle = 'rgba(0,120,200,0.2)';
        ctx.lineWidth = 0.5;
        ctx.fillRect(px2 - 22, py2, 44, 12);
        ctx.strokeRect(px2 - 22, py2, 44, 12);
        // Panel grid lines
        ctx.beginPath();
        ctx.moveTo(px2, py2); ctx.lineTo(px2, py2 + 12);
        ctx.moveTo(px2 - 11, py2); ctx.lineTo(px2 - 11, py2 + 12);
        ctx.moveTo(px2 + 11, py2); ctx.lineTo(px2 + 11, py2 + 12);
        ctx.moveTo(px2 - 22, py2 + 6); ctx.lineTo(px2 + 22, py2 + 6);
        ctx.strokeStyle = 'rgba(0,120,200,0.15)';
        ctx.stroke();
        ctx.restore();
      });

      /* ══ SLOW DIM CARBON PARTICLES ══ */
      tokens.forEach((tk) => {
        tk.phase += tk.speed;
        tk.y -= tk.vy;
        tk.x = tk.baseX + Math.sin(tk.phase) * 2.5 + (mx - 0.5) * -10;
        if (tk.y < 5) {
          tk.y = rand(65, 105);
          tk.baseX = rand(10, 90);
        }
        const px = (tk.x / 100) * W;
        const py = (tk.y / 100) * H;

        // Very soft glow only — no bright core
        const g = ctx.createRadialGradient(px, py, 0, px, py, tk.size * 2.5);
        g.addColorStop(0,   `rgba(0,200,80,${tk.alpha})`);
        g.addColorStop(1,   'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, tk.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      /* ══ VORTEX (subtle, top-centre) ══ */
      const vx = W * 0.5 + (mx - 0.5) * -30;
      const vy2 = H * 0.18 + (my - 0.5) * -20;
      const vortexGrad = ctx.createRadialGradient(vx, vy2, 0, vx, vy2, 90);
      vortexGrad.addColorStop(0,   'rgba(0,200,80,0.07)');
      vortexGrad.addColorStop(1,   'transparent');
      ctx.fillStyle = vortexGrad;
      ctx.beginPath();
      ctx.arc(vx, vy2, 90, 0, Math.PI * 2);
      ctx.fill();
      // Swirl arc — very faint
      ctx.save();
      ctx.translate(vx, vy2);
      ctx.rotate(t * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 1.2);
      ctx.strokeStyle = 'rgba(0,200,80,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      t += 0.008;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#030806' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom fade for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(3,8,6,0.75) 0%, transparent 40%)',
        pointerEvents: 'none',
      }} />

      {/* ── Holographic banner ── */}
      <motion.div
        className="absolute top-[16%] left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <div style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,102,0.1) 30%, rgba(0,255,102,0.1) 70%, transparent 100%)',
          borderTop: '1px solid rgba(0,255,102,0.35)',
          borderBottom: '1px solid rgba(0,255,102,0.35)',
          padding: '8px 36px',
          backdropFilter: 'blur(6px)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 800,
            letterSpacing: '0.2em', color: '#00cc55',
            textShadow: '0 0 12px rgba(0,200,80,0.6)',
            textTransform: 'uppercase',
          }}>
            ⟁ THE FARMER'S ROLE: SEQUESTER &amp; EARN ⟁
          </span>
        </div>
      </motion.div>

      {/* ── Right stat cards ── */}
      <motion.div
        className="absolute top-1/4 right-8 hidden lg:flex flex-col gap-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.9 }}
      >
        {[
          { label: 'Farmers in India',   value: '146 Million',  color: '#00cc55', glow: 'rgba(0,200,80,0.25)' },
          { label: 'Avg Credit Earning', value: '₹4,500/acre', color: '#4ade80', glow: 'rgba(74,222,128,0.2)' },
          { label: 'Carbon Potential',   value: '400M tCO₂e',  color: '#67e8f9', glow: 'rgba(103,232,249,0.2)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.15 }}
            style={{
              background: 'rgba(0,8,4,0.85)',
              border: `1.5px solid ${stat.color}55`,
              borderRadius: '14px', padding: '12px 18px',
              backdropFilter: 'blur(18px)',
              boxShadow: `0 0 16px ${stat.glow}`,
              minWidth: '172px',
            }}
          >
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 4 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '1.15rem', fontWeight: 900, color: stat.color }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Bottom info banner ── */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.9 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,16,8,0.88))',
          border: '1.5px solid rgba(0,200,80,0.4)',
          borderRadius: '18px', padding: '16px 22px',
          backdropFilter: 'blur(22px)',
          boxShadow: '0 0 24px rgba(0,180,70,0.12)',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
        }}>
          <div className="animate-pulse flex-shrink-0" style={{
            width: 8, height: 8, borderRadius: '50%', marginTop: 5,
            background: '#00cc55', boxShadow: '0 0 8px #00cc55',
          }} />
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#00cc55', letterSpacing: '0.05em', marginBottom: 6 }}>
              🌾 Farmers as Carbon Stewards
            </p>
            <p style={{ fontSize: '0.76rem', color: '#d1fae5', lineHeight: 1.65 }}>
              Indian farmers can{' '}
              <span style={{ color: '#86efac', fontWeight: 700 }}>sequester carbon through soil health, agroforestry &amp; reduced tillage</span>,
              earning verified carbon credits sold on platforms like C0. A single farmer with 5 acres can generate{' '}
              <span style={{ color: '#4ade80', fontWeight: 700 }}>10–25 tCO₂e/year</span> — turning invisible gases into{' '}
              <span style={{ color: '#67e8f9', fontWeight: 700 }}>real income</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
