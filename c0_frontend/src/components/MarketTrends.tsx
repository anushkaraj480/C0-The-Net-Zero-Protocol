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

// Color palette for project types — vibrant, distinct colors
const TYPE_COLORS: Record<string, string> = {
  reforestation:      '#00FFB2',  // primary green
  soil_carbon:        '#00CFFF',  // accent blue
  renewable_energy:   '#facc15',  // yellow
  blue_carbon:        '#a78bfa',  // purple
  methane_capture:    '#f97316',  // orange
  direct_air_capture: '#f43f5e',  // rose
  iex_green_market:   '#ffffff',  // pure white for the market index
};

// Human-readable labels
const TYPE_LABELS: Record<string, string> = {
  reforestation:      'Reforestation',
  soil_carbon:        'Soil Carbon',
  renewable_energy:   'Renewable',
  blue_carbon:        'Blue Carbon',
  methane_capture:    'Methane',
  direct_air_capture: 'DAC',
  iex_green_market:   'IEX Green Market (REC)',
};

interface ChartRow {
  name: string;
  [key: string]: string | number | undefined;
}

export default function MarketTrends() {
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceAPI.getTrends()
      .then((trends) => {
        // Collect and filter project types to only show the required core depictions
        const typesSet = new Set<string>();
        trends.forEach((p: TrendPoint) => typesSet.add(p.project_type));
        
        const ALLOWED_TYPES = ['reforestation', 'soil_carbon', 'renewable_energy', 'iex_green_market'];
        const types = Array.from(typesSet).filter(type => ALLOWED_TYPES.includes(type));
        
        setProjectTypes(types);

        // Group by month, pivot project_type into columns
        const monthMap = new Map<string, ChartRow>();
        
        trends.forEach((point: TrendPoint) => {
          const date = new Date(point.month + '-01');
          const label = `${MONTH_NAMES[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`;
          
          if (!monthMap.has(point.month)) {
            monthMap.set(point.month, { name: label });
          }
          const entry = monthMap.get(point.month)!;
          entry[point.project_type] = Number(point.avg_price);
        });

        // Sort by date key and convert to array
        const sorted = Array.from(monthMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, row]) => row);

        setChartData(sorted);
      })
      .catch(() => {
        // Fallback static data
        setProjectTypes(['reforestation', 'soil_carbon', 'renewable_energy']);
        setChartData([
          { name: "Jan '26", reforestation: 10.5, soil_carbon: 16.0, renewable_energy: 19.5 },
          { name: "Feb '26", reforestation: 11.0, soil_carbon: 16.8, renewable_energy: 20.0 },
          { name: "Mar '26", reforestation: 11.2, soil_carbon: 17.5, renewable_energy: 20.5 },
          { name: "Apr '26", reforestation: 11.8, soil_carbon: 18.0, renewable_energy: 21.0 },
          { name: "May '26", reforestation: 12.5, soil_carbon: 18.75, renewable_energy: 22.0 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="market" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Market Analysis</h2>
        <p className="text-gray-400">Explore live carbon credit pricing and sequestration projections.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Carbon Price Trend */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Carbon Price Trend</h3>
            <div className="flex gap-3 flex-wrap">
              {projectTypes.map(type => (
                <span key={type} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: TYPE_COLORS[type] || '#888' }} 
                  />
                  {TYPE_LABELS[type] || type}
                </span>
              ))}
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff50" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#ffffff50" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => `₹${val}`}
                    tick={{ fontSize: 11 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B0F1A', 
                      borderColor: '#ffffff20', 
                      borderRadius: '8px',
                      fontSize: '12px',
                    }} 
                    formatter={(value: any, name: any) => [
                      `₹${value.toFixed(2)}`, 
                      TYPE_LABELS[name] || name
                    ]}
                  />
                  {projectTypes.map(type => (
                    <Line 
                      key={type}
                      type="monotone" 
                      dataKey={type} 
                      stroke={TYPE_COLORS[type] || '#888'} 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#0B0F1A', strokeWidth: 2 }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      connectNulls
                    />
                  ))}
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
          <div className="h-72">
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
