'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

const LETTERS = 'AETHERIA'.split('');

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'title' | 'subtitle' | 'dissolve' | 'done'>('title');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('subtitle'), 1800);
    const t2 = setTimeout(() => setPhase('dissolve'), 2800);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const dissolving = phase === 'dissolve' || phase === 'done';

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'var(--void)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={dissolving ? { opacity: 0, scale: 1.1, filter: 'blur(8px)' } : {}}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center" style={{ letterSpacing: '0.3em' }}>
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-syne font-bold text-5xl md:text-6xl"
                  style={{ color: 'var(--text-primary)' }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.2 + i * 0.08,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <AnimatePresence>
              {(phase === 'subtitle' || phase === 'dissolve') && (
                <motion.p
                  className="font-syne text-sm tracking-widest"
                  style={{ color: 'var(--text-secondary)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  a space for your thoughts
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
