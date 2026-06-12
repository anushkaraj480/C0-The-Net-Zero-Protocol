import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function StickyCTA() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-primary text-background font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,255,178,0.4)] hover:shadow-[0_0_30px_rgba(0,255,178,0.6)] transition-shadow flex items-center gap-2"
      >
        <Leaf className="w-5 h-5" />
        Offset My Carbon
      </motion.button>
    </div>
  );
}



