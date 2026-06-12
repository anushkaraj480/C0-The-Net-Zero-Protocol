import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShoppingCart, Check, X } from 'lucide-react';
import { marketplaceAPI } from '../api/client';
import type { Listing } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CarbonMarket() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buyQty, setBuyQty] = useState<number>(100);
  const [buySuccess, setBuySuccess] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    marketplaceAPI.getListings()
      .then((data) => {
        if (data.length === 0) {
          setListings([
            { id: 1, project_name: 'Mundra DAC Facility', project_type: 'direct_air_capture', available: '500', price: '$150.00', quantity_available: 500, location_text: 'Gujarat, India', description: 'Pilot direct air capture facility.', standard: 'gold', price_per_credit: '150.00', status: 'active', listed_at: '', seller_email: '' },
            { id: 2, project_name: 'Mumbai Biogas Methane Capture', project_type: 'methane_capture', available: '8000', price: '$8.90', quantity_available: 8000, location_text: 'Maharashtra, India', description: 'Methane recovery from waste.', standard: 'vm0042', price_per_credit: '8.90', status: 'active', listed_at: '', seller_email: '' },
            { id: 3, project_name: 'Sundarbans Mangrove Restoration', project_type: 'blue_carbon', available: '1500', price: '$35.00', quantity_available: 1500, location_text: 'West Bengal, India', description: 'Restoring mangrove ecosystems.', standard: 'gold', price_per_credit: '35.00', status: 'active', listed_at: '', seller_email: '' },
            { id: 4, project_name: 'Bhadla Solar Park', project_type: 'renewable_energy', available: '10000', price: '$22.00', quantity_available: 10000, location_text: 'Rajasthan, India', description: 'Massive solar installation.', standard: 'bee_offset', price_per_credit: '22.00', status: 'active', listed_at: '', seller_email: '' },
          ]);
        } else {
          setListings(data);
        }
      })
      .catch(() => setError('Failed to load market data'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (listingId: number) => {
    if (!isLoggedIn) {
      setError('Please sign in to purchase credits');
      return;
    }
    try {
      await marketplaceAPI.buyCredits(listingId, buyQty);
      setBuySuccess(listingId);
      setBuyingId(null);
      // Refresh listings
      const updated = await marketplaceAPI.getListings();
      setListings(updated);
      setTimeout(() => setBuySuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Purchase failed');
      setTimeout(() => setError(null), 3000);
    }
  };

  const typeLabels: Record<string, string> = {
    'forestry': 'Forestry',
    'agriculture': 'Agriculture',
    'mangrove': 'Mangrove',
    'wetland': 'Wetland',
    'direct_air_capture': 'Direct Air Capture',
    'methane_capture': 'Methane Capture',
    'blue_carbon': 'Blue Carbon',
    'renewable_energy': 'Renewable Energy',
  };

  if (!isLoggedIn || user?.role !== 'buyer') {
    return null;
  }

  return (
    <section id="carbon-market" className="py-24 sage-section border-t border-[#142701]/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#142701]">Carbon Market</h2>
          <p className="text-[#142701]/70">Buy and sell verified credits instantly.</p>
        </div>

        <div className="sage-glass-panel overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-[#142701]/10 text-sm font-semibold text-[#142701]/70">
            <div className="col-span-2">Project</div>
            <div>Volume</div>
            <div>Price</div>
            <div>Action</div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-[#142701]/70">Loading market...</span>
            </div>
          ) : (
            listings.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-b border-[#142701]/5 items-center hover:bg-white/40 transition-colors text-[#142701]">
                <div className="col-span-2">
                  <div className="font-bold">{item.project_name}</div>
                  <div className="text-xs text-[#142701]/70">{typeLabels[item.project_type] || item.project_type}</div>
                </div>
                <div className="font-mono font-semibold">{item.available} t</div>
                <div className="font-mono font-semibold text-primary">{item.price}</div>
                <div>
                  <AnimatePresence mode="wait">
                    {buySuccess === item.id ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 text-sm text-primary font-bold"
                      >
                        <Check className="w-4 h-4" /> Purchased!
                      </motion.div>
                    ) : buyingId === item.id ? (
                      <motion.div
                        key="buying"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="number"
                          value={buyQty}
                          onChange={(e) => setBuyQty(Number(e.target.value))}
                          min={1}
                          max={item.quantity_available}
                          className="w-20 bg-white/60 border border-[#142701]/10 rounded px-2 py-1 text-sm text-[#142701] font-semibold outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => handleBuy(item.id)}
                          className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setBuyingId(null)}
                          className="text-[#142701]/50 hover:text-[#142701]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="buy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setBuyingId(item.id)}
                        className="bg-[#142701]/10 hover:bg-primary hover:text-white text-[#142701] text-sm font-bold px-4 py-2 rounded transition-colors w-full sm:w-auto flex items-center gap-1 justify-center"
                      >
                        <ShoppingCart className="w-3 h-3" /> Buy Now
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 bg-red-500/20 border border-red-500/30 backdrop-blur-lg text-red-700 px-6 py-3 rounded-xl text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
