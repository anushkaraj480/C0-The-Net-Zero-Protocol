import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Earth3D from './Earth3D';
import { dashboardAPI } from '../api/client';
import type { DashboardStats } from '../api/client';


export default function Hero() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(setStats)
      .catch(() => {
        // Fallback stats if API is unreachable
        setStats({
          total_sequestered_tco2e: 2400000,
          total_hectares: 12000,
          active_listings: 0,
          total_credits_available: 0,
          total_transactions: 0,
          active_projects: 0,
          active_sensors: 0,
        });
      });
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `+${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}+`;
    return num.toLocaleString();
  };

  return (
    <motion.section 
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="relative h-screen flex flex-col justify-center items-center text-center px-4 pt-20"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <Earth3D />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            Track. <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Restore.</span> Act.
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Transforming degraded landscapes into verifiable carbon credits. 
            The intelligent way to reach net-zero.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          <div className="glass-panel px-6 py-4 flex flex-col items-center">
            <motion.span 
              key={stats?.total_sequestered_tco2e}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-primary text-3xl font-bold"
            >
              {stats ? formatNumber(stats.total_sequestered_tco2e) : '+2.4M'}
            </motion.span>
            <span className="text-sm text-gray-400 uppercase tracking-wider">Tons CO₂ Sequestered</span>
          </div>
          <div className="glass-panel px-6 py-4 flex flex-col items-center">
            <motion.span 
              key={stats?.total_hectares}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-accent text-3xl font-bold"
            >
              {stats ? formatNumber(stats.total_hectares) : '12,000+'}
            </motion.span>
            <span className="text-sm text-gray-400 uppercase tracking-wider">Hectares Restored</span>
          </div>
          {stats && stats.active_listings > 0 && (
            <div className="glass-panel px-6 py-4 flex flex-col items-center">
              <span className="text-yellow-400 text-3xl font-bold">{stats.active_listings}</span>
              <span className="text-sm text-gray-400 uppercase tracking-wider">Active Projects</span>
            </div>
          )}
        </motion.div>



      </div>

      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
        onClick={() => document.getElementById('what-is-c0')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <ChevronDown className="w-8 h-8 text-primary/50" />
      </div>
    </motion.section>
  );
}
