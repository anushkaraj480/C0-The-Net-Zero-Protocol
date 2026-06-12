import { useState, useRef, useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';

export default function Storytelling() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showStory, setShowStory] = useState(false);
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

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStory(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      {/* Story Modal */}
      {showStory && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(10,26,18,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowStory(false)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl p-8"
            style={{
              background: '#f5f3ee',
              border: '1px solid rgba(45,106,79,0.2)',
              boxShadow: '0 24px 64px rgba(20,39,1,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowStory(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#142701]/10"
              style={{ color: '#142701' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1B4332' }}>
                <span className="font-bold text-sm" style={{ color: '#52B788' }}>HS</span>
              </div>
              <div>
                <div className="font-bold" style={{ color: '#0a1a12' }}>Harpreet Singh</div>
                <div className="text-xs font-semibold" style={{ color: '#2D6A4F' }}>Farm Owner, Punjab, India</div>
              </div>
            </div>

            {/* Story tag */}
            <div
              className="text-xs uppercase font-semibold tracking-widest mb-3"
              style={{ color: '#2D6A4F', letterSpacing: '0.08em' }}
            >
              His Journey
            </div>

            {/* Story text */}
            <h3 className="text-xl font-bold mb-4" style={{ color: '#0a1a12', lineHeight: 1.3 }}>
              From Depleted Soil to Regenerated Land
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#444', lineHeight: 1.75 }}>
              Harpreet Singh inherited five acres of overworked farmland in Punjab's Ludhiana district — soil exhausted by decades of chemical-heavy wheat cycles. In 2022, he enrolled on C0 and deployed IoT soil sensors across his farm. The real-time data revealed carbon levels 60% below regional benchmarks. Following C0's regenerative guidance — cover cropping, reduced tillage, and compost integration — Harpreet began restoring organic matter. By 2024, verified carbon sequestration earned him his first 340 credits on the marketplace. Today his yield is up 18%, soil health is recovering, and his land has become a model for neighbouring farmers in Punjab.
            </p>

            {/* Footer stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-5" style={{ borderTop: '1px solid rgba(45,106,79,0.15)' }}>
              {[
                { label: 'Credits Earned', value: '340' },
                { label: 'Yield Increase', value: '+18%' },
                { label: 'Since', value: '2022' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-black" style={{ color: '#1B4332' }}>{stat.value}</div>
                  <div className="text-xs font-medium" style={{ color: '#555' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="relative py-32 border-t border-[#142701]/10 overflow-hidden text-[#142701]">
        {/* Background visual element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#52B788]/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-[#142701]">From Degraded Land to Thriving Ecosystem</h2>
            <p className="text-lg font-medium text-[#142701]/85 mb-8">
              "Transitioning to regenerative agriculture didn't just capture carbon; it brought our soil back to life and increased our yield by 20%."
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#1B4332] flex items-center justify-center overflow-hidden border border-[#142701]/25">
                <span className="font-bold text-[#52B788]">HS</span>
              </div>
              <div>
                <div className="font-bold text-[#142701]">Harpreet Singh</div>
                <div className="text-sm font-semibold text-[#52B788] filter brightness-75">Farm Owner, Punjab, India</div>
              </div>
            </div>
            <button
              onClick={() => setShowStory(true)}
              className="flex items-center gap-3 text-[#142701] font-bold group transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-[#142701] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              Read Story
            </button>
          </div>
          
          <div className="flex-1 w-full">
            {/* Interactive Before/After Slider */}
            <div className="sage-glass-panel p-2 rounded-2xl relative overflow-hidden group">
              <div 
                ref={containerRef}
                className="relative h-80 rounded-xl overflow-hidden bg-[#142701] cursor-ew-resize select-none touch-none"
                onMouseDown={handleInteractionStart}
                onMouseMove={handleMouseMove}
                onTouchStart={handleInteractionStart}
                onTouchMove={handleTouchMove}
              >
                 {/* "After" Image (Background) */}
                 <div className="absolute inset-0 w-full h-full bg-[url('/planted_trees.png')] bg-cover bg-center"></div>
                 
                 {/* "Before" Image (Foreground/Clipped) */}
                 <div 
                   className="absolute inset-0 h-full bg-[url('/barren_land.png')] bg-cover bg-center border-r-2 border-[#52B788] shadow-[2px_0_15px_rgba(20,39,1,0.3)]"
                   style={{ width: `${sliderPosition}%` }}
                 ></div>
                 
                 {/* Slider Handle */}
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 border-2 border-[#142701]"
                   style={{ left: `calc(${sliderPosition}% - 16px)` }}
                 >
                   <div className="w-1 h-4 bg-[#142701]/60 rounded-full mx-[1px]"></div>
                   <div className="w-1 h-4 bg-[#142701]/60 rounded-full mx-[1px]"></div>
                 </div>

                 <div className="absolute bottom-4 left-4 bg-[#142701]/85 backdrop-blur px-3 py-1 rounded text-xs font-semibold pointer-events-none text-white">Before</div>
                 <div className="absolute bottom-4 right-4 bg-[#142701]/85 backdrop-blur px-3 py-1 rounded text-xs font-semibold pointer-events-none text-white">After 3 Years</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
