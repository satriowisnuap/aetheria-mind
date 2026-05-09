export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max));
}

export function getRandomOrbPosition(): { x: number; y: number } {
  if (typeof window === 'undefined') {
    return { x: 200, y: 200 };
  }
  return {
    x: randomBetween(0.1, 0.8) * window.innerWidth,
    y: randomBetween(0.2, 0.7) * window.innerHeight,
  };
}

export function getFloatAnimation() {
  return {
    duration: randomBetween(3.5, 5.5),
    delay: randomBetween(0, 2),
  };
}

export function generateId(): string {
  return `orb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
