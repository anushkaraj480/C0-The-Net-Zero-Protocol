import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Leaf, 
  TreePine, 
  Sparkles, 
  User, 
  Building2, 
  Cpu, 
  Check, 
  Lock, 
  Layers, 
  Flame, 
  Droplets,
  Zap,
  Terminal,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Design tokens for interactive options
const IDENTITY_OPTIONS = [
  {
    id: 'individual',
    title: 'Individual Advocate',
    description: 'Actively offset daily personal emissions and track your green footprint.',
    icon: User,
    color: 'emerald',
    glow: 'bg-emerald-500/10',
    border: 'border-emerald-500/30 hover:border-emerald-400 active:bg-emerald-500/5',
    accent: 'text-emerald-400'
  },
  {
    id: 'enterprise',
    title: 'Enterprise Builder',
    description: 'Integrate carbon APIs, automate project MRV, and acquire bulk offsets.',
    icon: Building2,
    color: 'cyan',
    glow: 'bg-cyan-500/10',
    border: 'border-cyan-500/30 hover:border-cyan-400 active:bg-cyan-500/5',
    accent: 'text-cyan-400'
  },
  {
    id: 'developer',
    title: 'Project Developer',
    description: 'List carbon sinks, connect satellite telemetry, and issue credits.',
    icon: Cpu,
    color: 'violet',
    glow: 'bg-violet-500/10',
    border: 'border-violet-500/30 hover:border-violet-400 active:bg-violet-500/5',
    accent: 'text-violet-400'
  }
];

const FOCUS_AREAS = [
  {
    id: 'forestry',
    title: 'Forestry & Soil Sinks',
    category: 'Nature-based',
    description: 'Protecting old-growth rainforests and nurturing regenerative topsoils.',
    icon: TreePine,
    color: 'emerald',
    accent: 'text-emerald-400'
  },
  {
    id: 'ocean',
    title: 'Blue Carbon Sinks',
    category: 'Oceanic',
    description: 'Restoring coastal mangrove swamps and kelp forest ecosystems.',
    icon: Droplets,
    color: 'cyan',
    accent: 'text-cyan-400'
  },
  {
    id: 'energy',
    title: 'Decarbonized Grids',
    category: 'Technological',
    description: 'Funding micro-solar utilities and active bio-methane gas captures.',
    icon: Zap,
    color: 'amber',
    accent: 'text-amber-400'
  }
];

