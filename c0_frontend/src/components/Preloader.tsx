import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function Preloader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      // Small delay to ensure minimum visible loading time
      setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => setIsHidden(true), 800);
      }, 2000);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      const timeoutId = setTimeout(handleLoad, 4000);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0F1A]/90 backdrop-blur-sm transition-opacity duration-[800ms] ease-in-out ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Background track ring */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-white/5"></div>

        {/* Spinning glowing ring */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-primary border-r-primary/30 animate-spin glow-shadow"></div>

        {/* Inner logo container */}
        <div className="relative w-28 h-28 bg-[#0B0F1A]/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10 border border-white/10 shadow-lg">
          <Globe className="w-12 h-12 text-primary" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="mt-8 text-2xl font-bold tracking-widest text-primary/90 uppercase animate-pulse">
        C0: Carbon Intelligence Platform
      </h1>
      <p className="mt-2 text-sm text-gray-400 tracking-wider">
        Loading Platform...
      </p>
    </div>
  );
}



