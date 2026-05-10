import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectListing from './components/ProjectListing';
import PerCreditImpact from './components/PerCreditImpact';
import MarketTrends from './components/MarketTrends';
import CarbonDashboard from './components/CarbonDashboard';
import MRVStatus from './components/MRVStatus';
import Storytelling from './components/Storytelling';
import CarbonMarket from './components/CarbonMarket';
import Footer from './components/Footer';
import StickyCTA from './components/StickyCTA';

export default function App() {
  return (
    <div className="relative w-full bg-background min-h-screen text-white font-sans selection:bg-primary/30 selection:text-primary">
      <Preloader />
      <StickyCTA />
      <Navbar />

      <Hero />
      <ProjectListing />
      <PerCreditImpact />
      <MarketTrends />
      <CarbonDashboard />
      <MRVStatus />
      <Storytelling />
      <CarbonMarket />

      <Footer />
    </div>
  );
}
