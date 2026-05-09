'use client';

import { useEffect } from 'react';
import { audioEngine } from '@/lib/audioEngine';

interface SoundscapeEngineProps {
  orbCount: number;
}

export default function SoundscapeEngine({ orbCount }: SoundscapeEngineProps) {
  useEffect(() => {
    const handleInteraction = () => {
      audioEngine.init();
      audioEngine.setOrbCount(orbCount);
      // Remove listeners after first interaction
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    audioEngine.setOrbCount(orbCount);
  }, [orbCount]);

  useEffect(() => {
    return () => {
      audioEngine.destroy();
    };
  }, []);

  return null;
}
