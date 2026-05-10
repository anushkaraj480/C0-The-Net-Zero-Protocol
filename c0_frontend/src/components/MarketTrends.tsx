import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { marketplaceAPI } from '../api/client';
import type { TrendPoint } from '../api/client';

// Month abbreviations for chart
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ChartData {
  name: string;
  forest?: number;
  agri?: number;
  mangrove?: number;
  wetland?: number;
}

export default function MarketTrends() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceAPI.getTrends()
      .then((trends) => {
        // Group by month, pivot project_type into columns
        const monthMap = new Map<string, ChartData>();
        
        trends.forEach((point: TrendPoint) => {
          const date = new Date(point.month);
          const label = MONTH_NAMES[date.getMonth()];
          
          if (!monthMap.has(label)) {
            monthMap.set(label, { name: label });
          }
          const entry = monthMap.get(label)!;
          
          if (point.project_type === 'forestry') entry.forest = Number(point.avg_price);
          else if (point.project_type === 'agriculture') entry.agri = Number(point.avg_price);
          else if (point.project_type === 'mangrove') entry.mangrove = Number(point.avg_price);
          else if (point.project_type === 'wetland') entry.wetland = Number(point.avg_price);
        });

        setChartData(Array.from(monthMap.values()));
      })
      .catch(() => {
        // Fallback to static data if API fails
        setChartData([
          { name: 'Jan', forest: 12, agri: 10 },
          { name: 'Feb', forest: 13, agri: 11 },
          { name: 'Mar', forest: 12.5, agri: 11.5 },
          { name: 'Apr', forest: 14, agri: 13 },
          { name: 'May', forest: 15.2, agri: 14 },
          { name: 'Jun', forest: 16.5, agri: 14.5 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="market" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Credit Price Trends */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Credit Price Trends</h3>
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full bg-primary"></div> Forest</span>
              <span className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full bg-accent"></div> Agri</span>
              <span className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Mangrove</span>
              <span className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Wetland</span>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#ffffff20', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="forest" stroke="#00FFB2" strokeWidth={3} dot={{ r: 4, fill: '#0B0F1A', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="agri" stroke="#00CFFF" strokeWidth={3} dot={{ r: 4, fill: '#0B0F1A', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="mangrove" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4, fill: '#0B0F1A', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="wetland" stroke="#facc15" strokeWidth={3} dot={{ r: 4, fill: '#0B0F1A', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Carbon Sequestration Graph */}
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
             <span className="font-mono text-2xl">y = ax² + bx + c</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Projected Sequestration</h3>
          <p className="text-sm text-gray-400 mb-6">Cumulative carbon stored over time per hectare.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { year: 'Y1', amount: 5 },
                { year: 'Y2', amount: 15 },
                { year: 'Y3', amount: 35 },
                { year: 'Y4', amount: 65 },
                { year: 'Y5', amount: 100 },
                { year: 'Y10', amount: 250 },
              ]}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFB2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FFB2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="year" stroke="#ffffff50" axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#ffffff20', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="amount" stroke="#00FFB2" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
