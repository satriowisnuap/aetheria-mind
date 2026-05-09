'use client';

import { useEffect, useRef } from 'react';
import { useHandTracking, GestureType } from '@/hooks/useHandTracking';

interface HandTrackerProps {
  active: boolean;
  onGesture: (gesture: GestureType, position: { x: number; y: number } | null) => void;
  debug?: boolean;
}

export default function HandTracker({ active, onGesture, debug = false }: HandTrackerProps) {
  const { isLoading, error, activeGesture, fingerPosition, rawResults } = useHandTracking(active);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    onGesture(activeGesture, fingerPosition);
  }, [activeGesture, fingerPosition, onGesture]);

  useEffect(() => {
    if (!debug || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (rawResults?.multiHandLandmarks) {
      import('@mediapipe/drawing_utils').then(({ drawConnectors, drawLandmarks }) => {
        import('@mediapipe/hands').then(({ HAND_CONNECTIONS }) => {
          for (const landmarks of rawResults.multiHandLandmarks) {
            // Because our canvas is fullscreen but results are normalized, we need to map them properly.
            // Also need to mirror x to match fingerPos logic
            const mirroredLandmarks = landmarks.map((l: any) => ({ ...l, x: 1 - l.x }));
            drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
            drawLandmarks(ctx, mirroredLandmarks, { color: '#FF0000', lineWidth: 1, radius: 2 });
          }
        });
      });
    }
  }, [rawResults, debug]);

  // Handle resize for debug canvas
  useEffect(() => {
    if (!debug) return;
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, [debug]);

  return (
    <>
      {debug && (
        <canvas 
          ref={canvasRef} 
          className="fixed inset-0 w-full h-full pointer-events-none z-50"
        />
      )}
      
      {active && isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-glass-border">
            <div className="w-5 h-5 border-2 border-cosmic-teal border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              calibrating hand tracking...
            </span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-6 py-3 rounded-full bg-red-900/40 backdrop-blur-md border border-red-500/30 text-red-200" style={{ fontFamily: 'var(--font-dm)', fontSize: '12px' }}>
            {error}
          </div>
        </div>
      )}
    </>
  );
}
