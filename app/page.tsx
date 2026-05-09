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
        </>
      )}
    </>
  );
}
