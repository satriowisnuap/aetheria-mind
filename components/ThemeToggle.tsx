'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-center gap-2">
      <AnimatePresence>
        {showTooltip && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -top-9 font-dm text-xs tracking-wider whitespace-nowrap px-2 py-1 rounded-md"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--glass-white)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            switch dimension
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-11 h-11 md:w-11 md:h-11 rounded-full flex items-center justify-center text-lg cursor-pointer"
        style={{
          background: 'var(--glass-white)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          width: '44px',
          height: '44px',
        }}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <motion.span
          key={theme}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </motion.span>
      </motion.button>
    </div>
  );
}
