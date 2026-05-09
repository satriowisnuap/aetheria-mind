'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HandModeToggleProps {
  active: boolean;
  onToggle: () => void;
}

export default function HandModeToggle({ active, onToggle }: HandModeToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (active) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowTooltip(false);
    }
  }, [active]);

  return (
    <div className="fixed bottom-6 right-24 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="px-4 py-2 rounded-xl bg-void/50 backdrop-blur-md border border-glass-border text-text-primary"
            style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', letterSpacing: '0.02em' }}
          >
            <span className="text-cosmic-teal">Point</span> → hover &nbsp;|&nbsp; <span className="text-cosmic-teal">Pinch</span> → grab &nbsp;|&nbsp; <span className="text-cosmic-teal">Palm</span> → freeze
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`px-4 py-2 flex items-center gap-2 rounded-full backdrop-blur-md transition-all duration-300 border ${
          active 
            ? 'bg-cosmic-teal/10 border-cosmic-teal shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
            : 'bg-glass-white border-glass-border'
        }`}
      >
        <span className={`text-sm transition-colors ${active ? 'text-cosmic-teal' : 'text-text-secondary'}`}>
          {active ? (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              style={{ display: 'inline-block' }}
            >
              🖐️
            </motion.span>
          ) : '✋'}
        </span>
        <span 
          style={{ 
            fontFamily: 'var(--font-dm)', 
            fontSize: '11px', 
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            letterSpacing: '0.05em'
          }}
        >
          hand mode
        </span>
      </motion.button>
    </div>
  );
}
