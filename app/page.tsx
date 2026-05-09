'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Orb from '@/components/Orb';
import AetherInput from '@/components/AetherInput';
import StarField from '@/components/StarField';
import IntroAnimation from '@/components/IntroAnimation';
import EmptyState from '@/components/EmptyState';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import MergePrompt from '@/components/MergePrompt';
import OrbDetailPanel from '@/components/OrbDetailPanel';
import { useOrbs, type OrbData } from '@/hooks/useOrbs';
import ConstellationLayer from '@/components/ConstellationLayer';
import ConstellationToggle from '@/components/ConstellationToggle';
import HandTracker from '@/components/HandTracker';
import HandModeToggle from '@/components/HandModeToggle';
import { type GestureType } from '@/hooks/useHandTracking';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const { orbs, addOrb, updateOrbPosition, burnOrb, mergeOrbs, loading } = useOrbs();
  
  const orbPositions = useRef(new Map<string, { x: number; y: number }>());
  const [mergeCandidate, setMergeCandidate] = useState<{ id1: string, id2: string, x: number, y: number } | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedOrb, setSelectedOrb] = useState<OrbData | null>(null);
  const [gravityWells, setGravityWells] = useState<{ id: string; x: number; y: number }[]>([]);
  const [isOrbInHorizon, setIsOrbInHorizon] = useState(false);
  const [constellationMode, setConstellationMode] = useState(false);
  const [handMode, setHandMode] = useState(false);
  const [fingerPos, setFingerPos] = useState<{ x: number, y: number } | null>(null);
  const [activeGesture, setActiveGesture] = useState<GestureType>('none');
  const [highlightedOrbId, setHighlightedOrbId] = useState<string | null>(null);
  const [grabbedOrbId, setGrabbedOrbId] = useState<string | null>(null);
  
  const fingerHistory = useRef<{ x: number, y: number, time: number }[]>([]);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const lastGesture = useRef<GestureType>('none');
  const lastHoveredId = useRef<string | null>(null);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const newWell = {
      id: Math.random().toString(36).substring(2, 9),
      x: e.clientX,
      y: e.clientY,
    };
    setGravityWells(prev => [...prev, newWell]);
    setTimeout(() => {
      setGravityWells(prev => prev.filter(w => w.id !== newWell.id));
    }, 8000);
  }, []);

  useEffect(() => {
    const checkHorizon = () => {
      const inHorizon = orbs.some(orb => (orb.posY / 100) < 0.15);
      setIsOrbInHorizon(inHorizon);
    };
    checkHorizon();
  }, [orbs]);

  useEffect(() => {
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    orbs.forEach(orb => {
      orbPositions.current.set(orb.id, { x: (orb.posX / 100) * vpWidth, y: (orb.posY / 100) * vpHeight });
    });
  }, [orbs]);

  const handleUpdateOrbPosition = useCallback((id: string, xPercent: number, yPercent: number) => {
    updateOrbPosition(id, xPercent, yPercent);

    if (mergeCandidate || isMerging) return;

    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    orbPositions.current.set(id, { x: (xPercent / 100) * vpWidth, y: (yPercent / 100) * vpHeight });

    const currentOrb = orbs.find(o => o.id === id);
    if (!currentOrb) return;

    const currentCenter = {
      x: orbPositions.current.get(id)!.x + currentOrb.config.size / 2,
      y: orbPositions.current.get(id)!.y + currentOrb.config.size / 2
    };

    for (const [otherId, pos] of Array.from(orbPositions.current.entries())) {
      if (otherId === id) continue;
      const otherOrb = orbs.find(o => o.id === otherId);
      if (!otherOrb) continue;

      const otherCenter = {
        x: pos.x + otherOrb.config.size / 2,
        y: pos.y + otherOrb.config.size / 2
      };

      const dx = currentCenter.x - otherCenter.x;
      const dy = currentCenter.y - otherCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (currentOrb.config.size / 2 + otherOrb.config.size / 2 + 20)) {
        setMergeCandidate({
          id1: id,
          id2: otherId,
          x: (currentCenter.x + otherCenter.x) / 2,
          y: (currentCenter.y + otherCenter.y) / 2
        });
        break;
      }
    }
  }, [orbs, updateOrbPosition, mergeCandidate, isMerging]);

  const handleMergeConfirm = () => {
    if (!mergeCandidate) return;
    setIsMerging(true);

    setTimeout(() => {
      mergeOrbs(mergeCandidate.id1, mergeCandidate.id2);
      setMergeCandidate(null);
      setIsMerging(false);
    }, 600);
  };

  const handleMergeCancel = () => {
    setMergeCandidate(null);
  };

  const handleGesture = useCallback((gesture: GestureType, pos: { x: number, y: number } | null) => {
    setActiveGesture(gesture);
    setFingerPos(pos);
    
    if (!pos) {
      fingerHistory.current = [];
      lastGesture.current = gesture;
      return;
    }
    
    // Update history
    fingerHistory.current.push({ x: pos.x, y: pos.y, time: Date.now() });
    if (fingerHistory.current.length > 5) {
      fingerHistory.current.shift();
    }
    
    // Point -> hover logic
    if (gesture === 'point') {
      let hoveredId: string | null = null;
      
      // Check overlap with orbs
      for (const [id, orbPos] of Array.from(orbPositions.current.entries())) {
        const orb = orbs.find(o => o.id === id);
        if (!orb) continue;
        const r = orb.config.size / 2;
        const cx = orbPos.x + r;
        const cy = orbPos.y + r;
        
        const dist = Math.sqrt(Math.pow(pos.x - cx, 2) + Math.pow(pos.y - cy, 2));
        if (dist < r * 1.5) { // generous hitbox
          hoveredId = id;
          break;
        }
      }
      
      if (hoveredId !== lastHoveredId.current) {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        lastHoveredId.current = hoveredId;
        setHighlightedOrbId(null);
        
        if (hoveredId) {
          hoverTimer.current = setTimeout(() => {
            setHighlightedOrbId(hoveredId);
          }, 1500);
        }
      }
    } else if (lastGesture.current === 'point') {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      lastHoveredId.current = null;
    }
    
    // Pinch -> grab logic
    if (gesture === 'pinch') {
      if (lastGesture.current !== 'pinch') {
        // Just pinched
        if (highlightedOrbId && !grabbedOrbId) {
          setGrabbedOrbId(highlightedOrbId);
        }
      }
      
      // Move grabbed orb
      if (grabbedOrbId) {
        const vpWidth = window.innerWidth;
        const vpHeight = window.innerHeight;
        const grabbedOrb = orbs.find(o => o.id === grabbedOrbId);
        if (grabbedOrb) {
          const r = grabbedOrb.config.size / 2;
          const targetX = pos.x - r;
          const targetY = pos.y - r;
          updateOrbPosition(grabbedOrbId, (targetX / vpWidth) * 100, (targetY / vpHeight) * 100);
          orbPositions.current.set(grabbedOrbId, { x: targetX, y: targetY });
        }
      }
    } else if (lastGesture.current === 'pinch') {
      // Released pinch
      if (grabbedOrbId) {
        // Check velocity for throw
        if (fingerHistory.current.length > 1) {
          const first = fingerHistory.current[0];
          const last = fingerHistory.current[fingerHistory.current.length - 1];
          const vy = (last.y - first.y) / (fingerHistory.current.length - 1); 
          
          if (vy < -8) { // fast upward throw
            burnOrb(grabbedOrbId);
          }
        }
        setGrabbedOrbId(null);
        setHighlightedOrbId(null);
      }
    }
    
    lastGesture.current = gesture;

  }, [orbs, grabbedOrbId, highlightedOrbId, updateOrbPosition, burnOrb]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <>
          <AuthButton />
          <div 
            className="nebula-bg" 
            aria-hidden="true" 
            onDoubleClick={handleDoubleClick}
            style={{ cursor: 'crosshair' }}
          />
          <StarField />
          <ConstellationLayer 
            orbs={orbs} 
            orbPositions={orbPositions.current} 
            active={constellationMode} 
          />
          <ThemeToggle />

          <AnimatePresence>
            {isOrbInHorizon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed left-1/2 -translate-x-1/2 w-[60%] h-[1px] z-20 pointer-events-none"
                style={{
                  top: '15%',
                  background: 'linear-gradient(90deg, transparent, var(--nebula-violet, #A855F7), transparent)',
                  opacity: 0.3,
                }}
              >
                <span 
                  className="absolute right-0 -top-4"
                  style={{
                    fontFamily: 'var(--font-dm)',
                    fontSize: '9px',
                    color: 'var(--text-secondary)',
                    opacity: 0.5,
                  }}
                >
                  event horizon
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gravityWells.map(well => (
              <motion.div
                key={well.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [1, 2], 
                  opacity: [0.3, 0] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{
                  position: 'fixed',
                  left: well.x - 50,
                  top: well.y - 50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '2px solid var(--cosmic-teal, #2DD4BF)',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              />
            ))}
          </AnimatePresence>

          <div className="fixed inset-0 z-10" aria-label="Thought canvas">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="w-8 h-8 rounded-full bg-cyan-400 opacity-50 animate-ping" />
              </div>
            )}

            <AnimatePresence>
              {!loading && orbs.length === 0 && <EmptyState key="empty" />}
            </AnimatePresence>

            <AnimatePresence>
              {mergeCandidate && !isMerging && (
                <MergePrompt
                  key="merge-prompt"
                  x={mergeCandidate.x}
                  y={mergeCandidate.y}
                  onConfirm={handleMergeConfirm}
                  onCancel={handleMergeCancel}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!loading && orbs.map((orb) => {
                const isMergeTarget = mergeCandidate?.id1 === orb.id || mergeCandidate?.id2 === orb.id;
                let targetPercent = null;
                if (isMerging && isMergeTarget && mergeCandidate) {
                  const vpWidth = window.innerWidth;
                  const vpHeight = window.innerHeight;
                  targetPercent = {
                    x: (mergeCandidate.x / vpWidth) * 100,
                    y: (mergeCandidate.y / vpHeight) * 100
                  };
                }

                return (
                  <Orb
                    key={orb.id}
                    id={orb.id}
                    text={orb.text}
                    config={orb.config}
                    posX={orb.posX}
                    posY={orb.posY}
                    onBurn={burnOrb}
                    onUpdatePosition={handleUpdateOrbPosition}
                    onTap={() => setSelectedOrb(orb)}
                    gravityWells={gravityWells}
                    isMergeCandidate={isMergeTarget && !isMerging}
                    mergeTargetPercent={targetPercent}
                    isPaused={activeGesture === 'palm'}
                    isHighlighted={orb.id === highlightedOrbId || orb.id === grabbedOrbId}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          <AetherInput onSubmit={addOrb} />

          <AnimatePresence>
            {selectedOrb && (
              <OrbDetailPanel
                orb={selectedOrb}
                onClose={() => setSelectedOrb(null)}
                onBurn={burnOrb}
              />
            )}
          </AnimatePresence>

          <ConstellationToggle 
            active={constellationMode} 
            onToggle={() => setConstellationMode(!constellationMode)} 
          />

          <HandTracker active={handMode} onGesture={handleGesture} />
          
          <HandModeToggle 
            active={handMode} 
            onToggle={() => {
              setHandMode(!handMode);
              if (handMode) {
                setHighlightedOrbId(null);
                setGrabbedOrbId(null);
                setActiveGesture('none');
              }
            }} 
          />

          {handMode && fingerPos && (
            <div 
              className="fixed rounded-full pointer-events-none z-[100] bg-cosmic-teal blur-sm transition-all duration-75"
              style={{
                left: fingerPos.x - 10,
                top: fingerPos.y - 10,
                width: 20,
                height: 20,
                boxShadow: activeGesture === 'pinch' ? '0 0 20px #22D3EE' : '0 0 10px #22D3EE'
              }}
            />
          )}

          {activeGesture === 'palm' && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-void/50 backdrop-blur-md rounded-full border border-glass-border">
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                ⏸ paused
              </span>
            </div>
          )}
        </>
      )}
    </>
  );
}
