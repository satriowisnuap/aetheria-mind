'use client';

import { motion } from 'framer-motion';
import type { OrbData } from '@/hooks/useOrbs';
import { formatDistanceToNow } from 'date-fns';

interface OrbDetailPanelProps {
  orb: OrbData;
  onClose: () => void;
  onBurn: (id: string) => void;
}

export default function OrbDetailPanel({ orb, onClose, onBurn }: OrbDetailPanelProps) {
  const getTimeLabel = () => {
    try {
      const date = orb.createdAt?.toDate ? orb.createdAt.toDate() : new Date(orb.createdAt);
      return `cast ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch (e) {
      return 'cast recently';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-[300px] overflow-hidden"
        style={{
          background: 'var(--glass-white, rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: orb.config.color,
                boxShadow: `0 0 10px ${orb.config.glowColor}`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-dm)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {orb.config.weight} thought
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              textAlign: 'center',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {orb.text}
          </h2>

          <span
            style={{
              fontFamily: 'var(--font-dm)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            {getTimeLabel()}
          </span>

          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'var(--glass-border)',
              margin: '8px 0',
            }}
          />

          <button
            onClick={() => {
              onBurn(orb.id);
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, var(--nebula-purple, #9333EA), var(--nebula-violet, #A855F7))',
              color: '#ffffff',
              fontFamily: 'var(--font-dm)',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
            className="hover:opacity-90 transition-opacity shadow-lg"
          >
            Release to Space
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-dm)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            className="hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
