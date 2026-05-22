import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CarbonDashboard() {
  const [landSize, setLandSize] = useState(500);
  const [projectType, setProjectType] = useState('Reforestation');

  // Estimate formulas (simplified)
  const multipliers: Record<string, number> = {
    'Agroforestry': 4.5,
    'Regenerative Agriculture': 2.8,
    'Reforestation': 9.0
  };
  const pricePerTon = 15; // Average price
  
  const estimatedCredits = Math.floor(landSize * multipliers[projectType]);
  const revenuePotential = estimatedCredits * pricePerTon;

  return (
    <section id="dashboard" className="py-24 bg-white/[0.02] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Your Carbon Portal</h2>
          <div className="w-full bg-white/10 rounded-full h-2 mt-8 mb-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "65%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-accent to-primary h-full relative"
            >
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-sm"></div>
            </motion.div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current Emissions</span>
            <span className="text-primary font-bold">65% Carbon Neutral</span>
          </div>
        </div>

        {/* Credit Generation Estimator - Full Width */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Generation Estimator</h3>
            <p className="text-sm text-gray-400 mb-8">Calculate your land's credit potential dynamically.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm text-gray-400 block">Land Size</label>
                  <span className="text-primary font-mono font-bold">{landSize} ha</span>
                </div>
                <input 
                  type="range" 
                  className="w-full accent-primary" 
                  min="10" 
                  max="5000" 
                  value={landSize}
                  onChange={(e) => setLandSize(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10ha</span>
                  <span>5000ha</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Project Type</label>
                <select 
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary [&>option]:bg-background"
                >
                  <option>Agroforestry</option>
                  <option>Regenerative Agriculture</option>
                  <option>Reforestation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0F1A]/50 rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row justify-around items-center gap-6">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Estimated Credits / Yr</div>
              <motion.div 
                key={estimatedCredits}
                initial={{ scale: 1.1, color: '#ffffff' }}
                animate={{ scale: 1, color: '#00FFB2' }}
                className="text-3xl font-black text-primary"
              >
                {estimatedCredits.toLocaleString()}<span className="text-sm font-normal">t</span>
              </motion.div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Revenue Potential</div>
              <motion.div 
                key={revenuePotential}
                initial={{ scale: 1.1, color: '#ffffff' }}
                animate={{ scale: 1, color: '#00CFFF' }}
                className="text-3xl font-black text-accent"
              >
                ${revenuePotential.toLocaleString()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
