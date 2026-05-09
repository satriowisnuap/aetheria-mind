'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MergePromptProps {
  x: number;
  y: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MergePrompt({ x, y, onConfirm, onCancel }: MergePromptProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          position: 'fixed',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
        }}
      >
        <div
          className="flex flex-col items-center gap-3 p-5 rounded-2xl shadow-2xl"
          style={{
            background: 'var(--glass-white, rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ color: 'var(--nebula-violet, #A855F7)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
          </motion.div>

          <div className="text-center">
            <h3
              style={{
                fontFamily: 'var(--font-syne, "Syne", sans-serif)',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--text-primary, #ffffff)',
                margin: 0,
              }}
            >
              Stellar Fusion?
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                fontSize: '12px',
                color: 'var(--text-secondary, #a1a1aa)',
                margin: '4px 0 0 0',
              }}
            >
              merge these thoughts?
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={onCancel}
              style={{
                fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                fontSize: '12px',
                color: 'var(--text-secondary, #a1a1aa)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
              }}
              className="hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                fontFamily: 'var(--font-dm, "DM Sans", sans-serif)',
                fontSize: '12px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, var(--nebula-purple, #9333EA), var(--nebula-violet, #A855F7))',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
              className="hover:opacity-90 transition-opacity shadow-lg"
            >
              Merge
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
