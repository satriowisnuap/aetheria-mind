'use client'

import { motion } from 'framer-motion';

interface ConstellationToggleProps {
  active: boolean;
  onToggle: () => void;
}

export default function ConstellationToggle({ active, onToggle }: ConstellationToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`fixed bottom-6 left-6 z-40 px-4 py-2 flex items-center gap-2 rounded-full backdrop-blur-md transition-all duration-300 border ${
        active 
          ? 'bg-cosmic-teal/10 border-cosmic-teal shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
          : 'bg-glass-white border-glass-border'
      }`}
    >
      <span className={`text-sm transition-colors ${active ? 'text-cosmic-teal' : 'text-star-gold/60'}`}>
        {active ? '✦✦✦' : '✦'}
      </span>
      <span 
        style={{ 
          fontFamily: 'var(--font-dm)', 
          fontSize: '11px', 
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          letterSpacing: '0.05em'
        }}
      >
        constellation
      </span>
    </motion.button>
  );
}