const TARGETS = [
  {
    id: 'starter',
    title: 'Starter Track',
    metric: '5 Tonnes / yr',
    description: 'Offsets daily streaming, local travel, and home utility footprint.',
    cost: '$75 / year estimate'
  },
  {
    id: 'neutral',
    title: 'Net-Zero Standard',
    metric: '20 Tonnes / yr',
    description: 'Achieves complete climate neutrality for active modern lifestyles.',
    cost: '$300 / year estimate'
  },
  {
    id: 'champion',
    title: 'Climate Champion',
    metric: '100+ Tonnes / yr',
    description: 'Advanced portfolio. Offsets full supply chain and operations.',
    cost: 'Custom institutional rates'
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save onboarding configurations in session state
      sessionStorage.setItem('c0_onboarding_completed', 'true');
      sessionStorage.setItem('c0_identity', selectedIdentity || '');
      sessionStorage.setItem('c0_focus', JSON.stringify(selectedFocus));
      sessionStorage.setItem('c0_target', selectedTarget || '');
      sessionStorage.setItem('c0_username', username || 'Protocol Operator');
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleFocus = (id: string) => {
    setSelectedFocus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Determine button state based on selections per step
  const isNextDisabled = () => {
    if (currentStep === 0 && !selectedIdentity) return true;
    if (currentStep === 1 && selectedFocus.length === 0) return true;
    if (currentStep === 2 && !selectedTarget) return true;
    if (currentStep === 3 && !username.trim()) return true;
    return false;
  };

  const getStepGlow = () => {
    if (currentStep === 0 && selectedIdentity) {
      const option = IDENTITY_OPTIONS.find(o => o.id === selectedIdentity);
      return option?.glow || 'bg-primary/10';
    }
    if (currentStep === 1) return 'bg-emerald-500/10';
    if (currentStep === 2) return 'bg-cyan-500/10';
    return 'bg-primary/10';
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      
      {/* Background Radial Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none z-0 transition-all duration-700 ${getStepGlow()}`} />

      {/* Retro-Futuristic Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Globe className="w-5 h-5 text-background" />
          </div>
          <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">C0 Net-Zero</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-gray-500 hover:text-white transition-colors text-xs font-bold tracking-wider uppercase"
        >
          Skip Journey
        </button>
      </header>

      {/* Main Interactive Interactive Wizard (Three.js Journey Style) */}
      <main className="flex-1 flex items-center justify-center relative z-10 my-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-12 items-center">
          
          {/* LEFT 3 COLUMNS: STAGE CARD WITH ANIMATIONS */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Step Indicators */}
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((stepIndex) => (
                <div 
                  key={stepIndex} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    stepIndex === currentStep 
                      ? 'w-16 bg-gradient-to-r from-primary to-secondary' 
                      : stepIndex < currentStep 
                        ? 'w-4 bg-primary/40' 
                        : 'w-4 bg-white/10'
                  }`} 
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 01: IDENTITY CHOICE */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-widest text-primary font-mono font-bold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      Stage 01: Establish Identity
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      Choose your <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Protocol Identity</span>
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                      Select your operational profile. We will customize your climate dashboard, telemetry feed, and transaction keys based on this node selection.
                    </p>
                  </div>

                  {/* Interactive Cards (Three.js Journey Track Selection styling) */}
                  <div className="grid gap-4 mt-8">
                    {IDENTITY_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedIdentity === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedIdentity(option.id)}
                          className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 relative overflow-hidden backdrop-blur-xl group ${
                            isSelected 
                              ? `bg-white/5 border-primary shadow-lg shadow-primary/10` 
                              : `bg-white/5 ${option.border}`
                          }`}
                        >
                          {/* Inner glowing dot */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-primary text-background' : 'bg-white/5 text-gray-400 group-hover:text-white'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 pr-6">
                            <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                              {option.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                              {option.description}
                            </p>
                          </div>

                          {/* Selected Check Indicator */}
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-primary border-primary' : 'border-white/20'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 02: FOCUS AREA MULTI-SELECTION */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      Stage 02: Carbon Targets
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      Select your <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Supported Sinks</span>
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                      Choose which ecological projects receive your funding. Selecting multiple pools will split offsets evenly across active pools.
                    </p>
                  </div>

                  <div className="grid gap-4 mt-8">
                    {FOCUS_AREAS.map((focus) => {
                      const Icon = focus.icon;
                      const isSelected = selectedFocus.includes(focus.id);
                      return (
                        <button
                          key={focus.id}
                          onClick={() => toggleFocus(focus.id)}
                          className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 relative overflow-hidden backdrop-blur-xl group ${
                            isSelected 
                              ? `bg-white/5 border-emerald-500/50 shadow-lg shadow-emerald-500/10` 
                              : `bg-white/5 border-white/10 hover:border-emerald-500/30`
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-emerald-500 text-background' : 'bg-white/5 text-gray-400 group-hover:text-emerald-400'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 pr-6">
                            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-gray-500 block mb-0.5">
                              {focus.category}
                            </span>
                            <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                              {focus.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                              {focus.description}
                            </p>
                          </div>

                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 03: DEFINE IMPACT TARGET */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-mono font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                      Stage 03: Scale Impact
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      Determine your <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Offset Target</span>
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                      Select your target annual footprint reduction volume. This configures your recurring micro-purchasing pipelines.
                    </p>
                  </div>

                  <div className="grid gap-4 mt-8">
                    {TARGETS.map((target) => {
                      const isSelected = selectedTarget === target.id;
                      return (
                        <button
                          key={target.id}
                          onClick={() => setSelectedTarget(target.id)}
                          className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 relative overflow-hidden backdrop-blur-xl group ${
                            isSelected 
                              ? `bg-white/5 border-cyan-500/50 shadow-lg shadow-cyan-500/10` 
                              : `bg-white/5 border-white/10 hover:border-cyan-500/30`
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                {target.title}
                              </h3>
                              <span className={`text-xs font-mono font-bold uppercase tracking-widest ${
                                isSelected ? 'text-cyan-400' : 'text-gray-400'
                              }`}>
                                {target.metric}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                              {target.description}
                            </p>
                            <span className="text-[10px] uppercase font-mono font-bold text-gray-500 mt-2 block">
                              {target.cost}
                            </span>
                          </div>

                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 04: USERNAME & TELEMETRY GENERATION */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-widest text-primary font-mono font-bold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      Stage 04: Initialize Key
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      Register your <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">Protocol Node</span>
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                      Enter your callsign to generate your cryptographically validated carbon key and enter the live global protocol marketplace.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="relative">
                      <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ENTER YOUR PROTOCOL CALLSIGN..."
                        maxLength={24}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-primary rounded-2xl py-4 pl-12 pr-4 outline-none font-mono text-sm tracking-wider uppercase transition-all placeholder:text-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-500 shrink-0" />
                      <p className="text-[11px] text-gray-500 font-mono leading-relaxed">
                        SECURE SHIELD: Your node configuration will be verified using active space orbits & local verified chains to secure credit custody.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controller Stepper Buttons */}
            <div className="flex gap-4 pt-6">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-300" />
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`flex-1 py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${
                  isNextDisabled() 
                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-secondary text-background hover:opacity-90 shadow-lg shadow-primary/20'
                }`}
              >
                {currentStep === 3 ? "Initialize Protocol Key" : "Continue Journey"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* RIGHT 2 COLUMNS: HOLOGRAM PREVIEW CARD (Three.js Journey inspired) */}
          <div className="lg:col-span-2 flex justify-center w-full">
            <div className="w-full max-w-sm aspect-[4/5] bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-[2.5rem] p-6 backdrop-blur-2xl flex flex-col justify-between overflow-hidden relative shadow-2xl">
              
              {/* Premium Top Holographic Radar Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,242,254,0.1),transparent_70%)] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-secondary to-primary" />

              {/* Card Holographic Title */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">LIVE FEED</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Holographic Center Display */}
              <div className="my-8 flex-1 flex flex-col justify-center items-center relative z-10">
                <AnimatePresence mode="wait">
                  {/* Step 1 Preview */}
                  {currentStep === 0 && (
                    <motion.div 
                      key="prev0"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center space-y-4"
                    >
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 border border-primary/20 rounded-full animate-spin-slow" />
                        <div className="absolute inset-2 border border-secondary/20 border-dashed rounded-full" />
                        <Globe className="w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">SELECTED PROFILE</span>
                        <h4 className="text-xl font-black mt-1 uppercase tracking-tight">
                          {selectedIdentity 
                            ? IDENTITY_OPTIONS.find(o => o.id === selectedIdentity)?.title 
                            : "AWAITING NODE..."}
                        </h4>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 Preview */}
                  {currentStep === 1 && (
                    <motion.div 
                      key="prev1"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center space-y-4 w-full px-4"
                    >
                      <div className="flex justify-center gap-3">
                        {selectedFocus.length > 0 ? (
                          selectedFocus.map((f, i) => {
                            const details = FOCUS_AREAS.find(fa => fa.id === f);
                            const Icon = details?.icon || TreePine;
                            return (
                              <motion.div 
                                key={f} 
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400"
                              >
                                <Icon className="w-5 h-5" />
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-600">
                            <TreePine className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">SINKS CONFIGURATION</span>
                        <h4 className="text-base font-black mt-1 leading-relaxed">
                          {selectedFocus.length > 0 
                            ? `${selectedFocus.length} POOLS ACTIVATED` 
                            : "NO SINKS ACTIVE"}
                        </h4>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 Preview */}
                  {currentStep === 2 && (
                    <motion.div 
                      key="prev2"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center space-y-4"
                    >
                      <div className="text-5xl font-black tracking-tighter text-cyan-400 font-mono">
                        {selectedTarget 
                          ? TARGETS.find(t => t.id === selectedTarget)?.metric.split(" ")[0] 
                          : "0"}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">ANNUAL TONNES CO₂</span>
                        <h4 className="text-lg font-black mt-1 uppercase tracking-tight">
                          {selectedTarget 
                            ? TARGETS.find(t => t.id === selectedTarget)?.title 
                            : "SELECT SCALING"}
                        </h4>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 Preview */}
                  {currentStep === 3 && (
                    <motion.div 
                      key="prev3"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full text-center space-y-5"
                    >
                      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl font-mono text-left space-y-2 relative overflow-hidden">
                        <div className="flex justify-between items-center text-[8px] text-gray-500">
                          <span>NODE CALLSIGN</span>
                          <span className="text-primary font-bold">READY TO MAP</span>
                        </div>
                        <div className="text-sm font-bold text-white tracking-widest uppercase truncate">
                          {username || "AWAITING KEY..."}
                        </div>
                        <div className="h-[1px] bg-white/5 my-2" />
                        <div className="grid grid-cols-2 gap-2 text-[8px] text-gray-400">
                          <div>
                            <span className="text-gray-600 block">IDENTITY</span>
                            <span className="uppercase text-gray-300 font-bold truncate">
                              {selectedIdentity || "None"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">SINKS SELECTED</span>
                            <span className="text-gray-300 font-bold">
                              {selectedFocus.length} POOLS
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Holographic Bottom Stats */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center font-mono text-[9px] text-gray-500 relative z-10">
                <div>
                  <span className="block text-gray-600">IP ADDRESS</span>
                  <span className="text-gray-400 font-bold">127.0.0.1::C0</span>
                </div>
                <div className="text-right">
                  <span className="block text-gray-600">STATUS</span>
                  <span className="text-primary font-bold uppercase animate-pulse">
                    {currentStep === 3 ? "SYNCING..." : "CONFIGURING"}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-6">
        <p>© 2026 C0 Net-Zero Protocol. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
