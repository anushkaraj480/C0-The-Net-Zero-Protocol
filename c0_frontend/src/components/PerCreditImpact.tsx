import { motion } from 'framer-motion';
import { Leaf, Activity, Droplet, Sun } from 'lucide-react';

export default function PerCreditImpact() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-semibold mb-12">Real World Impact of <span className="text-primary">1 Carbon Credit</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Leaf, value: "1", label: "Ton of CO₂ Removed", color: "text-primary" },
            { icon: Activity, value: "50", label: "Trees Grown", color: "text-accent" },
            { icon: Droplet, value: "10k", label: "Liters Water Saved", color: "text-blue-400" },
            { icon: Sun, value: "2", label: "Local Jobs Supported", color: "text-yellow-400" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center group"
            >
              <div className={`w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
