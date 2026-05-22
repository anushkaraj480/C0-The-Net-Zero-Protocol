import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Leaf, 
  ShieldCheck, 
  LineChart,
  Cpu,
  Activity,
  Zap,
  Users,
  Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CinematicEarth from '../components/CinematicEarth';
import LogoAssemblyScene from '../components/LogoAssemblyScene';
import CarbonCycleScene from '../components/CarbonCycleScene';
import AIPredictiveScene from '../components/AIPredictiveScene';
import BlockchainScene from '../components/BlockchainScene';
import CarbonCreditScene from '../components/CarbonCreditScene';
import FarmerCarbonScene from '../components/FarmerCarbonScene';
import CommunityHubScene from '../components/CommunityHubScene';
import HardwareNodeScene from '../components/HardwareNodeScene';

const TOUR_STEPS = [
  {
    title: "What is a Carbon Credit?",
    subtitle: "Stage 01: Focus Area — India's Carbon Market",
    description: "One carbon credit = 1 tonne of CO₂ avoided or removed. India's Carbon Credit Trading Scheme (CCTS), launched in 2023 under BEE, lets companies earn credits for going green and sell them to heavy emitters — creating a ₹6,000 Cr+ market racing toward ₹1,00,000 Cr by 2030.",
    icon: Globe,
    color: "primary"
  },
  {
    title: "The Farmer's Role in Carbon Markets",
    subtitle: "Stage 02: Focus Area — Sequester & Earn",
    description: "India's 146 million farmers are the backbone of carbon capture. Through agroforestry, soil restoration, and reduced tillage, farmers sequester CO₂ and earn verified carbon credits — turning invisible gases into real income of ₹4,500+ per acre per year.",
    icon: Leaf,
    color: "emerald"
  },
  {
    title: "What we do? Connect with land owners and farmers",
    subtitle: "Stage 03: Collaborative Sequestration",
    description: "We bridge the gap between local farmers and landowners, forming a united front. By providing the tools and platform to sequester carbon, we empower communities to generate verified credits and sustainable income together.",
    icon: Users,
    color: "cyan"
  },
  {
    title: "Survey, Analysis & Hardware Deployment",
    subtitle: "Stage 04: Precision Telemetry",
    description: "Survey and analysis of land type of vegetations and the deploy of hardware nodes like NO2, CO2, CH4, moisture and humidity sensors. A satellite view will also be given.",
    icon: Network,
    color: "blue"
  },
  {
    title: "🤖 AI Sees the Future — Predicting Your Carbon Path",
    subtitle: "Stage 05: Smart Forecasting",
    description: "Leverage advanced neural networks to forecast future emissions across your supply chain, preventing carbon liabilities before they occur.",
    icon: Cpu,
    color: "amber"
  }
];

const TypewriterText = ({ text }: { text: string }) => {
  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.02,
      },
    },
  };
  const letter = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  };

  return (
    <motion.p
      variants={sentence}
      initial="hidden"
      animate="visible"
      className="text-gray-200 text-base md:text-lg max-w-xl leading-relaxed mx-auto mt-6"
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={letter}>
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      sessionStorage.setItem('c0_onboarding_completed', 'true');
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getStepColorClass = () => {
    switch (currentStep) {
      case 0: return 'text-primary border-primary bg-primary/10';
      case 1: return 'text-emerald-400 border-emerald-400 bg-emerald-500/10';
      case 2: return 'text-cyan-400 border-cyan-400 bg-cyan-500/10';
      case 3: return 'text-violet-400 border-violet-400 bg-violet-500/10';
      case 4: return 'text-amber-400 border-amber-400 bg-amber-500/10';
      case 5: return 'text-rose-400 border-rose-400 bg-rose-500/10';
      case 6: return 'text-primary border-primary bg-primary/10';
      default: return 'text-primary border-primary bg-primary/10';
    }
  };
  
  const getGradientClass = () => {
    switch (currentStep) {
      case 0: return 'from-primary to-secondary';
      case 1: return 'from-emerald-400 to-teal-400';
      case 2: return 'from-cyan-400 to-blue-400';
      case 3: return 'from-blue-500 to-indigo-500';
      case 4: return 'from-amber-400 to-orange-500';
      default: return 'from-primary to-secondary';
    }
  };

  const currentData = TOUR_STEPS[currentStep];
  const Icon = currentData.icon;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      
      {/* 3D Background */}
      {currentStep === 0 && <CarbonCreditScene />}
      {currentStep === 1 && <FarmerCarbonScene />}
      {currentStep === 2 && <CommunityHubScene />}
      {currentStep === 3 && <HardwareNodeScene />}
      {currentStep === 4 && <AIPredictiveScene />}

      {/* Retro-Futuristic Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center w-full max-w-6xl mx-auto backdrop-blur-sm p-4 rounded-2xl bg-black/20 border border-white/5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Globe className="w-5 h-5 text-background" />
          </div>
          <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">C0 Net-Zero</span>
        </div>
        <button 
          onClick={() => {
            sessionStorage.setItem('c0_onboarding_completed', 'true');
            navigate('/');
          }} 
          className="text-gray-400 hover:text-white transition-colors text-xs font-bold tracking-wider uppercase bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
        >
          Skip Tour
        </button>
      </header>

      {/* Main Interactive Guide */}
      <main className="flex-1 flex items-center justify-center relative z-10 my-12 pointer-events-none">
        <div className="w-full max-w-3xl flex flex-col items-center pointer-events-auto">
          
          {/* Step Indicators */}
          <div className="flex gap-3 mb-12">
            {TOUR_STEPS.map((_, stepIndex) => (
              <div 
                key={stepIndex} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  stepIndex === currentStep 
                    ? `w-16 bg-gradient-to-r ${getGradientClass()}` 
                    : stepIndex < currentStep 
                      ? 'w-4 bg-white/40' 
                      : 'w-4 bg-white/10'
                }`} 
              />
            ))}
          </div>

          <div className="w-full relative p-8 md:p-12">

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-8 relative z-10"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl ${getStepColorClass()}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-3">
                    <span className={`text-[11px] uppercase tracking-widest font-mono font-bold px-4 py-1.5 rounded-full border transition-colors duration-500 ${getStepColorClass()}`}>
                      {currentData.subtitle}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mt-4">
                      {(currentStep <= 3) ? (
                        <span className="text-white">{currentData.title}</span>
                      ) : (
                        <>
                          {currentData.title.split(' ')[0]} <br />
                          <span className={`bg-clip-text text-transparent bg-gradient-to-r transition-colors duration-500 ${getGradientClass()}`}>
                            {currentData.title.split(' ').slice(1).join(' ')}
                          </span>
                        </>
                      )}
                    </h2>
                    <TypewriterText text={currentData.description} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controller Buttons */}
            <div className="flex gap-4 pt-12 relative z-10">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="p-4 md:px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-300 group-hover:text-white" />
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex-1 py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/10 text-white`}
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Enter Protocol Dashboard" : "Continue"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-6 pb-2">
        <p>© 2026 C0 Net-Zero Protocol. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
