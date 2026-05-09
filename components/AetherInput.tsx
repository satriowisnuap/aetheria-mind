'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AetherInputProps {
  onSubmit: (text: string) => void;
  orbCount: number;
}

export default function AetherInput({ onSubmit, orbCount }: AetherInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewportOffset, setViewportOffset] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportOffset(window.innerHeight - window.visualViewport.height);
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  const isFull = orbCount >= 20;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isFull) return;

    setSubmitting(true);
    onSubmit(trimmed);
    setValue('');

    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 1800);
    setTimeout(() => setSubmitting(false), 300);
  }, [value, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div 
      className="fixed bottom-8 left-0 right-0 flex justify-center z-40 px-4"
      style={{ transform: `translateY(-${viewportOffset}px)` }}
    >
      <motion.div
        animate={submitting ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          minWidth: '340px',
        }}
      >
        <motion.div
          animate={{
            borderColor: focused ? 'var(--cosmic-teal)' : 'var(--glass-border)',
          }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '9999px',
            background: 'var(--glass-white)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            padding: '12px 16px 12px 24px',
          }}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isFull ? "the void is getting full..." : "cast a thought into the void..."}
            disabled={isFull}
            aria-label={isFull ? "The void is full" : "Type your thought"}
            style={{
              flex: 1,
              background: 'transparent',
              outline: 'none',
              border: 'none',
              fontFamily: 'var(--font-dm)',
              fontSize: '14px',
              color: 'var(--text-primary)',
              minWidth: 0,
              opacity: isFull ? 0.5 : 1,
            }}
            className="placeholder-secondary"
            autoComplete="off"
            spellCheck={false}
          />

          <motion.button
            onClick={handleSubmit}
            whileHover={isFull ? {} : { scale: 1.1 }}
            whileTap={isFull ? {} : { scale: 0.95 }}
            disabled={!value.trim() || isFull}
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--nebula-violet), var(--nebula-purple))',
              border: 'none',
              cursor: value.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: value.trim() ? 1 : 0.4,
              transition: 'opacity 0.2s',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              lineHeight: 1,
            }}
            aria-label="Cast thought"
          >
            ✦
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '10px',
                fontFamily: 'var(--font-dm)',
                fontSize: '12px',
                color: 'var(--cosmic-teal)',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
              }}
            >
              ✦ thought cast
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
