'use client';

import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function StarField() {
  const { theme } = useTheme();

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      top: seededRandom(i * 3) * 100,
      left: seededRandom(i * 7) * 100,
      size: seededRandom(i * 11) < 0.3 ? 2 : 1,
      opacity: theme === 'dark'
        ? 0.1 + seededRandom(i * 5) * 0.4
        : 0.05 + seededRandom(i * 5) * 0.1,
      delay: seededRandom(i * 13) * 8,
      duration: 3 + seededRandom(i * 17) * 4,
    }));
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full star-dot"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            backgroundColor: theme === 'dark' ? '#ffffff' : '#475569',
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
