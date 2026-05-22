import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

export default function SustainableAgriculture() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleInteractionStart = () => setIsDragging(true);
  const handleInteractionEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchend', handleInteractionEnd);
    } else {
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    }
    return () => {
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging]);

  return (
    <section className="relative w-full min-h-screen py-24 flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] text-white">
      {/* Matte black background with soft ambient green glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#00ff66]/5 rounded-full blur-[200px] opacity-70" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Content (1/4 width) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col space-y-8 lg:col-span-1"
        >
          <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">Sustainable Agriculture</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-[#00b347]">The Focus Area</span>
          </h2>
          
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light">
            Our projects transform degraded landscapes into thriving ecosystems. Slide the handle to see the impact of sustainable land management.
          </p>

          <div className="pt-2">
            <button className="group relative px-6 py-4 bg-[#00FF66] hover:bg-[#00e65c] text-black font-black uppercase tracking-[0.15em] text-sm rounded-full transition-all flex items-center gap-2 overflow-hidden shadow-[0_0_30px_rgba(0,255,102,0.3)] hover:shadow-[0_0_50px_rgba(0,255,102,0.6)]">
              {/* Shine effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              <Sprout className="w-4 h-4 relative z-10" /> 
              <span className="relative z-10">Offset Carbon</span>
            </button>
          </div>
        </motion.div>

        {/* Right Side: Comparison Card (3/4 width) */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative group perspective-1000 lg:col-span-3"
        >
          <div 
            ref={containerRef}
            className="relative h-[50vh] md:h-[65vh] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-[#111] cursor-ew-resize select-none touch-none border border-white/5 shadow-[0_30px_100px_-20px_rgba(0,0,0,1),0_0_60px_-20px_rgba(0,255,102,0.15)] transition-transform duration-700 ease-out hover:scale-[1.02]"
            onMouseDown={handleInteractionStart}
            onMouseMove={handleMouseMove}
            onTouchStart={handleInteractionStart}
            onTouchMove={handleTouchMove}
          >
             {/* "After" Image (Background - Vibrant HD sunlit dense forest) */}
             <div className="absolute inset-0 w-full h-full overflow-hidden">
               <div 
                 className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center transition-transform duration-[10s] ease-out group-hover:scale-105"
                 style={{ backgroundImage: `url('/after_forest.jpg')` }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
             </div>
             
             {/* "Before" Image (Foreground - B&W barren agricultural land) */}
             <div 
               className="absolute inset-0 w-full h-full overflow-hidden"
               style={{ 
                 clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
               }}
             >
                <div 
                  className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center grayscale contrast-125 transition-transform duration-[10s] ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2100&auto=format&fit=crop')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 mix-blend-overlay" />
             </div>
             
             {/* Slider Handle & Glowing Neon Divider Line */}
             <div 
               className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#00FF66] to-transparent shadow-[0_0_20px_#00FF66] z-10 transition-transform duration-75 ease-out"
               style={{ left: `calc(${sliderPosition}% - 1px)` }}
             >
               {/* Circular Glassmorphism Handle */}
               <motion.div 
                 animate={{ scale: isDragging ? 0.9 : 1 }}
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center cursor-ew-resize backdrop-blur-xl bg-black/40 border border-[#00FF66]/50 shadow-[0_0_25px_rgba(0,255,102,0.4),inset_0_0_15px_rgba(0,255,102,0.2)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(0,255,102,0.6),inset_0_0_20px_rgba(0,255,102,0.3)]"
               >
                 <div className="flex gap-1 opacity-80">
                   <div className="w-1 h-4 bg-[#00FF66] rounded-full shadow-[0_0_5px_#00FF66]"></div>
                   <div className="w-1 h-4 bg-[#00FF66] rounded-full shadow-[0_0_5px_#00FF66]"></div>
                 </div>
               </motion.div>
             </div>

             {/* Bottom Left Label */}
             <div className="absolute bottom-6 left-6 pointer-events-none">
               <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-2xl">
                 <span className="text-[10px] md:text-xs font-semibold tracking-widest text-zinc-300 uppercase">
                   BEFORE: Degraded (2018)
                 </span>
               </div>
             </div>
             
             {/* Bottom Right Label */}
             <div className="absolute bottom-6 right-6 pointer-events-none">
               <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-[#00FF66]/20 shadow-[0_10px_30px_rgba(0,255,102,0.1)]">
                 <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#00FF66] uppercase">
                   AFTER: Reforested (2024)
                 </span>
               </div>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
