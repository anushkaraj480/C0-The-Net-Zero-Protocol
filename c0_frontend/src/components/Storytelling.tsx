import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function Storytelling() {
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
    <section className="relative py-32 border-t border-white/5 overflow-hidden">
      {/* Background visual element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1b5e20]/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">From Degraded Land to Thriving Ecosystem</h2>
          <p className="text-lg text-gray-400 mb-8">
            "Transitioning to regenerative agriculture didn't just capture carbon; it brought our soil back to life and increased our yield by 20%."
          </p>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              <span className="font-bold">MT</span>
            </div>
            <div>
              <div className="font-bold">Maria Torres</div>
              <div className="text-sm text-primary">Farm Owner, Colombia</div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-white font-medium group">
            <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center group-hover:scale-110 transition-transform group-hover:text-primary">
              <Play className="w-4 h-4 fill-current" />
            </div>
            Watch Full Story
          </button>
        </div>
        
        <div className="flex-1 w-full">
          {/* Interactive Before/After Slider */}
          <div className="glass-panel p-2 rounded-2xl relative overflow-hidden group">
            <div 
              ref={containerRef}
              className="relative h-80 rounded-xl overflow-hidden bg-gray-900 cursor-ew-resize select-none touch-none"
              onMouseDown={handleInteractionStart}
              onMouseMove={handleMouseMove}
              onTouchStart={handleInteractionStart}
              onTouchMove={handleTouchMove}
            >
               {/* "After" Image (Background) */}
               <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1598268121084-c8f7126e0cef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
               
               {/* "Before" Image (Foreground/Clipped) */}
               <div 
                 className="absolute inset-0 h-full bg-[url('https://images.unsplash.com/photo-1621323383803-c40d12e84179?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center border-r-2 border-white shadow-[2px_0_15px_rgba(0,0,0,0.5)]"
                 style={{ width: `${sliderPosition}%` }}
               ></div>
               
               {/* Slider Handle */}
               <div 
                 className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
                 style={{ left: `calc(${sliderPosition}% - 16px)` }}
               >
                 <div className="w-1 h-4 bg-gray-400 rounded-full mx-[1px]"></div>
                 <div className="w-1 h-4 bg-gray-400 rounded-full mx-[1px]"></div>
               </div>

               <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-semibold pointer-events-none">Before</div>
               <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-semibold pointer-events-none">After 3 Years</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
