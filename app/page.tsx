'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Orb from '@/components/Orb';
import AetherInput from '@/components/AetherInput';
import StarField from '@/components/StarField';
import IntroAnimation from '@/components/IntroAnimation';
import EmptyState from '@/components/EmptyState';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { analyzeEmotion } from '@/lib/emotionAnalyzer';
import { getRandomOrbPosition, generateId } from '@/lib/orbUtils';

interface OrbData {
  id: string;
  text: string;
  config: ReturnType<typeof analyzeEmotion>;
  x: number;
  y: number;
}

export default function Home() {
  const [orbs, setOrbs] = useState<OrbData[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const { user } = useAuth();

  const addOrb = useCallback((text: string) => {
    const config = analyzeEmotion(text);
    const { x, y } = getRandomOrbPosition();
    const newOrb: OrbData = {
      id: generateId(),
      text,
      config,
      x: Math.max(0, x - config.size / 2),
      y: Math.max(0, y - config.size / 2),
    };
    setOrbs((prev) => [...prev, newOrb]);
  }, []);

  const burnOrb = useCallback((id: string) => {
    setOrbs((prev) => prev.filter((o) => o.id !== id));
  }, []);

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
          <div className="nebula-bg" aria-hidden="true" />
          <StarField />
          <ThemeToggle />

          <div className="fixed inset-0 z-10" aria-label="Thought canvas">
            <AnimatePresence>
              {orbs.length === 0 && <EmptyState key="empty" />}
            </AnimatePresence>

            <AnimatePresence>
              {orbs.map((orb) => (
                <Orb
                  key={orb.id}
                  id={orb.id}
                  text={orb.text}
                  config={orb.config}
                  initialX={orb.x}
                  initialY={orb.y}
                  onBurn={burnOrb}
                />
              ))}
            </AnimatePresence>
          </div>

          <AetherInput onSubmit={addOrb} />
        </>
      )}
    </>
  );
}
