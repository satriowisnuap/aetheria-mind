'use client';

import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      <motion.p
        className="font-syne italic text-lg md:text-xl"
        style={{ color: 'var(--text-secondary)' }}
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        your mind is clear
      </motion.p>
      <motion.p
        className="mt-4 font-dm text-xs tracking-widest"
        style={{ color: 'var(--text-secondary)', opacity: 0.3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.8, duration: 1.2 }}
      >
        type below to begin
      </motion.p>
    </div>
  );
}
