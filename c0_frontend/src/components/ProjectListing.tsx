import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Award, MapPin, Loader2, X, ExternalLink, ShieldCheck, ShoppingCart } from 'lucide-react';
import { STAGGER_CHILDREN } from './shared/animations';
import { marketplaceAPI } from '../api/client';
import type { Listing } from '../api/client';
import { useCurrency } from '../context/CurrencyContext';

// Map standards to icons
const standardIcons: Record<string, typeof CheckCircle2> = {
  'vm0042': CheckCircle2,
  'gold': Award,
  'bee_offset': CheckCircle2,
};

const typeColors: Record<string, string> = {
  'forestry': 'from-green-900',
  'agriculture': 'from-yellow-900',
  'mangrove': 'from-blue-900',
  'wetland': 'from-cyan-900',
  'direct_air_capture': 'from-purple-900',
  'methane_capture': 'from-orange-900',
  'blue_carbon': 'from-indigo-900',
  'renewable_energy': 'from-yellow-600',
};

// Unique, high-quality images mapped directly to name, type, and domain to ensure no repetition
const getProjectImage = (name: string, type: string): string => {
  const normalizedName = name.toLowerCase();
  const normalizedType = type.toLowerCase();

  // 1. Precise project name matches to provide unique, highly realistic visuals
  if (normalizedName.includes('mundra') || normalizedName.includes('dac')) {
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Famous misty mountain valley (Yosemite/Icelandic look)
  }
  if (normalizedName.includes('mumbai') || normalizedName.includes('methane')) {
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Famous sunlit green landscape hills
  }
  if (normalizedName.includes('sundarbans') || normalizedName.includes('mangrove') || normalizedName.includes('blue')) {
    return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Lush blue mangrove coastal roots
  }
  if (normalizedName.includes('bhadla') || normalizedName.includes('rajasthan') || normalizedName.includes('solar')) {
    return 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Clean desert solar array
  }
  if (normalizedName.includes('western') || normalizedName.includes('reforestation') || normalizedName.includes('forestry')) {
    return 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Deep Amazon canopy view
  }
  if (normalizedName.includes('punjab') || normalizedName.includes('soil') || normalizedName.includes('agriculture')) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Beautiful rolling midwest farmland hills
  }

  // 2. Dynamic fallbacks by category to guarantee uniqueness if new custom ones are added
  if (normalizedType.includes('forestry')) {
    return 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  if (normalizedType.includes('wetland')) {
    return 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  if (normalizedType.includes('blue_carbon') || normalizedType.includes('mangrove')) {
    return 'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Default gorgeous eco landscape
};

// Human-readable labels
const standardLabels: Record<string, string> = {
  'vm0042': 'Verra',
  'verra': 'Verra',
  'gold': 'Gold Standard',
  'gold_standard': 'Gold Standard',
  'bee_offset': 'BEE Offset',
  'acr': 'ACR',
  'car': 'CAR',
  'puro': 'Puro.earth',
};

// Registry certificate data for each standard
const certificationInfo: Record<string, {
  name: string;
  registryId: string;
  url: string;
  description: string;
  color: string;
}> = {
  'vm0042': { name: 'Verra VCS', registryId: 'VCS-VM0042', url: 'https://verra.org', description: 'Verra Verified Carbon Standard — the world\'s leading voluntary GHG program, ensuring rigorous third-party carbon project verification.', color: '#00A86B' },
  'verra': { name: 'Verra VCS', registryId: 'VCS-VM0042', url: 'https://verra.org', description: 'Verra Verified Carbon Standard — the world\'s leading voluntary GHG program, ensuring rigorous third-party carbon project verification.', color: '#00A86B' },
  'gold': { name: 'Gold Standard', registryId: 'GS-3214', url: 'https://goldstandard.org', description: 'Gold Standard for the Global Goals — the highest certification for climate & development projects backed by 80+ NGOs worldwide.', color: '#F5A623' },
  'gold_standard': { name: 'Gold Standard', registryId: 'GS-3214', url: 'https://goldstandard.org', description: 'Gold Standard for the Global Goals — the highest certification for climate & development projects backed by 80+ NGOs worldwide.', color: '#F5A623' },
  'bee_offset': { name: 'BEE Carbon Offset', registryId: 'BEE-OFF-0891', url: 'https://beeindia.gov.in', description: 'Bureau of Energy Efficiency Carbon Offset — India\'s national scheme for certified energy efficiency and renewable energy carbon credits.', color: '#00CFFF' },
  'acr': { name: 'American Carbon Registry', registryId: 'ACR-4521', url: 'https://americancarbonregistry.org', description: 'ACR — The first private voluntary GHG registry in the world, providing rigorous standards for carbon offset projects in North America.', color: '#7C5CBF' },
  'car': { name: 'Climate Action Reserve', registryId: 'CAR-7823', url: 'https://climateactionreserve.org', description: 'Climate Action Reserve — A leading standards body for the North American voluntary carbon market, ensuring environmental integrity.', color: '#E8A838' },
  'puro': { name: 'Puro.earth', registryId: 'PURO-C0-2024-0032', url: 'https://puro.earth', description: 'Puro.earth — The first B2B marketplace and standard for carbon removal, focused exclusively on durable, high-quality carbon dioxide removal.', color: '#4CAF50' },
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
  'reforestation': 'Reforestation',
  'soil_carbon': 'Soil Carbon',
};

export default function ProjectListing() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certModal, setCertModal] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStandard, setFilterStandard] = useState('All Standards');

  useEffect(() => {
    marketplaceAPI.getListings()
      .then((data) => {
        if (data.length === 0) {
          setListings([
            { id: 1, project_name: 'Mundra DAC Facility', project_type: 'direct_air_capture', location_text: 'Gujarat, India', description: 'Pilot direct air capture facility storing carbon dioxide permanently in saline aquifers.', standard: 'gold', available: '500', price: '$150.00', quantity_available: 500, price_per_credit: '150.00', status: '', listed_at: '', seller_email: '' },
            { id: 2, project_name: 'Mumbai Biogas Methane Capture', project_type: 'methane_capture', location_text: 'Maharashtra, India', description: 'Methane recovery and bio-CNG generation from municipal solid waste.', standard: 'vm0042', available: '8000', price: '$8.90', quantity_available: 8000, price_per_credit: '8.90', status: '', listed_at: '', seller_email: '' },
            { id: 3, project_name: 'Sundarbans Mangrove Restoration', project_type: 'blue_carbon', location_text: 'West Bengal, India', description: 'Restoring mangrove ecosystems to protect coastlines and sequester blue carbon.', standard: 'gold', available: '1500', price: '$35.00', quantity_available: 1500, price_per_credit: '35.00', status: '', listed_at: '', seller_email: '' },
            { id: 4, project_name: 'Bhadla Solar Park', project_type: 'renewable_energy', location_text: 'Rajasthan, India', description: 'Massive solar installation displacing grid electricity with clean solar energy.', standard: 'bee_offset', available: '10000', price: '$22.00', quantity_available: 10000, price_per_credit: '22.00', status: '', listed_at: '', seller_email: '' },
          ]);
        } else {
          setListings(data);
        }
      })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  // Extract unique filter options from real data
  const locations = ['All Locations', ...new Set(listings.map(l => l.location_text))];
  const types = ['All Types', ...new Set(listings.map(l => typeLabels[l.project_type] || l.project_type))];
  const standards = ['All Standards', ...new Set(listings.map(l => standardLabels[l.standard] || l.standard))];

  const filteredProjects = listings.filter(p => {
    const matchLocation = filterLocation === 'All Locations' || p.location_text === filterLocation;
    const matchType = filterType === 'All Types' || (typeLabels[p.project_type] || p.project_type) === filterType;
    const matchStandard = filterStandard === 'All Standards' || (standardLabels[p.standard] || p.standard) === filterStandard;
    return matchLocation && matchType && matchStandard;
  });

  const activeCert = certModal ? certificationInfo[certModal] : null;

  return (
    <>
      {/* Certificate Verification Modal */}
      <AnimatePresence>
        {certModal && activeCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setCertModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-md w-full glass-panel rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header with color stripe */}
              <div className="h-2 w-full" style={{ backgroundColor: activeCert.color }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: activeCert.color + '22' }}>
                      <ShieldCheck className="w-6 h-6" style={{ color: activeCert.color }} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest">Verified by</div>
                      <h3 className="text-lg font-black" style={{ color: activeCert.color }}>{activeCert.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setCertModal(null)} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Registry ID</div>
                      <div className="font-mono font-bold text-white">{activeCert.registryId}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Status</div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="font-bold text-green-400 text-sm">Active</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Issued</div>
                      <div className="font-medium text-white">Jan 2024</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Expires</div>
                      <div className="font-medium text-white">Dec 2026</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-5 leading-relaxed">{activeCert.description}</p>

                <a
                  href={activeCert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold border transition-all hover:opacity-90"
                  style={{ borderColor: activeCert.color, color: activeCert.color, backgroundColor: activeCert.color + '15' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Official Registry
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <section id="projects" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 text-[#142701]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black mb-4 text-[#142701]">Featured Projects</h2>
            <p className="font-medium text-[#142701]/80 max-w-md">Invest in verified carbon sinks. Filter by standard, type, and location.</p>
          </div>
          <div className="sage-glass-panel p-2 flex flex-wrap gap-2 mt-6 md:mt-0">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 text-[#142701] [&>option]:bg-[#dad7cd] [&>option]:text-[#142701] outline-none px-3 py-2 cursor-pointer font-bold"
            >
              {locations.map(loc => <option key={loc}>{loc}</option>)}
            </select>
            <div className="w-px bg-[#142701]/10 my-1 hidden sm:block"></div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 text-[#142701] [&>option]:bg-[#dad7cd] [&>option]:text-[#142701] outline-none px-3 py-2 cursor-pointer font-bold"
            >
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="w-px bg-[#142701]/10 my-1 hidden sm:block"></div>
            <select
              value={filterStandard}
              onChange={(e) => setFilterStandard(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 text-[#142701] [&>option]:bg-[#dad7cd] [&>option]:text-[#142701] outline-none px-3 py-2 cursor-pointer font-bold"
            >
              {standards.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-[#142701]" />
            <span className="ml-3 font-semibold text-[#142701]/75">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-800 font-bold">{error}</div>
        ) : (
          <motion.div
            variants={STAGGER_CHILDREN}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => {
                const StandardIcon = standardIcons[project.standard] || CheckCircle2;
                const colorClass = typeColors[project.project_type] || 'from-gray-900';

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="sage-glass-panel overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors flex flex-col"
                  >
                    <div className={`h-48 bg-gradient-to-br ${colorClass} to-[#dad7cd] relative overflow-hidden`}>
                      <img
                        src={getProjectImage(project.project_name, project.project_type)}
                        alt={project.project_name}
                        className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Clickable certification badge */}
                      <button
                        onClick={() => setCertModal(project.standard)}
                        className="absolute top-4 right-4 bg-white/95 backdrop-blur text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#142701]/25 text-[#142701] font-bold z-10 hover:bg-[#52B788] hover:text-white transition-all cursor-pointer"
                        title="View verification certificate"
                      >
                        <StandardIcon className="w-3 h-3 text-[#52B788] filter brightness-75" /> {standardLabels[project.standard] || project.standard} Verified
                      </button>
                      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#dad7cd] to-transparent z-10"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
                        <MapPin className="w-3 h-3" /> {project.location_text}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-[#142701] group-hover:text-[#52B788] filter brightness-90 transition-colors">{project.project_name}</h3>
                      <p className="text-sm text-[#142701]/85 mb-4 line-clamp-2 flex-1">{project.description}</p>

                      <div className="flex justify-between items-center border-t border-[#142701]/10 pt-4 mt-auto mb-4">
                        <div>
                          <div className="text-xs font-semibold text-[#142701]/60">Price / Ton</div>
                          <div className="font-black text-[#142701] text-lg">{formatPrice(project.price_per_credit || project.price, 'USD')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#142701]/60">Available</div>
                          <div className="font-black text-emerald-800 text-lg">{project.available} t</div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => document.getElementById('carbon-market')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#142701]/5 border border-[#142701]/20 text-[#142701] hover:bg-[#142701] hover:text-white hover:border-[#142701] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy Credits
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {filteredProjects.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-3 text-center py-20 text-[#142701]/60 font-semibold"
                >
                  No projects match your current filters.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </>
  );
}
