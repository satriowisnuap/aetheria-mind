'use client';

export type GravityState = {
  baseVelocityY: number; // negative = upward drift
  currentY: number;
  isDrifting: boolean;
};

const DRIFT_SPEED = -0.5; // px per frame
const EVENT_HORIZON_PERCENT = 0.15;
const OSCILLATION_AMPLITUDE = 30; // px
const OSCILLATION_SPEED = 0.02; // radians per frame

export function calculateDrift(currentY: number, viewportH: number, frame: number): { dy: number; dx: number; isEventHorizon: boolean } {
  const eventHorizonY = viewportH * EVENT_HORIZON_PERCENT;
  
  if (currentY <= eventHorizonY) {
    // Within Event Horizon: oscillation
    const dx = Math.sin(frame * OSCILLATION_SPEED) * 0.5; // subtle per-frame movement
    return { dy: 0, dx, isEventHorizon: true };
  }

  // Calculate speed based on distance to event horizon
  // As it gets closer, it slows down
  const distanceToHorizon = currentY - eventHorizonY;
  const slowdownThreshold = viewportH * 0.2; // start slowing down 20% below horizon
  
  let currentDrift = DRIFT_SPEED;
  if (distanceToHorizon < slowdownThreshold) {
    const ratio = Math.max(0.1, distanceToHorizon / slowdownThreshold);
    currentDrift *= ratio;
  }

  return { dy: currentDrift, dx: 0, isEventHorizon: false };
}
