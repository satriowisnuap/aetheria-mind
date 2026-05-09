'use client';

import { useRef, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from 'framer-motion';
import type { OrbConfig } from '@/lib/emotionAnalyzer';
import { getFloatAnimation } from '@/lib/orbUtils';
import { calculateDrift } from '@/lib/orbPhysics';

interface OrbProps {
  id: string;
  text: string;
  config: OrbConfig;
  posX: number;
  posY: number;
  onBurn: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onTap?: () => void;
  gravityWells?: { id: string; x: number; y: number }[];
  isMergeCandidate?: boolean;
  mergeTargetPercent?: { x: number; y: number } | null;
  isPaused?: boolean;
  isHighlighted?: boolean;
}

interface Particle {
  id: number;
  angle: number;
  size: number;
  isWhite: boolean;
  isSpiral: boolean;
}

const PARTICLES: Particle[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i / 12) * 360,
  size: Math.random() * 5 + 3,
  isWhite: Math.random() > 0.5,
  isSpiral: Math.random() > 0.5,
}));

export const Orb = memo(function Orb({ id, text, config, posX, posY, onBurn, onUpdatePosition, onTap, gravityWells, isMergeCandidate, mergeTargetPercent, isPaused, isHighlighted }: OrbProps) {
  const [burning, setBurning] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [atHorizon, setAtHorizon] = useState(false);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const frameRef = useRef(0);
  const accumulatedDriftX = useRef(0);
  const accumulatedDriftY = useRef(0);

  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);
  
  const { duration, delay } = getFloatAnimation();
  const constraintsRef = useRef(null);

  useAnimationFrame((time) => {
    if (isDragging.current || burning || mergeTargetPercent || isPaused) return;
    
    frameRef.current++;
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    
    const currentPxX = (posX / 100) * vpWidth + driftX.get();
    const currentPxY = (posY / 100) * vpHeight + driftY.get();
    
    const drift = calculateDrift(currentPxY, vpHeight, frameRef.current);
    if (drift.isEventHorizon !== atHorizon) setAtHorizon(drift.isEventHorizon);
    
    let dx = drift.dx;
    let dy = drift.dy;
    
    gravityWells?.forEach(well => {
      const wdx = well.x - (currentPxX + config.size / 2);
      const wdy = well.y - (currentPxY + config.size / 2);
      const dist = Math.sqrt(wdx * wdx + wdy * wdy);
      if (dist < 200) {
        const pull = (200 - dist) / 200 * 1.2;
        dx += (wdx / dist) * pull;
        dy += (wdy / dist) * pull;
      }
    });
    
    accumulatedDriftX.current += dx;
    accumulatedDriftY.current += dy;
    
    driftX.set(accumulatedDriftX.current);
    driftY.set(accumulatedDriftY.current);
  });

  const startLongPressTimer = useCallback((e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, 600);
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    clearLongPressTimer();
    
    if (!isLongPress && !burning) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      if (deltaX < 5 && deltaY < 5) {
        onTap?.();
      }
    }
    setIsLongPress(false);
  }, [isLongPress, burning, onTap, clearLongPressTimer]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { point: { x: number; y: number }; offset: { x: number; y: number } }) => {
      clearLongPressTimer();
      setIsLongPress(false);
      isDragging.current = false;
      
      if (info.offset.y < -80) {
        setShowParticles(true);
        setShowRing(true);
        setBurning(true);
        setTimeout(() => onBurn(id), 800);
      } else {
        const vpWidth = window.innerWidth;
        const vpHeight = window.innerHeight;
        // Calculate new position including the drift that happened
        const startX = (posX / 100) * vpWidth + driftX.get();
        const startY = (posY / 100) * vpHeight + driftY.get();
        const newX = startX + info.offset.x;
        const newY = startY + info.offset.y;
        
        // Reset drift offsets and update the base percentage position
        accumulatedDriftX.current = 0;
        accumulatedDriftY.current = 0;
        driftX.set(0);
        driftY.set(0);
        onUpdatePosition(id, (newX / vpWidth) * 100, (newY / vpHeight) * 100);
      }
    },
    [id, onBurn, onUpdatePosition, posX, posY, clearLongPressTimer, driftX, driftY]
  );

  return (
    <AnimatePresence>
      {!burning && (
        <motion.div
          key={id}
          initial={{ scale: 0, opacity: 0, left: `${posX}%`, top: `${posY}%` }}
          animate={
            mergeTargetPercent
              ? {
                  left: `${mergeTargetPercent.x}%`,
                  top: `${mergeTargetPercent.y}%`,
                  scale: 0,
                  opacity: 0,
                  x: 0,
                  y: 0,
                }
              : {
                  left: `${posX}%`,
                  top: `${posY}%`,
                  scale: isMergeCandidate ? [1, 1.1, 1] : [1, 1.04, 1],
                  opacity: 1,
                }
          }
          exit={{ scale: 0, opacity: 0, y: -200, transition: { duration: 0.5 } }}
          transition={{
            scale: {
              duration: isMergeCandidate ? 0.4 : 5,
              repeat: mergeTargetPercent ? 0 : Infinity,
              repeatDelay: isMergeCandidate ? 0 : 5,
              ease: 'easeInOut',
            },
            opacity: { duration: mergeTargetPercent ? 0.5 : 0.4 },
            y: {
              duration: mergeTargetPercent ? 0.5 : duration,
              repeat: mergeTargetPercent ? 0 : Infinity,
              ease: 'easeInOut',
              delay: mergeTargetPercent ? 0 : delay,
            },
            x: {
              duration: mergeTargetPercent ? 0.5 : duration * 1.2,
              repeat: mergeTargetPercent ? 0 : Infinity,
              ease: 'easeInOut',
              delay: mergeTargetPercent ? 0 : delay + 0.3,
            },
            left: { duration: mergeTargetPercent ? 0.5 : 0, ease: 'backIn' },
            top: { duration: mergeTargetPercent ? 0.5 : 0, ease: 'backIn' },
          }}
          drag
          dragMomentum
          dragTransition={{ bounceStiffness: 80, bounceDamping: 15 }}
          whileDrag={{ scale: 1.08 }}
          onDragStart={() => {
            isDragging.current = true;
            clearLongPressTimer();
          }}
          onDrag={clearLongPressTimer}
          onDragEnd={handleDragEnd}
          onPointerDown={startLongPressTimer}
          onPointerUp={handlePointerUp}
          onPointerCancel={clearLongPressTimer}
          style={{
            position: 'absolute',
            left: `${posX}%`,
            top: `${posY}%`,
            x: driftX,
            y: driftY,
            width: config.size,
            height: config.size,
            cursor: 'grab',
            userSelect: 'none',
            zIndex: 20,
          }}
        >
          <motion.div
            animate={isPaused ? {} : {
              y: [0, -12, 0],
              x: [0, 6, 0],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <AnimatePresence>
            {isLongPress && !burning && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: -30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-dm)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}
              >
                flick up to release
              </motion.div>
            )}
          </AnimatePresence>
          <div
            style={{
              width: config.size,
              height: config.size,
              borderRadius: '50%',
              background: config.color,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${config.borderColor}99`,
              boxShadow: isLongPress || isHighlighted
                ? `0 0 60px ${config.glowColor}` 
                : atHorizon
                ? `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}66`
                : `0 0 20px ${config.glowColor}, 0 0 60px ${config.glowColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            {/* 3D Glassy Reflection */}
            <div 
              style={{
                position: 'absolute',
                top: '15%',
                left: '15%',
                width: '30%',
                height: '30%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 80%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
            {/* Downward Anti-gravity Shadow */}
            <div 
              style={{
                position: 'absolute',
                bottom: -20,
                left: '10%',
                right: '10%',
                height: '20px',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)',
                filter: 'blur(8px)',
                pointerEvents: 'none',
              }}
            />
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

          {mergeTargetPercent && (
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 3] }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                inset: -40,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 30,
                pointerEvents: 'none',
              }}
            />
          )}

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
                <motion.div
                  key={p.id}
                  className="burn-particle"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((p.angle * Math.PI) / 180) * (p.isSpiral ? 80 : 120),
                    y: Math.sin((p.angle * Math.PI) / 180) * (p.isSpiral ? 80 : 120),
                    rotate: p.isSpiral ? 360 : 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                    borderRadius: '50%',
                    background: p.isWhite ? '#ffffff' : config.glowColor,
                    top: -p.size / 2,
                    left: -p.size / 2,
                  }}
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {showRing && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  border: `2px solid ${config.glowColor}`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default Orb;
