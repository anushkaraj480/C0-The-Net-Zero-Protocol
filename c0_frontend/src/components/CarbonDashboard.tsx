import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, TrendingUp, Leaf, MapPin, TreePine, Clock, Activity, Layers, Info, History } from 'lucide-react';
import { dashboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

// Indian states grouped by climate zone — matches the ML model's training data
const STATE_OPTIONS = [
  { group: 'Tropical Wet', states: ['Kerala', 'Goa', 'Meghalaya', 'Assam', 'Mizoram', 'Nagaland', 'Tripura'] },
  { group: 'Tropical Dry', states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'] },
  { group: 'Arid', states: ['Rajasthan', 'Gujarat'] },
  { group: 'Subtropical', states: ['Himachal Pradesh', 'Uttarakhand', 'Sikkim', 'Arunachal Pradesh', 'Manipur'] },
  { group: 'Humid Subtropical', states: ['Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Punjab', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'West Bengal', 'Haryana'] },
];

const ACTIVITY_OPTIONS = ['Afforestation', 'Reforestation', 'Regenerative Agriculture'];

export default function CarbonDashboard() {
  const { isLoggedIn, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [landSize, setLandSize] = useState(500);
  const [activityType, setActivityType] = useState('Reforestation');
  const [state, setState] = useState('Maharashtra');
  const [projectAge, setProjectAge] = useState(5);
  const [estimatedCredits, setEstimatedCredits] = useState(0);
  const [revenuePotential, setRevenuePotential] = useState(0);
  const [modelInputs, setModelInputs] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDemoUser = user?.username === 'demo_seller' || user?.username === 'demo_buyer';
  const isNewUser = isDemoUser
    ? false
    : user?.date_joined
      ? (new Date().getTime() - new Date(user.date_joined).getTime()) < 1000 * 60 * 60 * 24
      : false;

  const renderSellerPanel = () => {
    if (isNewUser) {
      return (
        <div className="sage-glass-panel p-6 flex flex-col justify-center items-center h-full text-center lg:col-span-2">
          <Layers className="w-12 h-12 text-[#142701]/50 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-[#142701]">No Active Nodes</h3>
          <p className="text-sm text-[#142701]/70">Deploy nodes on your land to start monitoring real-time carbon sequestration.</p>
        </div>
      );
    }

    const nodesDeployed = user?.username === 'demo_seller' ? 12 : 4;
    const totalArea = user?.username === 'demo_seller' ? '350 ha' : '120 ha';
    const creditsProduced = user?.username === 'demo_seller' ? '1,420 tCO2e' : '450 tCO2e';

    return (
      <div className="sage-glass-panel p-6 flex flex-col lg:col-span-2 h-full">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Layers className="w-5 h-5" />
          <h3 className="text-lg font-bold text-[#142701]">Land & Node Overview</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="w-full md:w-1/2 h-48 md:h-full bg-white/50 rounded-xl border border-[#142701]/10 relative overflow-hidden flex items-center justify-center min-h-[12rem]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage: `url('${user?.username === 'demo_seller' ? '/demo_satellite.png' : 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}')`
              }}
            ></div>
            <div className="absolute inset-0 bg-[#52B788]/20 mix-blend-overlay"></div>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
            <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
            {user?.username === 'demo_seller' && (
              <>
                <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
                <div className="absolute top-1/5 right-1/3 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#52B788]"></div>
              </>
            )}
            <span className="text-xs text-[#142701] font-semibold z-10 bg-white/80 px-2 py-1 rounded shadow-sm">Live Satellite Feed</span>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-[#142701]/10">
              <span className="text-sm text-[#142701]/70">Nodes Deployed</span>
              <span className="text-lg font-bold text-[#142701]">{nodesDeployed}</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-[#142701]/10">
              <span className="text-sm text-[#142701]/70">Total Area</span>
              <span className="text-lg font-bold text-[#142701]">{totalArea}</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-[#142701]/10">
              <span className="text-sm text-[#142701]/70">Credits (Past Month)</span>
              <span className="text-lg font-bold text-primary">{creditsProduced}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBuyerPanel = () => {
    if (isNewUser) {
      return (
        <div className="sage-glass-panel p-6 flex flex-col justify-center items-center h-full text-center lg:col-span-2">
          <History className="w-12 h-12 text-[#142701]/50 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-[#142701]">No Recent Transactions</h3>
          <p className="text-sm text-[#142701]/70">Start purchasing carbon credits to build your transaction history.</p>
        </div>
      );
    }

    const defaultTransactions = [
      { id: 'TXN-001', date: '2026-05-18', amount: '500 t', price: 4500, priceBase: 'INR' as const, status: 'Completed' },
      { id: 'TXN-002', date: '2026-05-19', amount: '250 t', price: 2250, priceBase: 'INR' as const, status: 'Completed' },
      { id: 'TXN-003', date: '2026-05-20', amount: '100 t', price: 900, priceBase: 'INR' as const, status: 'Pending' }
    ];

    const demoBuyerTransactions = [
      { id: 'TXN-901', date: '2026-05-12', amount: '2,500 t', price: 22500, priceBase: 'INR' as const, status: 'Completed' },
      { id: 'TXN-902', date: '2026-05-15', amount: '1,200 t', price: 10800, priceBase: 'INR' as const, status: 'Completed' },
      { id: 'TXN-903', date: '2026-05-18', amount: '800 t', price: 7200, priceBase: 'INR' as const, status: 'Completed' },
      { id: 'TXN-904', date: '2026-05-20', amount: '450 t', price: 4050, priceBase: 'INR' as const, status: 'Pending' },
      { id: 'TXN-905', date: '2026-05-21', amount: '150 t', price: 1350, priceBase: 'INR' as const, status: 'Pending' }
    ];

    const transactions = user?.username === 'demo_buyer' ? demoBuyerTransactions : defaultTransactions;

    return (
      <div className="sage-glass-panel p-6 flex flex-col lg:col-span-2 h-full">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <History className="w-5 h-5" />
          <h3 className="text-lg font-bold text-[#142701]">Recent Transactions</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-[#142701]">
            <thead className="text-[#142701]/60 border-b border-[#142701]/10">
              <tr>
                <th className="pb-2">ID</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142701]/5">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3 font-mono text-xs">{txn.id}</td>
                  <td className="py-3">{txn.date}</td>
                  <td className="py-3 text-primary font-semibold">{txn.amount}</td>
                  <td className="py-3 font-semibold">{formatPrice(txn.price, txn.priceBase)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold ${txn.status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-700'}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchEstimate = async () => {
      setIsLoading(true);
      try {
        const result = await dashboardAPI.estimateCredits({
          land_size_hectares: landSize,
          activity_type: activityType,
          state: state,
          project_age_years: projectAge,
        });
        setEstimatedCredits(result.estimated_credits || 0);
        setRevenuePotential(result.revenue_potential || 0);
        setModelInputs(result.model_inputs_used || null);
      } catch (error) {
        console.error("Failed to estimate credits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchEstimate();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [landSize, activityType, state, projectAge]);

  if (!isLoggedIn) return null;

  return (
    <section id="dashboard" className="py-24 sage-section border-t border-[#142701]/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#142701]">Your Carbon Portal</h2>
          <div className="w-full bg-[#142701]/10 rounded-full h-2 mt-8 mb-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "65%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-primary h-full relative"
            >
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-sm"></div>
            </motion.div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#142701]/60">Current Emissions</span>
            <span className="text-primary font-bold">65% Carbon Neutral</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* AI Suggestions */}
            <div className="sage-glass-panel p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Wind className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[#142701]">AI Intelligence</h3>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/60 p-4 rounded-xl border border-[#142701]/10 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-semibold mb-1 text-[#142701]">Switch to drip irrigation</p>
                  <p className="text-xs text-[#142701]/60 mb-2">Reduce agricultural emissions by 18%</p>
                  <div className="text-primary text-xs flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3" /> High Impact
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/60 p-4 rounded-xl border border-[#142701]/10 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-semibold mb-1 text-[#142701]">Plant cover crops</p>
                  <p className="text-xs text-[#142701]/60 mb-2">Increase soil carbon sequestration</p>
                  <div className="text-primary text-xs flex items-center gap-1 font-bold">
                    <Leaf className="w-3 h-3" /> +1.2t / hectare
                  </div>
                </motion.div>

                {/* Model context chip — shows what the model auto-filled */}
                {modelInputs && (
                  <div className="mt-auto pt-4 border-t border-[#142701]/10">
                    <p className="text-[10px] uppercase tracking-wider text-[#142701]/50 mb-2 font-bold">Model Context</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#142701]/70 border border-[#142701]/10">
                        {(modelInputs as Record<string, unknown>).climate_zone as string}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#142701]/70 border border-[#142701]/10">
                        {(modelInputs as Record<string, unknown>).avg_rainfall_mm as number}mm rain
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#142701]/70 border border-[#142701]/10">
                        {(modelInputs as Record<string, unknown>).forest_cover_pct as number}% forest
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#142701]/70 border border-[#142701]/10">
                        SOC: {(modelInputs as Record<string, unknown>).soil_organic_carbon as string}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role-Specific Panel */}
            {user?.role === 'buyer' ? renderBuyerPanel() : renderSellerPanel()}

          </div>

          {/* Credit Generation Estimator — ML Powered */}
          <div className="sage-glass-panel p-6 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-[#142701]">Generation Estimator</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 font-bold">
                  <Activity className="w-3 h-3" /> ML Powered
                </span>
              </div>
              <p className="text-sm text-[#142701]/60 mb-8">Calculate your land's credit potential using our trained AI model.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Land Size Slider */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm text-[#142701]/70 flex items-center gap-1.5 font-medium">
                      <TreePine className="w-3.5 h-3.5" /> Land Size
                    </label>
                    <span className="text-primary font-mono font-bold">{landSize} ha</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-primary"
                    min="10"
                    max="5000"
                    value={landSize}
                    onChange={(e) => setLandSize(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-[#142701]/50 mt-1">
                    <span>10ha</span>
                    <span>5000ha</span>
                  </div>
                </div>

                {/* Activity Type */}
                <div>
                  <label className="text-sm text-[#142701]/70 flex items-center gap-1.5 mb-2 font-medium">
                    <Leaf className="w-3.5 h-3.5" /> Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full bg-white/60 border border-[#142701]/10 rounded-lg px-4 py-2 text-[#142701] outline-none focus:border-primary font-medium"
                  >
                    {ACTIVITY_OPTIONS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* State Selection */}
                <div>
                  <label className="text-sm text-[#142701]/70 flex items-center gap-1.5 mb-2 font-medium">
                    <MapPin className="w-3.5 h-3.5" /> State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white/60 border border-[#142701]/10 rounded-lg px-4 py-2 text-[#142701] outline-none focus:border-primary font-medium"
                  >
                    {STATE_OPTIONS.map(group => (
                      <optgroup key={group.group} label={`── ${group.group}`}>
                        {group.states.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Project Age Slider */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm text-[#142701]/70 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Project Age
                    </label>
                    <span className="text-primary font-mono font-bold">{projectAge} yr{projectAge > 1 ? 's' : ''}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-primary"
                    min="1"
                    max="10"
                    value={projectAge}
                    onChange={(e) => setProjectAge(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-[#142701]/50 mt-1">
                    <span>1 yr</span>
                    <span>10 yrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-white/40 rounded-xl p-6 border border-[#142701]/10 flex flex-col sm:flex-row justify-around items-center gap-6">
              <div className="text-center">
                <div className="text-[#142701]/60 text-sm mb-1 font-medium">Estimated Credits / Yr</div>
                <motion.div
                  key={estimatedCredits}
                  initial={{ scale: 1.1, color: '#142701' }}
                  animate={{ scale: 1, color: '#52B788' }}
                  className="text-3xl font-black text-primary"
                >
                  {isLoading ? (
                    <span className="animate-pulse text-[#142701]/30">···</span>
                  ) : (
                    <>{estimatedCredits.toLocaleString()}<span className="text-sm font-normal">t</span></>
                  )}
                </motion.div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-[#142701]/10"></div>
              <div className="text-center">
                <div className="text-[#142701]/60 text-sm mb-1 font-medium">Revenue Potential</div>
                <motion.div
                  key={revenuePotential}
                  initial={{ scale: 1.1, color: '#142701' }}
                  animate={{ scale: 1, color: '#52B788' }}
                  className="text-3xl font-black text-primary"
                >
                  {isLoading ? (
                    <span className="animate-pulse text-[#142701]/30">···</span>
                  ) : (
                    <>{formatPrice(revenuePotential, 'INR')}</>
                  )}
                </motion.div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/40 border border-[#142701]/10 rounded-lg flex gap-3 text-sm text-[#142701]/70 items-start">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>Note: This estimate is not 100% accurate and may differ from the actual carbon credits produced. Variations occur due to changing real-time environmental factors and verification adjustments.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
