'use client'

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type OrbData } from '@/hooks/useOrbs';
import { type OrbConfig } from '@/lib/emotionAnalyzer';

interface ConstellationLayerProps {
  orbs: OrbData[];
  orbPositions: Map<string, { x: number; y: number }>;
  active: boolean;
}

export default function ConstellationLayer({ orbs, orbPositions, active }: ConstellationLayerProps) {
  const connections = useMemo(() => {
    if (!active || orbs.length < 2) return [];

    const results: { id: string; x1: number; y1: number; x2: number; y2: number; midX: number; midY: number }[] = [];
    const orbList = orbs.map(orb => {
      const pos = orbPositions.get(orb.id);
      if (!pos) return null;
      return {
        ...orb,
        centerX: pos.x + orb.config.size / 2,
        centerY: pos.y + orb.config.size / 2,
        words: new Set(
          orb.text.toLowerCase()
            .replace(/[.,!?;:()]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
        )
      };
    }).filter((o): o is (OrbData & { centerX: number; centerY: number; words: Set<string> }) => o !== null);

    // Track connections to limit to 3 per orb
    const connectionCounts = new Map<string, number>();

    orbList.forEach((orbA) => {
      if ((connectionCounts.get(orbA.id) || 0) >= 3) return;

      const candidates = orbList
        .filter(orbB => orbB.id !== orbA.id)
        .filter(orbB => {
          // Share at least one keyword
          const hasOverlap = Array.from(orbA.words).some(word => orbB.words.has(word));
          // OR same weight category
          const sameWeight = orbA.config.weight === orbB.config.weight;
          return hasOverlap || sameWeight;
        })
        .map(orbB => ({
          orb: orbB,
          dist: Math.sqrt(Math.pow(orbA.centerX - orbB.centerX, 2) + Math.pow(orbA.centerY - orbB.centerY, 2))
        }))
        .sort((a, b) => a.dist - b.dist);

      for (const candidate of candidates) {
        if ((connectionCounts.get(orbA.id) || 0) >= 3) break;
        if ((connectionCounts.get(candidate.orb.id) || 0) >= 3) continue;

        // Unique ID for the line to avoid duplicate lines between same pair
        const [id1, id2] = [orbA.id, candidate.orb.id].sort();
        const lineId = `${id1}-${id2}`;

        if (!results.find(r => r.id === lineId)) {
          results.push({
            id: lineId,
            x1: orbA.centerX,
            y1: orbA.centerY,
            x2: candidate.orb.centerX,
            y2: candidate.orb.centerY,
            midX: (orbA.centerX + candidate.orb.centerX) / 2,
            midY: (orbA.centerY + candidate.orb.centerY) / 2,
          });
          connectionCounts.set(orbA.id, (connectionCounts.get(orbA.id) || 0) + 1);
          connectionCounts.set(candidate.orb.id, (connectionCounts.get(candidate.orb.id) || 0) + 1);
        }
      }
    });

    return results;
  }, [orbs, orbPositions, active]);

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <AnimatePresence>
        {active && connections.map((conn, index) => (
          <g key={conn.id}>
            <motion.line
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              className="constellation-line"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                pathLength: { duration: 0.8, delay: index * 0.05, ease: "easeInOut" },
                opacity: { duration: 0.3 }
              }}
            />
            <motion.circle
              cx={conn.midX}
              cy={conn.midY}
              r={2}
              fill="var(--star-gold)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: index * 0.05 + 0.4 }}
            />
          </g>
        ))}
      </AnimatePresence>
    </svg>
  );
}
