import { CheckCircle2, Activity, FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MRVStatus() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-16 text-center">Transparent Verification</h2>
      
      {/* Horizontal Timeline with IoT Data Flow Animation */}
      <div className="relative max-w-4xl mx-auto mb-20">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-3/4 h-1 bg-primary/30 -translate-y-1/2 rounded-full"></div>
        
        {/* Animated Data Particles */}
        <div className="absolute top-1/2 left-0 w-3/4 h-1 -translate-y-1/2 overflow-hidden rounded-full pointer-events-none">
          <motion.div 
            animate={{ x: ["-100%", "400%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-1/4 h-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_#00FFB2]"
          />
        </div>
        
        <div className="relative flex justify-between">
          {['Submitted', 'Verified', 'Issued', 'Sold'].map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 relative z-10 ${i < 3 ? 'bg-primary text-[#0B0F1A] shadow-[0_0_15px_rgba(0,255,178,0.6)]' : 'bg-[#1a2133] border-2 border-white/20 text-gray-500'}`}>
                {i < 3 && (
                   <motion.div
                     animate={{ scale: [1, 1.2, 1] }}
                     transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                     className="absolute inset-0 rounded-full bg-primary/40 -z-10"
                   />
                )}
                {i < 3 ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{i+1}</span>}
              </div>
              <span className={`text-sm font-semibold ${i < 3 ? 'text-white' : 'text-gray-500'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MRV Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="glass-panel p-4 flex items-center gap-4 group cursor-pointer border-l-2 border-l-primary hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">Monitoring <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div></div>
            <div className="text-xs text-gray-400">IoT sensors active</div>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 group cursor-pointer border-l-2 border-l-primary hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">Reporting <div className="w-2 h-2 rounded-full bg-primary"></div></div>
            <div className="text-xs text-gray-400">Q2 Data logged</div>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 group cursor-pointer border-l-2 border-l-yellow-400 hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">Verification <div className="w-2 h-2 rounded-full bg-yellow-400"></div></div>
            <div className="text-xs text-gray-400">In progress (Verra)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
