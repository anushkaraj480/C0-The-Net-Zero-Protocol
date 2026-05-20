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

export default function App() {
  return (
    <div className="relative w-full bg-background min-h-screen text-white font-sans selection:bg-primary/30 selection:text-primary">
      <Preloader />
      <Navbar />

      <Hero />
      
      <div id="what-is-c0">
        <section className="pt-24 pb-4 px-6 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">What is C0: The Net Zero Protocol</h2>
          <p className="text-xl text-gray-400">
            We are a decentralized platform dedicated to transforming degraded land into thriving ecosystems. 
            By leveraging transparent verification and continuous monitoring, we produce high-quality carbon credits 
            to accelerate the global transition to a net-zero future.
          </p>
        </section>
        <MRVStatus />
        <PerCreditImpact />
      </div>
      
      <Storytelling />
      <MarketTrends />
      <ProjectListing />
      <CarbonDashboard />
      <CarbonMarket />

      <Footer />
    </div>
  );
}
