import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CarbonCreditScene() {
  const particleRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track cursor for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;  // -1 to 1
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating green particles
  useEffect(() => {
    const container = particleRef.current;
    if (!container) return;
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1.5;
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(0, 255, 102, ${Math.random() * 0.5 + 0.15});
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatP ${Math.random() * 9 + 6}s ease-in-out infinite;
        animation-delay: ${Math.random() * -12}s;
        box-shadow: 0 0 ${size * 4}px rgba(0, 255, 102, 0.45);
      `;
      container.appendChild(p);
      particles.push(p);
    }
    return () => particles.forEach(p => p.remove());
  }, []);

  // Parallax shift amounts
  const shiftX = mousePos.x * 28;   // max ±28px
  const shiftY = mousePos.y * 20;   // max ±20px

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#050805' }}>
      <style>{`
        @keyframes floatP {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.25; }
          33%  { transform: translateY(-28px) translateX(8px); opacity: 0.85; }
          66%  { transform: translateY(-14px) translateX(-12px); opacity: 0.5; }
        }
        @keyframes statGlow {
          0%, 100% { box-shadow: 0 0 12px 1px var(--glow); }
          50%       { box-shadow: 0 0 24px 4px var(--glow); }
        }
      `}</style>

      {/* ── Sphere image — cursor-driven parallax ── */}
      <motion.div
        animate={{
          x: shiftX,
          y: shiftY,
        }}
        transition={{ type: 'spring', stiffness: 60, damping: 20, mass: 1 }}
        style={{
          position: 'absolute',
          inset: '-8%',          // slightly oversize so edges don't show on shift
          backgroundImage: `url('/carbon_credit_sphere.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.62) saturate(1.1)',
          willChange: 'transform',
        }}
      />

      {/* Dark overlay — keeps bg dark while sphere is still visible */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(3,8,4,0.52)',
        pointerEvents: 'none',
      }} />

      {/* Subtle radial vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom fade for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(5,8,5,0.72) 0%, transparent 38%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

      {/* ── Stat cards (right side) ── */}
      <motion.div
        className="absolute top-1/4 right-8 hidden lg:flex flex-col gap-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
      >
        {[
          { label: 'India Market Value', value: '₹6,000 Cr+',   color: '#00ff66', glow: 'rgba(0,255,102,0.35)' },
          { label: '2030 Target',        value: '₹1,00,000 Cr', color: '#00e5ff', glow: 'rgba(0,229,255,0.28)' },
          { label: 'Credits Traded',     value: '5.6M tCO₂e',   color: '#c084fc', glow: 'rgba(192,132,252,0.28)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.15, duration: 0.7 }}
            style={{
              '--glow': stat.glow,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.82), rgba(5,15,8,0.75))',
              border: `1.5px solid ${stat.color}`,
              borderRadius: '14px',
              padding: '12px 18px',
              backdropFilter: 'blur(18px)',
              boxShadow: `0 0 18px ${stat.glow}`,
              minWidth: '172px',
              animation: 'statGlow 3s ease-in-out infinite',
              animationDelay: `${i * 0.9}s`,
            } as React.CSSProperties}
          >
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 900, color: stat.color, textShadow: `0 0 12px ${stat.color}` }}>
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
        transition={{ delay: 1.0, duration: 0.9 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,18,8,0.85) 100%)',
          border: '1.5px solid rgba(0,255,102,0.55)',
          borderRadius: '18px',
          padding: '16px 22px',
          backdropFilter: 'blur(22px)',
          boxShadow: '0 0 28px rgba(0,255,102,0.18), inset 0 0 16px rgba(0,255,102,0.04)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}>
          <div style={{
            width: 9, height: 9, borderRadius: '50%',
            background: '#00ff66',
            boxShadow: '0 0 10px #00ff66, 0 0 20px #00ff66',
            marginTop: 5,
            flexShrink: 0,
          }} className="animate-pulse" />
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#00ff66', letterSpacing: '0.05em', marginBottom: 6, textShadow: '0 0 10px #00ff66' }}>
              India's Carbon Credit Trading Scheme (CCTS)
            </p>
            <p style={{ fontSize: '0.76rem', color: '#e5e7eb', lineHeight: 1.65 }}>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>1 Carbon Credit = 1 tonne of CO₂ avoided or removed.</span>{' '}
              Launched in 2023 under the Bureau of Energy Efficiency (BEE), CCTS lets companies{' '}
              <span style={{ color: '#86efac', fontWeight: 600 }}>earn credits for going green</span>{' '}
              and sell them to high emitters — driving a market set to hit{' '}
              <span style={{ color: '#00e5ff', fontWeight: 700 }}>₹1,00,000 Cr by 2030</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
