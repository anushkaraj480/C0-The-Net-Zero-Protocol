import { useState, useEffect, useRef } from 'react';

const stepsData = [
  {
    title: "Land Submission",
    body: "Landowners submit degraded parcels. Assessed via satellite imagery.",
    tooltipLabel: "STEP 01",
    tooltipSummary: "Owner submits land for assessment",
    x: 70,
    y: 19.231,
    textPos: 'bottom'
  },
  {
    title: "Sensor Deployment",
    body: "IoT sensors installed across the parcel, transmitting live data 24/7.",
    tooltipLabel: "STEP 02",
    tooltipSummary: "Soil, air & biomass sensors go live",
    x: 35,
    y: 19.231,
    textPos: 'top'
  },
  {
    title: "Verra Verification",
    body: "Independent verification against Verra VCS standard.",
    tooltipLabel: "STEP 03",
    tooltipSummary: "Third-party audit & certification",
    x: 35,
    y: 80.769,
    textPos: 'bottom'
  },
  {
    title: "Credits Issued",
    body: "Verified credits listed on marketplace with full GPS traceability.",
    tooltipLabel: "STEP 04",
    tooltipSummary: "Credits live on the C0 marketplace",
    x: 70,
    y: 80.769,
    textPos: 'top'
  }
];

export default function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [pathLength, setPathLength] = useState(1203);
  const pathRef = useRef<SVGPathElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [isMobile]);

  // Calculate stroke dash offset for highlight path based on hovered step
  const getDashOffset = () => {
    if (hoveredStep === null) return pathLength; // fully hidden
    if (hoveredStep === 0) return pathLength; // At Step 1 (start)
    if (hoveredStep === 1) return pathLength * 0.709; // To Step 2
    if (hoveredStep === 2) return pathLength * 0.291; // To Step 3
    if (hoveredStep === 3) return 0; // 100%
    return pathLength;
  };

  return (
    <section id="how-it-works" className="w-full pt-[64px] pb-[72px] px-6 max-w-7xl mx-auto font-sans text-left">
      <div className="mb-[56px] max-w-3xl mx-auto text-center md:text-left">
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2D6A4F', fontWeight: 500, marginBottom: '10px' }}>
          HOW IT WORKS
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0a1a12', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          From degraded land to verified carbon credit.
        </h2>
        <p style={{ fontSize: '15px', color: '#555555', lineHeight: 1.6 }}>
          Every credit on C0 is earned through a rigorous 4-step process — not estimated, not assumed. Measured.
        </p>
      </div>

      {isMobile ? (
        // Mobile fallback: Vertical straight line
        <div className="flex flex-col relative max-w-[400px] mx-auto">
          {stepsData.map((step, index) => {
            const isHovered = hoveredStep === index;
            const isCompleted = hoveredStep !== null && index < hoveredStep;
            const isFuture = hoveredStep !== null && index > hoveredStep;

            return (
              <div 
                key={index} 
                className="flex gap-6 relative"
                style={{ paddingBottom: index === stepsData.length - 1 ? '0' : '40px' }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Connector Line */}
                {index < stepsData.length - 1 && (
                  <div 
                    className="absolute left-[26px] top-[52px] bottom-0 transition-colors duration-300"
                    style={{
                      width: '2px',
                      background: (hoveredStep !== null && index < hoveredStep) ? '#52B788' : '#2D6A4F',
                    }}
                  />
                )}
                
                {/* Number Circle */}
                <div 
                  className="shrink-0 flex items-center justify-center transition-all duration-250 ease-in-out z-10"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isHovered ? '#52B788' : isCompleted ? '#1B4332' : '#ffffff',
                    border: isHovered ? '2px solid #52B788' : isCompleted ? '2px solid #1B4332' : isFuture ? '2px solid rgba(45,106,79,0.3)' : '2px solid #2D6A4F',
                    color: isHovered ? '#00063d' : isCompleted ? '#52B788' : isFuture ? 'rgba(0,0,0,0.3)' : '#2D6A4F',
                    fontSize: '16px',
                    fontWeight: 700,
                    transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  {index + 1}
                </div>

                {/* Step Content */}
                <div className="pb-2 pt-2">
                  <h3 
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0a1a12',
                      marginBottom: '4px',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#555555',
                    lineHeight: 1.6,
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Desktop C-Curve Layout
        <div className="relative w-full h-[520px] max-w-[1000px] mx-auto mt-8">
          {/* SVG Connecting Path */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 1000 520" 
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            {/* Base Path */}
            <path
              d="M 700 100 L 350 100 A 160 160 0 0 0 350 420 L 700 420"
              stroke="#2D6A4F"
              strokeWidth="2"
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              style={{ animation: 'drawPath 1.2s ease-in-out forwards' }}
            />
            {/* Highlight Path */}
            <path
              ref={pathRef}
              d="M 700 100 L 350 100 A 160 160 0 0 0 350 420 L 700 420"
              stroke="#52B788"
              strokeWidth="3"
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={getDashOffset()}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>

          {/* Keyframes for the initial base path drawing */}
          <style>{`
            @keyframes drawPath {
              to { stroke-dashoffset: 0; }
            }
          `}</style>

          {/* Step Nodes */}
          {stepsData.map((step, index) => {
            const isHovered = hoveredStep === index;
            const isCompleted = hoveredStep !== null && index < hoveredStep;
            const isFuture = hoveredStep !== null && index > hoveredStep;

            return (
              <div 
                key={index}
                className="absolute"
                style={{ 
                  left: `${step.x}%`, 
                  top: `${step.y}%`, 
                  zIndex: 1
                }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Tooltip */}
                <div 
                  className="absolute bg-white transition-all duration-200 ease-in-out pointer-events-none"
                  style={{
                    ...(step.textPos === 'top' ? { top: '38px' } : { bottom: '38px' }),
                    left: '0',
                    border: '0.5px solid #e0ddd5',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    width: '200px',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered 
                      ? 'translate(-50%, 0)' 
                      : `translate(-50%, ${step.textPos === 'top' ? '-4px' : '4px'})`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    zIndex: 10
                  }}
                >
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#2D6A4F', fontWeight: 600, marginBottom: '2px' }}>
                    {step.tooltipLabel}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0a1a12', lineHeight: 1.4 }}>
                    {step.tooltipSummary}
                  </div>
                  {/* Tooltip arrow */}
                  <div 
                    className="absolute w-3 h-3 bg-white"
                    style={{
                      ...(step.textPos === 'top' 
                        ? { top: '-6.5px', borderTop: '0.5px solid #e0ddd5', borderLeft: '0.5px solid #e0ddd5' } 
                        : { bottom: '-6.5px', borderBottom: '0.5px solid #e0ddd5', borderRight: '0.5px solid #e0ddd5' }),
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)'
                    }}
                  />
                </div>

                {/* Circle */}
                <div 
                  className="absolute flex items-center justify-center transition-all duration-250 ease-in-out cursor-pointer"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isHovered ? '#52B788' : isCompleted ? '#1B4332' : '#ffffff',
                    border: isHovered ? '2px solid #52B788' : isCompleted ? '2px solid #1B4332' : isFuture ? '2px solid rgba(45,106,79,0.3)' : '2px solid #2D6A4F',
                    color: isHovered ? '#00063d' : isCompleted ? '#52B788' : isFuture ? 'rgba(0,0,0,0.3)' : '#2D6A4F',
                    fontSize: '16px',
                    fontWeight: 700,
                    transform: isHovered ? 'translate(-50%, -50%) scale(1.15)' : 'translate(-50%, -50%) scale(1)',
                  }}
                >
                  {index + 1}
                </div>

                {/* Text Container */}
                <div 
                  className="absolute"
                  style={
                    step.textPos === 'bottom' ? {
                      top: '38px',
                      left: '0',
                      transform: 'translateX(-50%)',
                      width: '200px',
                      textAlign: 'center'
                    } : { // top
                      bottom: '38px',
                      left: '0',
                      transform: 'translateX(-50%)',
                      width: '200px',
                      textAlign: 'center'
                    }
                  }
                >
                  <h3 
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0a1a12',
                      marginBottom: '4px'
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#555555',
                    lineHeight: 1.6,
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
