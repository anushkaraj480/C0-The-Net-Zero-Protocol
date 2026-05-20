import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Award, MapPin, Loader2 } from 'lucide-react';
import { STAGGER_CHILDREN } from './shared/animations';
import { marketplaceAPI } from '../api/client';
import type { Listing } from '../api/client';

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

// Human-readable labels
const standardLabels: Record<string, string> = {
  'vm0042': 'Verra',
  'gold': 'Gold Standard',
  'bee_offset': 'BEE Offset',
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

export default function ProjectListing() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStandard, setFilterStandard] = useState('All Standards');

  useEffect(() => {
    marketplaceAPI.getListings()
      .then((data) => {
        if (data.length === 0) {
          setListings([
            { id: 1, project_name: 'Iceland DAC Facility', project_type: 'direct_air_capture', location_text: 'Iceland', description: 'Direct air capture facility in Iceland', standard: 'gold', available: '500', price: '$150.00', quantity_available: 500, price_per_credit: '150.00', status: '', listed_at: '', seller_email: '' },
            { id: 2, project_name: 'Alberta Methane Capture', project_type: 'methane_capture', location_text: 'Alberta, Canada', description: 'Methane capture from agriculture', standard: 'vm0042', available: '8000', price: '$8.90', quantity_available: 8000, price_per_credit: '8.90', status: '', listed_at: '', seller_email: '' },
            { id: 3, project_name: 'Kenya Mangrove Restoration', project_type: 'blue_carbon', location_text: 'Mombasa, Kenya', description: 'Restoring mangrove ecosystems', standard: 'gold', available: '1500', price: '$35.00', quantity_available: 1500, price_per_credit: '35.00', status: '', listed_at: '', seller_email: '' },
            { id: 4, project_name: 'Rajasthan Solar Farm', project_type: 'renewable_energy', location_text: 'Rajasthan, India', description: 'Large scale solar farm', standard: 'bee_offset', available: '10000', price: '$22.00', quantity_available: 10000, price_per_credit: '22.00', status: '', listed_at: '', seller_email: '' },
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

  return (
    <section id="projects" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-gray-400 max-w-md">Invest in verified carbon sinks. Filter by standard, type, and location.</p>
        </div>
        <div className="glass-panel p-2 flex flex-wrap gap-2 mt-6 md:mt-0">
          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-transparent text-sm border-none focus:ring-0 text-white [&>option]:bg-background outline-none px-3 py-2 cursor-pointer"
          >
            {locations.map(loc => <option key={loc}>{loc}</option>)}
          </select>
          <div className="w-px bg-white/10 my-1 hidden sm:block"></div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-sm border-none focus:ring-0 text-white [&>option]:bg-background outline-none px-3 py-2 cursor-pointer"
          >
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="w-px bg-white/10 my-1 hidden sm:block"></div>
          <select 
            value={filterStandard}
            onChange={(e) => setFilterStandard(e.target.value)}
            className="bg-transparent text-sm border-none focus:ring-0 text-white [&>option]:bg-background outline-none px-3 py-2 cursor-pointer text-primary"
          >
            {standards.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-400">Loading projects...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
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
                  className="glass-panel overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors flex flex-col"
                >
                  <div className={`h-48 bg-gradient-to-br ${colorClass} to-[#0B0F1A] relative`}>
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-primary/30 text-primary">
                      <StandardIcon className="w-3 h-3" /> {standardLabels[project.standard] || project.standard} Verified
                    </div>
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#0B0F1A] to-transparent"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-accent mb-2">
                      <MapPin className="w-3 h-3" /> {project.location_text}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.project_name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{project.description}</p>
                    
                    <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
                      <div>
                        <div className="text-xs text-gray-500">Price / Ton</div>
                        <div className="font-bold text-lg">{project.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Available</div>
                        <div className="font-bold text-primary">{project.available} t</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredProjects.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-3 text-center py-20 text-gray-500"
              >
                No projects match your current filters.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
