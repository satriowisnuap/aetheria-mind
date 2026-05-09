'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import type { OrbConfig } from '@/lib/emotionAnalyzer';
import { getFloatAnimation } from '@/lib/orbUtils';

interface OrbProps {
  id: string;
  text: string;
  config: OrbConfig;
  initialX: number;
  initialY: number;
  onBurn: (id: string) => void;
}

interface Particle {
  id: number;
  angle: number;
}

const PARTICLES: Particle[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i / 8) * 360,
}));

export default function Orb({ id, text, config, initialX, initialY, onBurn }: OrbProps) {
  const [burning, setBurning] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const { duration, delay } = getFloatAnimation();
  const y = useMotionValue(0);
  const constraintsRef = useRef(null);

  const handleDragEnd = useCallback(
    (_: unknown, info: { point: { y: number }; offset: { y: number } }) => {
      if (info.offset.y < -80) {
        setShowParticles(true);
        setBurning(true);
        setTimeout(() => onBurn(id), 600);
      }
    },
    [id, onBurn]
  );

  return (
    <AnimatePresence>
      {!burning && (
        <motion.div
          key={id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.04, 1],
            opacity: 1,
            y: [0, -18, 0],
            x: [0, 6, -6, 0],
          }}
          exit={{ scale: 0, opacity: 0, y: -200, transition: { duration: 0.5 } }}
          transition={{
            scale: {
              duration: 5,
              repeat: Infinity,
              repeatDelay: 5,
              ease: 'easeInOut',
            },
            opacity: { duration: 0.4, type: 'spring', stiffness: 200, damping: 20, delay: 0 },
            y: {
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            },
            x: {
              duration: duration * 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay + 0.3,
            },
          }}
          drag
          dragMomentum
          dragTransition={{ bounceStiffness: 80, bounceDamping: 15 }}
          whileDrag={{ scale: 1.08 }}
          onDragEnd={handleDragEnd}
          style={{
            position: 'absolute',
            left: initialX,
            top: initialY,
            width: config.size,
            height: config.size,
            cursor: 'grab',
            userSelect: 'none',
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: config.size,
              height: config.size,
              borderRadius: '50%',
              background: config.color,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${config.borderColor}99`,
              boxShadow: `0 0 20px ${config.glowColor}, 0 0 60px ${config.glowColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                opacity: 0.7,
                textAlign: 'center',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {text}
            </p>
          </div>

          {showParticles && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                pointerEvents: 'none',
              }}
            >
              {PARTICLES.map((p) => (
                <div
                  key={p.id}
                  className="burn-particle"
                  style={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: config.glowColor,
                    top: -3,
                    left: -3,
                    '--angle': `${p.angle}deg`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
