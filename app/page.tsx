'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Orb from '@/components/Orb';
import AetherInput from '@/components/AetherInput';
import StarField from '@/components/StarField';
import IntroAnimation from '@/components/IntroAnimation';
import EmptyState from '@/components/EmptyState';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import { useOrbs } from '@/hooks/useOrbs';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const { orbs, addOrb, updateOrbPosition, burnOrb, loading } = useOrbs();

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
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="w-8 h-8 rounded-full bg-cyan-400 opacity-50 animate-ping" />
              </div>
            )}

            <AnimatePresence>
              {!loading && orbs.length === 0 && <EmptyState key="empty" />}
            </AnimatePresence>

            <AnimatePresence>
              {!loading && orbs.map((orb) => (
                <Orb
                  key={orb.id}
                  id={orb.id}
                  text={orb.text}
                  config={orb.config}
                  posX={orb.posX}
                  posY={orb.posY}
                  onBurn={burnOrb}
                  onUpdatePosition={updateOrbPosition}
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
