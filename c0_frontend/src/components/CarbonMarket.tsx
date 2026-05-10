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
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    marketplaceAPI.getListings()
      .then(setListings)
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
  };

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Carbon Market</h2>
        <p className="text-gray-400">Buy and sell verified credits instantly.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 text-sm font-semibold text-gray-400">
          <div className="col-span-2">Project</div>
          <div>Volume</div>
          <div>Price</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-gray-400">Loading market...</span>
          </div>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
              <div className="col-span-2">
                <div className="font-bold">{item.project_name}</div>
                <div className="text-xs text-gray-400">{typeLabels[item.project_type] || item.project_type}</div>
              </div>
              <div className="font-mono">{item.available} t</div>
              <div className="font-mono text-primary">{item.price}</div>
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
                        className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleBuy(item.id)}
                        className="bg-primary text-background text-xs font-bold px-3 py-1.5 rounded transition-colors"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setBuyingId(null)}
                        className="text-gray-400 hover:text-white"
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
                      className="bg-white/10 hover:bg-primary hover:text-background text-sm font-bold px-4 py-2 rounded transition-colors w-full sm:w-auto flex items-center gap-1 justify-center"
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
            className="fixed bottom-6 right-6 z-50 bg-red-500/20 border border-red-500/30 backdrop-blur-lg text-red-300 px-6 py-3 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
