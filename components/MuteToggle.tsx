'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { audioEngine } from '@/lib/audioEngine';

export default function MuteToggle() {
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const newState = !muted;
    setMuted(newState);
    audioEngine.setMuted(newState);
  };

  return (
    <motion.button
      onClick={toggleMute}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`fixed bottom-6 right-6 z-40 px-4 py-2 flex items-center gap-2 rounded-full backdrop-blur-md transition-all duration-300 border ${
        !muted 
          ? 'bg-cosmic-teal/10 border-cosmic-teal shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
          : 'bg-glass-white border-glass-border'
      }`}
    >
      <span className={`text-sm transition-colors ${!muted ? 'text-cosmic-teal' : 'text-text-secondary'}`}>
        {!muted ? '🔊' : '🔇'}
      </span>
      <span 
        style={{ 
          fontFamily: 'var(--font-dm)', 
          fontSize: '11px', 
          color: !muted ? 'var(--text-primary)' : 'var(--text-secondary)',
          letterSpacing: '0.05em'
        }}
      >
        sound
      </span>
    </motion.button>
  );
}
