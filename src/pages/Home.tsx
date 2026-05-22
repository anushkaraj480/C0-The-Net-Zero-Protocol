import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Leaf, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FocusAreas from '../components/FocusAreas';
import ImpactStats from '../components/ImpactStats';
import ProjectListing from '../components/ProjectListing';
import MarketTrends from '../components/MarketTrends';
import CarbonDashboard from '../components/CarbonDashboard';
import BeforeAfter from '../components/BeforeAfter';
import Storytelling from '../components/Storytelling';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup 1.5 seconds after landing
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('c0_onboarding_dismissed');
      if (!dismissed) {
        setShowPopup(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartTour = () => {
    sessionStorage.setItem('c0_onboarding_dismissed', 'true');
    setShowPopup(false);
    navigate('/onboarding');
  };

  const handleDismiss = () => {
    sessionStorage.setItem('c0_onboarding_dismissed', 'true');
    setShowPopup(false);
  };

  return (
    <div className="relative w-full bg-background min-h-screen text-white font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      <StickyCTA />
      <Navbar />

      <main>
        <Hero />
        <FocusAreas />
        <ImpactStats />
        <ProjectListing />
        <MarketTrends />
        <CarbonDashboard />
        <BeforeAfter />
        <Storytelling />
      </main>

      <Footer />

      {/* Onboarding Invitation Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
            >
              {/* Top Banner Indicator */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-secondary to-primary" />
              
              {/* Close Button */}
              <button 
                onClick={handleDismiss}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-4 bg-primary/20 border border-primary/30 rounded-2xl text-primary animate-pulse shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">New to Net-Zero?</span>
                    <h2 className="text-2xl font-black tracking-tight mt-1">What are Carbon Credits?</h2>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-sm">
                  Most people don't fully understand how carbon credits work, how they offset global warming emissions, or how legancy markets suffer from trust issues. 
                </p>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex gap-3 items-center">
                  <Leaf className="w-5 h-5 text-secondary shrink-0" />
                  <p className="text-xs text-gray-400">
                    Take our <span className="text-white font-semibold">60-second visual tour</span> to see how we verify carbon removal with real-time satellites.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={handleStartTour}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-primary to-secondary text-background hover:opacity-90 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Start Visual Tour <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleDismiss}
                    className="py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
                  >
                    Explore App First
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
